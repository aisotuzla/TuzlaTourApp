import React, { useMemo, useState } from 'react';
import { Compass, Navigation, QrCode, Volume2, ChevronLeft, ChevronRight, CheckCircle2, Lock, Sparkles, MapPin } from 'lucide-react';
import { Language } from '../types';
import {
  QUEST_TARGETS,
  QUEST_TARGET_COORDS,
  PHASE_1_POIS,
  PHASE_2_POIS,
  PHASE_3_POIS,
  GRAND_FINALE_POIS,
  PHASE_META,
  POI_COLORS,
  isPoiRewardUnlocked,
  QuestTarget,
} from '../constants/questData';
import { QUEST_POI_THUMBNAILS } from './MapQuestView';
import { getDistance } from '../utils/geoUtils';
import { useCompassHeading } from '../hooks/useCompassHeading';

export interface QuestCompassPanelProps {
  lang: Language;
  unlockedRewards: string[];
  userLocation: { lat: number; lng: number } | null;
  activeTargetId: string;
  onSelectTarget: (poiId: string) => void;
  onOpenScanner: () => void;
  onStartNavigation: (name: string, lat: number, lon: number) => void;
  onPlayAudio?: (poiId: string, title: string, audioUrl?: string) => void;
}

function calculateBearing(startLat: number, startLon: number, destLat: number, destLon: number): number {
  const dLon = ((destLon - startLon) * Math.PI) / 180;
  const phi1 = (startLat * Math.PI) / 180;
  const phi2 = (destLat * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export const QuestCompassPanel: React.FC<QuestCompassPanelProps> = ({
  lang,
  unlockedRewards,
  userLocation,
  activeTargetId,
  onSelectTarget,
  onOpenScanner,
  onStartNavigation,
  onPlayAudio,
}) => {
  const { heading, requestPermission } = useCompassHeading();
  const [calibrating, setCalibrating] = useState(false);

  const handleCompassTap = async () => {
    setCalibrating(true);
    setTimeout(() => setCalibrating(false), 800);
    await requestPermission();
  };

  // Determine current active phase
  const isP1Done = PHASE_1_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards));
  const isP2Done = isP1Done && PHASE_2_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards));
  const isP3Done = isP2Done && PHASE_3_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards));
  const activePhase = !isP1Done ? 1 : !isP2Done ? 2 : !isP3Done ? 3 : 4;

  const currentPhasePois = useMemo(() => {
    if (activePhase === 1) return PHASE_1_POIS;
    if (activePhase === 2) return PHASE_2_POIS;
    if (activePhase === 3) return PHASE_3_POIS;
    return GRAND_FINALE_POIS;
  }, [activePhase]);

  // Current active target object
  const target = useMemo(() => {
    return QUEST_TARGETS.find(t => t.id === activeTargetId) || QUEST_TARGETS.find(t => t.id === currentPhasePois[0]) || QUEST_TARGETS[0];
  }, [activeTargetId, currentPhasePois]);

  const targetCoords = QUEST_TARGET_COORDS[target.id];
  const isUnlocked = unlockedRewards.includes(target.id);
  const phaseMeta = PHASE_META[activePhase as keyof typeof PHASE_META] || PHASE_META[1];

  // Distance calculation
  const distance = useMemo(() => {
    if (!userLocation || !targetCoords) return null;
    return getDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lon);
  }, [userLocation, targetCoords]);

  const isWithin25m = distance !== null && distance <= 25;

  // Bearing calculation
  const targetBearing = useMemo(() => {
    if (!userLocation || !targetCoords) return 0;
    return calculateBearing(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lon);
  }, [userLocation, targetCoords]);

  // Needle pointer angle relative to phone orientation
  const pointerAngle = useMemo(() => {
    const currentHeading = heading !== null ? heading : 0;
    return (targetBearing - currentHeading + 360) % 360;
  }, [targetBearing, heading]);

  // Rose dial rotation so 'N' points to actual north
  const dialRotation = useMemo(() => {
    return heading !== null ? (360 - heading) % 360 : 0;
  }, [heading]);

  // Navigation between POIs in current phase
  const currentIndex = currentPhasePois.indexOf(target.id);
  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + currentPhasePois.length) % currentPhasePois.length;
    onSelectTarget(currentPhasePois[prevIdx]);
  };
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % currentPhasePois.length;
    onSelectTarget(currentPhasePois[nextIdx]);
  };

  const targetTitle = target.name[lang] || target.name.bs || target.name.en;
  const targetThumb = QUEST_POI_THUMBNAILS[target.id] || target.Image;
  const targetColor = POI_COLORS[target.id] || phaseMeta.color;

  const phaseUnlockedCount = currentPhasePois.filter(id => unlockedRewards.includes(id)).length;

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between px-3.5 py-2.5 overflow-hidden select-none border-t border-white/10 shadow-2xl relative">
      {/* Top Bar: Phase Badge & Progress */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg"
            style={{ backgroundColor: phaseMeta.color, boxShadow: `0 0 8px ${phaseMeta.color}` }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 truncate">
              {lang === 'bs' ? `Faza ${activePhase}: ${phaseMeta.badge.bs}` : `Phase ${activePhase}: ${phaseMeta.badge.en}`}
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              {phaseUnlockedCount}/{currentPhasePois.length} {lang === 'bs' ? 'otključano' : 'unlocked'}
            </span>
          </div>
        </div>

        {/* Phase Progress Pills */}
        <div className="flex items-center gap-1 shrink-0">
          {currentPhasePois.map((pId) => {
            const done = unlockedRewards.includes(pId);
            const isCur = pId === target.id;
            return (
              <button
                key={pId}
                onClick={() => onSelectTarget(pId)}
                aria-label={pId}
                className={`w-5 h-2 rounded-full transition-all ${done
                  ? 'bg-amber-400 shadow-sm'
                  : isCur
                    ? 'bg-white ring-1 ring-amber-400 scale-110'
                    : 'bg-white/20 hover:bg-white/40'
                  }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Center Area: Compass Dial + Active POI Details */}
      <div className="flex items-center justify-between gap-3 my-auto py-1">
        {/* Left: Redesigned High-Precision Tactical Compass Instrument */}
        <div
          onClick={handleCompassTap}
          title={lang === 'bs' ? 'Dodirnite za kalibraciju kompasa' : 'Tap to calibrate compass'}
          className={`relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center cursor-pointer select-none group transition-transform active:scale-95 ${
            calibrating ? 'animate-pulse' : ''
          }`}
        >
          {/* Outer Machined Titanium Bezel */}
          <div
            className="absolute inset-0 rounded-full border-2 bg-gradient-to-br from-slate-800 via-slate-950 to-slate-900 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300"
            style={{
              borderColor: isWithin25m ? '#10b981' : '#475569',
              boxShadow: isWithin25m
                ? '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 12px rgba(16, 185, 129, 0.2)'
                : '0 0 14px rgba(15, 23, 42, 0.9), inset 0 0 10px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Static Radial Graduation Ring (Every 30° Major, 10° Minor) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="46" fill="none" stroke="#334155" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1.5 3" />
              {/* 12 Hour / 30° Perimeter Tick Marks */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="5"
                  x2="50"
                  y2={deg % 90 === 0 ? "10" : "7.5"}
                  stroke={deg === 0 ? "#f43f5e" : deg % 90 === 0 ? "#cbd5e1" : "#64748b"}
                  strokeWidth={deg % 90 === 0 ? "1.5" : "0.8"}
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>

            {/* Rotating Cardinal Rose Dial (N/E/S/W points to true North) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${dialRotation}deg)`,
                transition: 'transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: 'transform',
              }}
            >
              {/* North: Luminous Ruby Red Chevron + Letter */}
              <div className="absolute top-1.5 flex flex-col items-center">
                <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5px] border-b-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.9)]" />
                <span className="text-[8px] font-black tracking-tighter text-rose-500 drop-shadow-[0_0_3px_rgba(244,63,94,0.7)] leading-none mt-0.5">
                  N
                </span>
              </div>

              {/* East */}
              <span className="absolute right-2 text-[8px] font-bold text-slate-300 drop-shadow">E</span>
              {/* South */}
              <span className="absolute bottom-1.5 text-[8px] font-bold text-slate-400 drop-shadow">S</span>
              {/* West */}
              <span className="absolute left-2 text-[8px] font-bold text-slate-300 drop-shadow">W</span>

              {/* Sub-cardinal diamond pips (NE, SE, SW, NW) */}
              {[45, 135, 225, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-1 h-1 bg-amber-400/50 rotate-45 rounded-[0.5px]"
                  style={{
                    top: '8px',
                    left: 'calc(50% - 2px)',
                    transformOrigin: '2px 42px',
                    transform: `rotate(${deg}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Tactical Dual-Tone Pointer Needle (Points at Target POI) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${pointerAngle}deg)`,
                transition: 'transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: 'transform',
              }}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-between py-1.5">
                {/* Target Arrowhead with Luminous Glow */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent transition-colors duration-200 ${
                      isWithin25m
                        ? 'border-b-[16px] border-b-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,1)]'
                        : 'border-b-[16px] border-b-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                    }`}
                  />
                  <div
                    className={`w-1 h-3 -mt-0.5 rounded-full ${
                      isWithin25m ? 'bg-emerald-300 shadow-sm' : 'bg-amber-300 shadow-sm'
                    }`}
                  />
                </div>

                {/* Counter-Balance Skeletonized Tail */}
                <div className="flex flex-col items-center opacity-70">
                  <div className="w-1 h-2.5 bg-slate-500 rounded-full" />
                  <div className="w-2.5 h-2.5 border border-slate-400/80 rounded-full mt-0.5" />
                </div>
              </div>
            </div>

            {/* Digital Center Hub Core (Distance & Heading Readout) */}
            <div className="absolute z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/15 shadow-inner flex flex-col items-center justify-center text-center p-0.5">
              <span
                className={`text-[11px] sm:text-xs font-black font-mono tracking-tight leading-none ${
                  isWithin25m ? 'text-emerald-400 animate-pulse' : 'text-white'
                }`}
              >
                {distance !== null
                  ? distance < 1000
                    ? `${Math.round(distance)}m`
                    : `${(distance / 1000).toFixed(1)}k`
                  : '--'}
              </span>
              <span
                className={`text-[7px] font-black leading-none mt-0.5 uppercase tracking-wider ${
                  isWithin25m ? 'text-emerald-300' : 'text-amber-400/90'
                }`}
              >
                {isWithin25m
                  ? (lang === 'bs' ? 'ZONA' : 'IN ZONE')
                  : heading !== null
                  ? `${Math.round(heading)}°`
                  : (lang === 'bs' ? 'CILJ' : 'TARGET')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Active Target Info & POI Carousel */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full truncate"
              style={{ backgroundColor: `${targetColor}25`, color: targetColor, border: `1px solid ${targetColor}40` }}
            >
              {isUnlocked ? (lang === 'bs' ? '✓ Otključano' : '✓ Unlocked') : (lang === 'bs' ? 'U toku' : 'In progress')}
            </span>

            {/* Prev / Next POI in phase buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                title={lang === 'bs' ? 'Prethodna lokacija' : 'Previous POI'}
                aria-label="Previous POI"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                title={lang === 'bs' ? 'Sljedeća lokacija' : 'Next POI'}
                aria-label="Next POI"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={targetThumb}
              alt={targetTitle}
              className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0 shadow-md"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-black text-white leading-tight truncate">
                {targetTitle}
              </h4>
              <p className="text-[10px] text-slate-300 line-clamp-1 leading-snug">
                {target.description[lang] || target.description.bs || target.description.en}
              </p>
            </div>
          </div>

          {/* Location status prompt */}
          <div className="pt-0.5">
            {isWithin25m ? (
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                <Sparkles size={11} className="shrink-0 animate-spin" />
                {lang === 'bs' ? 'Unutar 25m! Skenirajte QR za potvrdu' : 'Within 25m! Scan QR to confirm'}
              </span>
            ) : distance !== null ? (
              <span className="text-[10px] font-semibold text-slate-400 truncate block">
                {lang === 'bs'
                  ? `Priđite unutar 25m (još ${Math.max(1, Math.round(distance - 25))}m)`
                  : `Get within 25m (${Math.max(1, Math.round(distance - 25))}m left)`}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-400/90 truncate block">
                {lang === 'bs' ? 'Traženje GPS signala...' : 'Acquiring GPS signal...'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar: Scanner CTA, Audio & Navigation */}
      <div className="flex items-center gap-2 shrink-0 pt-1">
        {/* Primary QR Scan Button (Dynamic glow if <= 25m) */}
        <button
          onClick={onOpenScanner}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isWithin25m
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 ring-2 ring-emerald-300 animate-pulse shadow-emerald-500/40'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
            }`}
        >
          <QrCode size={15} className="shrink-0" />
          <span className="truncate">{lang === 'bs' ? 'Skeniraj QR kod' : 'Scan QR Code'}</span>
        </button>

        {/* Route Navigation button */}
        {targetCoords && (
          <button
            onClick={() => onStartNavigation(targetTitle, targetCoords.lat, targetCoords.lon)}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10 flex items-center justify-center"
            title={lang === 'bs' ? 'Ruta na mapi' : 'Route on map'}
            aria-label="Route on map"
          >
            <Navigation size={15} />
          </button>
        )}

        {/* Audio Guide button */}
        {target.audio && onPlayAudio && (
          <button
            onClick={() => onPlayAudio(target.id, targetTitle, target.audio)}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 transition-all active:scale-95 border border-white/10 flex items-center justify-center"
            title={lang === 'bs' ? 'Audio vodič' : 'Audio guide'}
            aria-label="Audio guide"
          >
            <Volume2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestCompassPanel;

