import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from 'pmtiles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Navigation,
  Camera as CameraIcon,
  Route,
  Info,
  X,
  Compass,
  Landmark,
  Hotel as HotelIcon,
  Trophy,
  Lock,
  Layers,
  Check,
} from 'lucide-react';

import { AppFeatures } from '../utils/platform.ts';
import { Language } from '../types.ts';
import { TUZLA_CENTER, LOCATIONS } from '../constants.tsx';
import { useNetwork } from '../hooks/useNetwork.ts';
import { useQuestRuntimePolicy } from '../hooks/useQuestRuntimePolicy.ts';
import { getDistance } from '../utils/geoUtils.ts';
import {
  QUEST_TARGETS,
  POI_COLORS,
  NFT_REWARD_IDS,
  ROUTE_POI_PRESETS,
  PHASE_1_POIS,
  PHASE_2_POIS,
  PHASE_3_POIS,
  GRAND_FINALE_POIS,
} from '../constants/questData.ts';

import { NavigationHud } from './NavigationHud.tsx';
import { QrScannerModal } from './QrScannerModal.tsx';
import ARGuide from './ARGuide.tsx';


export interface MapQuestViewProps {
  lang: Language;
  features: AppFeatures;
  unlockedRewards: string[];
  onRewardFound: (id: string) => void;
  onToggleAR: () => void;
  navigationTarget?: any | null;
  onClearNavigation?: () => void;
  initialOpenScanner?: boolean;
}

// Map target IDs to accurate coordinates in Tuzla
const QUEST_TARGET_COORDS: Record<string, { lat: number; lon: number }> = {
  trg_slobode: { lat: 44.5395175, lon: 18.6749037 },
  salt_square: { lat: 44.5382182, lon: 18.6759398 },
  palancinkara: { lat: 44.5383762, lon: 18.6775339 },
  slana_banja: { lat: 44.5378167, lon: 18.6875664 },
  panonika: { lat: 44.5385, lon: 18.6767 },
  slapovi: { lat: 44.5404243, lon: 18.6819408 },
  kapija: { lat: 44.53863, lon: 18.676805 },
  atelje_ismet: { lat: 44.5371465, lon: 18.6810454 },
  bingo_city_centar: { lat: 44.532177, lon: 18.651743 },
  mesa_selimovic: { lat: 44.5370993, lon: 18.6781216 },
  tvrtko_park: { lat: 44.5380826, lon: 18.6783327 },
};

// Hotel presets (Matching MapView.tsx)
const TUZLA_HOTELS = [
  { name: 'Hotel Mellain', latitude: 44.537521, longitude: 18.683412, rating: '5.0', priceRange: '120-220 KM' },
  { name: 'Grand Hotel Tuzla', latitude: 44.532912, longitude: 18.676389, rating: '4.8', priceRange: '90-160 KM' },
  { name: 'Hotel Salis', latitude: 44.536102, longitude: 18.665241, rating: '4.7', priceRange: '80-140 KM' },
  { name: 'Hotel Heartland', latitude: 44.539120, longitude: 18.676912, rating: '4.6', priceRange: '70-120 KM' },
  { name: 'Hotel Tehnograd', latitude: 44.541230, longitude: 18.705120, rating: '60-100 KM' },
];

// Map Styles Configuration
const GEOAPIFY_API_KEY = '765d67152f78438bacd2c66f73665a91';
const VITE_PROTOMAPS_CARTO_API = '78417d24f3c5d515';
export const GEOAPIFY_MAPTILER_3D = `https://maps.geoapify.com/v1/styles/maptiler-3d/style.json?apiKey=${GEOAPIFY_API_KEY}`;
export const CARTO_VOYAGER_STYLE = `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?apiKey=${VITE_PROTOMAPS_CARTO_API}`;
export const OFFLINE_STYLE = '/maps/tiles/offline-vector-style.json';

const MAP_LAYER_OPTIONS = [
  { id: 'geoapify', name: { bs: 'Geoapify 3D (Primarna)', en: 'Geoapify 3D (Primary)' }, url: GEOAPIFY_MAPTILER_3D },
  { id: 'voyager', name: { bs: 'CARTO Voyager (Rezervna)', en: 'CARTO Voyager (Fallback)' }, url: CARTO_VOYAGER_STYLE },
  { id: 'offline', name: { bs: 'Lokalna PMTiles (Offline)', en: 'Local PMTiles (Offline)' }, url: OFFLINE_STYLE },
];

