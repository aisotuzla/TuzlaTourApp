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
  isHighQualityActive: boolean;        // Master flag: true if user manually enabled High Quality mode (60 FPS, 1080p)
  qualityMode: 'saver' | 'balanced' | 'cinematic'; // Current effective quality mode
  isBatteryApiSupported: boolean;      // True if browser supports navigator.getBattery (false on iOS/Safari)
}

export interface BatterySaverActions {
  enableBatterySaver: () => void;      // Manually enable battery saver (15 FPS, Eco 360p)
  disableBatterySaver: () => void;     // Revert to balanced / normal (30 FPS, 720p)
  toggleBatterySaver: () => void;       // Toggle battery saver mode
  setHighQualityMode: () => void;      // Manually enable High Quality mode (60 FPS, 1080p, PC / Flagship)
  setQualityMode: (mode: 'saver' | 'balanced' | 'cinematic') => void;
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

const readInitialQualityMode = (): 'saver' | 'balanced' | 'cinematic' => {
  if (typeof window === 'undefined') return 'balanced';
  const qMode = window.localStorage.getItem('tuzla.quest.quality-mode');
  if (qMode === 'cinematic') return 'cinematic';
  if (qMode === 'saver') return 'saver';
  if (window.localStorage.getItem('tuzla.batterySaver.manualMode') === 'true') return 'saver';
  return 'balanced';
};

/**
 * Hook for managing battery saver and quality modes
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
  const [qualityMode, setQualityModeState] = useState<'saver' | 'balanced' | 'cinematic'>(readInitialQualityMode);
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
      const mode = customEvent.detail?.mode;
      if (mode === 'cinematic' || mode === 'saver' || mode === 'balanced') {
        setQualityModeState(mode);
      } else {
        setQualityModeState(readInitialQualityMode());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tuzla.quest.quality-mode' || e.key === 'tuzla.batterySaver.manualMode') {
        setQualityModeState(readInitialQualityMode());
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
  const autoMode = batteryLevel !== null && qualityMode === 'balanced' && (isLow || isCritical);
  const isSaverActive = qualityMode === 'saver' || autoMode || isCritical || isLow;
  const isHighQualityActive = qualityMode === 'cinematic';
  const effectiveMode: 'saver' | 'balanced' | 'cinematic' = isSaverActive ? 'saver' : (isHighQualityActive ? 'cinematic' : 'balanced');

  const state: BatterySaverState = {
    batteryLevel,
    isCharging,
    isCritical,
    isLow,
    isStationary,
    manualMode: qualityMode === 'saver',
    autoMode,
    isSaverActive,
    isHighQualityActive,
    qualityMode,
    isBatteryApiSupported,
  };

  // Actions synchronize directly across app
  const setQualityMode = useCallback((mode: 'saver' | 'balanced' | 'cinematic') => {
    setQualityModeState(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tuzla.quest.quality-mode', mode);
      window.localStorage.setItem('tuzla.batterySaver.manualMode', mode === 'saver' ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('tuzla:quality-mode-changed', { detail: { mode } }));
    }
  }, []);

  const enableBatterySaver = useCallback(() => setQualityMode('saver'), [setQualityMode]);
  const disableBatterySaver = useCallback(() => setQualityMode('balanced'), [setQualityMode]);
  const setHighQualityMode = useCallback(() => setQualityMode('cinematic'), [setQualityMode]);
  const toggleBatterySaver = useCallback(() => {
    setQualityMode(qualityMode === 'saver' ? 'balanced' : 'saver');
  }, [qualityMode, setQualityMode]);

  const actions: BatterySaverActions = {
    enableBatterySaver,
    disableBatterySaver,
    toggleBatterySaver,
    setHighQualityMode,
    setQualityMode,
  };

  // Generate recommendations based on active quality mode and stationary detection
  const recommendations: BatterySaverRecommendations = {
    // Camera settings: 60 FPS (1920x1080) High Quality, 30 FPS (960x720) Balanced, 15 FPS (480x360) Saver
    cameraFps: effectiveMode === 'cinematic'
      ? 60
      : isCritical 
        ? fullConfig.cameraFpsCritical 
        : isSaverActive 
          ? fullConfig.cameraFpsLowBattery 
          : isStationary 
            ? Math.min(fullConfig.cameraFpsLowBattery, fullConfig.cameraFpsNormal) 
            : fullConfig.cameraFpsNormal,
    
    cameraWidth: effectiveMode === 'cinematic' ? 1920 : (isCritical || isSaverActive ? 480 : 960),
    cameraHeight: effectiveMode === 'cinematic' ? 1080 : (isCritical || isSaverActive ? 360 : 720),
    
    // GPS settings: High accuracy in High Quality & Balanced, throttled in Saver
    enableHighAccuracyGPS: effectiveMode === 'cinematic' || (!isSaverActive && !isStationary),
    gpsUpdateInterval: isCritical 
      ? fullConfig.gpsIntervalCritical 
      : isSaverActive 
        ? fullConfig.gpsIntervalLowBattery 
        : fullConfig.gpsIntervalNormal,
    
    // Animation settings: 60 FPS High Quality, 30 FPS Balanced, 15 FPS Saver
    animationFps: effectiveMode === 'cinematic'
      ? 60
      : isCritical 
        ? fullConfig.animationFpsCritical 
        : isSaverActive 
          ? fullConfig.animationFpsLowBattery 
          : fullConfig.animationFpsNormal,
    
    enableInfiniteAnimations: !isSaverActive,
    
    // Visual effects & 3D buildings
    enableGlowEffects: isSaverActive ? false : true,
    enable3dBuildings: isSaverActive ? false : true,
    
    blurStrength: effectiveMode === 'cinematic' ? 'high' : (isSaverActive ? 'low' : 'medium'),
    glowStrength: effectiveMode === 'cinematic' ? 'high' : (isSaverActive ? 'low' : 'medium'),
    
    // Feature restrictions
    maxConcurrentAnimations: effectiveMode === 'cinematic' ? 5 : (isSaverActive ? 1 : 3),
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
