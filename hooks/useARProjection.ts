import { getDistance, getBearing } from '../utils/geoUtils';

export interface POICoordinates {
  lat: number;
  lng: number;
}

export interface DeviceOrientation {
  alpha: number | null; // compass heading (0-360)
  beta: number | null; // front-back tilt (-180 to 180)
  gamma: number | null; // left-right tilt (-90 to 90)
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export enum ARStage {
  LONG_RANGE = 'LONG_RANGE',
  DISCOVERY = 'DISCOVERY',
  TARGET_LOCK = 'TARGET_LOCK',
  PRECISE = 'PRECISE',
}

export interface ProjectedPoint {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  isVisible: boolean;
  distance: number;
  stage: ARStage;
  scale: number;
  relativeBearing: number; // relative to phone orientation (-180 to 180)
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const stageForDistance = (distanceMeters: number): ARStage => {
  if (distanceMeters < 10) return ARStage.PRECISE;
  if (distanceMeters < 50) return ARStage.TARGET_LOCK;
  if (distanceMeters < 2000) return ARStage.DISCOVERY;
  return ARStage.LONG_RANGE;
};

/**
 * Pure projection function (not a React hook).
 *
 * This used to be a stateful hook and was called in `map()` loops, which causes
 * heavy re-rendering and heat. Keeping it pure makes it safe to call per-POI.
 */
export const getARProjection = (
  userLocation: UserLocation | null,
  orientation: DeviceOrientation,
  poiCoords: POICoordinates
): ProjectedPoint => {
  // Tuned for "good enough" UX rather than realism.
  const FOV_H = 60; // Horizontal FOV in degrees
  const FOV_V = 80; // Vertical FOV in degrees

  if (!userLocation) {
    return {
      x: 50,
      y: 50,
      isVisible: false,
      distance: Infinity,
      stage: ARStage.LONG_RANGE,
      scale: 1,
      relativeBearing: 0,
    };
  }

  const distance = getDistance(userLocation.lat, userLocation.lng, poiCoords.lat, poiCoords.lng);
  const stage = stageForDistance(distance);

  // If we don't have heading yet, we can still provide distance/stage.
  if (orientation.alpha === null) {
    return {
      x: 50,
      y: 50,
      isVisible: false,
      distance,
      stage,
      scale: 1,
      relativeBearing: 0,
    };
  }

  const bearing = getBearing(userLocation.lat, userLocation.lng, poiCoords.lat, poiCoords.lng);

  // Relative heading in [-180, 180]
  let relativeHeading = (bearing - orientation.alpha + 360) % 360;
  if (relativeHeading > 180) relativeHeading -= 360;

  const pitch = orientation.beta ?? 0;

  // Map bearing/pitch into screen space.
  const x = (relativeHeading / (FOV_H / 2)) * 50 + 50;
  const y = (-pitch / (FOV_V / 2)) * 50 + 50;

  const isVisible = Math.abs(relativeHeading) < FOV_H / 2 && Math.abs(pitch) < FOV_V / 2;

  // Scale: 0.6 at 120m+, 2.2 at 0m (clamped).
  const scale = clamp(2.2 - distance / 80, 0.6, 2.2);

  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
    isVisible,
    distance,
    stage,
    scale,
    relativeBearing: relativeHeading,
  };
};

// Backward compat export. Prefer `getARProjection`.
export const useARProjection = getARProjection;

