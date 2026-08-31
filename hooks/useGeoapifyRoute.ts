import { useState, useEffect, useCallback, useRef } from 'react';
import { getDistance } from '../utils/geoUtils';

export interface GeoapifyManeuverStep {
  id: string;
  text: string;
  type: string; // 'Start' | 'Straight' | 'Right' | 'Left' | 'TurnRight' | 'TurnLeft' | 'Arrival' | string;
  distance: number; // distance in meters for this maneuver
  lat: number;
  lng: number;
  stepIndex: number;
}

export interface LocationCoord {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface UseGeoapifyRouteProps {
  origin: LocationCoord | null;
  destination: LocationCoord | null;
  enabled?: boolean;
  apiKey?: string;
  onReachDestination?: () => void;
}

export interface UseGeoapifyRouteResult {
  fullPolyline: Array<[number, number, number]>; // Array of [lat, lng, elevation]
  steps: GeoapifyManeuverStep[];
  activeStepIndex: number;
  activeStep: GeoapifyManeuverStep | null;
  distanceToNextStep: number;
  distanceToDestination: number;
  totalDistance: number;
  totalTime: number;
  isLoading: boolean;
  error: string | null;
  hasReachedDestination: boolean;
  refetchRoute: () => void;
}

const DEFAULT_GEOAPIFY_KEY =
  (import.meta as any).env?.VITE_GEOAPIFY_ROUTING_API ||
  (import.meta as any).env?.VITE_MAPQUESTVIEW_GEOAPIFY_API_KEY ||
  '63e8b34f44974d71bc70aad63e5b56ba';

export function useGeoapifyRoute({
  origin,
  destination,
  enabled = true,
  apiKey = DEFAULT_GEOAPIFY_KEY,
  onReachDestination,
}: UseGeoapifyRouteProps): UseGeoapifyRouteResult {
  const [fullPolyline, setFullPolyline] = useState<Array<[number, number, number]>>([]);
  const [steps, setSteps] = useState<GeoapifyManeuverStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [distanceToNextStep, setDistanceToNextStep] = useState<number>(Infinity);
  const [distanceToDestination, setDistanceToDestination] = useState<number>(Infinity);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReachedDestination, setHasReachedDestination] = useState<boolean>(false);

  const reachedTriggeredRef = useRef<boolean>(false);

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination || !enabled) {
      setFullPolyline([]);
      setSteps([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    reachedTriggeredRef.current = false;
    setHasReachedDestination(false);

    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=walk&details=instruction_details,elevation&apiKey=${apiKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Geoapify Routing API returned status ${res.status}`);
      }

      const data = await res.json();
      const feature = data.features?.[0];

      if (!feature) {
        throw new Error('No routing path found');
      }

      // GeoJSON LineString coordinates are [lng, lat, elev?]
      const rawCoords: Array<[number, number, number?]> = feature.geometry?.coordinates || [];
      const parsedPolyline: Array<[number, number, number]> = rawCoords.map((coord) => [
        coord[1], // Latitude
        coord[0], // Longitude
        coord[2] ?? 0, // Elevation
      ]);

      setFullPolyline(parsedPolyline);

      // Parse Steps
      const legSteps = feature.properties?.legs?.[0]?.steps || [];
      const parsedSteps: GeoapifyManeuverStep[] = legSteps.map((step: any, idx: number) => {
        const fromIdx = step.from_index ?? 0;
        const stepCoord = parsedPolyline[fromIdx] || [destination.lat, destination.lng, 0];

        return {
          id: `step-${idx}-${step.instruction?.text || idx}`,
          text: step.instruction?.text || step.text || `Maneuver ${idx + 1}`,
          type: step.instruction?.type || step.type || 'Straight',
          distance: step.distance || 0,
          lat: stepCoord[0],
          lng: stepCoord[1],
          stepIndex: idx,
        };
      });

      // Ensure final step is destination arrival if not present
      if (parsedSteps.length === 0 || parsedSteps[parsedSteps.length - 1].type !== 'Arrival') {
        parsedSteps.push({
          id: `step-${parsedSteps.length}-arrival`,
          text: 'Arrive at destination',
          type: 'Arrival',
          distance: 0,
          lat: destination.lat,
          lng: destination.lng,
          stepIndex: parsedSteps.length,
        });
      }

      setSteps(parsedSteps);
      setActiveStepIndex(0);
      setTotalDistance(feature.properties?.distance || 0);
      setTotalTime(feature.properties?.time || 0);
    } catch (err: any) {
      console.warn('[useGeoapifyRoute] Error fetching route:', err);
      setError(err?.message || 'Failed to fetch walking route');
      // Direct straight line fallback if routing fails
      const fallbackPolyline: Array<[number, number, number]> = [
        [origin.lat, origin.lng, origin.elevation || 0],
        [destination.lat, destination.lng, destination.elevation || 0],
      ];
      setFullPolyline(fallbackPolyline);
      setSteps([
        {
          id: 'step-0-fallback',
          text: 'Head towards landmark',
          type: 'Straight',
          distance: getDistance(origin.lat, origin.lng, destination.lat, destination.lng),
          lat: destination.lat,
          lng: destination.lng,
          stepIndex: 0,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, enabled, apiKey]);

  // Initial and on-change fetch
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Real-time tracking loop (advance steps when <= 8m, trigger arrival when <= 5m)
  useEffect(() => {
    if (!origin || !destination) return;

    // 1. Distance to destination
    const distToDest = getDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    setDistanceToDestination(distToDest);

    // Auto-trigger 5m Geofence
    if (distToDest <= 5 && !reachedTriggeredRef.current) {
      reachedTriggeredRef.current = true;
      setHasReachedDestination(true);
      if (onReachDestination) {
        onReachDestination();
      }
    }

    // 2. Active Step advancement (<= 8m of step turn node)
    if (steps.length > 0 && activeStepIndex < steps.length) {
      const currentStepNode = steps[activeStepIndex];
      const distToStepNode = getDistance(origin.lat, origin.lng, currentStepNode.lat, currentStepNode.lng);
      setDistanceToNextStep(distToStepNode);

      if (distToStepNode <= 8 && activeStepIndex < steps.length - 1) {
        setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
      }
    }
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, steps, activeStepIndex, onReachDestination]);

  return {
    fullPolyline,
    steps,
    activeStepIndex,
    activeStep: steps[activeStepIndex] || null,
    distanceToNextStep,
    distanceToDestination,
    totalDistance,
    totalTime,
    isLoading,
    error,
    hasReachedDestination,
    refetchRoute: fetchRoute,
  };
}
