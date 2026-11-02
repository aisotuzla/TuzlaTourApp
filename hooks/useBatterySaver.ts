import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Battery Saver Hook
 * 
 * Provides comprehensive battery management for the Tuzla Tour App.
 * Features:
 * - Automatic battery level monitoring
 * - Manual battery saver mode toggle
 * - Adaptive power management based on battery level
 * - Throttling recommendations for various components
 */

export interface BatterySaverConfig {
  // Thresholds for automatic battery saver activation
  criticalBatteryThreshold: number;    // % (default: 15%)
  lowBatteryThreshold: number;         // % (default: 30%)
  
  // Camera FPS settings
  cameraFpsNormal: number;             // FPS when battery is good (default: 30)
  cameraFpsLowBattery: number;         // FPS when battery is low (default: 15)
  cameraFpsCritical: number;           // FPS when battery is critical (default: 10)
  
  // GPS update intervals (ms)
  gpsIntervalNormal: number;           // ms (default: 1000)
  gpsIntervalLowBattery: number;       // ms (default: 2000)
  gpsIntervalCritical: number;         // ms (default: 5000)
  
  // Animation FPS settings
  animationFpsNormal: number;          // FPS (default: 30)
  animationFpsLowBattery: number;       // FPS (default: 15)
  animationFpsCritical: number;        // FPS (default: 10)
  
  // Feature toggles at different battery levels
  enableGlowEffectsNormal: boolean;    // (default: true)
  enableGlowEffectsLowBattery: boolean; // (default: false)
  enable3dBuildingsNormal: boolean;    // (default: true)
  enable3dBuildingsLowBattery: boolean; // (default: false)
  
  // Stationary detection threshold (meters)
  stationaryThreshold: number;         // meters (default: 1.5)
  stationaryDuration: number;           // ms (default: 5000)
}

export interface BatterySaverState {
  batteryLevel: number | null;         // Current battery level (0-1)
  isCharging: boolean;                 // Whether device is charging
  isCritical: boolean;                 // Battery is critically low
  isLow: boolean;                      // Battery is low
  isStationary: boolean;               // User is not moving
  manualMode: boolean;                 // User has manually enabled battery saver
  autoMode: boolean;                   // Battery saver auto-activated due to low battery
  isSaverActive: boolean;              // Master flag: true if manualMode, autoMode, isCritical, or isLow
  isBatteryApiSupported: boolean;      // True if browser supports navigator.getBattery (false on iOS/Safari)
}

export interface BatterySaverActions {
  enableBatterySaver: () => void;      // Manually enable battery saver
  disableBatterySaver: () => void;     // Manually disable battery saver
  toggleBatterySaver: () => void;       // Toggle battery saver mode
}

export interface BatterySaverRecommendations {
  // Camera settings
  cameraFps: number;
  cameraWidth: number;
  cameraHeight: number;
  enableHighAccuracyGPS: boolean;
  
  // Animation settings
  animationFps: number;
  enableInfiniteAnimations: boolean;
  
  // Visual effects
  enableGlowEffects: boolean;
  enable3dBuildings: boolean;
  blurStrength: 'high' | 'medium' | 'low';
  glowStrength: 'high' | 'medium' | 'low';
  
  // GPS settings
  gpsUpdateInterval: number;
  
  // Feature restrictions
  maxConcurrentAnimations: number;
  enableBackgroundUpdates: boolean;
}

const DEFAULT_CONFIG: BatterySaverConfig = {
  criticalBatteryThreshold: 0.15,
  lowBatteryThreshold: 0.30,
  
  cameraFpsNormal: 30,
  cameraFpsLowBattery: 15,
  cameraFpsCritical: 10,
  
  gpsIntervalNormal: 1000,
  gpsIntervalLowBattery: 2500,
  gpsIntervalCritical: 5000,
  
  animationFpsNormal: 30,
  animationFpsLowBattery: 15,
  animationFpsCritical: 10,
  
  enableGlowEffectsNormal: true,
  enableGlowEffectsLowBattery: false,
  enable3dBuildingsNormal: true,
  enable3dBuildingsLowBattery: false,
  
  stationaryThreshold: 1.5,
  stationaryDuration: 5000,
};

type BatteryLike = EventTarget & {
  level?: number;
  charging?: boolean;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
};

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryLike>;
};

const normalizeBatteryLevel = (value: number | null): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.min(1, Math.max(0, value));
};

const readInitialSaverMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const qMode = window.localStorage.getItem('tuzla.quest.quality-mode');
  if (qMode === 'saver') return true;
  return window.localStorage.getItem('tuzla.batterySaver.manualMode') === 'true';
};

/**
 * Hook for managing battery saver mode
 */
