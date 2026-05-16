import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Language } from '../types';
import { TUZLA_CENTER } from '../constants';
import { AppFeatures } from '../utils/platform';
import { Search, X, Loader2, Navigation, Layers } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { useNetwork } from '../hooks/useNetwork';
import { tuzlaHotelData } from '../tuzlaHotelData';
import { Hotel as HotelIcon } from 'lucide-react';

interface MapViewProps {
  lang: Language;
  features: AppFeatures;
}

const OFFLINE_STYLE = '/style/offline-style.json';
const ONLINE_STYLE = 'https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=65090a03070e4e1898694f7a18ba415b';

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
      let combinedResults: any[] = [];

      // 1. Always check local poi.geojson first
      const localRes = await fetch('/poi.geojson');
      const localData = await localRes.json();
      const query = searchQuery.toLowerCase();
      
      const localMatches = localData.features.filter((f: any) =>
        f.properties.name.toLowerCase().includes(query) ||
        (f.properties.name_bs && f.properties.name_bs.toLowerCase().includes(query))
      ).map((f: any) => ({
        display_name: f.properties.name,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        category: f.properties.category || 'POI'
      }));
      
      combinedResults = [...localMatches];

      // 2. If online, also query Geoapify for real addresses
      if (isOnline) {
        try {
          const geoapifyKey = '5c27539c29954a908aeba457beeffbea';
          const geoRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&bias=proximity:18.67,44.53&filter=rect:18.5,44.4,18.8,44.7&apiKey=${geoapifyKey}`);
          const geoData = await geoRes.json();
          
          if (geoData.features) {
            const geoMatches = geoData.features.map((f: any) => ({
              display_name: f.properties.formatted,
              lat: f.properties.lat,
              lon: f.properties.lon,
              category: 'Address'
            }));
            combinedResults = [...combinedResults, ...geoMatches];
          }
        } catch (geoErr) {
          console.warn('Geoapify search failed:', geoErr);
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
          map.current?.setPaintProperty('park', 'fill-color', '#d1e8b9');
          map.current?.setPaintProperty('park_outline', 'line-color', '#b4f275');
          map.current?.setPaintProperty('landuse_residential', 'fill-color', 'rgba(215,190,154,0.49)');
          map.current?.setPaintProperty('landcover_wood', 'fill-color', 'rgba(148,203,117,0.7)');
          map.current?.setPaintProperty('landcover_grass', 'fill-color', '#a0d381');
          map.current?.setPaintProperty('landuse_cemetery', 'fill-color', '#f0f4e4');
          map.current?.setPaintProperty('landuse_hospital', 'fill-color', '#ffd7eb');
          map.current?.setPaintProperty('landuse_school', 'fill-color', '#f1f4b7');
          map.current?.setLayoutProperty('waterway_tunnel', 'visibility', 'none');
          map.current?.setPaintProperty('water', 'fill-color', '#8caff8');
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
        } catch (err) {
          console.warn("⚠️ MapView: Some style refinements could not be applied.", err);
        }
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
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: 900; color: #fbbf24;">${hotel.rating} ⭐</span>
                <span style="font-size: 10px; font-weight: 700; color: #475569; background: white/10; padding: 2px 8px; border-radius: 6px;">${hotel.priceRange}</span>
              </div>
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
          if (!userMarker.current) {
            const el = document.createElement('div');
            el.innerHTML = `<div style="background:#3b82f6;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(59,130,246,0.6);"><div style="width:8px;height:8px;background:#fff;border-radius:50%;" /></div>`;
            userMarker.current = new maplibregl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
          } else {
            userMarker.current.setLngLat([longitude, latitude]);
          }
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

      {/* Floating Weather & Location */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-4 z-10">
        <WeatherWidget lang={lang} />

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
