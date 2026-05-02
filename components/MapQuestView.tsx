import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AppFeatures } from '../utils/platform';
import { Language } from '../types';
import { TUZLA_CENTER, LOCATIONS } from '../constants';
import { tuzlaHotelData } from '../tuzlaHotelData';
import { QrCode, Navigation, Gamepad2, CheckCircle2, Lock, Play, X, Trophy } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetwork } from '../hooks/useNetwork';
import ParkQuestViewer from './ParkQuestViewer';
import StreetViewer from './StreetViewer';
import { useQuestRuntimePolicy } from '../hooks/useQuestRuntimePolicy';
import { QuestQualityMode } from '../utils/questRuntimePolicy';
import { getDistance } from '../utils/geoUtils';

const QUEST_TARGETS = [
  { id: 'irish', name: { en: 'Irish Pub', bs: 'Irish Pub' }, image: '/assets/Gallery/QuestQRLocations/44.53521, 18.68835 -Irish.webp' },
  { id: 'galerija', name: { en: 'Gallery', bs: 'Galerija' }, image: '/assets/Gallery/QuestQRLocations/44.535552, 18.688320 -Galerija.webp' },
  { id: 'banja', name: { en: 'Banja', bs: 'Banja' }, image: '/assets/Gallery/QuestQRLocations/44.536846, 18.688140 - Banja.webp' },
  { id: 'panonika', name: { en: 'Pannonica Office', bs: 'Panonika Ured' }, image: '/assets/Gallery/QuestQRLocations/44.539775, 18.682692 -panonikaoffice.webp' },
  { id: 'slapovi', name: { en: 'Waterfalls', bs: 'Slapovi' }, image: '/assets/Gallery/QuestQRLocations/44.540088, 18.681577 -slapovi.webp' },
  { id: 'ismet', name: { en: 'Ismet Mujezinovic', bs: 'Ismet Mujezinović' }, image: '/assets/Gallery/QuestQRLocations/Ismet_Mujezinović.webp' },
  { id: 'mesa_selimovic', name: { en: 'Mesa Selimovic', bs: 'Meša Selimović' }, image: '/assets/Gallery/QuestQRLocations/TuzlaMesaS.webp', video: '/assets/Gallery/QuestQRLocations/MesaSelimovic.mp4' },
  { id: 'tvrtko_park', name: { en: 'King Tvrtko Park', bs: 'Park Kralja Tvrtka I' }, image: '/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko11.webp' },
];

interface MapQuestViewProps {
  lang: Language;
  features: AppFeatures;
  unlockedRewards: string[];
  onRewardFound: (id: string) => void;
  onToggleAR: () => void;
  navigationTarget?: any | null;
  onClearNavigation?: () => void;
  initialOpenScanner?: boolean;
}

