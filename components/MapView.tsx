import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Language } from '../types';
import { Protocol } from 'pmtiles';
import { TUZLA_CENTER } from '../constants';
import { AppFeatures } from '../utils/platform';
import { Search, X, Loader2, Navigation, Layers, MapPin, Landmark, Compass, Eye, Route, Sparkles, Clock, Footprints } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { useNetwork } from '../hooks/useNetwork';
import { tuzlaHotelData } from '../tuzlaHotelData';
import { Hotel as HotelIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Module-level cache — tuzla-map.geojson is 8MB+, load once per session
let _tuzlaMapCache: any[] | null = null;
let _tuzlaMapLoading: Promise<any[] | null> | null = null;

// Initialize PMTiles Protocol once
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

async function getTuzlaMapFeatures(): Promise<any[] | null> {
  if (_tuzlaMapCache) return _tuzlaMapCache;
  if (_tuzlaMapLoading) return _tuzlaMapLoading;
  _tuzlaMapLoading = fetch('/maps/TuzlaTourGuide.geojson')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      _tuzlaMapCache = data?.features ?? null;
      _tuzlaMapLoading = null;
      return _tuzlaMapCache;
    })
    .catch(() => { _tuzlaMapLoading = null; return null; });
  return _tuzlaMapLoading;
}

interface MapViewProps {
  lang: Language;
  features: AppFeatures;
}

const OFFLINE_STYLE = '/style/offline-style.json';
const ONLINE_STYLE = 'https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=65090a03070e4e1898694f7a18ba415b';

const ROUTE_POI_PRESETS = [
  {
    name: { bs: 'Panonska Jezera', en: 'Pannonian Lakes' },
    lat: 44.5385,
    lon: 18.6800,
    category: 'nature'
  },
  {
    name: { bs: 'Trg Slobode', en: 'Freedom Square' },
    lat: 44.5384,
    lon: 18.6756,
    category: 'culture'
  },
  {
    name: { bs: 'Spomenik Kralju Tvrtku', en: 'King Tvrtko Monument' },
    lat: 44.5369,
    lon: 18.6720,
    category: 'history'
  },
  {
    name: { bs: 'Spomenik Meši Selimoviću', en: 'Mesa Selimovic Monument' },
    lat: 44.5365,
    lon: 18.6738,
    category: 'culture'
  },
  {
    name: { bs: 'Džamija Šarena (Atik)', en: 'Atik Mosque' },
    lat: 44.5392,
    lon: 18.6732,
    category: 'religion'
  },
  {
    name: { bs: 'Saborna Crkva', en: 'Orthodox Cathedral' },
    lat: 44.5350,
    lon: 18.6781,
    category: 'religion'
  }
];

