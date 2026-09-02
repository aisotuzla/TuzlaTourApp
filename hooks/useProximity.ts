import { useEffect, useState, useRef } from 'react';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1); const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1); const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useProximity(
  targetLat: number, targetLng: number,
  options?: { onError?: (error: GeolocationPositionError) => void; }
) {
  const [distance, setDistance] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { console.warn('Geolocation not supported'); return; }

    // PRO FIX: Removed redundant setInterval. watchPosition is sufficient and far more battery-efficient.
    // PRO FIX: Increased maximumAge to 5000ms to allow OS to use cached GPS.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const d = haversineDistance(latitude, longitude, targetLat, targetLng);
        setDistance(d); setHasPermission(true);
      },
      (err) => {
        options?.onError?.(err); setHasPermission(false);
        console.error('Geolocation error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [targetLat, targetLng, options?.onError]);

  return { distance, hasPermission };
}