const MapQuestView: React.FC<MapQuestViewProps> = ({
  lang,
  features,
  unlockedRewards,
  onRewardFound,
  onToggleAR,
  navigationTarget,
  onClearNavigation,
  initialOpenScanner = false
}) => {
  const { policy, mode, setMode } = useQuestRuntimePolicy(features);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isShowingParkTour, setIsShowingParkTour] = useState(false);
  const [activeStreetView, setActiveStreetView] = useState<{ url: string, title: string, subtitle?: string } | null>(null);
  const isOnline = useNetwork();

  const scannerContainerId = "map-quest-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const markers = useRef<{ [key: string]: maplibregl.Marker }>({});
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const isUtilityMode = policy.qualityLevel === 'utility';
  const isBalancedMode = policy.qualityLevel === 'balanced';
  const scannerFps = isUtilityMode ? 10 : (isBalancedMode ? 12 : 15);
  const scannerQrSize = isUtilityMode ? 220 : 250;
  const qualityOptions: Array<{ value: QuestQualityMode; label: string }> = [
    { value: 'auto', label: 'Auto' },
    { value: 'cinematic', label: 'Cine' },
    { value: 'balanced', label: 'Bal' },
    { value: 'saver', label: 'Save' },
  ];

  const setupBuildings = (mapInstance: maplibregl.Map) => {
    const layers = mapInstance.getStyle().layers ?? [];
    const buildingLayer = layers.find((l: any) => l['source-layer'] === 'building' || l['source-layer'] === 'buildings');
    if (!buildingLayer) return;

    const source = (buildingLayer as any).source;
    const sourceLayer = (buildingLayer as any)['source-layer'];

    if (mapInstance.getLayer('building-outline')) mapInstance.removeLayer('building-outline');
    if (mapInstance.getLayer('building')) mapInstance.removeLayer('building');

    let labelLayerId: string | undefined;
    for (const layer of layers) {
      if (layer.type === 'symbol' && (layer as any).layout?.['text-field']) {
        labelLayerId = layer.id;
        break;
      }
    }

    if (!mapInstance.getLayer('3d-buildings')) {
      mapInstance.addLayer({
        id: '3d-buildings',
        source: source,
        'source-layer': sourceLayer,
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], ['get', 'height'], 15],
            0, '#94a3b8',
            20, '#64748b',
            50, '#475569',
            100, '#334155'
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            15, ['coalesce', ['get', 'render_height'], ['get', 'height'], 15],
          ],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.9,
        },
      }, labelLayerId);
    }
  };

  const setupHighlighters = (mapInstance: maplibregl.Map) => {
    if (mapInstance.getLayer('m4-glow-outer')) return;

    mapInstance.addLayer({
      id: 'm4-glow-outer',
      type: 'line',
      source: 'jawg',
      'source-layer': 'road',
      filter: ['all',
        ['any', ['==', 'road_type', 'primary'], ['==', 'road_type', 'motorway']],
        ['==', 'name', 'Obala Zmaja od Bosne']
      ],
      paint: {
        'line-color': '#facc15',
        'line-width': 12,
        'line-blur': 8,
        'line-opacity': 0.3
      }
    }, '3d-buildings');

    mapInstance.addLayer({
      id: 'm4-glow-inner',
      type: 'line',
      source: 'jawg',
      'source-layer': 'road',
      filter: ['all',
        ['any', ['==', 'road_type', 'primary'], ['==', 'road_type', 'motorway']],
        ['==', 'name', 'Obala Zmaja od Bosne']
      ],
      paint: {
        'line-color': '#fef08a',
        'line-width': 4,
        'line-opacity': 0.6
      }
    }, '3d-buildings');
  };

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (initialOpenScanner) {
      setIsScanning(true);
    }

    const questRules = lang === 'bs'
      ? '<strong>Tuzla Quest Pravila:</strong> Posjetite lokacije na mapi. Skupite sve nagrade! Kada dođete na cilj, skenirajte QR kod na lokaciji kako biste otključali AR sadržaj.'
      : '<strong>Tuzla Quest Rules:</strong> Visit map locations and collect rewards! Once there, scan the QR code to unlock the AR content.';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.jawg.io/styles/jawg-streets.json?access-token=MJ1UjbO1irardUqAtZPQAzlWULZIZAFIsQdTrqkdC9bA34vgAGVMi20z7kP9ZRWX',
      center: [TUZLA_CENTER[1], TUZLA_CENTER[0]],
      zoom: 15,
      pitch: 75,
      bearing: -15,
      attributionControl: false,
    });

    // FAIL-SAFE: If Jawg style fails to load, fallback to local GeoJSON
    map.current.on('error', (e) => {
      console.warn("🗺️ MapQuest: Style error detected, attempting local fallback...", e.error?.message);
      if (e.error?.message?.includes('401') || e.error?.message?.includes('403') || e.error?.message?.includes('Failed to fetch') || e.error?.message?.includes('NetworkError')) {
        setIsOfflineMode(true);
        map.current?.setStyle({
          version: 8,
          sources: {
            'tuzla': {
              type: 'geojson',
              data: 'assets/tuzla-map.geojson'
            }
          },
          layers: [
            { id: 'background', type: 'background', paint: { 'background-color': '#48392cff' } },
            { id: 'water', type: 'fill', source: 'tuzla', filter: ['any', ['==', 'natural', 'water'], ['==', 'waterway', 'river']], paint: { 'fill-color': '#1d4ed8', 'fill-opacity': 0.7 } },
            { id: 'parks', type: 'fill', source: 'tuzla', filter: ['any', ['==', 'leisure', 'park'], ['==', 'landuse', 'grass']], paint: { 'fill-color': '#064e3b', 'fill-opacity': 0.5 } },
            { id: 'roads', type: 'fill', source: 'tuzla', filter: ['has', 'highway'], paint: { 'fill-color': '#95beffff', 'fill-opacity': 0.6 } },
            { id: 'primary-roads', type: 'line', source: 'tuzla', filter: ['any', ['==', 'highway', 'primary'], ['==', 'highway', 'secondary']], paint: { 'line-color': '#010c1aff', 'line-width': 2.5, 'line-opacity': 0.9 } },
            {
              id: 'buildings-3d', type: 'fill-extrusion', source: 'tuzla', filter: ['has', 'building'], paint: {
                'fill-extrusion-color': '#3d3636ff', 'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
                'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0], 'fill-extrusion-opacity': 0.85
              }
            }
          ]
        });
        // Ensure we signal loaded so markers can appear
        setTimeout(() => setIsLoaded(true), 1000);
      }
    });

    map.current.addControl(new maplibregl.AttributionControl({
      customAttribution: questRules
    }));

    // 1. Initial Resources Setup
    const setupResources = () => {
      if (!map.current) return;

      // Add source for navigation line
      if (!map.current.getSource('nav-line')) {
        map.current?.addSource('nav-line', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        map.current?.addLayer({
          id: 'nav-line-layer',
          type: 'line',
          source: 'nav-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#2563eb',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });
      }

      // Simple connect path
      if (!map.current.getSource('connect-path')) {
        map.current?.addSource('connect-path', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: LOCATIONS.map(l => [l.coordinates[1], l.coordinates[0]])
            }
          }
        });

        map.current?.addLayer({
          id: 'connect-path-layer',
          type: 'line',
          source: 'connect-path',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 2,
            'line-opacity': 0.2,
            'line-dasharray': [5, 10]
          }
        });
      }
    };

    // 2. Attach global nav function IMMEDIATELY so buttons work even if style is loading
    (window as any).setGlobalMapNavTarget = (locId: string) => {
      console.log("🚀 Navigating to:", locId);
      let coords: [number, number] | null = null;
      const tgt = LOCATIONS.find(l => l.id === locId);

      if (tgt) {
        coords = [tgt.coordinates[1], tgt.coordinates[0]];
      } else if (locId.startsWith('hotel-')) {
        const idx = parseInt(locId.split('-')[1]);
        const hotelTarget = tuzlaHotelData[idx];
        if (hotelTarget) coords = [hotelTarget.longitude, hotelTarget.latitude];
      }

      if (coords && map.current) {
        map.current.flyTo({ center: coords, zoom: 18, pitch: Math.min(60, policy.mapFx.maxPitch) });

        // Ensure sources exist before setting data
        setupResources();

        const navLineSource = map.current.getSource('nav-line') as maplibregl.GeoJSONSource;
        if (navLineSource && (window as any).currentUserLngLat) {
          const [lng, lat] = (window as any).currentUserLngLat;
          navLineSource.setData({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [[lng, lat], coords] }
          });
        }
      } else {
        console.warn("❌ Could not navigate: Coords or Map missing", { coords, map: !!map.current });
      }
    };

    map.current.on('load', () => {
      setIsLoaded(true);
      setupResources();
      
      // Advanced 3D Lighting for metallic effect
      map.current?.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.15, 210, 30]
      });

      if (isOnline && policy.mapFx.enable3dBuildings) {
        setupBuildings(map.current!);
      }
      if (isOnline) {
        setupHighlighters(map.current!);
      }
    });

    // Special case: if offline mode kicks in via error handler, we might miss 'load'
    map.current.on('styledata', () => {
      if (map.current?.isStyleLoaded()) {
        setupResources();
      }
    });

    (window as any).launchParkVirtualTour = () => {
      setIsShowingParkTour(true);
    };

    (window as any).launchStreetView = (url: string, title: string, subtitle?: string) => {
      setActiveStreetView({ url, title, subtitle });
    };

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle Offline Map Styles
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    if (isOnline) {
      setIsOfflineMode(false);
      map.current.setStyle('https://api.jawg.io/styles/jawg-streets.json?access-token=MJ1UjbO1irardUqAtZPQAzlWULZIZAFIsQdTrqkdC9bA34vgAGVMi20z7kP9ZRWX');

      map.current.once('style.load', () => {
        if (!map.current) return;
        
        // Advanced 3D Lighting
        map.current.setLight({
          anchor: 'viewport',
          color: '#ffffff',
          intensity: 0.4,
          position: [1.15, 210, 30]
        });

        if (policy.mapFx.enable3dBuildings) {
          setupBuildings(map.current);
        }
        setupHighlighters(map.current);
      });
    } else {
      setIsOfflineMode(true);
      map.current.setStyle({
        version: 8,
        sources: {
          'tuzla': {
            type: 'geojson',
            data: 'assets/tuzla-map.geojson'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#f0f3f9ff' }
          },
          {
            id: 'water',
            type: 'fill',
            source: 'tuzla',
            filter: ['any', ['==', 'natural', 'water'], ['==', 'waterway', 'river']],
            paint: { 'fill-color': '#1d4ed8', 'fill-opacity': 0.7 }
          },
          {
            id: 'parks',
            type: 'fill',
            source: 'tuzla',
            filter: ['any', ['==', 'leisure', 'park'], ['==', 'landuse', 'grass']],
            paint: { 'fill-color': '#064e3b', 'fill-opacity': 0.5 }
          },
          {
            id: 'roads',
            type: 'line',
            source: 'tuzla',
            filter: ['has', 'highway'],
            paint: {
              'line-color': '#3b82f6',
              'line-width': 1.5,
              'line-opacity': 0.3
            }
          },
          // M-4 highlight in offline mode
          {
            id: 'm4-glow-offline',
            type: 'line',
            source: 'tuzla',
            filter: ['all', ['has', 'highway'], ['==', 'name', 'Obala Zmaja od Bosne']],
            paint: {
              'line-color': '#facc15',
              'line-width': 6,
              'line-opacity': 0.6
            }
          },
          {
            id: 'primary-roads',
            type: 'line',
            source: 'tuzla',
            filter: ['any', ['==', 'highway', 'primary'], ['==', 'highway', 'secondary']],
            paint: {
              'line-color': '#60a5fa',
              'line-width': 2.5,
              'line-opacity': 0.7
            }
          },
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'tuzla',
            filter: ['has', 'building'],
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['coalesce', ['get', 'height'], 15],
                0, '#94a3b8',
                20, '#64748b',
                50, '#475569',
                100, '#334155'
              ],
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
              'fill-extrusion-opacity': 0.9
            }
          }
        ]
      });
    }
  }, [isOnline, isLoaded, policy.mapFx.enable3dBuildings, policy.mapFx.maxPitch]);

  // Update Quest Markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const POI_COLORS: Record<string, string> = {
      '1': '#06b6d4', // Cyan
      '2': '#f59e0b', // Amber
      '3': '#e2e8f0', // Silver/White
      '4': '#84cc16', // Lime
      '5': '#ec4899', // Pink
      'mesa_selimovic': '#a855f7', // Purple
      'irish': '#10b981', // Green
      'galerija': '#3b82f6', // Blue
      'banja': '#fbbf24', // Yellow
      'panonika': '#f97316', // Orange
      'slapovi': '#0ea5e9', // Sky Blue
      'ismet': '#ef4444',  // Red
      'tvrtko_park': '#f59e0b' // Amber/Gold
    };

    LOCATIONS.forEach(loc => {
      const isQuest = loc.category !== 'hotel' && loc.category !== 'food' && loc.category !== 'shopping';
      const isUnlocked = isQuest ? unlockedRewards.includes(loc.id) : true;

      if (!markers.current[loc.id]) {
        const el = document.createElement('div');
        el.className = `quest-marker-container`;

        const markerColor = POI_COLORS[loc.id] || '#cbd5e1';
        // Applying refined 20% opacity for locked items
        const displayColor = (isQuest && !isUnlocked) ? `${markerColor}33` : markerColor;

        const iconContent = (isQuest && !isUnlocked)
          ? `<span style="font-size: 20px; filter: grayscale(1) opacity(0.4); transform: scale(0.75)">🔒</span>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:white; filter: drop-shadow(0 0 8px ${markerColor})"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

        el.innerHTML = `
          <style>
            @keyframes marker-breathe {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.08); opacity: 1; }
            }
          </style>
          <div class="${(isQuest && !isUnlocked) ? 'locked-quest-pulse' : 'quest-marker-pulse'}" 
               style="background:${displayColor}; width:56px; height:56px; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); 
                      border: 2px solid ${isUnlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)'}; 
                      display: flex; flex-direction: column; align-items: center; justify-content: center; 
                      box-shadow: ${isUtilityMode
                        ? `0 0 ${isUnlocked ? '8px' : '4px'} ${markerColor}${isUnlocked ? '66' : '22'}`
                        : `0 0 ${isUnlocked ? '20px' : '8px'} ${markerColor}${isUnlocked ? '99' : '22'}, 
                                  0 0 ${isUnlocked ? '40px' : '12px'} ${markerColor}${isUnlocked ? '44' : '11'}, 
                                  inset 0 0 15px rgba(255,255,255,${isUnlocked ? '0.5' : '0.05'})`}; 
                      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1); 
                      animation: ${policy.uiFx.enableInfiniteAnimations ? `marker-breathe ${isUnlocked ? '3s' : '6s'} infinite ease-in-out` : 'none'};">
            <div style="transform: scale(0.9); display: flex; align-items: center; justify-content: center;">
              ${iconContent}
            </div>
            ${isQuest && !isUnlocked ? `<span style="font-size: 6px; font-weight: 900; color: white; text-transform: uppercase; margin-top: 2px; opacity: 0.8;">Active Quest</span>` : ''}
          </div>`;

        const popup = new maplibregl.Popup({ offset: 35 }).setHTML(`
          <div style="padding: 18px; font-family: 'Quicksand', sans-serif; background: #0f172a; color: white; border-radius: 24px; border: 2px solid ${markerColor}${isUnlocked ? '' : '33'}; box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 30px ${markerColor}${isUnlocked ? '40' : '05'};">
            <h3 style="margin: 0; font-size: 18px; font-weight: 900; color: ${isUnlocked ? markerColor : '#64748b'}; text-transform: uppercase; letter-spacing: 0.15em; text-shadow: 0 0 10px ${markerColor}44;">${isUnlocked ? loc.name[lang] : '??? Location ???'}</h3>
            <p style="font-size: 14px; margin: 10px 0; color: #94a3b8; line-height: 1.6;">${isUnlocked ? loc.description[lang] : 'Search this area to uncover its history and collect your reward.'}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 15px;">
              ${isQuest ? (!isUnlocked ? '<span style="font-size: 10px; color: #f59e0b; font-weight: 900; background: rgba(245,158,11,0.2); padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(245,158,11,0.3);">🔒 Quest Active</span>' : '<span style="font-size: 10px; color: #10b981; font-weight: 900; background: rgba(16,185,129,0.2); padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(16,185,129,0.3);">🔓 Reward Unlocked</span>') : ''}
              <span style="font-size: 10px; color: #475569; font-weight: bold; text-transform: uppercase;">Quest Target</span>
            </div>
            <button onclick="window.setGlobalMapNavTarget('${loc.id}')" style="margin-top: 18px; width: 100%; padding: 12px; background: ${isUnlocked ? markerColor : '#1e293b'}; color: white; border: none; border-radius: 16px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em; box-shadow: 0 15px 30px ${isUnlocked ? markerColor : '#000000'}33; transition: all 0.3s ease;">Set GPS Route</button>
            ${loc.id === 'tvrtko_park' ? `<button onclick="window.launchParkVirtualTour()" style="margin-top: 10px; width: 100%; padding: 12px; background: #92400e; color: white; border: none; border-radius: 16px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em; box-shadow: 0 15px 30px rgba(146, 64, 14, 0.3); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">Virtual Tour 👁️</button>
            <button onclick="window.launchStreetView('/assets/Gallery/QuestQRLocations/Tvrko pannellum/KingTvrtkoPanorama.jpg', 'Kralj Tvrtko I', 'Spomenik u Centralnom Parku')" style="margin-top: 10px; width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 16px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em; box-shadow: 0 15px 30px rgba(79, 70, 229, 0.3); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">Street View 360° 🔄</button>` : ''}
          </div>
        `);

        markers.current[loc.id] = new maplibregl.Marker(el)
          .setLngLat([loc.coordinates[1], loc.coordinates[0]])
          .setPopup(popup)
          .addTo(map.current!);
      } else {
        const markerColor = POI_COLORS[loc.id] || '#cbd5e1';
        const displayColor = (isQuest && !isUnlocked) ? `${markerColor}33` : markerColor;

        const el = markers.current[loc.id].getElement();
        const inner = el.querySelector('div');
        if (inner) {
          inner.style.background = displayColor;
          inner.style.boxShadow = isUtilityMode
            ? `0 0 ${isUnlocked ? '8px' : '4px'} ${markerColor}${isUnlocked ? '66' : '22'}`
            : `0 0 ${isUnlocked ? '20px' : '8px'} ${markerColor}${isUnlocked ? '99' : '22'}, 0 0 ${isUnlocked ? '40px' : '12px'} ${markerColor}${isUnlocked ? '44' : '11'}, inset 0 0 15px rgba(255,255,255,${isUnlocked ? '0.5' : '0.05'})`;

          if (isQuest && !isUnlocked) {
            if (policy.uiFx.enableInfiniteAnimations) {
              inner.classList.add('locked-quest-pulse');
              inner.classList.remove('quest-marker-pulse');
            } else {
              inner.classList.remove('locked-quest-pulse');
              inner.classList.remove('quest-marker-pulse');
            }
            inner.innerHTML = `<span style="font-size: 20px; filter: grayscale(1) opacity(0.4);">🔒</span>`;
          } else {
            inner.classList.remove('locked-quest-pulse');
            if (policy.uiFx.enableInfiniteAnimations) {
              inner.classList.add('quest-marker-pulse');
            } else {
              inner.classList.remove('quest-marker-pulse');
            }
            inner.innerHTML = `<div style="transform: scale(0.9); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:white; filter: drop-shadow(0 0 8px ${markerColor})"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`;
          }
        }
      }
    });

    tuzlaHotelData.forEach((hotel, idx) => {
      const hotelId = `hotel-${idx}`;
      if (!markers.current[hotelId]) {
        const el = document.createElement('div');
        el.className = `hotel-marker-container ${policy.uiFx.enableInfiniteAnimations ? 'quest-marker-pulse' : ''}`;

        el.innerHTML = `
          <div style="position: relative; width: 48px; height: 62px; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));">
            <svg viewBox="0 0 44 56" style="width: 100%; height: 100%; fill: #1d4ed8; filter: drop-shadow(0 0 10px #1d4ed880)">
              <path d="M22 0C9.8 0 0 9.8 0 22C0 38.5 22 56 22 56C22 56 44 38.5 44 22C44 9.8 34.2 0 22 0Z" />
              <circle cx="22" cy="22" r="18" fill="white" fill-opacity="0.15" />
            </svg>
            <div style="position: absolute; top: 7px; left: 50%; translate: -50% 0; width: 34px; height: 34px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); border: 2px solid #1d4ed820;">
              <img src="/assets/Gallery/QuestQRLocations/hotel.svg" alt="Hotel" style="width: 22px; height: 22px;" />
            </div>
          </div>`;

        const popup = new maplibregl.Popup({ offset: 35 }).setHTML(`
          <div style="padding: 20px; font-family: 'Quicksand', sans-serif; background: #0f172a; color: white; border-radius: 28px; border: 2px solid #3b82f633; box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px #1d4ed833;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 900; color: #60a5fa; text-shadow: 0 0 10px #60a5fa44;">${hotel.name}</h3>
            <p style="font-size: 14px; margin: 10px 0; color: #94a3b8; line-height: 1.6;">${hotel.description[lang]}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
               <span style="font-size: 11px; color: #fbbf24; font-weight: 900; background: rgba(251,191,36,0.15); padding: 6px 14px; border-radius: 10px; border: 1px solid rgba(251,191,36,0.2);">⭐ ${hotel.rating} / 10</span>
               <span style="font-size: 10px; color: #60a5fa; font-weight: bold; text-transform: uppercase; background: rgba(59,130,246,0.1); padding: 5px 12px; border-radius: 8px;">🏨 Premier Hotel</span>
            </div>
            <button onclick="window.setGlobalMapNavTarget('${hotelId}')" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 18px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em; box-shadow: 0 20px 40px rgba(37,99,235,0.4); transition: all 0.3s ease;">Start GPS Navigation</button>
          </div>
        `);

        markers.current[hotelId] = new maplibregl.Marker(el)
          .setLngLat([hotel.longitude, hotel.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });
  }, [isLoaded, unlockedRewards, lang, isUtilityMode, policy.uiFx.enableInfiniteAnimations]);

  // Watch Position & User Marker
  useEffect(() => {
    let watchId: number;

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);

          if (map.current && isLoaded) {
            if (!userMarker.current) {
              const el = document.createElement('div');
              el.innerHTML = `<div style="background:#3b82f6;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(59,130,246,0.6);"><div style="width:8px;height:8px;background:#fff;border-radius:50%;" /></div>`;
              userMarker.current = new maplibregl.Marker(el)
                .setLngLat([longitude, latitude])
                .addTo(map.current);
            } else {
              userMarker.current.setLngLat([longitude, latitude]);
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
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        startTracking();
      } else {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    if (document.visibilityState === 'visible') {
      startTracking();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isLoaded, unlockedRewards, navigationTarget]);

  // Fly to navigation target when it changes
  useEffect(() => {
    if (map.current && isLoaded && navigationTarget) {
      map.current.flyTo({
        center: [navigationTarget.coordinates[1], navigationTarget.coordinates[0]],
        zoom: 18,
        pitch: Math.min(60, policy.mapFx.maxPitch),
      });
    }
  }, [navigationTarget, isLoaded, policy.mapFx.maxPitch]);

  // Scanner Logic (Same as before)
  useEffect(() => {
    if (isScanning) startScanner();
    else stopScanner();
    return () => { stopScanner(); };
  }, [isScanning]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: scannerFps, qrbox: { width: scannerQrSize, height: scannerQrSize } },
        (decodedText) => {
          const matched = LOCATIONS.find(l => l.qrCode === decodedText);
          if (matched) {
            onRewardFound(matched.id);
            setSuccessMessage(`Unlocked: ${matched.name[lang]}`);
            setTimeout(() => setSuccessMessage(null), 3000);
            setIsScanning(false);

            if (matched.id === 'mesa_selimovic') {
              setPlayingVideo('/assets/Gallery/QuestQRLocations/MesaSelimovic.mp4');
            }
          }
        },
        () => { }
      );
    } catch (err) { setIsScanning(false); }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }
  };

  const unlockedItems = QUEST_TARGETS.filter(item => unlockedRewards.includes(item.id));
  const lockedItems = QUEST_TARGETS.filter(item => !unlockedRewards.includes(item.id));

  return (
    <div className="h-[calc(100vh-88px)] w-full relative flex flex-col overflow-hidden bg-slate-900 font-quicksand">
      {/* MAP VIEW */}
      <div ref={mapContainer} className="flex-grow z-0 relative h-full grayscale-[20%] brightness-[0.8]" />

      {/* OFFLINE INDICATOR BAR */}
      <AnimatePresence>
        {isOfflineMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-28 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 shadow-lg shadow-blue-500/20"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Saved Offline Map Data</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-28 left-6 z-20 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
        {policy.qualityLevel}
        {mode === 'auto' && policy.reasonTag ? ` - ${policy.reasonTag}` : ''}
      </div>

      {/* TOP FLOATING HUB */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-lg">
        <div className={`bg-slate-900/40 ${isUtilityMode ? 'backdrop-blur-sm shadow-lg' : 'backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'} px-6 py-4 rounded-[2.5rem] border border-white/20 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 rotate-3 transition-transform hover:rotate-0">
              <Trophy className="w-6 h-6 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] leading-none mb-1">Explorer Hub</span>
              <span className="text-xl font-black text-white uppercase tracking-tight leading-none">Tuzla Quest</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsScanning(true)}
              className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-amber-500 text-white hover:text-slate-900 rounded-2xl transition-all active:scale-90 border border-white/10 group shadow-lg"
            >
              <QrCode className="w-6 h-6 transition-transform group-hover:scale-110" />
            </button>
            <button
              onClick={onToggleAR}
              className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-blue-500 text-white rounded-2xl transition-all active:scale-90 border border-white/10 group shadow-lg"
            >
              <Navigation className="w-6 h-6 rotate-45 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-2xl border border-white/15 bg-slate-900/70 p-1">
        {qualityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setMode(option.value)}
            className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors ${
              mode === option.value ? 'bg-amber-400 text-slate-900' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 3D PITCH CONTROL */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3 bg-white/5 ${isUtilityMode ? 'backdrop-blur-sm shadow-lg' : 'backdrop-blur-xl shadow-2xl'} p-3 rounded-full border border-white/10`}>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-tighter">3D</div>
        <input
          type="range" min="30" max={policy.mapFx.maxPitch.toString()} defaultValue={Math.min(75, policy.mapFx.maxPitch).toString()}
          onChange={(e) => map.current?.setPitch(Math.min(parseInt(e.target.value), policy.mapFx.maxPitch))}
          className="bg-white/20 rounded-full h-32 w-2 focus:outline-none focus:ring-2 focus:ring-amber-500 [writing-mode:vertical-rl] [appearance:slider-vertical] [-webkit-appearance:slider-vertical]"
        />
      </div>

      {/* SCANNER OVERLAY */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[2000] bg-black flex flex-col pt-32"
          >
            {/* LASER SCANNER FRAME */}
            <div className="relative w-full h-[40vh] flex flex-col items-center justify-center mb-12">
              {!isUtilityMode && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-amber-500/10 blur-[40px] rounded-full" />}

              <div className="relative w-64 h-64">
                {/* Real Camera Feed */}
                <div id={scannerContainerId} className="absolute inset-0 rounded-3xl overflow-hidden bg-black border-2 border-white/10 shadow-[0_0_80px_rgba(245,158,11,0.1)]" style={{ backgroundColor: 'black' }} />

                {/* Cyber Frame Decor */}
                <div className="absolute -inset-4 border-2 border-white/5 rounded-[2.5rem] pointer-events-none" />
                <div className={`absolute -inset-1 border border-amber-500/50 rounded-[1.5rem] pointer-events-none ${policy.uiFx.enableInfiniteAnimations ? 'animate-pulse' : ''}`} />

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-2xl" />

                {/* Animated Laser line with blur trail */}
                {policy.uiFx.enableInfiniteAnimations ? (
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent z-10"
                  >
                    <div className="absolute inset-0 bg-amber-400 blur-sm opacity-50" />
                  </motion.div>
                ) : (
                  <div className="absolute left-0 top-1/2 w-full h-1 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent z-10" />
                )}
              </div>

              <div className="mt-8 flex flex-col items-center">
                <span className="text-amber-400 font-black text-xs uppercase tracking-[0.3em] mb-2 animate-pulse">Scanning Signal</span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center px-12 leading-relaxed">
                  Position QR code within the frame to unlock rewards
                </span>
              </div>
            </div>

            {/* REWARD SECTIONS */}
            <div className="flex-1 overflow-y-auto px-6 pb-20 hide-scrollbar space-y-12">

              {/* SECTION: UNLOCKED */}
              {unlockedItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">{lang === 'bs' ? 'Otključane Nagrade' : 'Unlocked Rewards'}</h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {unlockedItems.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        className="group relative h-32 rounded-3xl overflow-hidden border border-amber-400/40 bg-white/5 shadow-xl transition-all active:scale-95"
                        onClick={() => item.video && setPlayingVideo(item.video)}
                      >
                        <img src={item.image} alt={item.name[lang]} className={`w-full h-full object-cover brightness-[0.7] ${isUtilityMode ? '' : 'group-hover:brightness-100 transition-all duration-500'}`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent p-5 flex flex-col justify-center">
                          <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">{lang === 'bs' ? 'Otključano' : 'Unlocked'}</span>
                          <h3 className="text-lg font-black text-white uppercase leading-none tracking-tight">{item.name[lang]}</h3>
                        </div>
                        {item.video && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
                            <Play className="w-5 h-5 text-slate-950 fill-slate-950 ml-0.5" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-500 w-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: LOCKED */}
              {lockedItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Lock className="w-5 h-5 text-slate-500" />
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{lang === 'bs' ? 'Preostali Zadaci' : 'Remaining Quests'}</h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {lockedItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative h-28 rounded-3xl overflow-hidden border border-white/5 bg-slate-900/50"
                      >
                        <img src={item.image} alt="Locked" className={`w-full h-full object-cover grayscale brightness-[0.3] ${isUtilityMode ? 'blur-sm' : 'blur-xl'}`} />
                        <div className="absolute inset-0 flex items-center justify-between px-8">
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Find to Unlock</span>
                            <h3 className="text-md font-black text-slate-600 uppercase leading-none tracking-tight italic">SECRET LOCATION</h3>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-700" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsScanning(false)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 rounded-3xl flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO PLAYER */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-black flex flex-col p-6"
          >
            <div className="flex-grow flex items-center justify-center bg-black">
              <video
                src={playingVideo}
                autoPlay
                controls
                playsInline
                poster={QUEST_TARGETS.find(q => q.video === playingVideo)?.image}
                className="w-full max-h-[70vh] rounded-[2.5rem] bg-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10"
              />
            </div>

            <div className="h-48 flex flex-col items-center justify-center gap-6">
              <h2 className="text-white font-black text-2xl uppercase tracking-tighter text-center">Reward Cinematic Unlocked</h2>
              <button
                onClick={() => setPlayingVideo(null)}
                className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Return to Quest
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS POPUP */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[3000] bg-green-500 text-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.4)] flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-100 block mb-1">New Reward Unlocked</span>
              <span className="text-lg font-black uppercase text-white leading-none">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isShowingParkTour && (
          <ParkQuestViewer
            lang={lang === 'bs' ? 'bs' : 'en'}
            onClose={() => setIsShowingParkTour(false)}
            onOpenScanner={() => {
              setIsShowingParkTour(false);
              setIsScanning(true);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeStreetView && (
          <StreetViewer
            lang={lang === 'bs' ? 'bs' : 'en'}
            panoramaUrl={activeStreetView.url}
            title={activeStreetView.title}
            subtitle={activeStreetView.subtitle}
            onClose={() => setActiveStreetView(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapQuestView;
