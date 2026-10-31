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
  isLow: boolean;                       // Battery is low
  isStationary: boolean;               // User is not moving
  manualMode: boolean;                  // User has manually enabled battery saver
  autoMode: boolean;                   // Battery saver auto-activated due to low battery
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
  gpsIntervalLowBattery: 2000,
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [isStationary, setIsStationary] = useState<boolean>(false);
  
  const batteryRef = useRef<BatteryLike | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  
  // Load saved manual mode preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = window.localStorage.getItem('tuzla.batterySaver.manualMode');
      if (savedMode !== null) {
        setManualMode(savedMode === 'true');
      }
    }
  }, []);

  // Save manual mode preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tuzla.batterySaver.manualMode', String(manualMode));
    }
  }, [manualMode]);

  // Battery API monitoring
  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== 'function') {
      // Battery API not available, use fallback values
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
      }
    };

    nav.getBattery()
      .then((battery) => {
        if (cancelled) return;
        batteryRef.current = battery;
        syncBattery();
        battery.addEventListener('levelchange', syncBattery);
        battery.addEventListener('chargingchange', syncBattery);
      })
      .catch(() => {
        // Battery API failed or not supported
      });

    return () => {
      cancelled = true;
      if (batteryRef.current) {
        batteryRef.current.removeEventListener('levelchange', syncBattery);
        batteryRef.current.removeEventListener('chargingchange', syncBattery);
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
      // User has moved significantly
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

  // Calculate state
  const state: BatterySaverState = {
    batteryLevel,
    isCharging,
    isCritical: batteryLevel !== null && batteryLevel <= fullConfig.criticalBatteryThreshold,
    isLow: batteryLevel !== null && batteryLevel <= fullConfig.lowBatteryThreshold,
    isStationary,
    manualMode,
    autoMode: batteryLevel !== null && !manualMode && 
              (batteryLevel <= fullConfig.lowBatteryThreshold || batteryLevel <= fullConfig.criticalBatteryThreshold),
  };

  // Actions
  const actions: BatterySaverActions = {
    enableBatterySaver: useCallback(() => setManualMode(true), []),
    disableBatterySaver: useCallback(() => setManualMode(false), []),
    toggleBatterySaver: useCallback(() => setManualMode(prev => !prev), []),
  };

  // Generate recommendations based on current state
  const recommendations: BatterySaverRecommendations = {
    // Camera settings
    cameraFps: state.isCritical 
      ? fullConfig.cameraFpsCritical 
      : state.isLow 
        ? fullConfig.cameraFpsLowBattery 
        : state.isStationary 
          ? Math.min(fullConfig.cameraFpsLowBattery, fullConfig.cameraFpsNormal) 
          : fullConfig.cameraFpsNormal,
    
    cameraWidth: state.isCritical ? 480 : state.isLow ? 640 : 960,
    cameraHeight: state.isCritical ? 360 : state.isLow ? 480 : 720,
    
    // GPS settings
    enableHighAccuracyGPS: !state.isLow && !state.isCritical && !state.isStationary,
    gpsUpdateInterval: state.isCritical 
      ? fullConfig.gpsIntervalCritical 
      : state.isLow 
        ? fullConfig.gpsIntervalLowBattery 
        : fullConfig.gpsIntervalNormal,
    
    // Animation settings
    animationFps: state.isCritical 
      ? fullConfig.animationFpsCritical 
      : state.isLow 
        ? fullConfig.animationFpsLowBattery 
        : fullConfig.animationFpsNormal,
    
    enableInfiniteAnimations: !state.isCritical && !state.isLow,
    
    // Visual effects
    enableGlowEffects: state.isCritical || state.isLow 
      ? fullConfig.enableGlowEffectsLowBattery 
      : fullConfig.enableGlowEffectsNormal,
    
    enable3dBuildings: state.isCritical || state.isLow 
      ? fullConfig.enable3dBuildingsLowBattery 
      : fullConfig.enable3dBuildingsNormal,
    
    blurStrength: state.isCritical ? 'low' : state.isLow ? 'medium' : 'high',
    glowStrength: state.isCritical ? 'low' : state.isLow ? 'medium' : 'high',
    
    // Feature restrictions
    maxConcurrentAnimations: state.isCritical ? 1 : state.isLow ? 2 : 3,
    enableBackgroundUpdates: !state.isCritical && !state.isLow,
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
