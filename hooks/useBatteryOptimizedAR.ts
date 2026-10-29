/**
 * Battery Optimized AR Hook
 * 
 * This hook provides optimized AR functionality with battery-saving features.
 * It automatically adjusts camera FPS, GPS accuracy, and animation quality
 * based on battery level, movement state, and user preferences.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBatterySaver } from './useBatterySaver';
import { DeviceOrientation, WGS84Location } from '../utils/arProjection';
import { RoutePoint } from './useBreadcrumbsTrail';

export interface BatteryOptimizedARConfig {
  // Base camera settings (when battery is good)
  baseCameraWidth: number;
  baseCameraHeight: number;
  baseCameraFps: number;
  
  // Base animation settings
  baseAnimationFps: number;
  
  // GPS settings
  baseEnableHighAccuracy: boolean;
  baseGpsInterval: number;
  
  // Thresholds
  stationaryThreshold: number; // meters
  stationaryDuration: number; // ms
  lowBatteryThreshold: number; // 0-1
  criticalBatteryThreshold: number; // 0-1
}

export interface BatteryOptimizedARState {
  cameraFps: number;
  cameraWidth: number;
  cameraHeight: number;
  animationFps: number;
  enableHighAccuracyGPS: boolean;
  gpsInterval: number;
  isStationary: boolean;
  isLowBattery: boolean;
  isCriticalBattery: boolean;
  isCharging: boolean;
}

export interface BatteryOptimizedARActions {
  updatePosition: (lat: number, lng: number, timestamp?: number) => void;
  setStationary: (isStationary: boolean) => void;
}

const DEFAULT_CONFIG: BatteryOptimizedARConfig = {
  baseCameraWidth: 960,
  baseCameraHeight: 720,
  baseCameraFps: 30,
  baseAnimationFps: 30,
  baseEnableHighAccuracy: true,
  baseGpsInterval: 1000,
  stationaryThreshold: 1.5,
  stationaryDuration: 5000,
  lowBatteryThreshold: 0.30,
  criticalBatteryThreshold: 0.15,
};

/**
 * Hook for battery-optimized AR functionality
 */
export function useBatteryOptimizedAR(
  config: Partial<BatteryOptimizedARConfig> = {}
): {
  state: BatteryOptimizedARState;
  actions: BatteryOptimizedARActions;
  cameraConstraints: MediaTrackConstraints;
  gpsOptions: PositionOptions;
} {
  const fullConfig: BatteryOptimizedARConfig = { ...DEFAULT_CONFIG, ...config };
  
  const { state: batteryState, recommendations } = useBatterySaver({
    criticalBatteryThreshold: fullConfig.criticalBatteryThreshold,
    lowBatteryThreshold: fullConfig.lowBatteryThreshold,
    stationaryThreshold: fullConfig.stationaryThreshold,
    stationaryDuration: fullConfig.stationaryDuration,
  });

  const [isStationaryInternal, setIsStationaryInternal] = useState<boolean>(false);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);

  // Use battery saver's stationary detection if available, otherwise use internal
  const isStationary = batteryState.isStationary !== undefined 
    ? batteryState.isStationary 
    : isStationaryInternal;

  // Update internal stationary detection
  const updatePosition = useCallback((lat: number, lng: number, timestamp: number = Date.now()) => {
    if (!lastPositionRef.current) {
      lastPositionRef.current = { lat, lng, timestamp };
      setIsStationaryInternal(false);
      return;
    }

    const prev = lastPositionRef.current;
    const distanceMoved = Math.sqrt(
      Math.pow((lat - prev.lat) * 111000, 2) + 
      Math.pow((lng - prev.lng) * 111000 * Math.cos((lat * Math.PI) / 180), 2)
    );

    if (distanceMoved > fullConfig.stationaryThreshold) {
      lastPositionRef.current = { lat, lng, timestamp };
      if (isStationaryInternal) setIsStationaryInternal(false);
    } else {
      lastPositionRef.current = { lat, lng, timestamp };
      const stationaryDuration = timestamp - prev.timestamp;
      if (stationaryDuration > fullConfig.stationaryDuration && !isStationaryInternal) {
        setIsStationaryInternal(true);
      }
    }
  }, [fullConfig.stationaryThreshold, fullConfig.stationaryDuration, isStationaryInternal]);

  // Calculate optimized state
  const state: BatteryOptimizedARState = useMemo(() => {
    const isLow = batteryState.isLow || batteryState.isCritical;
    const isCritical = batteryState.isCritical;
    
    return {
      cameraFps: isCritical 
        ? 10 
        : isLow 
          ? 15 
          : isStationary 
            ? 15 
            : fullConfig.baseCameraFps,
      
      cameraWidth: isCritical 
        ? 480 
        : isLow 
          ? 640 
          : fullConfig.baseCameraWidth,
      
      cameraHeight: isCritical 
        ? 360 
        : isLow 
          ? 480 
          : fullConfig.baseCameraHeight,
      
      animationFps: isCritical 
        ? 10 
        : isLow 
          ? 15 
          : fullConfig.baseAnimationFps,
      
      enableHighAccuracyGPS: !isLow && !isCritical && !isStationary,
      
      gpsInterval: isCritical 
        ? 5000 
        : isLow 
          ? 2000 
          : isStationary 
            ? 3000 
            : fullConfig.baseGpsInterval,
      
      isStationary,
      isLowBattery: batteryState.isLow,
      isCriticalBattery: batteryState.isCritical,
      isCharging: batteryState.isCharging,
    };
  }, [
    batteryState.isLow, 
    batteryState.isCritical, 
    batteryState.isCharging,
    isStationary,
    fullConfig
  ]);

  // Camera constraints based on current state
  const cameraConstraints: MediaTrackConstraints = useMemo(() => ({
    facingMode: { ideal: 'environment' },
    width: { ideal: state.cameraWidth },
    height: { ideal: state.cameraHeight },
    frameRate: { 
      ideal: state.cameraFps, 
      max: state.cameraFps + 5 
    },
  }), [state.cameraFps, state.cameraWidth, state.cameraHeight]);

  // GPS options based on current state
  const gpsOptions: PositionOptions = useMemo(() => ({
    enableHighAccuracy: state.enableHighAccuracyGPS,
    maximumAge: state.gpsInterval,
    timeout: state.gpsInterval * 2,
  }), [state.enableHighAccuracyGPS, state.gpsInterval]);

  const actions: BatteryOptimizedARActions = {
    updatePosition,
    setStationary: useCallback((isStationary: boolean) => {
      setIsStationaryInternal(isStationary);
    }, []),
  };

  return {
    state,
    actions,
    cameraConstraints,
    gpsOptions,
  };
}

