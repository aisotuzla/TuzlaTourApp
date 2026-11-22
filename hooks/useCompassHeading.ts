import { useState, useEffect, useRef, useCallback } from 'react';
import { computeTiltCompensatedHeading, smoothHeading } from '../utils/arProjection';

export function useCompassHeading(): {
  heading: number | null;
  accuracy: number | null;
  requestPermission: () => Promise<boolean>;
} {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const smoothedHeadingRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceOrientation permission notice:', err);
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    let hasAbsolute = false;

    const handleOrientation = (e: DeviceOrientationEvent, isAbs: boolean) => {
      // Prefer geomagnetic absolute orientation when available
      if (hasAbsolute && !isAbs) return;
      if (isAbs) hasAbsolute = true;

      const webkitHeading = (e as any).webkitCompassHeading;
      if (webkitHeading !== undefined && (e as any).webkitCompassAccuracy !== undefined) {
        setAccuracy((e as any).webkitCompassAccuracy);
      }

      const rawHeading = computeTiltCompensatedHeading(e.alpha, e.beta, e.gamma, webkitHeading);
      if (rawHeading !== null) {
        const screenAngle = window.screen?.orientation?.angle ?? (typeof window.orientation === 'number' ? window.orientation : 0);
        const adjustedHeading = (rawHeading + screenAngle + 360) % 360;

        // Smooth heading across 0/360 boundary
        const smoothed = smoothHeading(adjustedHeading, smoothedHeadingRef.current, 0.25);
        smoothedHeadingRef.current = smoothed;

        const now = performance.now();
        // Update at ~30 FPS for fluid dial motion while preventing CPU overload
        if (now - lastUpdateTimeRef.current >= 33) {
          lastUpdateTimeRef.current = now;
          setHeading(Math.round(smoothed * 10) / 10);
        }
      }
    };

    const onOrientation = (e: DeviceOrientationEvent) => handleOrientation(e, false);
    const onAbsoluteOrientation = (e: DeviceOrientationEvent) => handleOrientation(e, true);

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', onAbsoluteOrientation as any, { passive: true });
    }
    window.addEventListener('deviceorientation', onOrientation as any, { passive: true });

    return () => {
      if ('ondeviceorientationabsolute' in window) {
        window.removeEventListener('deviceorientationabsolute', onAbsoluteOrientation as any);
      }
      window.removeEventListener('deviceorientation', onOrientation as any);
    };
  }, []);

  return { heading, accuracy, requestPermission };
}

