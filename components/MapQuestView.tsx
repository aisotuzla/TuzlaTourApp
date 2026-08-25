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

import { AppFeatures } from '../utils/platform';
import { Language } from '../types';
import { TUZLA_CENTER, LOCATIONS } from '../constants';
import { useNetwork } from '../hooks/useNetwork';
import { useQuestRuntimePolicy } from '../hooks/useQuestRuntimePolicy';
import { getDistance } from '../utils/geoUtils';
import {
  QUEST_TARGETS,
  POI_COLORS,
  NFT_REWARD_IDS,
  ROUTE_POI_PRESETS,
} from '../constants/questData';

import { NavigationHud } from './NavigationHud';
import { QrScannerModal } from './QrScannerModal';
import { POICameraModal } from './POICameraModal';


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
  ismet: { lat: 44.5375, lon: 18.6805 },
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
export const CARTO_VOYAGER_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
export const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
export const OFFLINE_STYLE = '/maps/tiles/offline-vector-style.json';

const MAP_LAYER_OPTIONS = [
  { id: 'voyager', name: { bs: 'CARTO Voyager (Detaljna)', en: 'CARTO Voyager (Detailed)' }, url: CARTO_VOYAGER_STYLE },
  { id: 'dark', name: { bs: 'CARTO Dark (Tamna)', en: 'CARTO Dark (Dark)' }, url: CARTO_DARK_STYLE },
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

  // Core Map State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string>(CARTO_VOYAGER_STYLE);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);

  // Modals & Navigation State
  const [isScannerOpen, setIsScannerOpen] = useState(initialOpenScanner);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraModalPoi, setCameraModalPoi] = useState<{ id: string; name: string }>({
    id: 'trg_slobode',
    name: 'Trg Slobode',
  });
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

  // 1. Initialize MapLibre Instance with CARTO Voyager Primary Basemap
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialStyle = navigator.onLine ? CARTO_VOYAGER_STYLE : OFFLINE_STYLE;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [TUZLA_CENTER[1], TUZLA_CENTER[0]],
      zoom: 15.5,
      pitch: 55,
      bearing: -15,
      attributionControl: false,
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      setIsLoaded(true);

      // Add navigation controls
      mapInstance.addControl(
        new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
        'bottom-right'
      );

      // 3D Buildings Extrusion setup
      setupBuildingExtrusions(mapInstance);
    });

    mapInstance.on('styledata', () => {
      if (map.current) {
        setupBuildingExtrusions(map.current);
      }
    });

    mapInstance.on('error', (e) => {
      console.warn('🗺️ MapQuest CARTO Style event error:', e.error?.message);
      if (!navigator.onLine && !isOfflineMode) {
        console.log('🔌 Offline detected, switching to Tuzla.pmtiles style...');
        setIsOfflineMode(true);
        setActiveStyle(OFFLINE_STYLE);
        mapInstance.setStyle(OFFLINE_STYLE);
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

  // 2-Way 3D building extrusions helper (CARTO vector silvery layer + GeoJSON custom layer)
  const setupBuildingExtrusions = (mapInstance: maplibregl.Map) => {
    try {
      const layers = mapInstance.getStyle().layers || [];
      let labelLayerId: string | undefined;

      for (const layer of layers) {
        if (layer.type === 'symbol' && (layer as any).layout?.['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }

      // Check if CARTO vector building layer exists in style
      const cartoBuildingLayer = layers.find(
        (l: any) => l.source === 'carto' || l['source-layer'] === 'building' || l.id.includes('building')
      );

      // WAY 1: CARTO Vector 3D Buildings (Silvery gradient finish)
      if (cartoBuildingLayer && !mapInstance.getLayer('3d-buildings-silvery')) {
        const sourceId = (cartoBuildingLayer as any).source || 'carto';
        const sourceLayer = (cartoBuildingLayer as any)['source-layer'] || 'building';

        mapInstance.addLayer(
          {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#a8a3a3ff',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.9
            }
          }); mapInstance.addLayer(
            {
              id: '3d-buildings-silvery',
              source: sourceId,
              'source-layer': sourceLayer,
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
                  0,
                  '#d1d5db',
                  25,
                  '#9ca3af',
                  60,
                  '#64748b',
                ],
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13,
                  0,
                  15.5,
                  ['coalesce', ['get', 'render_height'], ['get', 'height'], 12],
                ],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                'fill-extrusion-opacity': 0.9,
                'fill-extrusion-vertical-gradient': true,
              },
            },
            labelLayerId
          );
      }

      // WAY 2: Custom GeoJSON 3D Buildings (TuzlaTourGuide.geojson)
      if (!mapInstance.getLayer('3d-buildings-geojson')) {
        const geojsonSourceId = 'my-custom-buildings';
        if (!mapInstance.getSource(geojsonSourceId)) {
          mapInstance.addSource(geojsonSourceId, {
            type: 'geojson',
            data: '/maps/TuzlaTourGuide.geojson',
          });
        }

        mapInstance.addLayer(
          {
            id: '3d-buildings-geojson',
            source: geojsonSourceId,
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'height'], 10],
                0,
                '#e2e8f0',
                30,
                '#94a3b8',
              ],
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
              'fill-extrusion-opacity': 0.9,
              'fill-extrusion-vertical-gradient': true,
            },
          },
          labelLayerId
        );
      }
    } catch (err) {
      console.warn('Could not setup 3D extrusions:', err);
    }
  };

  // Render POI Quest Target markers with popups
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    QUEST_TARGETS.forEach((target) => {
      const isUnlocked = unlockedRewards.includes(target.id);

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

      const el = document.createElement('div');
      el.className = 'quest-target-marker';
      el.innerHTML = `
        <div class="relative flex items-center justify-center cursor-pointer group transition-transform duration-200 hover:scale-125" title="${title}">
          <div class="w-9 h-9 rounded-2xl ${isUnlocked ? 'bg-amber-500 border-2 border-amber-200 text-slate-950 shadow-amber-500/50' : 'bg-slate-900 border-2 border-blue-400 text-blue-400 shadow-blue-500/30'} flex items-center justify-center shadow-2xl transition-all">
            <span class="text-xs font-black">${isUnlocked ? '★' : '📍'}</span>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-blue-500 rotate-45 rounded-sm"></div>
        </div>
      `;

      const marker = new maplibregl.Marker(el)
        .setLngLat([coords.lon, coords.lat])
        .addTo(map.current!);

      const popupHtml = `
        <div style="font-family: 'Quicksand', sans-serif; padding: 10px; background: #090d16; border-radius: 16px; color: white; width: 220px; border: 1px solid rgba(59, 130, 246, 0.3); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);">
          <div style="position: relative; overflow: hidden; border-radius: 10px; height: 100px; margin-bottom: 8px; background: #1e293b;">
            <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'"/>
            <div style="position: absolute; top: 4px; right: 4px; background: ${isUnlocked ? 'rgba(245, 158, 11, 0.9)' : 'rgba(15, 23, 42, 0.9)'}; color: ${isUnlocked ? '#0f172a' : '#38bdf8'}; padding: 2px 6px; border-radius: 8px; font-weight: 900; font-size: 9px;">
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
            <button onclick="window.startNavigationFromPopup('${title.replace(/'/g, "\\'")}', ${coords.lat}, ${coords.lon})" style="width: 100%; background: linear-gradient(135deg, #2563eb, #1d4ed8); border: none; border-radius: 10px; color: white; padding: 7px 0; font-weight: 800; font-size: 10px; cursor: pointer; font-family: 'Quicksand', sans-serif; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
              ${lang === 'bs' ? '🧭 Navigiraj' : '🧭 Navigate'}
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
  }, [isLoaded, unlockedRewards, lang]);

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

  // Watch GPS Position
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        userLocationRef.current = coords;

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
              .setLngLat([coords[1], coords[0]])
              .addTo(map.current);
          } else {
            userMarkerRef.current.setLngLat([coords[1], coords[0]]);
          }
        }
      },
      (err) => console.warn('GPS location error:', err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLoaded]);

  // Handle POI Camera Open
  const handleOpenCameraModal = () => {
    const locked = QUEST_TARGETS.filter((t) => !unlockedRewards.includes(t.id));
    const target = selectedNavTarget
      ? { id: selectedNavTarget.name.toLowerCase().replace(/\s+/g, '_'), name: selectedNavTarget.name }
      : locked.length > 0
        ? { id: locked[0].id, name: locked[0].name[lang] || locked[0].name.bs }
        : { id: 'trg_slobode', name: 'Trg Slobode' };

    setCameraModalPoi(target);
    setIsCameraModalOpen(true);
  };

  // End Navigation
  const handleEndNavigation = () => {
    setIsNavigating(false);
    setSelectedNavTarget(null);
    setRouteDistance(null);
    setRouteTime(null);
    if (onClearNavigation) onClearNavigation();
  };

  const unlockedItemsCount = unlockedRewards.length;
  const totalItemsCount = QUEST_TARGETS.length;

  return (
    <div className="h-[calc(100vh-88px)] w-full relative flex flex-col overflow-hidden bg-slate-950 font-quicksand">
      {/* MAIN MAP CONTAINER */}
      <div ref={mapContainer} className="h-full w-full" />

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

            {/* Camera AI Verify Button */}
            <button
              onClick={handleOpenCameraModal}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500 hover:to-emerald-600 text-emerald-300 hover:text-slate-950 rounded-2xl border border-emerald-500/30 transition-all active:scale-95 shadow-md"
            >
              <CameraIcon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Camera</span>
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

      {/* BOTTOM LEFT CONTROLS (LOCATION & RULES) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
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
        >
          <Info size={18} />
        </button>
      </div>

      {/* BOTTOM RIGHT FLOATING LAYER SWITCHER BUTTON & MENU */}
      <div className="absolute bottom-16 right-4 z-20 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showLayerMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="w-64 p-3 bg-slate-900/95 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-2xl space-y-1.5"
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

        <button
          onClick={() => setShowLayerMenu((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl border border-blue-400/40 rounded-full shadow-xl text-blue-400 hover:text-white hover:border-blue-400 active:scale-95 transition-all"
          title={lang === 'bs' ? 'Promijeni Sloj Mape' : 'Switch Map Layer'}
        >
          <Layers size={18} />
        </button>
      </div>

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

      {/* EXTRACTED POI CAMERA AI MODAL */}
      {isCameraModalOpen && (
        <POICameraModal
          poiId={cameraModalPoi.id}
          poiName={cameraModalPoi.name}
          onSuccess={(msg) => {
            onRewardFound(cameraModalPoi.id);
            setIsCameraModalOpen(false);
          }}
          onClose={() => setIsCameraModalOpen(false)}
        />
      )}

    </div>
  );
};

export default MapQuestView;
