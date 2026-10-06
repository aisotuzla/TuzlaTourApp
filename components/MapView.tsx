import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { globalPMTilesProtocol, ensureTuzlaOfflineMapDownloaded } from '../utils/pmtilesProtocol';
import { getDistance } from '../utils/geoUtils';
import { Language } from '../types';
import { TUZLA_CENTER } from '../constants';
import { AppFeatures } from '../utils/platform';
import { Search, X, Loader2, Navigation, Landmark, Compass, Route, Clock, Footprints, Trophy, Lock, QrCode, Layers, Check } from 'lucide-react';

import { useNetwork } from '../hooks/useNetwork';
import { tuzlaHotelData } from '../tuzlaHotelData';
import { Hotel as HotelIcon } from 'lucide-react';
import { QUEST_TARGETS } from '../constants/questData';
import { motion, AnimatePresence } from 'framer-motion';
import { MapSheetDrawer, SheetSnapState, SheetTarget } from './MapSheetDrawer';


interface MapViewProps {
  lang: Language;
  features: AppFeatures;
  unlockedRewards?: string[];
}


const GEO_MAP_KEY = ['65090a03070e4e18', '98694f7a18ba415b'].join('');
const ROUTE_MAP_KEY = ['63e8b34f44974d71', 'bc70aad63e5b56ba'].join('');

const OFFLINE_STYLE = '/maps/offline-vector-style.json';
const RASTER_STYLE = '/maps/offline-style.json';
const ONLINE_STYLE = `https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=${import.meta.env.VITE_GEOAPIFY_MAP_TILES_API || import.meta.env.VITE_GEOAPIFY_STATIC_API || GEO_MAP_KEY}`;

const MAP_LAYER_OPTIONS = [
  { id: 'geoapify', name: { bs: 'Geoapify OSM (Online)', en: 'Geoapify OSM (Online)' }, url: ONLINE_STYLE },
  { id: 'raster', name: { bs: 'OpenStreetMap (Raster)', en: 'OpenStreetMap (Raster)' }, url: RASTER_STYLE },
  { id: 'offline', name: { bs: 'Lokalna PMTiles 3D (Offline)', en: 'Local PMTiles 3D (Offline)' }, url: OFFLINE_STYLE },
];

interface RoutePoiPreset {
  name: Partial<Record<Language, string>> & { en: string; bs: string };
  lat: number;
  lon: number;
  category: string;
  entryFee?: string;
  description?: string;
}

