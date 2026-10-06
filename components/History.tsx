import React from 'react';
import { Language } from '../types';
import { useImage } from '../hooks/ImageContext';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioGuide } from '../contexts/AudioGuideContext';
import { HISTORY_NARRATIONS } from '../utils/historyNarrations';

interface HistoryProps {
  lang: Language;
}

const History: React.FC<HistoryProps> = ({ lang }) => {
  const images: Record<Language, string[]> = {
    en: ['/assets/HistoryEN.webp', '/assets/HistoryEN2.webp'],
    bs: ['/assets/HistoryBA.webp', '/assets/HistoryBA2.webp'],
    de: ['/assets/HistoryDE.webp', '/assets/HistoryDE2.webp'],
    tr: ['/assets/HistoryTR.webp', '/assets/HistoryTR2.webp'],
  };

  const activeImages = images[lang] || images.en;
  const { openGallery } = useImage();
  const { currentNarration, isPlaying, isPaused, playNarration, stopNarration } = useAudioGuide();

  const handleToggleAudio = (index: number) => {
    const pageData = HISTORY_NARRATIONS[index];
    if (!pageData) return;

    const narrationId = `history-page-${index}`;
    if (currentNarration?.id === narrationId && isPlaying) {
      stopNarration();
    } else {
      const title = pageData.title[lang] || pageData.title.en;
      const text = pageData.text[lang] || pageData.text.en;
      playNarration({
        id: narrationId,
        title,
        text,
        lang
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-32">
      {activeImages.map((src, index) => {
        const isCurrentPlaying = currentNarration?.id === `history-page-${index}` && isPlaying && !isPaused;

        return (
          <div
            key={index}
            className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 bg-slate-100 group cursor-pointer history-card-3d ${
              isCurrentPlaying
                ? 'border-amber-400 ring-4 ring-amber-300/30 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                : 'border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
            }`}
            onClick={() => openGallery(activeImages, index)}
            role="button"
            tabIndex={0}
            aria-label={`View Tuzla History Image ${index + 1} fullscreen`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openGallery(activeImages, index); }}
          >
            <img
              src={src}
              alt={`Tuzla History ${lang.toUpperCase()} ${index + 1}`}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Sound Button in bottom left corner */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleAudio(index);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                  isCurrentPlaying
                    ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-400/30 animate-pulse'
                    : 'bg-slate-950/80 hover:bg-blue-600 text-white border border-white/20'
                }`}
                title={isCurrentPlaying ? (lang === 'bs' ? 'Zaustavi audio' : 'Stop audio') : (lang === 'bs' ? 'Poslušaj historiju' : 'Listen to history')}
              >
                {isCurrentPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isCurrentPlaying ? (lang === 'bs' ? 'Zaustavi' : 'Stop') : (lang === 'bs' ? 'Audio' : 'Listen')}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default History;