export function useBatterySaver(config: Partial<BatterySaverConfig> = {}): {
  state: BatterySaverState;
  actions: BatterySaverActions;
  recommendations: BatterySaverRecommendations;
  config: BatterySaverConfig;
} {
  const fullConfig: BatterySaverConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(readInitialSaverMode);
  const [isStationary, setIsStationary] = useState<boolean>(false);
  const [isBatteryApiSupported, setIsBatteryApiSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'getBattery' in navigator && typeof (navigator as any).getBattery === 'function';
  });
  
  const batteryRef = useRef<BatteryLike | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  
  // Listen for quality-mode and storage events to stay completely in sync with useQuestRuntimePolicy
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleModeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: string }>;
      if (customEvent.detail?.mode) {
        setManualMode(customEvent.detail.mode === 'saver');
      } else {
        setManualMode(readInitialSaverMode());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tuzla.quest.quality-mode' || e.key === 'tuzla.batterySaver.manualMode') {
        setManualMode(readInitialSaverMode());
      }
    };

    window.addEventListener('tuzla:quality-mode-changed', handleModeEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('tuzla:quality-mode-changed', handleModeEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Battery API monitoring with safe fallback for iOS Safari and restricted contexts
  useEffect(() => {
    if (typeof navigator === 'undefined') {
      setIsBatteryApiSupported(false);
      return;
    }
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== 'function') {
      setIsBatteryApiSupported(false);
      return;
    }

    let cancelled = false;

    const syncBattery = () => {
      if (!batteryRef.current || cancelled) return;
      const level = normalizeBatteryLevel(batteryRef.current.level ?? null);
      const charging = batteryRef.current.charging === true;
      if (!cancelled) {
        setBatteryLevel(level);
        setIsCharging(charging);
        setIsBatteryApiSupported(true);
      }
    };

    try {
      nav.getBattery()
        .then((battery) => {
          if (cancelled || !battery) return;
          batteryRef.current = battery;
          setIsBatteryApiSupported(true);
          syncBattery();
          battery.addEventListener('levelchange', syncBattery);
          battery.addEventListener('chargingchange', syncBattery);
        })
        .catch(() => {
          if (!cancelled) setIsBatteryApiSupported(false);
        });
    } catch {
      if (!cancelled) setIsBatteryApiSupported(false);
    }

    return () => {
      cancelled = true;
      if (batteryRef.current) {
        try {
          batteryRef.current.removeEventListener('levelchange', syncBattery);
          batteryRef.current.removeEventListener('chargingchange', syncBattery);
        } catch {}
      }
    };
  }, []);

  // Stationary detection (to be called from location updates)
  const updatePosition = useCallback((lat: number, lng: number, timestamp: number = Date.now()) => {
    if (!lastPositionRef.current) {
      lastPositionRef.current = { lat, lng, timestamp };
      setIsStationary(false);
      return;
    }

    const prev = lastPositionRef.current;
    const distanceMoved = Math.sqrt(
      Math.pow((lat - prev.lat) * 111000, 2) + 
      Math.pow((lng - prev.lng) * 111000 * Math.cos((lat * Math.PI) / 180), 2)
    );

    if (distanceMoved > fullConfig.stationaryThreshold) {
      lastPositionRef.current = { lat, lng, timestamp };
      if (isStationary) setIsStationary(false);
    } else {
      lastPositionRef.current = { lat, lng, timestamp };
      const stationaryDuration = timestamp - prev.timestamp;
      if (stationaryDuration > fullConfig.stationaryDuration && !isStationary) {
        setIsStationary(true);
      }
    }
  }, [fullConfig.stationaryThreshold, fullConfig.stationaryDuration, isStationary]);

  // Calculate master state
  const isCritical = batteryLevel !== null && batteryLevel <= fullConfig.criticalBatteryThreshold;
  const isLow = batteryLevel !== null && batteryLevel <= fullConfig.lowBatteryThreshold;
  const autoMode = batteryLevel !== null && !manualMode && (isLow || isCritical);
  const isSaverActive = manualMode || autoMode || isCritical || isLow;

  const state: BatterySaverState = {
    batteryLevel,
    isCharging,
    isCritical,
    isLow,
    isStationary,
    manualMode,
    autoMode,
    isSaverActive,
    isBatteryApiSupported,
  };

  // Actions synchronize directly across app
  const enableBatterySaver = useCallback(() => {
    setManualMode(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tuzla.batterySaver.manualMode', 'true');
      window.localStorage.setItem('tuzla.quest.quality-mode', 'saver');
      window.dispatchEvent(new CustomEvent('tuzla:quality-mode-changed', { detail: { mode: 'saver' } }));
    }
  }, []);

  const disableBatterySaver = useCallback(() => {
    setManualMode(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tuzla.batterySaver.manualMode', 'false');
      window.localStorage.setItem('tuzla.quest.quality-mode', 'auto');
      window.dispatchEvent(new CustomEvent('tuzla:quality-mode-changed', { detail: { mode: 'auto' } }));
    }
  }, []);

  const toggleBatterySaver = useCallback(() => {
    setManualMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('tuzla.batterySaver.manualMode', String(next));
        window.localStorage.setItem('tuzla.quest.quality-mode', next ? 'saver' : 'auto');
        window.dispatchEvent(new CustomEvent('tuzla:quality-mode-changed', { detail: { mode: next ? 'saver' : 'auto' } }));
      }
      return next;
    });
  }, []);

  const actions: BatterySaverActions = {
    enableBatterySaver,
    disableBatterySaver,
    toggleBatterySaver,
  };

  // Generate recommendations based on active saver state and stationary detection
  const recommendations: BatterySaverRecommendations = {
    // Camera settings: 15 FPS when saver active or stationary, 30 FPS normal
    cameraFps: isCritical 
      ? fullConfig.cameraFpsCritical 
      : isSaverActive 
        ? fullConfig.cameraFpsLowBattery 
        : isStationary 
          ? Math.min(fullConfig.cameraFpsLowBattery, fullConfig.cameraFpsNormal) 
          : fullConfig.cameraFpsNormal,
    
    cameraWidth: isCritical ? 480 : isSaverActive ? 480 : 960,
    cameraHeight: isCritical ? 360 : isSaverActive ? 360 : 720,
    
    // GPS settings
    enableHighAccuracyGPS: !isSaverActive && !isStationary,
    gpsUpdateInterval: isCritical 
      ? fullConfig.gpsIntervalCritical 
      : isSaverActive 
        ? fullConfig.gpsIntervalLowBattery 
        : fullConfig.gpsIntervalNormal,
    
    // Animation settings: 15 FPS saver, 30 FPS normal
    animationFps: isCritical 
      ? fullConfig.animationFpsCritical 
      : isSaverActive 
        ? fullConfig.animationFpsLowBattery 
        : fullConfig.animationFpsNormal,
    
    enableInfiniteAnimations: !isSaverActive,
    
    // Visual effects
    enableGlowEffects: isSaverActive 
      ? fullConfig.enableGlowEffectsLowBattery 
      : fullConfig.enableGlowEffectsNormal,
    
    enable3dBuildings: isSaverActive 
      ? fullConfig.enable3dBuildingsLowBattery 
      : fullConfig.enable3dBuildingsNormal,
    
    blurStrength: isSaverActive ? 'low' : 'medium',
    glowStrength: isSaverActive ? 'low' : 'medium',
    
    // Feature restrictions
    maxConcurrentAnimations: isSaverActive ? 1 : 3,
    enableBackgroundUpdates: !isSaverActive,
  };

  return {
    state,
    actions,
    recommendations,
    config: fullConfig,
  };
}