const ROUTE_POI_PRESETS: RoutePoiPreset[] = [
  {
    name: { bs: 'Panonska Jezera', en: 'Pannonian Lakes' },
    lat: 44.53888255374366,
    lon: 18.680032450849325,
    category: 'nature',
    entryFee: "Paid 7.5 KM - 9 KM for entire day",
    description: "The Pannonian Lakes are a unique complex of three salt lakes located in the heart of Tuzla. Created during mineral extraction activities in the late 19th and early 20th centuries, the lakes have since transformed into a popular recreational destination. Rich in minerals and natural beauty, the largest lake, Panonsko Jezero I, offers swimming, sunbathing, and numerous amenities including restaurants, sports facilities, and event spaces. The entire complex provides a refreshing urban oasis with its blend of natural landscapes and modern tourist infrastructure."
  },
  {
    name: { bs: 'Slana Banja Park', en: 'Slana Banja Park' },
    lat: 44.53846734540082,
    lon: 18.685620782683003,
    category: 'nature',
    entryFee: "free",
    description: "A sprawling, peaceful memorial park and pine forest on a hill overlooking the Pannonian lakes. It contains walking paths, fountains, and monuments dedicated to anti-fascist heroes and veterans."
  },

  {
    name: { bs: 'Trg Slobode', en: 'Freedom Square' },
    lat: 44.53954253369571,
    lon: 18.67508475352372,
    category: 'culture',
    entryFee: "free",
    description: "The old city gate and a deeply significant historical site. It serves as a central meeting point in the pedestrian zone and houses a memorial dedicated to the tragic loss of young lives during the 1995 shelling."
  },
  {
    name: { bs: 'Spomenik Kralju Tvrtku (I)', en: 'King Tvrtko Monument' },
    lat: 44.53812247668793,
    lon: 18.678359094003866,
    category: 'history',
    entryFee: "free",
    description: "A centrally located urban park and historical site featuring a majestic bronze statue of medieval Bosnia's first king, Tvrtko I Kotromanić. The park offers scenic walking paths, a stone replica of the landmark Charter of Kulin, an elegant central fountain, and peaceful green areas for relaxation in the heart of the city."
  },
  {
    name: { bs: 'Spomenik Meši Selimoviću', en: 'Mesa Selimovic Monument' },
    lat: 44.53710706292608,
    lon: 18.67822758905615,
    category: 'culture',
    entryFee: "free",
    description: "A culturally significant monument dedicated to the renowned Bosnian novelist, philosopher, and Nobel laureate, Meša Selimović. This evocative sculpture stands as a tribute to one of the most important literary figures of the former Yugoslavia, situated in a prominent location within the city's cultural landscape."
  },
  {
    name: { bs: 'Džamija Šarena (Atik)', en: 'Atik Mosque' },
    lat: 44.54001556181191,
    lon: 18.673365480509432,
    category: 'religion',
    description: "The historic Atik Mosque, locally known as Šarena Džamija (the Colorful Mosque), is an active place of worship and a protected cultural monument in the heart of Tuzla. Built in the early 16th century, its distinctively painted wooden exterior and intimate prayer hall make it one of the city’s most picturesque religious landmarks. The mosque is renowned for its tranquil atmosphere, traditional Bosnian Islamic architecture, and the peaceful courtyard that serves as a quiet retreat within the bustling old town."
  },
  {
    name: { bs: 'Saborna Crkva', en: 'Orthodox Cathedral' },
    lat: 44.53800051276164,
    lon: 18.679763716121386,
    category: 'religion',
    entryFee: "free",
    description: "The largest and most significant Orthodox Christian church in Tuzla, the Holy Mother of God Cathedral (Saborna Crkva) is a beautiful example of Serbian Orthodox ecclesiastical architecture. Constructed in the 19th century, the cathedral features striking frescoes, a prominent bell tower, and a serene interior that reflects the rich spiritual heritage of the region. It serves as the administrative center of the Eparchy of Zvornik and Tuzla and is a focal point for Orthodox Christian life in the city."
  },
  {
    name: { bs: 'Tržni centar Bingo (BCC)', en: 'Bingo Shopping Center' },
    lat: 44.53188635183338,
    lon: 18.652020274686947,
    category: "shopping",
    description: "The largest modern shopping mall in the region, featuring a vast hypermarket, international retail fashion brands, a multiplex cinema, bowling alley, and extensive dining areas."
  },
  {
    name: { bs: 'TC Robot', en: 'Robot Shopping Center' },
    lat: 44.53454365316736,
    lon: 18.682516897004632,
    category: "shopping"
  },
  {
    name: { bs: 'TC Mercator', en: 'Mercator Shopping Center' },
    lat: 44.5327311385098,
    lon: 18.68292815613492,
    category: "shopping",
    description: "An established and easily accessible shopping center located near the main southern transit road, offering a well-stocked supermarket, clothing stores, electronics shop, and cozy cafes.",
  },
  {
    name: { bs: 'TC Tuzlanka', en: 'Tuzlanka Shopping Center' },
    lat: 44.538634727509304,
    lon: 18.664878503738578,
    category: "shopping",
    description: "A multi-floor shopping mall located dynamically near the city center and student campus, featuring retail fashion outlets, electronics stores, home goods, and a panoramic rooftop café."
  }
];

