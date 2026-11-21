import { useState, useEffect, useRef } from 'react';
import { computeTiltCompensatedHeading, smoothHeading } from '../utils/arProjection';

export function useCompassHeading(): { heading: number | null; accuracy: number | null } {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const smoothedAlphaRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastEmittedRef = useRef<number | null>(null);

  useEffect(() => {
    let hasAbsolute = false;

    const handleOrientation = (e: DeviceOrientationEvent, isAbs: boolean) => {
      if (hasAbsolute && !isAbs) return;
      if (isAbs) hasAbsolute = true;

      const webkitHeading = (e as any).webkitCompassHeading;
      if (webkitHeading !== undefined && (e as any).webkitCompassAccuracy !== undefined) {
        setAccuracy((e as any).webkitCompassAccuracy);
      }

      const rawHeading = computeTiltCompensatedHeading(e.alpha, e.beta, e.gamma, webkitHeading);
      if (rawHeading !== null) {
        const screenAngle = window.screen?.orientation?.angle || (window.orientation as number) || 0;
        const adjustedHeading = (rawHeading + screenAngle) % 360;
        const smoothed = smoothHeading(adjustedHeading, smoothedAlphaRef.current, 0.2);
        smoothedAlphaRef.current = smoothed;

        const now = performance.now();
        // Throttle updates to ~15fps and only when angle changes > 1 degree to keep UI snappy and save CPU
        if (
          now - lastUpdateTimeRef.current >= 66 &&
          (lastEmittedRef.current === null || Math.abs(smoothed - lastEmittedRef.current) > 1.0)
        ) {
          lastUpdateTimeRef.current = now;
          lastEmittedRef.current = smoothed;
          setHeading(smoothed);
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

  return { heading, accuracy };
}