/**
 * Hook for getting battery-optimized camera constraints
 */
export function useBatteryOptimizedCamera(
  baseConstraints: MediaTrackConstraints | undefined,
  batterySaver: BatterySaverRecommendations
): MediaTrackConstraints {
  if (!baseConstraints) {
    return {
      facingMode: { ideal: 'environment' },
      frameRate: { ideal: batterySaver.cameraFps, max: batterySaver.cameraFps + 5 },
      width: { ideal: batterySaver.cameraWidth },
      height: { ideal: batterySaver.cameraHeight },
    };
  }

  return {
    ...baseConstraints,
    frameRate: {
      ideal: batterySaver.cameraFps,
      max: batterySaver.cameraFps + 5,
    },
    width: { ideal: batterySaver.cameraWidth },
    height: { ideal: batterySaver.cameraHeight },
  };
}

/**
 * Hook for getting battery-optimized GPS options
 */
export function useBatteryOptimizedGPS(
  batterySaver: BatterySaverRecommendations
): PositionOptions {
  return {
    enableHighAccuracy: batterySaver.enableHighAccuracyGPS,
    maximumAge: batterySaver.gpsUpdateInterval,
    timeout: batterySaver.gpsUpdateInterval * 2,
  };
}

/**
 * Utility to format battery percentage
 */
export function formatBatteryPercentage(level: number | null): string {
  if (level === null) return 'Unknown';
  return `${Math.round(level * 100)}%`;
}

/**
 * Utility to get battery icon based on level
 */
export function getBatteryIcon(level: number | null, isCharging: boolean): string {
  if (level === null) return '⚡';
  if (isCharging) return '⚡';
  if (level <= 0.15) return '🪫';
  if (level <= 0.30) return '🔋';
  if (level <= 0.60) return '🔋🔋';
  if (level <= 0.85) return '🔋🔋🔋';
  return '🔋🔋🔋🔋';
}

export default useBatterySaver;