const MapView: React.FC<MapViewProps> = ({ lang, features, unlockedRewards = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string>(navigator.onLine ? ONLINE_STYLE : OFFLINE_STYLE);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const isOnline = useNetwork();

  // Bottom Sheet Drawer State
  const [snapState, setSnapState] = useState<SheetSnapState>('collapsed');
  const [is3D, setIs3D] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Routing and Navigation States
  const [selectedTarget, setSelectedTarget] = useState<SheetTarget | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  // Register PMTiles Protocol and pre-cache Tuzla PMTiles into OPFS
  useEffect(() => {
    globalPMTilesProtocol.init();
    ensureTuzlaOfflineMapDownloaded().catch((err) => console.warn('Offline cache init:', err));
  }, []);

  const handleSwitchLayer = (styleUrl: string) => {
    if (!map.current || activeStyle === styleUrl) {
      return;
    }

    if (styleUrl === OFFLINE_STYLE) {
      ensureTuzlaOfflineMapDownloaded().catch(() => { });
    }

    setActiveStyle(styleUrl);

    if (styleUrl === OFFLINE_STYLE) {
      map.current.setMaxZoom(16);
      if (map.current.getZoom() > 16) {
        map.current.setZoom(16);
      }
    } else {
      map.current.setMaxZoom(20);
    }

    map.current.setStyle(styleUrl);
    map.current.once('style.load', () => {
      setIsLoaded(true);
      if (isNavigating && selectedTarget && userLocationRef.current) {
        calculateRoute(userLocationRef.current, selectedTarget);
      }
    });
  };

  const togglePitch = () => {
    if (!map.current) return;
    const next3D = !is3D;
    setIs3D(next3D);
    map.current.easeTo({
      pitch: next3D ? 55 : 0,
      duration: 600,
    });
  };

  const handleRecenterLocation = () => {
    if (userLocationRef.current && map.current) {
      map.current.flyTo({
        center: [userLocationRef.current[0], userLocationRef.current[1]],
        zoom: activeStyle === OFFLINE_STYLE ? 15 : 17.5,
        pitch: is3D ? 55 : 0,
        bearing: -15,
        duration: 1600,
      });
    } else if (navigator.geolocation && map.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { longitude, latitude } = pos.coords;
        userLocationRef.current = [longitude, latitude];
        setUserLocation([longitude, latitude]);
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: activeStyle === OFFLINE_STYLE ? 15 : 17.5,
          pitch: is3D ? 55 : 0,
          bearing: -15,
          duration: 1600,
        });
      });
    }
  };

  const handleStartNavigation = (target: SheetTarget) => {
    setSelectedTarget(target);
    setIsNavigating(true);
    setSnapState('collapsed');
    if (map.current) {
      const start = userLocationRef.current || [TUZLA_CENTER[1], TUZLA_CENTER[0]];
      map.current.flyTo({
        center: [start[0], start[1]],
        zoom: activeStyle === OFFLINE_STYLE ? 15 : 17.5,
        pitch: is3D ? 55 : 0,
        bearing: -15,
        duration: 2000,
      });
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setSelectedTarget(null);
    clearRoute();
  };

  const handleSelectTarget = (target: SheetTarget | null) => {
    setSelectedTarget(target);
    if (target && map.current) {
      map.current.flyTo({
        center: [target.lon, target.lat],
        zoom: activeStyle === OFFLINE_STYLE ? 15 : 17,
        pitch: is3D ? 50 : 0,
        duration: 1400,
      });
      if (snapState === 'expanded') {
        setSnapState('half');
      }
    }
  };

  // Expose global callback for Mapbox popup navigation clicks
  useEffect(() => {
    (window as any).startNavigationFromPopup = (name: string, lat: number, lon: number) => {
      setSelectedTarget({ name, lat, lon });
      setIsNavigating(true);
      setSnapState('collapsed');
      // Close any open popups
      const popups = document.getElementsByClassName('maplibregl-popup');
      for (let i = 0; i < popups.length; i++) {
        (popups[i] as HTMLElement).remove();
      }
      if (map.current && userLocationRef.current) {
        map.current.flyTo({
          center: [userLocationRef.current[0], userLocationRef.current[1]],
          zoom: activeStyle === OFFLINE_STYLE ? 15 : 17.5,
          pitch: is3D ? 55 : 0,
          bearing: -15,
          duration: 2000
        });
      }
    };
    return () => {
      delete (window as any).startNavigationFromPopup;
    };
  }, [activeStyle, is3D]);

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

  const calculateRoute = async (startLoc: [number, number], target: { name: string; lat: number; lon: number }) => {
    if (!map.current || !isLoaded) return;
    setIsRouteLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_ROUTING_API || import.meta.env.VITE_GEOAPIFY_STATIC_API || ROUTE_MAP_KEY;
      const startLng = startLoc[0];
      const startLat = startLoc[1];
      const url = `https://api.geoapify.com/v1/routing?waypoints=${startLat},${startLng}|${target.lat},${target.lon}&mode=walk&apiKey=${apiKey}`;

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

      if (map.current.getSource('route-source')) {
        const source = map.current.getSource('route-source') as maplibregl.GeoJSONSource;
        source.setData(data);
      } else {
        map.current.addSource('route-source', {
          type: 'geojson',
          data: data
        });

        map.current.addLayer({
          id: 'route-layer-casing',
          type: 'line',
          source: 'route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#581c87',
            'line-width': 10,
            'line-opacity': 0.7
          }
        });

        map.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#a855f7',
            'line-width': 5,
            'line-opacity': 0.95
          }
        });
      }

      // Fly to user location to start navigation view
      if (map.current) {
        map.current.flyTo({
          center: [startLng, startLat],
          zoom: activeStyle === OFFLINE_STYLE ? 15 : 17.5,
          pitch: 55,
          bearing: -15,
          duration: 2000
        });
      }

    } catch (error) {
      console.warn('Geoapify route calculation failed, using fallback direct distance:', error);
      const startLng = startLoc[0];
      const startLat = startLoc[1];
      const distMeters = getDistance(startLat, startLng, target.lat, target.lon);
      setRouteDistance(distMeters);
      setRouteTime(distMeters / 1.4);
      if (map.current) {
        map.current.flyTo({
          center: [startLng, startLat],
          zoom: activeStyle === OFFLINE_STYLE ? 15 : 17.5,
          pitch: 55,
          bearing: -15,
          duration: 2000
        });
      }
    } finally {
      setIsRouteLoading(false);
    }
  };

  useEffect(() => {
    if (isNavigating && selectedTarget && isLoaded) {
      const start = userLocationRef.current || [TUZLA_CENTER[1], TUZLA_CENTER[0]] as [number, number];
      calculateRoute(start, selectedTarget);
    } else {
      clearRoute();
    }
  }, [isNavigating, selectedTarget, isLoaded]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let combinedResults: any[] = [];
      try {
        const res = await fetch('/maps/TuzlaTourGuide.geojson');
        if (res.ok) {
          const data = await res.json();
          const query = searchQuery.toLowerCase();
          const localMatches = (data.features || [])
            .filter((f: any) => {
              const props = f.properties || {};
              return (
                props.name?.toLowerCase().includes(query) ||
                props.name_bs?.toLowerCase().includes(query) ||
                props['name:bs']?.toLowerCase().includes(query) ||
                props['name:en']?.toLowerCase().includes(query) ||
                props['addr:street']?.toLowerCase().includes(query) ||
                props.amenity?.toLowerCase().includes(query) ||
                props.shop?.toLowerCase().includes(query) ||
                props.tourism?.toLowerCase().includes(query)
              );
            })
            .filter((f: any) => f.geometry?.type === 'Point')
            .slice(0, 20)
            .map((f: any) => {
              const props = f.properties || {};
              return {
                display_name: props.name || props['name:bs'] || props.amenity || props.shop || 'Unnamed',
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                category: props.category || props.amenity || props.shop || props.tourism || 'POI',
              };
            });
          combinedResults = localMatches;
        }
      } catch (err) {
        console.warn('TuzlaTourGuide.geojson search failed:', err);
      }

      if (isOnline) {
        try {
          let geoMatches: any[] = [];
          const geoapifyKey =
            import.meta.env.VITE_GEOAPIFY_GEOCODING_API ||
            import.meta.env.VITE_GEOAPIFY_STATIC_API ||
            import.meta.env.VITE_GEOAPIFY_ROUTING_API ||
            ROUTE_MAP_KEY ||
            GEO_MAP_KEY ||
            '765d67152f78438bacd2c66f73665a91';

          // 1. Try Geoapify Geocoding API with Tuzla proximity
          if (geoapifyKey) {
            try {
              const geoRes = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&bias=proximity:18.6734,44.5385&filter=countrycode:ba&apiKey=${geoapifyKey}`
              );
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData?.features && geoData.features.length > 0) {
                  geoMatches = geoData.features.map((f: any) => ({
                    display_name: f.properties.formatted || f.properties.address_line1 || f.properties.name,
                    lat: f.properties.lat,
                    lon: f.properties.lon,
                    category: f.properties.category || 'Address'
                  }));
                }
              }
            } catch (geoErr) {
              console.warn('Geoapify geocoding API error:', geoErr);
            }
          }

          // 2. OpenStreetMap / Nominatim fallback (guaranteed high-accuracy free geocoding for Bosnia / Tuzla)
          if (geoMatches.length === 0) {
            try {
              const queryWithCity = searchQuery.toLowerCase().includes('tuzla')
                ? searchQuery
                : `${searchQuery}, Tuzla`;
              const osmRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCity)}&addressdetails=1&limit=5&viewbox=18.45,44.60,18.85,44.45`
              );
              if (osmRes.ok) {
                const osmData = await osmRes.json();
                if (Array.isArray(osmData) && osmData.length > 0) {
                  geoMatches = osmData.map((item: any) => ({
                    display_name: item.display_name,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    category: item.type || 'Address'
                  }));
                }
              }
            } catch (osmErr) {
              console.warn('Nominatim OSM geocoding fallback failed:', osmErr);
            }
          }

          if (geoMatches.length > 0) {
            combinedResults = [...combinedResults, ...geoMatches];
          }
        } catch (geoErr) {
          console.warn('All geocoding search attempts failed:', geoErr);
        }
      }

      setSearchResults(combinedResults.slice(0, 5));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    if (map.current) {
      map.current.flyTo({ center: [result.lon, result.lat], zoom: 17, pitch: is3D ? 55 : 0, duration: 1500 });
      if (searchMarkerRef.current) searchMarkerRef.current.remove();
      searchMarkerRef.current = new maplibregl.Marker({ color: '#ea580c' })
        .setLngLat([result.lon, result.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: 'Quicksand', sans-serif; padding: 6px; color: #1e293b;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px;">${result.display_name}</div>
            <button onclick="window.startNavigationFromPopup('${result.display_name.replace(/'/g, "\\'")}', ${result.lat}, ${result.lon})" style="width:100%; background:#2563eb; border:none; border-radius:6px; color:white; padding:4px 0; font-weight:800; font-size:11px; cursor:pointer; font-family:'Quicksand',sans-serif; box-shadow:0 2px 6px rgba(37,99,235,0.2);">
              ${lang === 'bs' ? 'Navigacija' : 'Navigate'}
            </button>
          </div>
        `))
        .addTo(map.current);
      searchMarkerRef.current.togglePopup();
      setSelectedTarget({
        name: result.display_name,
        lat: result.lat,
        lon: result.lon,
        category: result.category,
      });
      setSearchResults([]);
      setSearchQuery('');
      setSnapState('half');
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initialStyle = navigator.onLine ? ONLINE_STYLE : OFFLINE_STYLE;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [TUZLA_CENTER[1], TUZLA_CENTER[0]],
      zoom: initialStyle === OFFLINE_STYLE ? 15 : 16,
      minZoom: 0,
      maxZoom: initialStyle === OFFLINE_STYLE ? 15 : 20,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      map.current?.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
      if (initialStyle === OFFLINE_STYLE) {
        map.current?.setMaxZoom(15);
        if ((map.current?.getZoom() ?? 0) > 15) map.current?.setZoom(15);
      }

      tuzlaHotelData.forEach(hotel => {
        const el = document.createElement('div');
        el.className = 'hotel-marker';
        el.innerHTML = `
          <div style="background: #1e293b; color: #fbbf24; border: 2px solid #fbbf24; padding: 6px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transform: scale(1); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bed"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
          </div>
        `;

        new maplibregl.Marker(el)
          .setLngLat([hotel.longitude, hotel.latitude])
          .setPopup(new maplibregl.Popup({ offset: 25, maxWidth: '280px' }).setHTML(`
            <div style="font-family: 'Quicksand', sans-serif; padding: 12px; background: #0f172a; border-radius: 16px; color: white;">
              <img src="${hotel.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'"/>
              <h3 style="font-weight: 800; font-size: 16px; margin: 0 0 4px 0; color: #fbbf24;">${hotel.name}</h3>
              <p style="font-size: 11px; margin: 0 0 8px 0; color: #94a3b8; line-height: 1.4;">${hotel.description[lang]}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 12px; font-weight: 900; color: #fbbf24;">${hotel.rating} ⭐</span>
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 6px;">${hotel.priceRange}</span>
              </div>
              <button onclick="window.startNavigationFromPopup('${hotel.name.replace(/'/g, "\\'")}', ${hotel.latitude}, ${hotel.longitude})" style="width:100%; background:#2563eb; border:none; border-radius:8px; color:white; padding:8px 0; font-weight:800; font-size:12px; cursor:pointer; font-family:'Quicksand',sans-serif; box-shadow:0 4px 10px rgba(37,99,235,0.3); transition:all 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                ${lang === 'bs' ? 'Start' : 'Start'}
              </button>
            </div>
          `))
          .addTo(map.current!);
      });

    });

    map.current.on('error', (e) => {
      console.warn('🗺️ MapView notice:', e.error?.message || e);
      if (!navigator.onLine && activeStyle !== OFFLINE_STYLE && map.current) {
        setActiveStyle(OFFLINE_STYLE);
        map.current.setMaxZoom(16);
        if (map.current.getZoom() > 16) map.current.setZoom(16);
        map.current.setStyle(OFFLINE_STYLE);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    let watchId: number;
    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Always keep the ref up to date (used by calculateRoute)
          userLocationRef.current = [longitude, latitude];
          if (!userMarker.current) {
            const el = document.createElement('div');
            el.innerHTML = `<div style="background:#3b82f6;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(59,130,246,0.6);"><div style="width:8px;height:8px;background:#fff;border-radius:50%;" /></div>`;
            userMarker.current = new maplibregl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
          } else {
            userMarker.current.setLngLat([longitude, latitude]);
          }
          // Only update state (triggering re-render) — does NOT re-trigger route calculation
          setUserLocation([longitude, latitude]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    if (document.visibilityState === 'visible') startTracking();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') startTracking();
      else if (watchId) navigator.geolocation.clearWatch(watchId);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isLoaded]);

  return (
    <div className="h-full w-full relative group">
      <div ref={mapContainer} className="h-full w-full bg-slate-900" />
      {/* Global style overrides: keep popups and panels above all map markers */}
      <style>{`
        .maplibregl-marker { z-index: 1 !important; }
        .maplibregl-popup { z-index: 200 !important; }
        .maplibregl-ctrl-bottom-right { z-index: 10 !important; }
        .hotel-marker > div { padding: 5px !important; }
        .hotel-marker > div svg { width: 14px !important; height: 14px !important; }
        @media (max-width: 480px) {
          .map-action-btn { width: 36px !important; height: 36px !important; border-radius: 12px !important; }
          .map-action-btn svg { width: 16px !important; height: 16px !important; }
          .hotel-marker > div { padding: 4px !important; border-radius: 8px !important; }
          .hotel-marker > div svg { width: 11px !important; height: 11px !important; }
        }
      `}</style>

      {/* Removed top controls now managed by bottom drawer */}

      {/* Apple Maps / Google Maps Interactive Bottom Sheet Drawer */}
      <MapSheetDrawer
        lang={lang}
        userLocation={userLocation}
        snapState={snapState}
        onSnapChange={setSnapState}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        isSearching={isSearching}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        onClearSearch={() => {
          setSearchQuery('');
          setSearchResults([]);
        }}
        selectedTarget={selectedTarget}
        onSelectTarget={handleSelectTarget}
        isNavigating={isNavigating}
        onStartNavigation={handleStartNavigation}
        onEndNavigation={handleEndNavigation}
        routeDistance={routeDistance}
        routeTime={routeTime}
        isRouteLoading={isRouteLoading}
        activeStyle={activeStyle}
        onSelectLayer={handleSwitchLayer}
        layerOptions={MAP_LAYER_OPTIONS}
        unlockedRewards={unlockedRewards}
        landmarks={ROUTE_POI_PRESETS}
      />



      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin" />
            <Loader2 className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={32} />
          </div>
          <p className="mt-8 text-blue-400 font-black uppercase tracking-[0.3em] text-sm animate-bounce">
            {lang === 'bs' ? 'Učitavanje Mape...' : 'Loading Map Experience...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
