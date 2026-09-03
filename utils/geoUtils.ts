/**
 * Calculates the Haversine distance between two points in meters.
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Calculates the bearing from point 1 to point 2 in degrees (0-360).
 */
export const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const lambda1 = (lon1 * Math.PI) / 180;
    const lambda2 = (lon2 * Math.PI) / 180;

    const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
    const x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
    const theta = Math.atan2(y, x);

    return ((theta * 180) / Math.PI + 360) % 360;
};

/**
 * Performs a cinematic "first-person / street-view" fly-in on a MapLibre map.
 * Flies to the user's current position, rotates the camera to face the
 * navigation target (bearing), and sets a high pitch for an immersive view.
 *
 * @param mapInstance  The MapLibre GL map instance
 * @param userLng     User's longitude
 * @param userLat     User's latitude
 * @param targetLat   Navigation target latitude
 * @param targetLon   Navigation target longitude
 * @param opts        Optional overrides for zoom, pitch, and duration
 */
export const flyToFirstPerson = (
    mapInstance: any,
    userLng: number,
    userLat: number,
    targetLat: number,
    targetLon: number,
    opts?: { zoom?: number; pitch?: number; duration?: number }
): void => {
    const bearing = getBearing(userLat, userLng, targetLat, targetLon);
    const zoom = opts?.zoom ?? 18.5;
    const pitch = opts?.pitch ?? 72;
    const duration = opts?.duration ?? 2800;

    mapInstance.flyTo({
        center: [userLng, userLat],
        zoom,
        pitch,
        bearing,
        duration,
        essential: true,
        curve: 1.42,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
};