/**
 * Hook for creating a battery-optimized animation loop
 */
export function useBatteryOptimizedAnimation(
  targetFps: number,
  batterySaver: BatteryOptimizedARState
): {
  shouldRender: boolean;
  frameInterval: number;
} {
  // Adjust FPS based on battery state
  const adjustedFps = batterySaver.isCriticalBattery 
    ? Math.max(10, Math.floor(targetFps * 0.5))
    : batterySaver.isLowBattery 
      ? Math.max(15, Math.floor(targetFps * 0.7))
      : targetFps;

  return {
    shouldRender: adjustedFps > 0,
    frameInterval: 1000 / adjustedFps,
  };
}

/**
 * Utility to throttle function calls based on battery state
 */
export function createBatteryOptimizedThrottle<T extends (...args: any[]) => any>(
  func: T,
  batterySaver: BatteryOptimizedARState,
  normalDelay: number
): (...args: Parameters<T>) => void {
  const delay = batterySaver.isCriticalBattery 
    ? normalDelay * 3
    : batterySaver.isLowBattery 
      ? normalDelay * 2
      : normalDelay;

  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    } else {
      timeoutId = setTimeout(() => {
        func(...args);
        lastCall = Date.now();
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Hook for battery-optimized requestAnimationFrame
 */
export function useBatteryOptimizedRequestAnimationFrame(
  batterySaver: BatteryOptimizedARState,
  baseFps: number = 30
): {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
} {
  const adjustedFps = batterySaver.isCriticalBattery 
    ? Math.max(10, Math.floor(baseFps * 0.5))
    : batterySaver.isLowBattery 
      ? Math.max(15, Math.floor(baseFps * 0.7))
      : baseFps;

  const frameInterval = 1000 / adjustedFps;
  let lastFrameTime = 0;
  let frameId: number | null = null;

  const requestFrame = useCallback((callback: FrameRequestCallback): number => {
    const wrappedCallback: FrameRequestCallback = (timestamp) => {
      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed >= frameInterval) {
        callback(timestamp);
        lastFrameTime = timestamp;
      }
      
      frameId = requestAnimationFrame(wrappedCallback);
    };

    lastFrameTime = performance.now();
    frameId = requestAnimationFrame(wrappedCallback);
    return frameId;
  }, [frameInterval]);

  const cancelFrame = useCallback((id: number) => {
    if (frameId === id) {
      cancelAnimationFrame(id);
      frameId = null;
    }
  }, []);

  return {
    requestFrame,
    cancelFrame,
  };
}

export default useBatteryOptimizedAR;
