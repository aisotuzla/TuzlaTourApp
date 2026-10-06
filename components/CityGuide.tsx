import React, { useMemo, useState } from 'react';
import { Language } from '../types';
import { useImage } from '../hooks/ImageContext';
import { CalendarPlus, Check, Volume2, VolumeX } from 'lucide-react';
import { addToItinerary } from '../utils/itineraryUtils';
import { CITY_GUIDE_PAGES } from '../utils/cityGuideData';
import { useAudioGuide } from '../contexts/AudioGuideContext';

interface CityGuideProps {
  lang: Language;
}

const CityGuide: React.FC<CityGuideProps> = ({ lang }) => {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { currentNarration, isPlaying, isPaused, playNarration, stopNarration } = useAudioGuide();

  const items = useMemo(() => {
    return CITY_GUIDE_PAGES.map(item => ({
      ...item,
      currentSrc: lang === 'bs' ? item.bsImage : item.enImage,
      currentTitle: lang === 'bs' ? item.title.bs : (item.title.en || item.title.bs),
      currentSubtitle: lang === 'bs' ? item.subtitle?.bs : (item.subtitle?.en || item.subtitle?.bs),
      currentPlanName: lang === 'bs' ? item.planName.bs : item.planName.en,
      currentAudioText: lang === 'bs' ? item.audioText.bs : item.audioText.en,
    }));
  }, [lang]);

  const pannonicaSrc = lang === 'bs' ? '/assets/PannonicaBA.webp'
    : lang === 'de' ? '/assets/PannonicaDE.webp'
      : lang === 'tr' ? '/assets/PannonicaTR.webp'
        : '/assets/PannonicaEN.webp';

  const emergencySrc = '/assets/Gallery/QuestQRLocations/tour-emergency info.webp';

  // Combine for full screen image gallery
  const allImageSrcs = useMemo(() => [
    ...items.map(item => item.currentSrc),
    pannonicaSrc,
    emergencySrc
  ], [items, pannonicaSrc, emergencySrc]);

  const { openGallery } = useImage();

  const handleImageTap = (index: number) => {
    openGallery(allImageSrcs, index);
  };

  const handleAddToPlan = async (name: string) => {
    const added = await addToItinerary(name, "Tuzla City Guide Site", 'Attraction');
    if (added) {
      setAddedIds(prev => new Set(prev).add(name));
    }
  };

  const handleToggleAudio = (item: typeof items[0]) => {
    if (currentNarration?.id === item.id && isPlaying) {
      stopNarration();
    } else {
      playNarration({
        id: item.id,
        title: item.currentTitle,
        text: item.currentAudioText,
        lang
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 max-w-4xl mx-auto overflow-y-auto pb-32">
      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-xl">
        <h1 className="text-3xl sm:text-5xl font-black text-blue-900 drop-shadow-sm uppercase font-quicksand tracking-tight">
          {lang === 'bs' ? 'Gradski Vodič' : lang === 'de' ? 'Stadtführer' : lang === 'tr' ? 'Şehir Rehberi' : 'City Guide'}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          {lang === 'bs'
            ? 'Istražite tematske stranice Tuzle uz interaktivni audio vodič i planer posjete'
            : 'Explore Tuzla thematic pages with interactive audio readout and visit planner'}
        </p>
      </div>

      {/* Guide Theme Cards */}
      <div className="w-full flex flex-col gap-8 sm:gap-10">
        {items.map((item, index) => {
          const isItemPlaying = currentNarration?.id === item.id && isPlaying && !isPaused;
          const isAdded = addedIds.has(item.currentPlanName);

          return (
            <div
              key={item.id}
              className={`relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl border transition-all duration-300 bg-white/90 group ${
                isItemPlaying
                  ? 'border-amber-400 ring-4 ring-amber-300/40 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
                  : 'border-blue-300/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-400/70'
              }`}
            >
              {/* Image with overlay */}
              <div
                className="cursor-pointer relative"
                onClick={() => handleImageTap(index)}
              >
                <img
                  src={item.currentSrc}
                  alt={item.currentTitle}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Interactive Action Controls - Bottom Bar */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2 pointer-events-auto">
                  {/* Left: Compact Plan Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlan(item.currentPlanName);
                    }}
                    disabled={isAdded}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide transition-all shadow-lg backdrop-blur-md cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500/90 text-white border border-emerald-400 cursor-default'
                        : 'bg-yellow-400/95 text-blue-950 border border-yellow-200 hover:bg-yellow-300 active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} className="shrink-0 text-white" />
                        <span>{lang === 'bs' ? 'Dodano' : 'Added'}</span>
                      </>
                    ) : (
                      <>
                        <CalendarPlus size={14} className="shrink-0" />
                        <span>{lang === 'bs' ? 'Plan' : 'Plan'}</span>
                      </>
                    )}
                  </button>

                  {/* Right: Audio Readout TTS Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAudio(item);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide transition-all shadow-lg backdrop-blur-md cursor-pointer ${
                      isItemPlaying
                        ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-400/30 animate-pulse'
                        : 'bg-blue-600/90 text-white border border-blue-400/50 hover:bg-blue-600 active:scale-95'
                    }`}
                    title={isItemPlaying ? (lang === 'bs' ? 'Zaustavi audio' : 'Stop audio') : (lang === 'bs' ? 'Poslušaj tekst' : 'Listen to audio')}
                  >
                    {isItemPlaying ? (
                      <>
                        <VolumeX size={14} />
                        <span>{lang === 'bs' ? 'Zaustavi' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} />
                        <span>{lang === 'bs' ? 'Audio' : 'Listen'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency & Pannonica Info Bottom Banner */}
      <div className="w-full mt-6 mb-4">
        <div
          className="relative w-full rounded-[2rem] overflow-hidden shadow-xl border-2 border-blue-400/40 opacity-95 transition-all hover:opacity-100 cursor-pointer group"
          onClick={() => handleImageTap(items.length + 1)}
        >
          <img src={emergencySrc} alt="Emergency Info" className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.01]" />
        </div>
      </div>
    </div>
  );
};

export default CityGuide;
