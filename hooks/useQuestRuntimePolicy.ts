import { useEffect, useMemo, useRef, useState } from 'react';
import { AppFeatures } from '../utils/platform';
import {
  QuestQualityLevel,
  QuestQualityMode,
  QuestRuntimePolicy,
  QuestRuntimeSignals,
  normalizeBatteryLevel,
  resolveQuestRuntimePolicy,
  sanitizeQualityMode,
} from '../utils/questRuntimePolicy';

const STORAGE_KEY = 'tuzla.quest.quality-mode';

interface BatteryState {
  level: number | null;
  saving: boolean;
}

interface UseQuestRuntimePolicyResult {
  policy: QuestRuntimePolicy;
  mode: QuestQualityMode;
  setMode: (mode: QuestQualityMode) => void;
}

type BatteryLike = EventTarget & {
  level?: number;
  charging?: boolean;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
};

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryLike>;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

const readInitialMode = (): QuestQualityMode => {
  if (typeof window === 'undefined') return 'auto';
  return sanitizeQualityMode(window.localStorage.getItem(STORAGE_KEY));
};

const readConnectionSignals = (): Pick<QuestRuntimeSignals, 'saveData' | 'effectiveConnectionType'> => {
  const nav = navigator as NavigatorWithBattery;
  return {
    saveData: Boolean(nav.connection?.saveData),
    effectiveConnectionType: nav.connection?.effectiveType ?? null,
  };
};

export const useQuestRuntimePolicy = (features: AppFeatures): UseQuestRuntimePolicyResult => {
  const [mode, setModeState] = useState<QuestQualityMode>(readInitialMode);
  const [batteryState, setBatteryState] = useState<BatteryState>({ level: null, saving: false });
  const [connectionState, setConnectionState] = useState(readConnectionSignals);
  const [activeLevel, setActiveLevel] = useState<QuestQualityLevel>(features.isAndroidLight ? 'balanced' : 'cinematic');
  const lastSwitchAtRef = useRef<number>(Date.now());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== 'function') return;

    let batteryRef: BatteryLike | null = null;
    let cancelled = false;

    const syncBattery = () => {
      if (!batteryRef) return;
      const level = normalizeBatteryLevel(typeof batteryRef.level === 'number' ? batteryRef.level : null);
      const saving = batteryRef.charging === false && typeof level === 'number' && level <= 0.2;
      setBatteryState({ level, saving });
    };

    nav.getBattery()
      .then((battery) => {
        if (cancelled) return;
        batteryRef = battery;
        syncBattery();
        batteryRef.addEventListener('levelchange', syncBattery);
        batteryRef.addEventListener('chargingchange', syncBattery);
      })
      .catch(() => {
        // No-op: battery API is optional.
      });

    return () => {
      cancelled = true;
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', syncBattery);
        batteryRef.removeEventListener('chargingchange', syncBattery);
      }
    };
  }, []);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (!nav.connection || typeof (nav.connection as EventTarget).addEventListener !== 'function') return;

    const handleConnectionChange = () => {
      setConnectionState(readConnectionSignals());
    };

    (nav.connection as EventTarget).addEventListener('change', handleConnectionChange);
    return () => {
      (nav.connection as EventTarget).removeEventListener('change', handleConnectionChange);
    };
  }, []);

  const signals = useMemo<QuestRuntimeSignals>(() => {
    return {
      batteryLevel: batteryState.level,
      batterySaving: batteryState.saving,
      saveData: connectionState.saveData,
      effectiveConnectionType: connectionState.effectiveConnectionType,
    };
  }, [batteryState.level, batteryState.saving, connectionState.effectiveConnectionType, connectionState.saveData]);

  const policy = useMemo<QuestRuntimePolicy>(() => {
    return resolveQuestRuntimePolicy({
      features,
      mode,
      signals,
      previousLevel: activeLevel,
      lastSwitchAtMs: lastSwitchAtRef.current,
      nowMs: Date.now(),
    });
  }, [activeLevel, features, mode, signals]);

  useEffect(() => {
    if (policy.qualityLevel === activeLevel) return;
    lastSwitchAtRef.current = Date.now();
    setActiveLevel(policy.qualityLevel);
  }, [activeLevel, policy.qualityLevel]);

  return {
    policy,
    mode,
    setMode: setModeState,
  };
};
