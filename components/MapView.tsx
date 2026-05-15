import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Language } from '../types';
import { TUZLA_CENTER } from '../constants';
import { AppFeatures } from '../utils/platform';
import { tuzlaHotelData, HotelData } from '../tuzlaHotelData';
import { WeatherWidget } from './WeatherWidget';
import { useNetwork } from '../hooks/useNetwork';
import { Search, X, Loader2 } from 'lucide-react';

interface MapViewProps {
  lang: Language;
  features: AppFeatures;
}

const MapView: React.FC<MapViewProps> = ({ lang, features }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [zoom, setZoom] = useState(17);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const isOnline = useNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const apiKey = import.meta.env.VITE_GEOCODING_API_KEY;
      const url = `https://geocode.maps.co/search?q=${encodeURIComponent(searchQuery + ', Tuzla, Bosnia')}&api_key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (map.current && !isNaN(lat) && !isNaN(lon)) {
      map.current.flyTo({ center: [lon, lat], zoom: 17, pitch: 60 });

      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
      }

      searchMarkerRef.current = new maplibregl.Marker({ color: '#ea580c' })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: 'Quicksand', sans-serif; font-size: 14px; font-weight: 700; color: #1e293b; padding: 4px;">
            ${result.display_name.split(',')[0]}
          </div>
        `))
        .addTo(map.current);

      searchMarkerRef.current.togglePopup();
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  // Helper setup for buildings
  const setupBuildings = (mapInstance: maplibregl.Map) => {
    const existingBuilding = mapInstance.getStyle().layers.find(
      (l: any) => l.id === 'building' && l['source-layer'] === 'building'
    );
    if (!existingBuilding) return;

    const buildingSource = (existingBuilding as any).source;
    if (mapInstance.getLayer('building-outline')) mapInstance.removeLayer('building-outline');
    if (mapInstance.getLayer('building')) mapInstance.removeLayer('building');

    const layers = mapInstance.getStyle().layers;
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
        source: buildingSource,
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], ['get', 'height'], 15],
            0, '#f8fafc',    // Sky 50 (Highlight)
            20, '#e2e8f0',   // Slate 200 (Silver Base)
            50, '#cbd5e1',   // Slate 300 (Medium Silver)
            100, '#94a3b8'   // Slate 400 (Darker Silver)
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            15, ['coalesce', ['get', 'render_height'], ['get', 'height'], 12],
          ],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.9,
        },
      }, labelLayerId);
    }
  };

  const setupHighlighters = (mapInstance: maplibregl.Map) => {
    if (mapInstance.getLayer('m4-glow-outer')) return;

    // Find the correct source ID used by the Jawg style
    const sources = mapInstance.getStyle().sources;
    const sourceId = Object.keys(sources).find(id => id.includes('jawg') || id.includes('streets') || id.includes('osm')) || 'jawg';

    mapInstance.addLayer({
      id: 'm4-glow-outer',
      type: 'line',
      source: sourceId,
      'source-layer': 'road',
      filter: ['all',
        ['any', ['==', 'class', 'primary'], ['==', 'class', 'motorway'], ['==', 'type', 'primary'], ['==', 'type', 'motorway'], ['==', 'highway', 'primary']],
        ['any', ['==', 'name', 'Obala Zmaja od Bosne'], ['==', 'ref', 'M-4'], ['==', 'ref', 'M 4']]
      ],
      paint: {
        'line-color': '#0f0f0fff',
        'line-width': 12,
        'line-blur': 8,
        'line-opacity': 0.5
      }
    });
    mapInstance.addLayer({
      id: 'm4-glow-inner',
      type: 'line',
      source: sourceId,
      'source-layer': 'road',
      filter: ['all',
        ['any', ['==', 'class', 'primary'], ['==', 'class', 'motorway'], ['==', 'type', 'primary'], ['==', 'type', 'motorway'], ['==', 'highway', 'primary']],
        ['any', ['==', 'name', 'Obala Zmaja od Bosne'], ['==', 'ref', 'M-4'], ['==', 'ref', 'M 4']]
      ],
      paint: {
        'line-color': '#eee094ff',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: isOnline
        ? `https://api.jawg.io/styles/845b87e6-2431-4d4c-ae2c-a3d1e8095a01.json?access-token=MJ1UjbO1irardUqAtZPQAzlWULZIZAFIsQdTrqkdC9bA34vgAGVMi20z7kP9ZRWX`
        : {
          version: 8,
          sources: {
            'tuzla': { type: 'geojson', data: '/assets/tuzla-map.geojson' },
            'buildings-1': { type: 'geojson', data: '/MAP/overture-2026-03-18.0-building-18.669,44.534,18.692,44.546.geojson' },
            'buildings-2': { type: 'geojson', data: '/MAP/overture-2026-03-18.0-building-18.672,44.530,18.695,44.542.geojson' }
          },
          layers: [
            { id: 'background', type: 'background', paint: { 'background-color': '#b2bedbff' } },
            { id: 'water', type: 'fill', source: 'tuzla', filter: ['any', ['==', 'natural', 'water'], ['==', 'waterway', 'river']], paint: { 'fill-color': '#0004f3ff', 'fill-opacity': 0.9 } },
            { id: 'parks', type: 'fill', source: 'tuzla', filter: ['any', ['==', 'leisure', 'park'], ['==', 'landuse', 'grass']], paint: { 'fill-color': '#064e3b', 'fill-opacity': 0.5 } },
            { id: 'roads', type: 'line', source: 'tuzla', filter: ['has', 'highway'], paint: { 'line-color': '#3b82f6', 'line-width': 1.5, 'line-opacity': 0.3 } },
            { id: 'primary-roads', type: 'line', source: 'tuzla', filter: ['any', ['==', 'highway', 'primary'], ['==', 'highway', 'secondary']], paint: { 'line-color': '#167cf8ff', 'line-width': 2.5, 'line-opacity': 0.7 } },
            {
              id: '3d-buildings', type: 'fill-extrusion', source: 'tuzla', filter: ['has', 'building'], paint: {
                'fill-extrusion-color': [
                  'interpolate', ['linear'], ['coalesce', ['get', 'height'], 15],
                  0, '#f8fafc',
                  20, '#e2e8f0',
                  50, '#cbd5e1',
                  100, '#94a3b8'
                ],
                'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
                'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                'fill-extrusion-opacity': 0.9
              }
            },
            {
              id: '3d-buildings-offline-1',
              source: 'buildings-1',
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#cbd5e1',
                'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
                'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                'fill-extrusion-opacity': 0.9
              }
            },
            {
              id: '3d-buildings-offline-2',
              source: 'buildings-2',
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#cbd5e1',
                'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
                'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                'fill-extrusion-opacity': 0.9
              }
            }
          ]
        },
      center: [TUZLA_CENTER[1], TUZLA_CENTER[0]],
      zoom: zoom,
      pitch: 85,
      bearing: -25,
    });

    map.current.on('load', () => {
      setIsLoaded(true);

      // Advanced 3D Lighting for metallic effect (applied to both modes)
      map.current?.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.3,
        position: [1.15, 210, 30]
      });

      if (isOnline) {
        setupBuildings(map.current!);
        setupHighlighters(map.current!);
      }

      // Add hotel markers
      tuzlaHotelData.forEach((hotel: HotelData) => {
        if (!hotel.latitude || !hotel.longitude) return;
        const el = document.createElement('div');
        el.className = 'hotel-marker-container';
        el.innerHTML = `
          <div style="position: relative; width: 44px; height: 56px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));">
            <svg viewBox="0 0 44 56" style="width: 100%; height: 100%; fill: #FFD700;">
              <path d="M22 0C9.8 0 0 9.8 0 22C0 38.5 22 56 22 56C22 56 44 38.5 44 22C44 9.8 34.2 0 22 0Z" />
              <circle cx="22" cy="22" r="18" fill="white" fill-opacity="0.2" />
            </svg>
            <div style="position: absolute; top: 6px; left: 50%; translate: -50% 0; width: 32px; height: 32px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
              <img src="/assets/Gallery/QuestQRLocations/hotel.svg" alt="Hotel" style="width: 20px; height: 20px;" />
            </div>
          </div>`;

        new maplibregl.Marker(el)
          .setLngLat([hotel.longitude, hotel.latitude])
          .setPopup(new maplibregl.Popup({ offset: 30 }).setHTML(`
            <div style="padding: 16px; font-family: 'Quicksand', sans-serif; background: #292925ff; color: white; border-radius: 20px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #60a5fa;">${hotel.name}</h3>
              <p style="margin: 4px 0 12px 0; font-size: 11px; color: #94a3b8;">🏨 Hotel &bull; ⭐ ${hotel.rating}</p>
            </div>
          `))
          .addTo(map.current!);
      });
    });

    map.current.on('error', (e) => {
      console.warn("MapView Map: Style error detected, attempting local fallback or signaling loaded...", e);
      if (!isLoaded) {
        setTimeout(() => setIsLoaded(true), 1000);
      }
    });

    map.current.on('zoom', () => setZoom(map.current?.getZoom() || 0));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isOnline]); // Re-init on online/offline switch for simplicity

  // Tracking effect
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        if (!userMarker.current) {
          const el = document.createElement('div');
          el.innerHTML = `<div style="background:#3b82f6;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(59,130,246,0.6);"><div style="width:8px;height:8px;background:#fff;border-radius:50%;" /></div>`;
          userMarker.current = new maplibregl.Marker(el).setLngLat([longitude, latitude]).addTo(map.current!);
          // Fly to user on first GPS lock
          map.current?.flyTo({ center: [longitude, latitude], zoom: 16, pitch: 60, duration: 2000 });
        } else {
          userMarker.current.setLngLat([longitude, latitude]);
        }
      },
      (err) => {
        console.error("MapView Geolocation Error:", err);
        if (err.code === 3 || err.code === 1) {
          navigator.geolocation.getCurrentPosition(
            (p) => setUserLocation([p.coords.latitude, p.coords.longitude]),
            (e) => console.error("MapView Fallback Geolocation Error:", e),
            { enableHighAccuracy: false, timeout: 10000 }
          );
        }
      },
      { enableHighAccuracy: features.mapGpsHighAccuracy, timeout: 15000, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLoaded, features.mapGpsHighAccuracy]);

  return (
    <div className="h-[calc(100vh-64px)] w-full relative flex flex-col">
      <WeatherWidget className="top-4 left-4" />

      {/* OFFLINE INDICATOR */}
      {!isOnline && (
        <div className="absolute top-16 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-blue-500/30">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Offline Mode</span>
        </div>
      )}

      {/* SEARCH BAR */}
      {isOnline && (
        <div className="absolute top-4 right-4 z-20 flex items-center justify-end">
          <div
            className={`flex items-center gap-2 h-11 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden ${isSearchOpen ? 'w-[280px] px-4' : 'w-11 px-0'}`}
          >
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isSearchOpen) {
                  setSearchQuery('');
                  setSearchResults([]);
                }
              }}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-blue-400/80 hover:text-blue-400"
            >
              <Search className="w-5 h-5" />
            </button>

            {isSearchOpen && (
              <form onSubmit={handleSearch} className="flex-grow flex items-center relative">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'bs' ? "Pronađi adresu..." : "Search..."}
                  className="w-full bg-transparent border-none text-white px-2 focus:outline-none placeholder-white/30 font-quicksand font-bold text-xs"
                />
                {isSearching && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
                {searchQuery && !isSearching && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-white/30 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>
            )}
          </div>

          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-14 right-0 w-[280px] bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-quicksand z-30">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 flex flex-col gap-0.5"
                >
                  <span className="text-white text-[11px] font-bold truncate">{result.display_name.split(',')[0]}</span>
                  <span className="text-white/40 text-[9px] truncate tracking-tight">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3D SLIDER */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2 bg-white/90 p-2 rounded-full shadow-lg border border-blue-200">
        <span className="text-[10px] font-black text-blue-800 uppercase" style={{ writingMode: 'vertical-rl' }}>3D</span>
        <input
          type="range" min="30" max="90" defaultValue="75"
          onChange={(e) => map.current?.setPitch(parseInt(e.target.value))}
          className="appearance-none bg-blue-200 rounded-full h-24 w-1.5"
          style={{ appearance: 'slider-vertical' as any, WebkitAppearance: 'slider-vertical', writingMode: 'vertical-rl' }}
        />
      </div>

      <div ref={mapContainer} className="flex-grow w-full h-full">
        {/* RECENTER BUTTON */}
        <button 
          onClick={() => {
            if (userLocation && map.current) {
              map.current.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 17, pitch: 60 });
            } else {
              navigator.geolocation.getCurrentPosition(
                (p) => {
                  const coords: [number, number] = [p.coords.latitude, p.coords.longitude];
                  setUserLocation(coords);
                  map.current?.flyTo({ center: [coords[1], coords[0]], zoom: 17, pitch: 60 });
                },
                (e) => alert(lang === 'bs' ? 'GPS lokacija nije dostupna.' : 'GPS location not available.'),
                { enableHighAccuracy: true, timeout: 10000 }
              );
            }
          }}
          className="absolute bottom-6 left-6 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-blue-600 active:scale-95 transition-all"
        >
          <Navigation size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapView;
