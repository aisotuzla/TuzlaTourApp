export interface WGS84Location {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface ENUCoordinate {
  x: number; // East in meters
  y: number; // North in meters
  z: number; // Up in meters (relative elevation)
}

export interface DeviceOrientation {
  alpha: number | null; // Compass yaw / heading (0 - 360 deg)
  beta: number | null;  // Device pitch (-180 to 180 deg)
  gamma: number | null; // Device roll (-90 to 90 deg)
}

export enum ARStage {
  LONG_RANGE = 'LONG_RANGE',
  DISCOVERY = 'DISCOVERY',
  TARGET_LOCK = 'TARGET_LOCK',
  PRECISE = 'PRECISE',
}

export interface ProjectedPoint {
  x: number; // percentage (0 - 100) or pixel x
  y: number; // percentage (0 - 100) or pixel y
  pxX: number; // screen pixel X
  pxY: number; // screen pixel Y
  isVisible: boolean;
  distance: number; // Metric distance in meters
  stage: ARStage;
  scale: number;
  relativeBearing: number; // Relative bearing in degrees (-180 to 180)
  zCam: number; // Forward depth in meters
}

export interface ScreenDimensions {
  width: number;
  height: number;
}

const WGS84_EARTH_RADIUS = 6378137; // Earth equatorial radius in meters
const DEFAULT_FOV_Y = 60; // Vertical Camera Field of View in degrees

/**
 * Converts standard WGS84 GPS coordinate [lat, lng, elev] into Earth-Centered ENU (East-North-Up) metric coordinates relative to origin.
 * Relative ground elevation ΔZ = (Waypoint Elevation - User Elevation) + 0.2m - 1.5m (camera eye height).
 */
export function wgs84ToEnu(poi: WGS84Location, origin: WGS84Location): ENUCoordinate {
  const originLatRad = (origin.lat * Math.PI) / 180;
  const dLatRad = ((poi.lat - origin.lat) * Math.PI) / 180;
  const dLngRad = ((poi.lng - origin.lng) * Math.PI) / 180;

  const x = WGS84_EARTH_RADIUS * dLngRad * Math.cos(originLatRad);
  const y = WGS84_EARTH_RADIUS * dLatRad;

  const poiElev = poi.elevation ?? 0;
  const userElev = origin.elevation ?? 0;
  const z = (poiElev - userElev) + 0.2 - 1.5;

  return { x, y, z };
}

/**
 * Smooth compass heading / yaw angle taking circular 0/360 wraparound into account.
 */
export function smoothHeading(newAlpha: number, prevAlpha: number | null, factor: number = 0.18): number {
  if (prevAlpha === null) return (newAlpha + 360) % 360;
  const diff = (((newAlpha - prevAlpha) + 540) % 360) - 180;
  return (prevAlpha + factor * diff + 360) % 360;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function stageForDistance(distanceMeters: number): ARStage {
  if (distanceMeters < 10) return ARStage.PRECISE;
  if (distanceMeters < 50) return ARStage.TARGET_LOCK;
  if (distanceMeters < 2000) return ARStage.DISCOVERY;
  return ARStage.LONG_RANGE;
}

/**
 * Projects a 3D ENU coordinate to 2D screen coordinates taking FOV and device pitch/heading into account.
 */
export function projectEnuToScreen(
  enu: ENUCoordinate,
  orientation: DeviceOrientation,
  screen: ScreenDimensions = { width: typeof window !== 'undefined' ? window.innerWidth : 1000, height: typeof window !== 'undefined' ? window.innerHeight : 1000 },
  fovYDeg: number = DEFAULT_FOV_Y
): ProjectedPoint {
  const horizontalDist = Math.sqrt(enu.x * enu.x + enu.y * enu.y);
  const totalDist = Math.sqrt(enu.x * enu.x + enu.y * enu.y + enu.z * enu.z);
  const stage = stageForDistance(totalDist);

  const heading = orientation.alpha ?? 0;
  const pitchRaw = orientation.beta ?? 90;

  // Compute world bearing to point (degrees CW from North)
  const worldBearingRad = Math.atan2(enu.x, enu.y);
  const worldBearingDeg = (worldBearingRad * 180) / Math.PI;

  // Relative bearing to camera heading (-180 to 180)
  let relativeBearing = (((worldBearingDeg - heading) + 540) % 360) - 180;

  // Camera forward and right depths
  const relBearingRad = (relativeBearing * Math.PI) / 180;
  const zCam = horizontalDist * Math.cos(relBearingRad); // Forward depth along viewing ray

  // Pitch tilt compensation relative to upright vertical (90 deg)
  const pitchOffsetDeg = pitchRaw - 90;
  const elevationAngleDeg = (Math.atan2(enu.z, Math.max(0.1, horizontalDist)) * 180) / Math.PI;
  const relativeVerticalDeg = elevationAngleDeg - pitchOffsetDeg;

  // FOV Math
  const aspect = screen.width / Math.max(1, screen.height);
  const halfFovYRad = (fovYDeg * Math.PI) / 360;
  const tanHalfFovY = Math.tan(halfFovYRad);
  const tanHalfFovX = tanHalfFovY * aspect;
  const fovXDeg = (2 * Math.atan(tanHalfFovX) * 180) / Math.PI;

  // Perspective projection calculation
  const tanRelHorizontal = Math.tan(relBearingRad);
  const tanRelVertical = Math.tan((relativeVerticalDeg * Math.PI) / 180);

  const pxX = (tanRelHorizontal / tanHalfFovX) * (screen.width / 2) + screen.width / 2;
  const pxY = screen.height / 2 - (tanRelVertical / tanHalfFovY) * (screen.height / 2);

  const pctX = (pxX / Math.max(1, screen.width)) * 100;
  const pctY = (pxY / Math.max(1, screen.height)) * 100;

  const isVisible =
    zCam > 0.1 &&
    Math.abs(relativeBearing) <= fovXDeg / 2 &&
    Math.abs(relativeVerticalDeg) <= fovYDeg / 2;

  const scale = clamp(2.2 - totalDist / 80, 0.6, 2.2);

  return {
    x: clamp(pctX, -50, 150),
    y: clamp(pctY, -50, 150),
    pxX,
    pxY,
    isVisible,
    distance: totalDist,
    stage,
    scale,
    relativeBearing,
    zCam,
  };
}

/**
 * Main Pure AR Projection function combining GPS location & orientation inputs.
 */
export function getARProjection(
  userLocation: WGS84Location | null,
  orientation: DeviceOrientation,
  poiCoords: WGS84Location,
  screen?: ScreenDimensions
): ProjectedPoint {
  if (!userLocation) {
    return {
      x: 50,
      y: 50,
      pxX: 0,
      pxY: 0,
      isVisible: false,
      distance: Infinity,
      stage: ARStage.LONG_RANGE,
      scale: 1,
      relativeBearing: 0,
      zCam: 0,
    };
  }

  const enu = wgs84ToEnu(poiCoords, userLocation);
  return projectEnuToScreen(enu, orientation, screen);
}

/**
 * Projects an entire GPS path polyline with elevation into 2D canvas space coordinates.
 */
export function projectGpsPathWithElevationToCanvas(
  polyline: Array<[number, number, number?]>,
  userLocation: WGS84Location,
  orientation: DeviceOrientation,
  canvasWidth: number,
  canvasHeight: number
): ProjectedPoint[] {
  const screen = { width: canvasWidth, height: canvasHeight };

  return polyline.map(([lat, lng, elevation]) => {
    const enu = wgs84ToEnu({ lat, lng, elevation }, userLocation);
    return projectEnuToScreen(enu, orientation, screen);
  });
}
