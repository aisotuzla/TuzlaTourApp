import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const savedQuality = window.localStorage.getItem(STORAGE_KEY);
  if (savedQuality) return sanitizeQualityMode(savedQuality);
  const legacySaver = window.localStorage.getItem('tuzla.batterySaver.manualMode');
  if (legacySaver === 'true') return 'saver';
  return 'auto';
};

const readConnectionSignals = (): Pick<QuestRuntimeSignals, 'saveData' | 'effectiveConnectionType'> => {
  if (typeof navigator === 'undefined') {
    return { saveData: false, effectiveConnectionType: null };
  }
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

  const setMode = useCallback((newMode: QuestQualityMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, newMode);
      window.localStorage.setItem('tuzla.batterySaver.manualMode', newMode === 'saver' ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('tuzla:quality-mode-changed', { detail: { mode: newMode } }));
    }
  }, []);

  // Listen for cross-component / cross-tab quality mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleModeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: QuestQualityMode }>;
      if (customEvent.detail?.mode) {
        setModeState(sanitizeQualityMode(customEvent.detail.mode));
      } else {
        setModeState(readInitialMode());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === 'tuzla.batterySaver.manualMode') {
        setModeState(readInitialMode());
      }
    };

    window.addEventListener('tuzla:quality-mode-changed', handleModeEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('tuzla:quality-mode-changed', handleModeEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Safe battery monitoring (iOS Safari, Firefox, and Chrome)
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== 'function') return;

    let batteryRef: BatteryLike | null = null;
    let cancelled = false;

    const syncBattery = () => {
      if (!batteryRef || cancelled) return;
      const level = normalizeBatteryLevel(typeof batteryRef.level === 'number' ? batteryRef.level : null);
      const saving = batteryRef.charging === false && typeof level === 'number' && level <= 0.2;
      setBatteryState({ level, saving });
    };

    try {
      nav.getBattery()
        .then((battery) => {
          if (cancelled || !battery) return;
          batteryRef = battery;
          syncBattery();
          batteryRef.addEventListener('levelchange', syncBattery);
          batteryRef.addEventListener('chargingchange', syncBattery);
        })
        .catch(() => {
          // Graceful fallback: battery API blocked or unsupported
        });
    } catch {
      // Graceful fallback for security / permission restrictions
    }

    return () => {
      cancelled = true;
      if (batteryRef) {
        try {
          batteryRef.removeEventListener('levelchange', syncBattery);
          batteryRef.removeEventListener('chargingchange', syncBattery);
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
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
    setMode,
  };
};