const MapView: React.FC<MapViewProps> = ({ lang, features }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  // Keep a ref to the latest location so calculateRoute can read it
  // without being a reactive dependency — prevents auto-rererouting on GPS tick
  const userLocationRef = useRef<[number, number] | null>(null);
  const isOnline = useNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Routing and Navigation States
  const [selectedTarget, setSelectedTarget] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [searchedTarget, setSearchedTarget] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'poi' | 'hotel'>('poi');

  // Expose global callback for Mapbox popup navigation clicks
  useEffect(() => {
    (window as any).startNavigationFromPopup = (name: string, lat: number, lon: number) => {
      setSelectedTarget({ name, lat, lon });
      setIsNavigating(true);
      // Close any open popups
      const popups = document.getElementsByClassName('maplibregl-popup');
      for (let i = 0; i < popups.length; i++) {
        (popups[i] as HTMLElement).remove();
      }
    };
    return () => {
      delete (window as any).startNavigationFromPopup;
    };
  }, []);

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
      const apiKey = import.meta.env.VITE_GEOAPIFY_ROUTING_API || '63e8b34f44974d71bc70aad63e5b56ba';
      const url = `https://api.geoapify.com/v1/routing?waypoints=${startLoc[1]},${startLoc[0]}|${target.lat},${target.lon}&mode=walk&apiKey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Routing API request failed');

      const data = await res.json();
      if (!data || !data.features || data.features.length === 0) {
        throw new Error('No route found');
      }

      const routeFeature = data.features[0];
      const distance = routeFeature.properties.distance; // in meters
      const time = routeFeature.properties.time; // in seconds

      setRouteDistance(distance);
      setRouteTime(time);

      if (!map.current) return;

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
            'line-color': '#16a34a',
            'line-width': 8,
            'line-opacity': 0.4
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
            'line-color': '#22c55e',
            'line-width': 4,
            'line-opacity': 0.9
          }
        });
      }

      const coordinates = routeFeature.geometry.coordinates;
      if (coordinates && coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });

        map.current.fitBounds(bounds, {
          padding: { top: 120, bottom: 240, left: 60, right: 60 },
          duration: 1500
        });
      }

    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsRouteLoading(false);
    }
  };

  // Recalculate route ONLY when the user explicitly starts navigation or
  // changes the destination — NOT on every GPS location tick.
  // userLocationRef is read inside calculateRoute to get the current position.
  useEffect(() => {
    if (isNavigating && selectedTarget && isLoaded) {
      const start = userLocationRef.current || [TUZLA_CENTER[1], TUZLA_CENTER[0]] as [number, number];
      calculateRoute(start, selectedTarget);
    } else {
      clearRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating, selectedTarget, isLoaded]); // intentionally excludes userLocation

  // Local GeoJSON Search (Offline-First)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let combinedResults: any[] = [];

      // 1. Search TuzlaTourGuide.geojson (full OSM dataset + merged POIs) — cached in memory
      try {
        const features = await getTuzlaMapFeatures();
        if (features) {
          const query = searchQuery.toLowerCase();
          const localData = { features };

          const localMatches = localData.features
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
            .filter((f: any) => f.geometry?.type === 'Point') // only mappable points
            .slice(0, 20) // cap before mapping
            .map((f: any) => {
              const props = f.properties || {};
              const displayName = props.name || props['name:bs'] || props.amenity || props.shop || 'Unnamed';
              const category = props.category || props.amenity || props.shop || props.tourism || props.office || 'POI';
              return {
                display_name: displayName,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                category,
              };
            });

          combinedResults = localMatches;
        }
      } catch (err) {
        // Fallback to poi.geojson if TuzlaTourGuide.geojson is unavailable
        console.warn('TuzlaTourGuide.geojson unavailable, falling back to poi.geojson:', err);
        try {
          const fallbackRes = await fetch('/poi.geojson');
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const query = searchQuery.toLowerCase();
            combinedResults = fallbackData.features
              .filter((f: any) =>
                f.properties.name?.toLowerCase().includes(query) ||
                f.properties.name_bs?.toLowerCase().includes(query)
              )
              .map((f: any) => ({
                display_name: f.properties.name,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                category: f.properties.category || 'POI',
              }));
          }
        } catch (fbErr) {
          console.warn('Fallback poi.geojson also failed:', fbErr);
        }
      }

      // 2. If online, also query Geoapify for real addresses
      if (isOnline) {
        try {
          let geoData;
          try {
            const geoapifyKey = import.meta.env.VITE_GEOAPIFY_GEOCODING_API ?? '5c27539c29954a908aeba457beeffbea';
            const geoRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&bias=proximity:18.67,44.53&filter=rect:18.5,44.4,18.8,44.7&apiKey=${geoapifyKey}`);
            if (!geoRes.ok) throw new Error("Primary API failed");
            geoData = await geoRes.json();
          } catch (primaryErr) {
            console.warn('Primary geocoding API failed, trying backup...', primaryErr);
            const backupKey = import.meta.env.VITE_GEOCODING_API_KEY;
            if (backupKey) {
              const backupRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&bias=proximity:18.67,44.53&filter=rect:18.5,44.4,18.8,44.7&apiKey=${backupKey}`);
              if (!backupRes.ok) {
                // Try as LocationIQ just in case
                const liqRes = await fetch(`https://eu1.locationiq.com/v1/search.php?key=${backupKey}&q=${encodeURIComponent(searchQuery)}&format=json`);
                if (liqRes.ok) {
                  const liqData = await liqRes.json();
                  geoData = {
                    features: Array.isArray(liqData) ? liqData.map((item: any) => ({
                      properties: { formatted: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) }
                    })) : []
                  };
                } else {
                  throw new Error("Backup API also failed");
                }
              } else {
                geoData = await backupRes.json();
              }
            } else {
              throw new Error("No backup API key provided");
            }
          }

          if (geoData && geoData.features) {
            const geoMatches = geoData.features.map((f: any) => ({
              display_name: f.properties.formatted,
              lat: f.properties.lat,
              lon: f.properties.lon,
              category: 'Address'
            }));
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
      map.current.flyTo({ center: [result.lon, result.lat], zoom: 17, pitch: 60 });

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

      setSearchedTarget({
        name: result.display_name,
        lat: result.lat,
        lon: result.lon
      });

      setSearchResults([]);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Determine style based on connectivity
    const styleToUse = isOnline ? ONLINE_STYLE : OFFLINE_STYLE;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleToUse,
      center: [TUZLA_CENTER[1], TUZLA_CENTER[0]],
      zoom: 16,
      minZoom: isOnline ? 0 : 14,
      maxZoom: isOnline ? 20 : 16,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      setIsLoaded(true);

      // Add standard navigation controls
      map.current?.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

      try {
        if (!map.current?.isStyleLoaded()) return;

        // Set 3D light for premium feel
        map.current?.setLight({
          anchor: 'viewport',
          color: '#ffffff',
          intensity: 0.4,
          position: [1.15, 210, 30]
        });

        // Apply custom style refinements (from Mapa-Tuzle.js)
        if (isOnline) {
          map.current?.setPaintProperty('background', 'background-color', '#f2ebc9');
          map.current?.setPaintProperty('park', 'fill-color', '#b0d38aff');
          map.current?.setPaintProperty('park_outline', 'line-color', '#a3e660ff');
          map.current?.setPaintProperty('landuse_residential', 'fill-color', 'rgba(215,190,154,0.49)');
          map.current?.setPaintProperty('landcover_wood', 'fill-color', 'rgba(91, 160, 51, 0.7)');
          map.current?.setPaintProperty('landcover_grass', 'fill-color', '#81c756ff');
          map.current?.setPaintProperty('landuse_cemetery', 'fill-color', '#f0f4e4');
          map.current?.setPaintProperty('landuse_hospital', 'fill-color', '#ffd7eb');
          map.current?.setPaintProperty('landuse_school', 'fill-color', '#f1f4b7');
          map.current?.setLayoutProperty('waterway_tunnel', 'visibility', 'none');
          map.current?.setPaintProperty('water', 'fill-color', '#81b7ffff');
          map.current?.setPaintProperty('aeroway_runway', 'line-color', '#d9d6d3');
          map.current?.setPaintProperty('road_area_pattern', 'fill-color', '#f2f5f6');
          map.current?.setPaintProperty('road_motorway_link_casing', 'line-color', '#ff9437');
          map.current?.setPaintProperty('road_minor_casing', 'line-color', '#3e3b38');
          map.current?.setPaintProperty('road_secondary_tertiary_casing', 'line-color', '#d58a48');
          map.current?.setPaintProperty('road_secondary_tertiary_casing', 'line-width', { "base": 1.2, "stops": [[8, 1.5882352941176472], [20, 18]] });
          map.current?.setPaintProperty('road_trunk_primary_casing', 'line-color', '#f0a461');
          map.current?.setPaintProperty('road_motorway_casing', 'line-color', '#f49e53');
          map.current?.setPaintProperty('road_path_pedestrian', 'line-color', '#a06346');
          map.current?.setPaintProperty('road_path_pedestrian', 'line-width', { "base": 1.2, "stops": [[14, 0.30000000000000004], [20, 3]] });
          map.current?.setPaintProperty('road_motorway_link', 'line-color', '#e5972f');
          map.current?.setPaintProperty('road_service_track', 'line-color', '#ecdcdc');
          map.current?.setPaintProperty('road_minor', 'line-width', { "base": 1.2, "stops": [[13.5, 0], [14, 2.638888888888889], [20, 19]] });
          map.current?.setPaintProperty('road_secondary_tertiary', 'line-color', '#fce174');
          map.current?.setPaintProperty('road_secondary_tertiary', 'line-width', { "base": 1.2, "stops": [[6.5, 0], [8, 0.5769230769230769], [20, 15]] });
          map.current?.setPaintProperty('road_trunk_primary', 'line-color', '#ffb16e');
          map.current?.setPaintProperty('road_motorway', 'line-color', '#db9b45');
          map.current?.setPaintProperty('road_one_way_arrow', 'text-color', '#b3acac');
          map.current?.setLayoutProperty('road_one_way_arrow', 'text-size', 1);
          map.current?.setPaintProperty('road_one_way_arrow_opposite', 'text-color', '#b0abab');
          map.current?.setLayoutProperty('road_one_way_arrow_opposite', 'text-size', 1);
          map.current?.setPaintProperty('building-3d', 'fill-extrusion-color', '#c9c2c2');
          map.current?.setLayoutProperty('water_name_line', 'visibility', 'none');
          map.current?.setLayoutProperty('water_name_point', 'visibility', 'none');
          map.current?.setLayoutProperty('poi_transit', 'text-size', 13);
          map.current?.setPaintProperty('road_label', 'text-color', '#5d5858');
          map.current?.setLayoutProperty('road_label', 'text-size', { "base": 1, "stops": [[13, 9.23076923076923], [14, 10]] });
          map.current?.setPaintProperty('road_shield', 'text-color', '#2e2a2a');
        }
      } catch (err) {
        console.warn("⚠️ MapView: Some style refinements could not be applied.", err);
      }

      // Add Hotel Markers
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

    // Error handling with automatic fallback to offline style if online fails
    map.current.on('error', (e) => {
      console.warn("Map error detected:", e.error?.message);
      if (isOnline && (e.error?.message?.includes('Failed to fetch') || e.error?.status === 401)) {
        console.log("⚠️ MapView: Online style failed, falling back to local offline-style.json");
        map.current?.setStyle(OFFLINE_STYLE);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isOnline]);

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

      {/* Search Overlay */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-lg transition-all duration-500 ${isSearchOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={lang === 'bs' ? "Traži lokacije..." : "Search locations..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/95 backdrop-blur-xl border-2 border-white/20 rounded-[2rem] py-4 pl-14 pr-16 shadow-2xl text-blue-900 font-bold outline-none focus:border-blue-500 transition-all placeholder:text-blue-900/30"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" size={24} />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </form>

        {/* Search Results */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="mt-4 bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/20 overflow-hidden">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-blue-600 gap-3">
                <Loader2 className="animate-spin" />
                <span className="font-bold">{lang === 'bs' ? 'Pretraživanje...' : 'Searching...'}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full p-4 hover:bg-blue-50 rounded-2xl transition-all flex items-center gap-4 text-left group"
                  >
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Navigation size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-blue-900">{result.display_name}</h4>
                      <p className="text-xs text-blue-600/60 font-bold uppercase tracking-widest">{result.category || (lang === 'bs' ? 'Lokacija' : 'Location')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center text-blue-600 hover:scale-110 active:scale-95 transition-all group"
        >
          <Search size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Floating Navigation Button (Opposite to Search Button) */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
        <button
          onClick={() => {
            if (isNavigating) {
              setIsNavigating(false);
              setSelectedTarget(null);
            } else if (searchedTarget) {
              setSelectedTarget(searchedTarget);
              setIsNavigating(true);
            } else {
              setIsPresetModalOpen(true);
            }
          }}
          className={`w-14 h-14 rounded-2xl shadow-2xl border flex items-center justify-center transition-all duration-300 ${isNavigating
              ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white hover:scale-110 active:scale-95 animate-pulse'
              : 'bg-white/90 border-white/20 text-blue-600 hover:scale-110 active:scale-95'
            }`}
        >
          {isNavigating ? (
            <X size={24} className="animate-in spin-in-90 duration-300" />
          ) : (
            <Route size={24} className="hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Floating Weather */}
      <WeatherWidget lang={lang} className="top-6 right-24" />

      {/* Destination Preset Selector Modal */}
      <AnimatePresence>
        {isPresetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg overflow-hidden border bg-slate-900/95 backdrop-blur-2xl border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Compass className="text-blue-500" size={24} />
                    {lang === 'bs' ? 'Odaberi Odredište' : 'Choose Destination'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {lang === 'bs' ? 'Započni pješačku rutu kroz Tuzlu' : 'Start a walking route through Tuzla'}
                  </p>
                </div>
                <button
                  onClick={() => setIsPresetModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 py-2 border-b border-white/5 flex gap-2">
                <button
                  onClick={() => setActiveModalTab('poi')}
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${activeModalTab === 'poi'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Landmark size={16} />
                  {lang === 'bs' ? 'Znamenitosti' : 'Landmarks'}
                </button>
                <button
                  onClick={() => setActiveModalTab('hotel')}
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${activeModalTab === 'hotel'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <HotelIcon size={16} />
                  {lang === 'bs' ? 'Hoteli' : 'Hotels'}
                </button>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {activeModalTab === 'poi' ? (
                  ROUTE_POI_PRESETS.map((poi, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTarget({
                          name: poi.name[lang] || poi.name.en,
                          lat: poi.lat,
                          lon: poi.lon
                        });
                        setIsNavigating(true);
                        setIsPresetModalOpen(false);
                      }}
                      className="w-full p-4 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 border border-white/5 rounded-2xl transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Landmark size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white group-hover:text-blue-300 transition-colors">
                            {poi.name[lang] || poi.name.en}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400/80">
                            {poi.category}
                          </span>
                        </div>
                      </div>
                      <Route size={20} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                ) : (
                  tuzlaHotelData.map((hotel, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTarget({
                          name: hotel.name,
                          lat: hotel.latitude,
                          lon: hotel.longitude
                        });
                        setIsNavigating(true);
                        setIsPresetModalOpen(false);
                      }}
                      className="w-full p-4 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 border border-white/5 rounded-2xl transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <HotelIcon size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white group-hover:text-blue-300 transition-colors">
                            {hotel.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400/80">
                            {hotel.rating} ★ • {hotel.priceRange}
                          </span>
                        </div>
                      </div>
                      <Route size={20} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation HUD Panel */}
      <AnimatePresence>
        {isNavigating && selectedTarget && (
          <motion.div
            initial={{ y: 50, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 50, opacity: 0, x: '-50%' }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-md"
          >
            <div className="bg-slate-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <Route size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">
                      {lang === 'bs' ? 'U Toku je Pješačka Ruta' : 'Walking Route in Progress'}
                    </span>
                    <h4 className="text-base font-black text-white line-clamp-1 mt-0.5">
                      {selectedTarget.name}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsNavigating(false);
                    setSelectedTarget(null);
                  }}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Data Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Distance Card */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Footprints size={14} />
                    <span className="text-xs font-bold">{lang === 'bs' ? 'Udaljenost' : 'Distance'}</span>
                  </div>
                  <div className="mt-2 text-white font-black text-xl flex items-baseline gap-1">
                    {isRouteLoading ? (
                      <Loader2 className="animate-spin text-blue-400" size={20} />
                    ) : routeDistance !== null ? (
                      routeDistance >= 1000 ? (
                        <>
                          {(routeDistance / 1000).toFixed(1)}
                          <span className="text-xs text-blue-400 font-bold">km</span>
                        </>
                      ) : (
                        <>
                          {Math.round(routeDistance)}
                          <span className="text-xs text-blue-400 font-bold">m</span>
                        </>
                      )
                    ) : (
                      '--'
                    )}
                  </div>
                </div>

                {/* Duration Card */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-xs font-bold">{lang === 'bs' ? 'Vrijeme' : 'Duration'}</span>
                  </div>
                  <div className="mt-2 text-white font-black text-xl flex items-baseline gap-1">
                    {isRouteLoading ? (
                      <Loader2 className="animate-spin text-blue-400" size={20} />
                    ) : routeTime !== null ? (
                      <>
                        {Math.ceil(routeTime / 60)}
                        <span className="text-xs text-blue-400 font-bold">min</span>
                      </>
                    ) : (
                      '--'
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Maps Integration Button - Removed to keep navigation internal */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsNavigating(false);
                    setSelectedTarget(null);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-red-600/20"
                >
                  {lang === 'bs' ? 'Završi' : 'End'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Location Action Button */}
      <div className="absolute bottom-10 left-10 z-10">
        <button
          onClick={() => userLocation && map.current?.flyTo({ center: userLocation, zoom: 17, pitch: 60 })}
          className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-[0_15px_40px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <Navigation size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

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
