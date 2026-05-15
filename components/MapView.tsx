import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Language } from '../types';
import { TUZLA_CENTER } from '../constants';
import { AppFeatures } from '../utils/platform';
import { Search, X, Loader2, Navigation, Layers } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { useNetwork } from '../hooks/useNetwork';

interface MapViewProps {
  lang: Language;
  features: AppFeatures;
}

const OFFLINE_STYLE = '/style/offline-style.json';
const ONLINE_STYLE = 'https://api.jawg.io/styles/845b87e6-2431-4d4c-ae2c-a3d1e8095a01.json?access-token=MJ1UjbO1irardUqAtZPQAzlWULZIZAFIsQdTrqkdC9bA34vgAGVMi20z7kP9ZRWX';

const MapView: React.FC<MapViewProps> = ({ lang, features }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const isOnline = useNetwork();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Local GeoJSON Search (Offline-First)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Always fetch from local poi.geojson for speed and offline consistency
      const res = await fetch('/poi.geojson');
      const data = await res.json();
      
      const query = searchQuery.toLowerCase();
      const filtered = data.features.filter((f: any) => 
        f.properties.name.toLowerCase().includes(query) || 
        (f.properties.name_bs && f.properties.name_bs.toLowerCase().includes(query))
      ).map((f: any) => ({
        display_name: f.properties.name,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        category: f.properties.category
      }));

      setSearchResults(filtered.slice(0, 5));
    } catch (err) {
      console.error('Local search failed:', err);
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
          <div style="font-family: 'Quicksand', sans-serif; font-size: 14px; font-weight: 700; color: #1e293b; padding: 4px;">
            ${result.display_name}
          </div>
        `))
        .addTo(map.current);

      searchMarkerRef.current.togglePopup();
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
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Add standard navigation controls
      map.current?.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

      // Set 3D light for premium feel
      map.current?.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.15, 210, 30]
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

  // GPS Tracking
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        
        if (!userMarker.current) {
          const el = document.createElement('div');
          el.className = 'user-location-marker';
          el.innerHTML = `
            <div style="width: 24px; height: 24px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 20px rgba(59,130,246,0.5); position: relative;">
              <div style="position: absolute; top: -2px; left: -2px; width: 28px; height: 28px; background: #3b82f6; border-radius: 50%; opacity: 0.2; animation: pulse 2s infinite;" />
            </div>
          `;
          userMarker.current = new maplibregl.Marker(el).setLngLat([longitude, latitude]).addTo(map.current!);
        } else {
          userMarker.current.setLngLat([longitude, latitude]);
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: features.mapGpsHighAccuracy, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLoaded, features.mapGpsHighAccuracy]);

  return (
    <div className="h-[calc(100vh-64px)] w-full relative flex flex-col bg-slate-950">
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <WeatherWidget className="top-4 left-4" />

      {/* Connectivity Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-2xl transition-all duration-500">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
          {isOnline ? 'Live Mode' : 'Offline Ready'}
        </span>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className={`flex items-center gap-2 h-12 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden ${isSearchOpen ? 'w-[300px] px-4' : 'w-12 px-0'}`}>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-blue-400 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {isSearchOpen && (
            <form onSubmit={handleSearch} className="flex-grow flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bs' ? "Traži lokacije..." : "Search locations..."}
                className="w-full bg-transparent border-none text-white px-1 focus:outline-none placeholder-white/30 font-quicksand font-bold text-sm"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                searchQuery && <X className="w-4 h-4 text-white/40 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
              )}
            </form>
          )}
        </div>

        {isSearchOpen && searchResults.length > 0 && (
          <div className="w-[300px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-quicksand z-30">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-5 py-4 border-b border-white/5 hover:bg-blue-600/20 flex flex-col gap-1 transition-colors"
              >
                <span className="text-white text-sm font-bold truncate">{result.display_name}</span>
                <span className="text-blue-400/60 text-[10px] font-black uppercase tracking-wider">{result.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recenter & Layer Toggles */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
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
                () => alert('GPS not available'),
                { enableHighAccuracy: true }
              );
            }
          }}
          className="w-14 h-14 bg-blue-600 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:bg-blue-500 active:scale-95 transition-all border border-blue-400/30"
        >
          <Navigation size={24} />
        </button>
      </div>

      <div ref={mapContainer} className="flex-grow w-full h-full grayscale-[0.2] contrast-[1.1]" />
    </div>
  );
};

export default MapView;
