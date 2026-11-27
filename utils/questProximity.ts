export const QUEST_PROXIMITY_RADIUS_METERS = 10;

export function isWithinQuestProximity(distanceMeters: number): boolean {
    return Number.isFinite(distanceMeters) && distanceMeters <= QUEST_PROXIMITY_RADIUS_METERS;
}
