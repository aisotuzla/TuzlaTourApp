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

const MAP_IMAGE = '/assets/Gallery/QuestQRLocations/tuzlaMapTour12.webp';
const FALLBACK_IMAGE = '/assets/Gallery/QuestQRLocations/mapa.webp';

// Percent positions are aligned to the circular landmark callouts in the supplied map artwork.
const HOTSPOTS: Record<string, { left: string; top: string }> = {
  tvrtko_park: { left: '47.5%', top: '15.5%' },
  salt_square: { left: '26.5%', top: '27%' },
  trg_slobode: { left: '77.5%', top: '26.5%' },
  stara_cesma: { left: '49.5%', top: '40%' },
  slana_banja: { left: '30.5%', top: '48%' },
  bingo_city_centar: { left: '70.5%', top: '47%' },
  panonika: { left: '21%', top: '66%' },
  slapovi: { left: '40%', top: '73%' },
  kapija: { left: '61.5%', top: '73%' },
  mesa_selimovic: { left: '77%', top: '67%' },
  atelje_ismet: { left: '54%', top: '91%' },
  palancinkara: { left: '90%', top: '56%' },
};

const labels = {
  en: { title: 'Tuzla Quest Map', subtitle: 'Choose a landmark to explore', completed: 'Completed', discovered: 'Discovered', locked: 'Locked', phase: 'Current phase', navigate: 'Navigate', scan: 'Scan QR', close: 'Close' },
  bs: { title: 'Mapa potrage Tuzla', subtitle: 'Odaberite lokaciju za istraživanje', completed: 'Završeno', discovered: 'Otkriveno', locked: 'Zaključano', phase: 'Trenutna faza', navigate: 'Navigacija', scan: 'Skeniraj QR', close: 'Zatvori' },
  de: { title: 'Tuzla Quest-Karte', subtitle: 'Wähle einen Ort zum Entdecken', completed: 'Abgeschlossen', discovered: 'Entdeckt', locked: 'Gesperrt', phase: 'Aktuelle Phase', navigate: 'Navigieren', scan: 'QR scannen', close: 'Schließen' },
  tr: { title: 'Tuzla Keşif Haritası', subtitle: 'Keşfetmek için bir konum seçin', completed: 'Tamamlandı', discovered: 'Keşfedildi', locked: 'Kilitli', phase: 'Mevcut aşama', navigate: 'Yol tarifi', scan: 'QR Tara', close: 'Kapat' },
} as const;

const QuestIllustratedMap: React.FC<QuestIllustratedMapProps> = ({ lang, unlockedRewards, onClose, onNavigate, onScan }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState(MAP_IMAGE);
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
  const targetDescription = (target: QuestTarget) => target.description[lang] || target.description.en || target.description.bs;

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col bg-[#10213b] text-white" role="dialog" aria-modal="true" aria-label={copy.title}>
      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-amber-300/20 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-3 py-3 sm:px-5">
        <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20" aria-label={copy.close}>
          <ArrowLeft size={19} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="truncate text-base font-black uppercase tracking-wide text-amber-300 sm:text-lg">{copy.title}</h2>
          <p className="text-[10px] font-semibold text-blue-100/80 sm:text-xs">{copy.subtitle}</p>
        </div>
        <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-2.5 text-amber-200">
          <MapPin size={15} />
          <span className="text-xs font-black tabular-nums">{unlockedRewards.length}/{QUEST_TARGETS.length}</span>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#10213b] p-2 sm:p-4">
        <div className="relative mx-auto w-full max-w-[1500px] overflow-hidden rounded-xl border border-amber-300/40 bg-[#e8d4a7] shadow-[0_20px_70px_rgba(0,0,0,.45)]">
          <img
            src={imageSrc}
            alt="Illustrated map of Tuzla with quest landmarks"
            className="block h-auto w-full select-none"
            draggable={false}
            onError={() => { if (imageSrc !== FALLBACK_IMAGE) setImageSrc(FALLBACK_IMAGE); }}
          />

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
                className={`absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-125 active:scale-95 sm:h-9 sm:w-9 ${statusClass(status)} ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-blue-900 scale-125' : ''}`}
              >
                {status === 'completed' ? <Check size={16} strokeWidth={3} /> : status === 'locked' ? <Lock size={13} /> : <MapPin size={15} fill="currentColor" />}
              </button>
            );
          })}
        </div>

        <div className="fixed bottom-3 left-3 z-20 flex flex-wrap gap-2 rounded-xl border border-amber-200/25 bg-blue-950/90 p-2.5 shadow-xl backdrop-blur-md sm:bottom-5 sm:left-5 sm:gap-3 sm:px-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold sm:text-xs"><i className="h-3 w-3 rounded-full border border-amber-100 bg-amber-400" />{copy.completed}</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold sm:text-xs"><i className="h-3 w-3 rounded-full border border-sky-100 bg-sky-500" />{copy.discovered}</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold sm:text-xs"><i className="h-3 w-3 rounded-full border border-stone-200 bg-stone-500" />{copy.locked}</span>
        </div>
      </main>

      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-30 mx-auto max-w-md overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 p-4 shadow-2xl sm:bottom-5 sm:right-5 sm:left-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[.2em] text-amber-300">{copy.phase} {getPoiPhase(selected.id)}</p>
              <h3 className="text-lg font-black leading-tight text-white">{targetName(selected)}</h3>
            </div>
            <button onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-blue-100/70 hover:bg-white/10 hover:text-white" aria-label={copy.close}><X size={17} /></button>
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-blue-100/85">{targetDescription(selected)}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => onNavigate(selected)} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-3 text-xs font-black text-white shadow-lg shadow-blue-950/40 active:scale-95">
              <Navigation size={15} />{copy.navigate}
            </button>
            <button onClick={onScan} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 px-3 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-950/30 active:scale-95">
              <QrCode size={15} />{copy.scan}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestIllustratedMap;
