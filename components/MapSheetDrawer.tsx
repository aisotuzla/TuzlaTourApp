import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Search,
  X,
  Navigation,
  Route,
  Landmark,
  Hotel as HotelIcon,
  Trophy,
  Layers,
  Clock,
  Footprints,
  ChevronUp,
  ChevronDown,
  Check,
  Loader2,
  Lock,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Language } from '../types';
import { getDistance } from '../utils/geoUtils';
import { tuzlaHotelData } from '../tuzlaHotelData';
import { QUEST_TARGETS } from '../constants/questData';

export type SheetSnapState = 'collapsed' | 'half' | 'expanded';

export interface SheetTarget {
  name: string;
  lat: number;
  lon: number;
  category?: string;
  description?: string;
  entryFee?: string;
  rating?: string;
  priceRange?: string;
  image?: string;
}

export interface MapSheetDrawerProps {
  lang: Language;
  userLocation: [number, number] | null;
  snapState: SheetSnapState;
  onSnapChange: (snap: SheetSnapState) => void;
  // Search
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchResults: any[];
  onSelectSearchResult: (result: any) => void;
  onClearSearch: () => void;
  // Selected Target / Inspection
  selectedTarget: SheetTarget | null;
  onSelectTarget: (target: SheetTarget | null) => void;
  // Active Navigation
  isNavigating: boolean;
  onStartNavigation: (target: SheetTarget) => void;
  onEndNavigation: () => void;
  routeDistance: number | null;
  routeTime: number | null;
  isRouteLoading: boolean;
  // Layer switching
  activeStyle: string;
  onSelectLayer: (styleUrl: string) => void;
  layerOptions: Array<{ id: string; name: { bs: string; en: string }; url: string }>;
  // Rewards
  unlockedRewards?: string[];
  // Presets list
  landmarks: Array<{
    name: Partial<Record<Language, string>> & { en: string; bs: string };
    lat: number;
    lon: number;
    category: string;
    entryFee?: string;
    description?: string;
  }>;
}