const MapQuestView: React.FC<MapQuestViewProps> = ({
  lang,
  features,
  unlockedRewards,
  onRewardFound,
  onToggleAR,
  navigationTarget,
  onClearNavigation,
  initialOpenScanner = false,
}) => {
  const { policy } = useQuestRuntimePolicy(features);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  // 3D tilt (pitch) and bearing (rotation) state
  const [pitch, setPitch] = useState<number>(55);
  const [bearing, setBearing] = useState<number>(-15);

  // Core Map State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string>(GEOAPIFY_MAPTILER_3D);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);

  // Modals & Navigation State
  const [isScannerOpen, setIsScannerOpen] = useState(initialOpenScanner);
  const [showARGuide, setShowARGuide] = useState(false);
  const [selectedNavTarget, setSelectedNavTarget] = useState<{
    name: string;
    lat: number;
    lon: number;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'quest' | 'poi' | 'hotel'>('quest');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Phase Completion Celebration Modals state
  const [activeVictoryModal, setActiveVictoryModal] = useState<'phase1' | 'phase2' | 'phase3' | 'finale' | null>(null);
  const [dismissedModals, setDismissedModals] = useState<string[]>([]);

  // Phase Calculations
  const isPhase1Done = PHASE_1_POIS.every(id => unlockedRewards.includes(id));
  const isPhase2Done = isPhase1Done && PHASE_2_POIS.every(id => unlockedRewards.includes(id));
  const isPhase3Done = isPhase2Done && PHASE_3_POIS.every(id => unlockedRewards.includes(id));
  const isGrandFinaleDone = isPhase3Done && GRAND_FINALE_POIS.every(id => unlockedRewards.includes(id));

  const currentPhase = !isPhase1Done ? 1 : !isPhase2Done ? 2 : !isPhase3Done ? 3 : 4;

  // Trigger Victory Celebrations on phase completions
  useEffect(() => {
    if (isGrandFinaleDone && !dismissedModals.includes('finale')) {
      setActiveVictoryModal('finale');
    } else if (isPhase3Done && !dismissedModals.includes('phase3')) {
      setActiveVictoryModal('phase3');
    } else if (isPhase2Done && !dismissedModals.includes('phase2')) {
      setActiveVictoryModal('phase2');
    } else if (isPhase1Done && !dismissedModals.includes('phase1')) {
      setActiveVictoryModal('phase1');
    }
  }, [isPhase1Done, isPhase2Done, isPhase3Done, isGrandFinaleDone, dismissedModals]);

  const handleCloseVictoryModal = (modalKey: 'phase1' | 'phase2' | 'phase3' | 'finale') => {
    setDismissedModals(prev => [...prev, modalKey]);
    setActiveVictoryModal(null);
  };

  const isOnline = useNetwork();
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Register Global Popup Navigation Handler
  useEffect(() => {
    (window as any).startNavigationFromPopup = (name: string, lat: number, lon: number) => {
      setSelectedNavTarget({ name, lat, lon });
      setIsNavigating(true);
    };

    return () => {
      delete (window as any).startNavigationFromPopup;
    };
  }, []);

  // Register PMTiles Protocol for offline vector map fallback
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    return () => {
      try {
        maplibregl.removeProtocol('pmtiles');
      } catch (e) {
        // Safeguard
      }
    };
  }, []);

  // Helper: apply Geoapify MapTiler 3D custom paint overrides
  const applyGeoapifyPaintOverrides = (mapInstance: maplibregl.Map) => {
    const safeSet = (layerId: string, prop: string, value: any) => {
      try {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.setPaintProperty(layerId, prop, value);
        }
      } catch (_) { }
    };
    safeSet('background', 'background-color', '#eff1e3');
    safeSet('landuse-residential', 'fill-color', '#e0d9ce');
    safeSet('landcover_grass', 'fill-color', '#c5f179');
    safeSet('park', 'fill-color', 'rgba(175,214,108,0.53)');
    safeSet('landcover_wood', 'fill-color', '#bcda89');
    safeSet('road_path', 'line-color', '#adadad');
    safeSet('road_minor', 'line-color', '#ffffff');
    safeSet('road_trunk_primary', 'line-color', '#f7dcb2');
    safeSet('road_secondary_tertiary', 'line-color', '#fff299');
    safeSet('building-3d', 'fill-extrusion-color', '#95a6c0ff');
  };

  // 1. Initialize MapLibre Instance with full native touch tilt & right-click angle controls
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialStyle = navigator.onLine ? GEOAPIFY_MAPTILER_3D : OFFLINE_STYLE;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [TUZLA_CENTER[1], TUZLA_CENTER[0]],
      zoom: 15.5,
      pitch: 55,
      bearing: -15,
      dragRotate: true,
      pitchWithRotate: true,
      touchPitch: true,
      touchZoomRotate: true,
      attributionControl: false,
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      setIsLoaded(true);

      mapInstance.dragRotate.enable();
      mapInstance.touchPitch.enable();
      mapInstance.touchZoomRotate.enable();

      // Listen to pitch and rotate events to keep state in sync
      mapInstance.on('pitch', () => {
        setPitch(Math.round(mapInstance.getPitch()));
      });
      mapInstance.on('rotate', () => {
        setBearing(Math.round(mapInstance.getBearing()));
      });

      if (mapInstance.getStyle().name?.toLowerCase().includes('maptiler') ||
        (mapInstance as any)._requestedStyleURL?.includes('geoapify')) {
        applyGeoapifyPaintOverrides(mapInstance);
      }

      mapInstance.addControl(
        new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
        'bottom-right'
      );
    });

    mapInstance.on('styledata', () => {
      if (map.current && activeStyle === GEOAPIFY_MAPTILER_3D) {
        applyGeoapifyPaintOverrides(map.current);
      }
    });

    mapInstance.on('error', (e) => {
      const msg = e.error?.message || '';
      console.warn('🗺️ Map style error:', msg);

      if (!navigator.onLine && !isOfflineMode) {
        setIsOfflineMode(true);
        setActiveStyle(OFFLINE_STYLE);
        mapInstance.setStyle(OFFLINE_STYLE);
      } else if (navigator.onLine) {
        setActiveStyle(CARTO_VOYAGER_STYLE);
        mapInstance.setStyle(CARTO_VOYAGER_STYLE);
      }
    });

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  // Switch Layer / Map Style Handler
  const handleSwitchLayer = (styleUrl: string) => {
    if (map.current) {
      setActiveStyle(styleUrl);
      map.current.setStyle(styleUrl);
      setShowLayerMenu(false);
    }
  };

  // Render POI Quest Target markers filtered by active Game Phase
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Filter visible targets based on game phase progression
    const visibleTargets = QUEST_TARGETS.filter((target) => {
      if (currentPhase === 1) {
        return PHASE_1_POIS.includes(target.id);
      } else if (currentPhase === 2) {
        return PHASE_1_POIS.includes(target.id) || PHASE_2_POIS.includes(target.id);
      } else if (currentPhase === 3) {
        return PHASE_1_POIS.includes(target.id) || PHASE_2_POIS.includes(target.id) || PHASE_3_POIS.includes(target.id);
      }
      return true; // Phase 4 / Grand Finale: All targets visible
    });

    visibleTargets.forEach((target) => {
      const isUnlocked = unlockedRewards.includes(target.id);
      const isCompletedFromPreviousPhase = (
        (currentPhase >= 2 && PHASE_1_POIS.includes(target.id)) ||
        (currentPhase >= 3 && PHASE_2_POIS.includes(target.id)) ||
        (currentPhase >= 4 && PHASE_3_POIS.includes(target.id))
      );

      const matchedLoc = LOCATIONS.find(
        (l) =>
          l.id === target.id ||
          l.id.toLowerCase() === target.id.toLowerCase() ||
          l.name.bs.toLowerCase().includes(target.name.bs.toLowerCase()) ||
          l.name.en.toLowerCase().includes(target.name.en.toLowerCase())
      );

      const coords = QUEST_TARGET_COORDS[target.id] ||
        (matchedLoc ? { lat: matchedLoc.coordinates[0], lon: matchedLoc.coordinates[1] } : null);

      if (!coords) return;

      const title = target.name[lang] || target.name.bs;
      const imageUrl = target.Image || matchedLoc?.image || '/assets/Gallery/QuestQRLocations/trgslobode.webp';
      const description = matchedLoc?.description?.[lang] ||
        matchedLoc?.description?.bs ||
        matchedLoc?.description?.en ||
        (lang === 'bs' ? 'Kulturna i historijska znamenitost grada Tuzle.' : 'Cultural and historical landmark of Tuzla.');

      const customPoiColor = POI_COLORS[target.id] || '#3b82f6';

      const el = document.createElement('div');
      el.className = `quest-target-marker transition-all duration-300 ${
        isCompletedFromPreviousPhase ? 'opacity-40 grayscale blur-[0.5px] scale-90' : 'opacity-100 hover:scale-125'
      }`;
      el.innerHTML = `
        <div class="relative flex items-center justify-center cursor-pointer group" title="${title}">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl transition-all border-2" style="background-color: ${customPoiColor}; border-color: ${isUnlocked ? '#fef08a' : '#ffffff'}; box-shadow: 0 0 15px ${customPoiColor};">
            <span class="text-xs font-black text-white">${isUnlocked ? '★' : '📍'}</span>
          </div>
          <div class="absolute -bottom-1 w-2.5 h-2.5 rotate-45 rounded-sm" style="background-color: ${customPoiColor};"></div>
        </div>
      `;

      const marker = new maplibregl.Marker(el)
        .setLngLat([coords.lon, coords.lat])
        .addTo(map.current!);

      const popupHtml = `
        <div style="font-family: 'Quicksand', sans-serif; padding: 10px; background: #090d16; border-radius: 16px; color: white; width: 220px; border: 1px solid ${customPoiColor}; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);">
          <div style="position: relative; overflow: hidden; border-radius: 10px; height: 100px; margin-bottom: 8px; background: #1e293b;">
            <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'"/>
            <div style="position: absolute; top: 4px; right: 4px; background: ${isUnlocked ? customPoiColor : 'rgba(15, 23, 42, 0.9)'}; color: #ffffff; padding: 2px 6px; border-radius: 8px; font-weight: 900; font-size: 9px;">
              ${isUnlocked ? '★ ' + (lang === 'bs' ? 'Otključano' : 'Unlocked') : '🔒 ' + (lang === 'bs' ? 'Zaključano' : 'Locked')}
            </div>
          </div>
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; color: #f8fafc; line-height: 1.2;">
            ${title}
          </h4>
          <p style="font-size: 10px; margin: 0 0 10px 0; color: #94a3b8; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${description}
          </p>
          <div style="display: flex; gap: 6px;">
            <button onclick="window.startNavigationFromPopup('${title.replace(/'/g, "\\'")}', ${coords.lat}, ${coords.lon})" style="width: 100%; background: ${customPoiColor}; border: none; border-radius: 10px; color: white; padding: 7px 0; font-weight: 800; font-size: 10px; cursor: pointer; font-family: 'Quicksand', sans-serif; box-shadow: 0 4px 12px ${customPoiColor}66;">
              ${lang === 'bs' ? '🧭 GPS Navigacija' : '🧭 Navigate'}
            </button>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false, maxWidth: '240px' }).setHTML(popupHtml);
      marker.setPopup(popup);

      markersRef.current[target.id] = marker;
    });

    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
    };
  }, [isLoaded, unlockedRewards, lang, currentPhase]);

  // Clear Routing Layers
  const clearRoute = () => {
    if (map.current) {
      try {
        if (map.current.getLayer('route-layer')) map.current.removeLayer('route-layer');
        if (map.current.getLayer('route-layer-casing')) map.current.removeLayer('route-layer-casing');
        if (map.current.getSource('route-source')) map.current.removeSource('route-source');
      } catch (err) {
        console.warn('Error clearing route layers:', err);
      }
    }
    setRouteDistance(null);
    setRouteTime(null);
  };

  // Calculate Route via Geoapify API with Straight-Line fallback
  const calculateRoute = async (startLoc: [number, number], target: { name: string; lat: number; lon: number }) => {
    if (!map.current || !isLoaded) return;
    setIsRouteLoading(true);

    try {
      const ROUTE_MAP_KEY = ['63e8b34f44974d71', 'bc70aad63e5b56ba'].join('');
      const apiKey = import.meta.env.VITE_GEOAPIFY_ROUTING_API || import.meta.env.VITE_GEOAPIFY_STATIC_API || ROUTE_MAP_KEY;
      const url = `https://api.geoapify.com/v1/routing?waypoints=${startLoc[1]},${startLoc[0]}|${target.lat},${target.lon}&mode=walk&apiKey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Routing API request failed');

      const data = await res.json();
      if (!data || !data.features || data.features.length === 0) {
        throw new Error('No route found');
      }

      const routeFeature = data.features[0];
      const distance = routeFeature.properties.distance;
      const time = routeFeature.properties.time;

      setRouteDistance(distance);
      setRouteTime(time);

      if (!map.current) return;

      if (map.current.getSource('route-source')) {
        const source = map.current.getSource('route-source') as maplibregl.GeoJSONSource;
        source.setData(data);
      } else {
        map.current.addSource('route-source', {
          type: 'geojson',
          data: data,
        });

        map.current.addLayer({
          id: 'route-layer-casing',
          type: 'line',
          source: 'route-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#1c8a44', 'line-width': 9, 'line-opacity': 0.5 },
        });

        map.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#22c55e', 'line-width': 4, 'line-opacity': 0.9 },
        });
      }

      const coordinates = routeFeature.geometry.coordinates;
      if (coordinates && coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => bounds.extend(coord));

        map.current.fitBounds(bounds, {
          padding: { top: 120, bottom: 240, left: 60, right: 60 },
          duration: 1500,
        });
      }
    } catch (error) {
      console.warn('Geoapify route fallback triggered (straight-line calculation):', error);
      const distKm = getDistance(startLoc[0], startLoc[1], target.lat, target.lon);
      const distMeters = distKm * 1000;
      const estTimeSec = distMeters / 1.4;

      setRouteDistance(distMeters);
      setRouteTime(estTimeSec);

      const lineGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [startLoc[1], startLoc[0]],
                [target.lon, target.lat],
              ],
            },
            properties: {},
          },
        ],
      };

      if (map.current.getSource('route-source')) {
        (map.current.getSource('route-source') as maplibregl.GeoJSONSource).setData(lineGeoJson as any);
      } else {
        map.current.addSource('route-source', { type: 'geojson', data: lineGeoJson as any });
        map.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 2] },
        });
      }
    } finally {
      setIsRouteLoading(false);
    }
  };

  // Trigger GPS Routing when navigation state changes
  useEffect(() => {
    if (isNavigating && selectedNavTarget && isLoaded) {
      const start = userLocationRef.current || [TUZLA_CENTER[0], TUZLA_CENTER[1]];
      calculateRoute(start, selectedNavTarget);
    } else {
      clearRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating, selectedNavTarget, isLoaded]);


  // Watch Position & User Marker
  useEffect(() => {
    let watchId: number;

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          userLocationRef.current = [longitude, latitude];

          if (map.current && isLoaded) {
            if (!userMarkerRef.current) {
              const el = document.createElement('div');
              el.className = 'user-gps-marker';
              el.innerHTML = `
              <div class="relative flex items-center justify-center w-6 h-6">
                <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
                <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
              </div>
            `;
              userMarkerRef.current = new maplibregl.Marker(el)
                .setLngLat([longitude, latitude])
                .addTo(map.current);
              // Fly to user on first GPS lock
              map.current?.flyTo({ center: [longitude, latitude], zoom: 17, pitch: 60, duration: 2000 });
            } else {
              userMarkerRef.current.setLngLat([longitude, latitude]);
            }

            // Set global position for the nav line logic
            (window as any).currentUserLngLat = [longitude, latitude];

            // Update navigation line
            let targetPoint = navigationTarget;

            if (!targetPoint) {
              const lockedPoints = LOCATIONS.filter(l => !unlockedRewards.includes(l.id) && l.category !== 'hotel' && l.category !== 'food' && l.category !== 'shop');
              if (lockedPoints.length > 0) {
                let closest = lockedPoints[0];
                let minDist = getDistance(latitude, longitude, closest.coordinates[0], closest.coordinates[1]);
                lockedPoints.forEach(p => {
                  const d = getDistance(latitude, longitude, p.coordinates[0], p.coordinates[1]);
                  if (d < minDist) { minDist = d; closest = p; }
                });
                targetPoint = closest;
              }
            }

            if (targetPoint) {
              const navLineSource = map.current.getSource('nav-line') as maplibregl.GeoJSONSource;
              if (navLineSource) {
                navLineSource.setData({
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [longitude, latitude],
                      [targetPoint.coordinates[1], targetPoint.coordinates[0]]
                    ]
                  }
                });
              }
            }
          }
        },
        (err) => {
          console.error("MapQuest Geolocation Error:", err);
          if (err.code === 3 || err.code === 1) {
            navigator.geolocation.getCurrentPosition(
              (p) => setUserLocation([p.coords.latitude, p.coords.longitude]),
              (e) => console.error("MapQuest Fallback Geolocation Error:", e),
              { enableHighAccuracy: false, timeout: 10000 }
            );
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    };

    startTracking();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isLoaded, navigationTarget, unlockedRewards]);

  // End Navigation
  const handleEndNavigation = () => {
    setIsNavigating(false);
    setSelectedNavTarget(null);
    setRouteDistance(null);
    setRouteTime(null);
    if (onClearNavigation) onClearNavigation();
  };

  // Trigger map resize when showARGuide toggles so top 40% canvas resizes instantly
  useEffect(() => {
    if (map.current) {
      const timer = setTimeout(() => {
        map.current?.resize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showARGuide]);

  const unlockedItemsCount = unlockedRewards.length;
  const totalItemsCount = QUEST_TARGETS.length;

  return (
    <div className="h-[calc(100vh-88px)] w-full relative flex flex-col overflow-hidden bg-slate-950 font-quicksand">
      {/* TOP 40% OR 100% CONTAINER: INTERACTIVE 3D MAPQUESTVIEW MAP */}
      <div
        ref={mapContainer}
        className={`w-full transition-all duration-300 ${
          showARGuide
            ? 'h-[40%] flex-shrink-0 border-b-2 border-amber-500/50 shadow-2xl'
            : 'h-full flex-1'
        }`}
      />

      {/* BOTTOM 60% CONTAINER: AR GUIDE LOGIC PANEL */}
      {showARGuide && (
        <div className="h-[60%] w-full flex-1 relative flex flex-col bg-slate-950 border-t-2 border-amber-500/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header Bar */}
          <div className="p-2.5 bg-slate-900/95 border-b border-amber-500/30 flex justify-between items-center z-50 shrink-0 px-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CameraIcon className="w-4 h-4 text-amber-400 animate-pulse" />
              {lang === 'bs' ? 'AR Vodič & Navigacija (60% Ekran)' : 'AR Guide & Navigation (60% Screen)'}
            </span>
            <button
              onClick={() => setShowARGuide(false)}
              className="p-1 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 px-2.5 text-[10px] font-bold active:scale-95"
            >
              <X className="w-4 h-4" />
              {lang === 'bs' ? 'Zatvori AR' : 'Close AR'}
            </button>
          </div>
          {/* AR Guide Logic Component */}
          <div className="flex-1 relative overflow-hidden">
            <ARGuide
              lang={lang}
              features={features}
              onNavigate={poi => {
                setShowARGuide(false);
                setSelectedNavTarget({ name: poi.name[lang] || poi.name.bs, lat: poi.coordinates[0], lon: poi.coordinates[1] });
              }}
            />
          </div>
        </div>
      )}

      {/* GAMIFIED PHASE VICTORY MODALS */}
      <AnimatePresence>
        {activeVictoryModal === 'phase1' && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
                <Trophy className="w-9 h-9 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                FAZA 1 ZAVRŠENA! / PHASE 1 COMPLETE!
              </span>
              <h3 className="text-2xl font-black text-white">
                Otključana Faza 2! 🚀
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Čestitamo! Uspješno ste otključali <b>Trg Slobode</b>, <b>Kapiju</b> i <b>Mešu Selimovića</b>.
                Sada su otključane lokacije Faze 2: Park Kralja Tvrtka, Palančikara i Solni Trg!
              </p>
              <button
                onClick={() => handleCloseVictoryModal('phase1')}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all uppercase tracking-wider text-xs active:scale-95"
              >
                Kreni na Fazu 2 🎉
              </button>
            </motion.div>
          </div>
        )}

        {activeVictoryModal === 'phase2' && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center animate-pulse">
                <Trophy className="w-9 h-9 text-purple-300" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                FAZA 2 ZAVRŠENA • SOLANA NFT REWARD! ⚽
              </span>
              <h3 className="text-2xl font-black text-white">
                Osvojili ste NFT Karticu!
              </h3>
              
              {/* Bosnia Football Squad NFT Card Preview */}
              <div className="w-full bg-slate-950/80 border border-purple-400/40 rounded-2xl p-4 flex flex-col items-center space-y-2 relative overflow-hidden shadow-inner">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-600/80 text-[8px] font-black text-white uppercase">
                  Solana Devnet
                </div>
                <img
                  src="/assets/Gallery/Photos/tuzla12.webp"
                  alt="Bosnia Football Squad NFT"
                  className="w-24 h-24 rounded-xl object-cover border-2 border-purple-400 shadow-md"
                />
                <h4 className="font-extrabold text-sm text-purple-200">Bosnia Football Squad Collectible</h4>
                <p className="text-[10px] text-purple-300 font-mono">Sent to Solflare Wallet (Solana Devnet)</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Čestitamo! Otključali ste Park Kralja Tvrtka, Palančikara Bagi i Solni Trg. Vaša nagradna NFT kartica reprezentacije je pripremljena za Solflare novčanik.
              </p>

              <button
                onClick={() => handleCloseVictoryModal('phase2')}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-wider text-xs active:scale-95"
              >
                Preuzmi & Nastavi na Fazu 3 🚀
              </button>
            </motion.div>
          </div>
        )}

        {activeVictoryModal === 'phase3' && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-rose-950 to-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center space-y-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />
              
              <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center animate-bounce shadow-2xl">
                <span className="text-4xl">❤️</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-400/30">
                FAZA 3 GRANDIOZNA POBJEDA! 🎆
              </span>
              <h3 className="text-2xl font-black text-white">
                SRCE TUZLE! ❤️
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Fantastično! Otključali ste <b>Panoniku</b>, <b>Slapove</b>, <b>Slanu Banju</b> i <b>Atelje Ismet Mujezinović</b>. Osvojili ste trofej "Srce Tuzle"!
              </p>
              <button
                onClick={() => handleCloseVictoryModal('phase3')}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-wider text-xs active:scale-95"
              >
                Otvori Veliko Finale (Bingo City Centar) 🏆
              </button>
            </motion.div>
          </div>
        )}

        {activeVictoryModal === 'finale' && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center animate-spin-slow shadow-2xl">
                <Trophy className="w-10 h-10 text-amber-300" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                VELIKO FINALE ZAVRŠENO • ZLATNI PARTNER! 🌟
              </span>
              <h3 className="text-2xl font-black text-white">
                Bingo City Centar Nagrada!
              </h3>
              <div className="w-full bg-amber-500/10 border border-amber-400/40 rounded-2xl p-4 text-center space-y-1">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Kupon Popusta Trgovine</span>
                <p className="text-2xl font-black text-white tracking-widest font-mono">BCC-GOLDEN-TUZLA-2026</p>
                <p className="text-[10px] text-amber-200/80">Predočite kod za posebni popust u Bingo City Centru!</p>
              </div>
              <button
                onClick={() => handleCloseVictoryModal('finale')}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl transition-all uppercase tracking-wider text-xs active:scale-95"
              >
                Preuzmi Nagradu & Završi 👑
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP FLOATING NAVIGATION HUB */}
      <div className="absolute top-4 inset-x-0 mx-auto z-10 w-[92%] max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-3xl border border-blue-500/30 shadow-2xl flex flex-col gap-2.5">
          {/* Header Title & Progress */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              {lang === 'bs' ? 'Tuzla Potraga' : 'Tuzla Quest'}
            </h2>
            <div className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black text-blue-400">
              {unlockedItemsCount} / {totalItemsCount} {lang === 'bs' ? 'Otključano' : 'Unlocked'}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2">
            {/* QR Scanner Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-gradient-to-b from-amber-500/20 to-amber-600/10 hover:from-amber-500 hover:to-amber-600 text-amber-300 hover:text-slate-950 rounded-2xl border border-amber-500/30 transition-all active:scale-95 shadow-md"
            >
              <QrCode className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">QR Code</span>
            </button>
            {/* AR Guide Button */}
            <button
              onClick={() => setShowARGuide((prev) => !prev)}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-gradient-to-b from-purple-500/20 to-purple-600/10 hover:from-purple-500 hover:to-purple-600 text-purple-300 hover:text-slate-950 rounded-2xl border border-purple-500/30 transition-all active:scale-95 shadow-md"
            >
              <Compass className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">AR Guide</span>
            </button>

            {/* GPS / Route Selector Button */}
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-gradient-to-b from-blue-500/20 to-blue-600/10 hover:from-blue-500 hover:to-blue-600 text-blue-300 hover:text-white rounded-2xl border border-blue-500/30 transition-all active:scale-95 shadow-md"
            >
              <Route className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">GPS Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT CONTROLS (LOCATION, RULES & LAYER SWITCHER) */}
      <div
        className={`absolute z-20 flex items-center gap-2 transition-all duration-300 ${
          showARGuide ? 'bottom-[62%] left-4' : 'bottom-4 left-4'
        }`}
      >
        <button
          onClick={() => {
            if (userLocation && map.current) {
              map.current.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 17, pitch: 60 });
            }
          }}
          className="w-10 h-10 flex items-center justify-center bg-blue-600/90 backdrop-blur-xl border border-blue-400/40 rounded-full shadow-lg text-white active:scale-95 transition-all hover:bg-blue-500"
          title={lang === 'bs' ? 'Moja Lokacija' : 'My Location'}
        >
          <Navigation size={18} />
        </button>

        <button
          onClick={() => setShowRules((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl border border-blue-400/30 rounded-full shadow-lg text-blue-400 hover:text-white active:scale-95 transition-all"
          title={lang === 'bs' ? 'Pravila Potrage' : 'Quest Rules'}
        >
          <Info size={18} />
        </button>

        <button
          onClick={() => setShowLayerMenu((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl border border-blue-400/40 rounded-full shadow-xl text-blue-400 hover:text-white hover:border-blue-400 active:scale-95 transition-all"
          title={lang === 'bs' ? 'Promijeni Sloj Mape' : 'Switch Map Layer'}
        >
          <Layers size={18} />
        </button>
      </div>

      {/* BOTTOM LEFT FLOATING LAYER MENU POPUP */}
      <AnimatePresence>
        {showLayerMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={`absolute z-30 w-64 p-3 bg-slate-900/95 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-2xl space-y-1.5 transition-all duration-300 ${
              showARGuide ? 'bottom-[calc(62%+48px)] left-4' : 'bottom-16 left-4'
            }`}
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 border-b border-white/5 flex items-center justify-between">
              <span>{lang === 'bs' ? 'Sloj Mape' : 'Map Layer'}</span>
              <Layers size={12} className="text-blue-400" />
            </div>
            {MAP_LAYER_OPTIONS.map((layerOpt) => {
              const isSelected = activeStyle === layerOpt.url;
              return (
                <button
                  key={layerOpt.id}
                  onClick={() => handleSwitchLayer(layerOpt.url)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className="truncate">{layerOpt.name[lang] || layerOpt.name.bs}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-white" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* RULES POPUP OVERLAY */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 left-4 z-30 max-w-[280px] p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 shadow-2xl text-xs text-slate-200"
          >
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
              <span className="font-black text-amber-400 uppercase tracking-wide text-[10px]">
                {lang === 'bs' ? 'Pravila Potrage' : 'Quest Rules'}
              </span>
              <button onClick={() => setShowRules(false)} className="text-white/60 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {lang === 'bs'
                ? 'Pronađite označene lokacije po gradu, usmjerite kameru ili skenirajte QR kod za otključavanje nagrada!'
                : 'Find marked locations around the city, frame them with your camera or scan QR codes to unlock rewards!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESTINATION PRESET SELECTOR MODAL */}
      <AnimatePresence>
        {isPresetModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg overflow-hidden border bg-slate-900/95 backdrop-blur-2xl border-blue-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Compass className="text-blue-400" size={22} />
                    {lang === 'bs' ? 'Odaberi Odredište Potrage' : 'Choose Quest Target'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {lang === 'bs' ? 'Započni pješačku rutu do lokacije u Tuzli' : 'Start a walking route to a location in Tuzla'}
                  </p>
                </div>
                <button
                  onClick={() => setIsPresetModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-5 py-2 border-b border-white/5 flex gap-2">
                <button
                  onClick={() => setActiveModalTab('quest')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${activeModalTab === 'quest'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Trophy size={14} />
                  {lang === 'bs' ? 'Potraga' : 'Quest Targets'}
                </button>
                <button
                  onClick={() => setActiveModalTab('poi')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${activeModalTab === 'poi'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Landmark size={14} />
                  {lang === 'bs' ? 'Znamenitosti' : 'Landmarks'}
                </button>
                <button
                  onClick={() => setActiveModalTab('hotel')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${activeModalTab === 'hotel'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <HotelIcon size={14} />
                  {lang === 'bs' ? 'Hoteli' : 'Hotels'}
                </button>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {activeModalTab === 'quest' ? (
                  QUEST_TARGETS.map((target) => {
                    const isUnlocked = unlockedRewards.includes(target.id);
                    const coords = QUEST_TARGET_COORDS[target.id];
                    const title = target.name[lang] || target.name.bs;

                    return (
                      <button
                        key={target.id}
                        onClick={() => {
                          if (coords) {
                            setSelectedNavTarget({
                              name: title,
                              lat: coords.lat,
                              lon: coords.lon,
                            });
                            setIsNavigating(true);
                            setIsPresetModalOpen(false);
                          }
                        }}
                        className="w-full p-3.5 bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/50 border border-white/5 rounded-2xl transition-all flex items-center justify-between group text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={target.Image}
                            alt={title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                              {title}
                            </h4>
                            <span
                              className={`text-[10px] uppercase font-black tracking-wider ${isUnlocked ? 'text-amber-400' : 'text-blue-400/80'
                                }`}
                            >
                              {isUnlocked ? '★ ' + (lang === 'bs' ? 'Otključano' : 'Unlocked') : '🔒 ' + (lang === 'bs' ? 'Zaključano' : 'Locked')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400 group-hover:underline">
                            {lang === 'bs' ? 'Navigiraj' : 'Navigate'}
                          </span>
                          <Route size={18} className="text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    );
                  })
                ) : activeModalTab === 'poi' ? (
                  ROUTE_POI_PRESETS.map((poi, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedNavTarget({
                          name: poi.name[lang] ?? poi.name.en,
                          lat: poi.lat,
                          lon: poi.lon,
                        });
                        setIsNavigating(true);
                        setIsPresetModalOpen(false);
                      }}
                      className="w-full p-3.5 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 border border-white/5 rounded-2xl transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Landmark size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                            {poi.name[lang] ?? poi.name.en}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400/80">
                            {poi.category}
                          </span>
                        </div>
                      </div>
                      <Route size={18} className="text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                ) : (
                  TUZLA_HOTELS.map((hotel, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedNavTarget({
                          name: hotel.name,
                          lat: hotel.latitude,
                          lon: hotel.longitude,
                        });
                        setIsNavigating(true);
                        setIsPresetModalOpen(false);
                      }}
                      className="w-full p-3.5 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 border border-white/5 rounded-2xl transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <HotelIcon size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                            {hotel.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400/80">
                            {hotel.rating} ★ • {hotel.priceRange}
                          </span>
                        </div>
                      </div>
                      <Route size={18} className="text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXTRACTED NAVIGATION HUD OVERLAY */}
      <NavigationHud
        isNavigating={isNavigating}
        selectedNavTarget={selectedNavTarget}
        lang={lang}
        routeDistance={routeDistance}
        routeTime={routeTime}
        isRouteLoading={isRouteLoading}
        onEndNavigation={handleEndNavigation}
      />

      {/* EXTRACTED QR SCANNER MODAL */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        lang={lang}
        unlockedRewards={unlockedRewards}
        onRewardFound={onRewardFound}
      />

    </div>
  );
};

export default MapQuestView;
