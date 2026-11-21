import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Lock, MapPin, Navigation, QrCode, X } from 'lucide-react';
import type { Language } from '../types';
import { QUEST_TARGETS, getCurrentQuestPhase, getPoiPhase, isPoiRewardUnlocked } from '../constants/questData';

type QuestTarget = (typeof QUEST_TARGETS)[number];

interface QuestIllustratedMapProps {
  lang: Language;
  unlockedRewards: string[];
  onClose: () => void;
  onNavigate: (target: QuestTarget) => void;
  onScan: () => void;
}

const MAP_IMAGE = '/assets/QuestMap3.webp';

// Percent positions aligned with the 12 medallion callouts in QuestMap3.webp
const HOTSPOTS: Record<string, { left: string; top: string }> = {
  tvrtko_park: { left: '47.5%', top: '17.2%' },
  salt_square: { left: '23.5%', top: '27.1%' },
  trg_slobode: { left: '81.5%', top: '27.6%' },
  stara_cesma: { left: '50.0%', top: '35.5%' },
  slana_banja: { left: '25.9%', top: '42.4%' },
  bingo_city_centar: { left: '73.6%', top: '41.5%' },
  palacinkara: { left: '89.6%', top: '51.5%' },
  palancikara: { left: '89.6%', top: '51.5%' },
  panonika: { left: '22.5%', top: '57.8%' },
  mesa_selimovic: { left: '78.5%', top: '62.5%' },
  slapovi: { left: '36.6%', top: '68.5%' },
  kapija: { left: '61.1%', top: '71.3%' },
  atelje_ismet: { left: '52.5%', top: '81.5%' },
};

const labels = {
  en: { title: 'Tuzla Quest Map', phase: 'Phase', navigate: 'Navigate', scan: 'Scan QR', close: 'Close' },
  bs: { title: 'Mapa potrage Tuzla', phase: 'Faza', navigate: 'Navigacija', scan: 'Skeniraj QR', close: 'Zatvori' },
  de: { title: 'Tuzla Quest-Karte', phase: 'Phase', navigate: 'Navigieren', scan: 'QR scannen', close: 'Schließen' },
  tr: { title: 'Tuzla Keşif Haritası', phase: 'Aşama', navigate: 'Yol tarifi', scan: 'QR Tara', close: 'Kapat' },
} as const;

const QuestIllustratedMap: React.FC<QuestIllustratedMapProps> = ({
  lang,
  unlockedRewards,
  onClose,
  onNavigate,
  onScan,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const copy = labels[lang] || labels.en;
  const currentPhase = getCurrentQuestPhase(unlockedRewards);

  const selected = useMemo(
    () => QUEST_TARGETS.find((target) => target.id === selectedId) || null,
    [selectedId]
  );

  const getStatus = (id: string) => {
    if (isPoiRewardUnlocked(id, unlockedRewards)) return 'completed';
    return getPoiPhase(id) <= currentPhase ? 'discovered' : 'locked';
  };

  const statusClass = (status: string) => {
    if (status === 'completed') return 'border-amber-200 bg-amber-400 text-slate-950 shadow-amber-400/60';
    if (status === 'discovered') return 'border-sky-100 bg-sky-500 text-white shadow-sky-500/60';
    return 'border-stone-200 bg-stone-500 text-white shadow-stone-500/40';
  };

  const targetName = (target: QuestTarget) => target.name[lang] || target.name.en || target.name.bs;

  return (
    <div
      className="fixed inset-0 z-[5000] flex flex-col bg-slate-950 text-white select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      {/* MINIMAL TOP BANNER - STRICTLY ABOVE THE IMAGE, ZERO OVERLAY ON MAP */}
      <header className="shrink-0 z-20 flex items-center justify-between gap-2 bg-slate-950 px-2 py-1 border-b border-amber-400/20 text-white h-8">
        {selected ? (
          // When a landmark is clicked, actions show here in the top bar above the map
          <div className="flex items-center justify-between w-full gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={copy.close}
                title={copy.close}
              >
                <X size={12} />
              </button>
              <div className="truncate">
                <span className="text-[11px] font-black text-amber-300">{targetName(selected)}</span>
                <span className="text-[9px] text-slate-400 ml-1 font-bold">
                  ({copy.phase} {getPoiPhase(selected.id)})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate(selected)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 font-bold text-white text-[10px] shadow active:scale-95 transition-all"
              >
                <Navigation size={10} />
                <span>{copy.navigate}</span>
              </button>
              <button
                type="button"
                onClick={onScan}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 font-black text-slate-950 text-[10px] shadow active:scale-95 transition-all"
              >
                <QrCode size={10} />
                <span>{copy.scan}</span>
              </button>
            </div>
          </div>
        ) : (
          // Default minimal top bar
          <>
            <button
              type="button"
              onClick={onClose}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/15 bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-colors"
              aria-label={copy.close}
            >
              <ArrowLeft size={12} />
            </button>
            <h2 className="text-[11px] font-black uppercase tracking-wider text-amber-300 truncate">
              {copy.title}
            </h2>
            <div className="flex items-center gap-1 rounded border border-amber-300/30 bg-amber-400/10 px-1.5 py-0.5 text-amber-200 text-[10px] font-black tabular-nums">
              <MapPin size={10} />
              <span>
                {unlockedRewards.length}/{QUEST_TARGETS.length}
              </span>
            </div>
          </>
        )}
      </header>

      {/* MAP VIEWPORT - CLEAN IN ALL CORNERS ALL THE TIME */}
      <main className="relative flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden bg-slate-950 p-0 sm:p-1">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative max-w-full max-h-full aspect-[2160/3840] flex items-center justify-center">
            <img
              src={MAP_IMAGE}
              alt="Illustrated map of Tuzla with quest landmarks"
              className="w-full h-full object-contain select-none block"
              draggable={false}
            />

            {/* Landmarks Hotspots */}
            {QUEST_TARGETS.map((target) => {
              const position = HOTSPOTS[target.id];
              if (!position) return null;
              const status = getStatus(target.id);
              const isSelected = selectedId === target.id;
              return (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => setSelectedId(target.id)}
                  aria-label={targetName(target)}
                  title={targetName(target)}
                  style={{ left: position.left, top: position.top }}
                  className={`absolute z-10 flex ${status === 'completed' ? 'h-5 w-5 sm:h-5 sm:w-5' : 'h-6 w-6 sm:h-7 sm:w-7'} -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-md transition-transform hover:scale-125 active:scale-95 ${statusClass(
                    status
                  )} ${isSelected ? 'ring-2 ring-white scale-125' : ''}`}
                >
                  {status === 'completed' ? (
                    <Check size={10} strokeWidth={2.5} />
                  ) : status === 'locked' ? (
                    <Lock size={11} />
                  ) : (
                    <MapPin size={12} fill="currentColor" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestIllustratedMap;