export const MapSheetDrawer: React.FC<MapSheetDrawerProps> = ({
  lang,
  userLocation,
  snapState,
  onSnapChange,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  isSearching,
  searchResults,
  onSelectSearchResult,
  onClearSearch,
  selectedTarget,
  onSelectTarget,
  isNavigating,
  onStartNavigation,
  onEndNavigation,
  routeDistance,
  routeTime,
  isRouteLoading,
  activeStyle,
  onSelectLayer,
  layerOptions,
  unlockedRewards = [],
  landmarks,
}) => {
  const [activeTab, setActiveTab] = useState<'landmarks' | 'hotels' | 'rewards' | 'layers'>('landmarks');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Format distance helper
  const formatDistance = (targetLat: number, targetLon: number): string | null => {
    if (!userLocation) return null;
    const meters = getDistance(userLocation[1], userLocation[0], targetLat, targetLon);
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Drag gestures for snapping
  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const yDelta = offset.y;
    const yVel = velocity.y;

    if (snapState === 'collapsed') {
      if (yDelta < -40 || yVel < -200) {
        onSnapChange('half');
      }
    } else if (snapState === 'half') {
      if (yDelta < -60 || yVel < -300) {
        onSnapChange('expanded');
      } else if (yDelta > 60 || yVel > 300) {
        onSnapChange('collapsed');
      }
    } else if (snapState === 'expanded') {
      if (yDelta > 60 || yVel > 300) {
        onSnapChange('half');
      }
    }
  };

  // Cycle snaps on handle click
  const handleToggleSnap = () => {
    if (snapState === 'collapsed') {
      onSnapChange('half');
    } else if (snapState === 'half') {
      onSnapChange('expanded');
    } else {
      onSnapChange('collapsed');
    }
  };

  // Height mappings based on snap
  const getDrawerHeight = () => {
    switch (snapState) {
      case 'collapsed':
        return isNavigating ? '120px' : '110px';
      case 'half':
        return '48vh';
      case 'expanded':
        return '84vh';
      default:
        return '110px';
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      animate={{ height: getDrawerHeight() }}
      transition={{ type: 'spring', damping: 30, stiffness: 340, mass: 0.8 }}
      className="absolute bottom-0 left-0 right-0 z-[160] mx-auto w-full max-w-2xl bg-slate-950/92 backdrop-blur-2xl border-t border-white/15 rounded-t-[2.2rem] shadow-[0_-12px_45px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden text-white transition-[border-color] duration-300 pointer-events-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ── DRAG HANDLE & TOP BAR ── */}
      <div
        onClick={handleToggleSnap}
        className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none group shrink-0"
        title={lang === 'bs' ? 'Povuci ili klikni za promjenu visine' : 'Drag or click to resize'}
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-500/50 group-hover:bg-blue-400 group-hover:scale-x-110 transition-all duration-300" />
      </div>

      {/* ── ACTIVE NAVIGATION MODE (TURN-BY-TURN HUD BAR) ── */}
      {isNavigating && selectedTarget ? (
        <div className="px-4 sm:px-6 pt-1 pb-3 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900/90 border border-blue-500/30 rounded-2xl p-2.5 sm:p-3 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                <Route className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                    {lang === 'bs' ? 'Aktivna ruta' : 'Walking Route'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate leading-tight">
                  {selectedTarget.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Distance & Time pill */}
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-black text-white">
                  {isRouteLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 inline" />
                  ) : routeDistance !== null ? (
                    routeDistance >= 1000 ? `${(routeDistance / 1000).toFixed(1)} km` : `${Math.round(routeDistance)} m`
                  ) : '--'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {routeTime !== null ? `${Math.ceil(routeTime / 60)} min` : '--'}
                </span>
              </div>

              {/* End button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEndNavigation();
                }}
                className="px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <X size={14} />
                <span>{lang === 'bs' ? 'Završi' : 'End'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSnap();
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              >
                {snapState === 'collapsed' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Quick metrics row for mobile */}
          <div className="flex sm:hidden items-center justify-between px-1 text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Footprints size={12} className="text-blue-400" />
              {isRouteLoading ? '...' : routeDistance !== null ? (routeDistance >= 1000 ? `${(routeDistance / 1000).toFixed(1)} km` : `${Math.round(routeDistance)} m`) : '--'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-blue-400" />
              {routeTime !== null ? `${Math.ceil(routeTime / 60)} min` : '--'}
            </span>
            <span className="text-blue-400 uppercase tracking-widest text-[9px] font-black">
              {lang === 'bs' ? 'Pješačka putanja' : 'Walking pace'}
            </span>
          </div>
        </div>
      ) : (
        /* ── STANDARD APPLE / GOOGLE MAPS SEARCH & CHIP BAR ── */
        <div className="px-4 sm:px-6 pb-2.5 shrink-0 flex flex-col gap-2">
          {/* Integrated Search Input */}
          <form
            onSubmit={(e) => {
              onSearchSubmit(e);
              if (snapState === 'collapsed') onSnapChange('half');
            }}
            className="relative flex items-center"
          >
            <Search className="absolute left-3.5 text-blue-400 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={lang === 'bs' ? 'Pretraži Tuzlu (lokacije, restorani, spomenici)...' : 'Search Tuzla (landmarks, hotels, spots)...'}
              value={searchQuery}
              onFocus={() => {
                if (snapState === 'collapsed') onSnapChange('half');
              }}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/[0.13] focus:bg-white/[0.16] border border-white/15 focus:border-blue-500 rounded-2xl py-2.5 pl-10 pr-20 text-xs sm:text-sm font-bold text-white placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-1" />
              ) : (
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  {lang === 'bs' ? 'Traži' : 'Go'}
                </button>
              )}
            </div>
          </form>

          {/* Quick Category Action Chips (horizontal scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
            <button
              onClick={() => {
                setActiveTab('landmarks');
                if (snapState === 'collapsed') onSnapChange('half');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'landmarks' && snapState !== 'collapsed'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Landmark size={14} className={activeTab === 'landmarks' ? 'text-white' : 'text-blue-400'} />
              <span>{lang === 'bs' ? 'Znamenitosti' : 'Landmarks'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('hotels');
                if (snapState === 'collapsed') onSnapChange('half');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'hotels' && snapState !== 'collapsed'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <HotelIcon size={14} className={activeTab === 'hotels' ? 'text-white' : 'text-amber-400'} />
              <span>{lang === 'bs' ? 'Hoteli' : 'Hotels'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('rewards');
                if (snapState === 'collapsed') onSnapChange('half');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'rewards' && snapState !== 'collapsed'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Trophy size={14} className={activeTab === 'rewards' ? 'text-slate-950' : 'text-amber-400'} />
              <span>{lang === 'bs' ? 'Nagrade' : 'Quest Rewards'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                {unlockedRewards.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('layers');
                if (snapState === 'collapsed') onSnapChange('half');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'layers' && snapState !== 'collapsed'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Layers size={14} className={activeTab === 'layers' ? 'text-white' : 'text-emerald-400'} />
              <span>{lang === 'bs' ? 'Sloj Mape' : 'Layers'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── EXPANDABLE CONTENT BODY (VISIBLE WHEN HALF OR EXPANDED) ── */}
      <AnimatePresence>
        {snapState !== 'collapsed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 space-y-3 custom-scrollbar overscroll-contain"
          >
            {/* 1. SEARCH RESULTS (IF ACTIVE) */}
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
                  <span>{lang === 'bs' ? 'Rezultati Pretrage' : 'Search Results'}</span>
                  <button onClick={onClearSearch} className="text-blue-400 hover:underline lowercase font-bold text-[11px]">
                    {lang === 'bs' ? 'očisti' : 'clear'}
                  </button>
                </div>
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectSearchResult(result)}
                    className="p-3.5 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/40 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 truncate">
                          {result.display_name}
                        </h4>
                        <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider">
                          {result.category || (lang === 'bs' ? 'Lokacija' : 'Location')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartNavigation({
                          name: result.display_name,
                          lat: result.lat,
                          lon: result.lon,
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0 ml-2 shadow-md shadow-blue-600/30"
                    >
                      <Route size={14} />
                      <span>{lang === 'bs' ? 'Ruta' : 'Go'}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : selectedTarget && !isNavigating ? (
              /* 2. SELECTED TARGET DETAIL CARD */
              <div className="p-4 bg-gradient-to-b from-blue-950/60 to-slate-900/90 border border-blue-500/30 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-0.5">
                      {selectedTarget.category || (lang === 'bs' ? 'Odabrana Lokacija' : 'Selected Location')}
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedTarget.name}</h3>
                    {userLocation && (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                        <Footprints size={12} className="text-blue-400" />
                        {formatDistance(selectedTarget.lat, selectedTarget.lon)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectTarget(null)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                {selectedTarget.description && (
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {selectedTarget.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onStartNavigation(selectedTarget)}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Route size={16} />
                    <span>{lang === 'bs' ? 'Započni Pješačku Rutu' : 'Start Walking Route'}</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* 3. TAB 1: LANDMARKS (ZNAMENITOSTI) */}
            {activeTab === 'landmarks' && searchResults.length === 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Landmark size={14} className="text-blue-400" />
                    {lang === 'bs' ? 'Poznate Znamenitosti Tuzle' : 'Famous Tuzla Landmarks'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{landmarks.length}</span>
                </div>

                {landmarks.map((poi, idx) => {
                  const title = poi.name[lang as 'bs' | 'en'] ?? poi.name.en;
                  const distance = formatDistance(poi.lat, poi.lon);
                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        onSelectTarget({
                          name: title,
                          lat: poi.lat,
                          lon: poi.lon,
                          category: poi.category,
                          description: poi.description,
                          entryFee: poi.entryFee,
                        })
                      }
                      className="p-3.5 bg-white/5 hover:bg-blue-600/15 border border-white/5 hover:border-blue-500/40 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          <Landmark size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 truncate">
                            {title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] uppercase font-black tracking-wider text-blue-400/90">
                              {poi.category}
                            </span>
                            {distance && (
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                                • {distance}
                              </span>
                            )}
                            {poi.entryFee && (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded-md">
                                {poi.entryFee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartNavigation({
                            name: title,
                            lat: poi.lat,
                            lon: poi.lon,
                            category: poi.category,
                            description: poi.description,
                          });
                        }}
                        className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-all shrink-0 group/btn"
                        title={lang === 'bs' ? 'Započni rutu' : 'Start route'}
                      >
                        <Route size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. TAB 2: HOTELS (HOTELI) */}
            {activeTab === 'hotels' && searchResults.length === 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <HotelIcon size={14} className="text-amber-400" />
                    {lang === 'bs' ? 'Smještaj i Hoteli' : 'Hotels & Accommodation'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{tuzlaHotelData.length}</span>
                </div>

                {tuzlaHotelData.map((hotel, idx) => {
                  const distance = formatDistance(hotel.latitude, hotel.longitude);
                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        onSelectTarget({
                          name: hotel.name,
                          lat: hotel.latitude,
                          lon: hotel.longitude,
                          rating: String(hotel.rating),
                          priceRange: hotel.priceRange,
                          description: hotel.description[lang],
                          image: hotel.image,
                          category: 'Hotel',
                        })
                      }
                      className="p-3.5 bg-white/5 hover:bg-blue-600/15 border border-white/5 hover:border-blue-500/40 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {hotel.image ? (
                          <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shrink-0">
                            <HotelIcon size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 truncate">
                            {hotel.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-amber-400">
                              {hotel.rating} ★
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              • {hotel.priceRange}
                            </span>
                            {distance && (
                              <span className="text-[10px] font-bold text-slate-400">
                                • {distance}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartNavigation({
                            name: hotel.name,
                            lat: hotel.latitude,
                            lon: hotel.longitude,
                            category: 'Hotel',
                          });
                        }}
                        className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-all shrink-0 group/btn"
                        title={lang === 'bs' ? 'Započni rutu' : 'Start route'}
                      >
                        <Route size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. TAB 3: QUEST REWARDS (NAGRADE) */}
            {activeTab === 'rewards' && searchResults.length === 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-400" />
                    {lang === 'bs' ? 'Tajne Lokacije i Nagrade' : 'Secret Targets & Rewards'}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    {unlockedRewards.length} / {QUEST_TARGETS.length}
                  </span>
                </div>

                {QUEST_TARGETS.map((item) => {
                  const isUnlocked = unlockedRewards.includes(item.id);
                  const title = isUnlocked
                    ? (item.name[lang as 'bs' | 'en'] || item.name.en || item.name.bs)
                    : (lang === 'bs' ? '??? Skrivena lokacija' : '??? Secret Location');

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        isUnlocked
                          ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20'
                          : 'border-white/5 bg-white/[0.02] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={item.Image}
                            alt="Reward"
                            className={`w-full h-full object-cover ${
                              isUnlocked ? 'brightness-90' : 'grayscale brightness-40 blur-sm'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest block ${
                              isUnlocked ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            {isUnlocked
                              ? (lang === 'bs' ? 'Otključano' : 'Unlocked')
                              : (lang === 'bs' ? 'Zaključano' : 'Locked')}
                          </span>
                          <h4
                            className={`font-extrabold text-sm truncate ${
                              isUnlocked ? 'text-white' : 'text-slate-500 italic'
                            }`}
                          >
                            {title}
                          </h4>
                        </div>
                      </div>

                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-600'
                        }`}
                      >
                        {isUnlocked ? <Trophy size={16} /> : <Lock size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 6. TAB 4: MAP LAYERS (SLOJEVI) */}
            {activeTab === 'layers' && searchResults.length === 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-emerald-400" />
                    {lang === 'bs' ? 'Stilovi i Slojevi Mape' : 'Map Styles & Layers'}
                  </span>
                </div>

                <div className="space-y-2">
                  {layerOptions.map((layerOpt) => {
                    const isSelected = activeStyle === layerOpt.url;
                    return (
                      <button
                        key={layerOpt.id}
                        onClick={() => onSelectLayer(layerOpt.url)}
                        className={`w-full p-4 rounded-2xl text-xs font-bold text-left flex items-center justify-between transition-all border ${
                          isSelected
                            ? 'bg-blue-600/90 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Layers size={18} className={isSelected ? 'text-white' : 'text-slate-400'} />
                          <div>
                            <span className="font-extrabold text-sm block">
                              {layerOpt.name[lang as 'bs' | 'en'] || layerOpt.name.bs}
                            </span>
                            <span className="text-[10px] text-slate-300/80 uppercase font-mono">
                              {layerOpt.id === 'offline'
                                ? (lang === 'bs' ? 'Bez interneta (PMTiles)' : 'Works Offline')
                                : (lang === 'bs' ? 'Zahtijeva internet' : 'Online OSM')}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center shadow">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
