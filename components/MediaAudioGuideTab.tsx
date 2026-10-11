import React from 'react';
import { Play, Pause, Headphones, Volume2, Square } from 'lucide-react';
import { Language } from '../types';
import { useAudioGuide } from '../contexts/AudioGuideContext';

interface AudioFile {
  id: string;
  src: string;
  label: {
    bs: string;
    en: string;
  };
}

// Hard-coded list of audio assets
const audioFiles: AudioFile[] = [
  { id: 'city-guide-ba', src: '/audio/CityGuideBA.mp3', label: { bs: 'Gradski Vodič (Bosanski)', en: 'City Guide (Bosnian)' } },
  { id: 'city-guide-en', src: '/audio/CityGuideEN.mp3', label: { bs: 'Gradski Vodič (Engleski)', en: 'City Guide (English)' } },
  { id: 'history-ba', src: '/audio/HistoryBA.mp3', label: { bs: 'Historija Tuzle (Bosanski)', en: 'History of Tuzla (Bosnian)' } },
  { id: 'history-en', src: '/audio/HistoryEN.mp3', label: { bs: 'Historija Tuzle (Engleski)', en: 'History of Tuzla (English)' } },
  { id: 'history-de', src: '/audio/HistoryDE.mp3', label: { bs: 'Historija Tuzle (Njemački)', en: 'History of Tuzla (German)' } },
  { id: 'history-tr', src: '/audio/HistoryTR.mp3', label: { bs: 'Historija Tuzle (Turski)', en: 'History of Tuzla (Turkish)' } },
];

/**
 * Media audio tab in TaskManager.
 * Connected to global AudioGuideContext so the floating AudioControlBar
 * stays visible across all tabs and lets the user play, pause, resume and stop at any time.
 */
export const MediaAudioGuideTab: React.FC<{ lang: Language }> = ({ lang }) => {
  const { currentNarration, isPlaying, isPaused, playNarration, pauseNarration, resumeNarration, stopNarration } = useAudioGuide();

  const handleToggle = (file: AudioFile) => {
    const isThisActive = currentNarration?.id === file.id;

    if (isThisActive && isPlaying) {
      if (isPaused) {
        resumeNarration();
      } else {
        pauseNarration();
      }
    } else {
      playNarration({
        id: file.id,
        title: lang === 'bs' ? file.label.bs : file.label.en,
        text: '',
        lang,
        audioSrc: file.src
      });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{lang === 'bs' ? 'Audio Vodič & Media Player' : 'Audio Guide & Media Player'}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'bs' ? 'Slušajte audio vodiče uz lebdeći player koji ostaje aktivan tokom navigacije' : 'Listen to audio guides with floating persistent player controls'}
              </p>
            </div>
          </div>
          {currentNarration && isPlaying && (
            <button
              onClick={stopNarration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold text-xs transition-colors"
            >
              <Square size={13} className="fill-current" />
              <span>{lang === 'bs' ? 'Zaustavi sve' : 'Stop all'}</span>
            </button>
          )}
        </div>

        <ul className="space-y-2.5">
          {audioFiles.map((file) => {
            const isThisActive = currentNarration?.id === file.id;
            const isThisPlaying = isThisActive && isPlaying && !isPaused;

            return (
              <li
                key={file.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                  isThisActive
                    ? 'bg-amber-50/80 border-amber-300 shadow-md ring-2 ring-amber-300/30'
                    : 'bg-white/80 hover:bg-white border-blue-50 hover:border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isThisPlaying ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {isThisPlaying ? <Volume2 size={16} /> : <Headphones size={16} />}
                  </div>
                  <span className={`text-sm font-bold truncate ${isThisActive ? 'text-amber-950' : 'text-slate-800'}`}>
                    {lang === 'bs' ? file.label.bs : file.label.en}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(file)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                      isThisPlaying
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                        : isThisActive && isPaused
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause size={14} className="fill-current" />
                        <span>{lang === 'bs' ? 'Pauza' : 'Pause'}</span>
                      </>
                    ) : isThisActive && isPaused ? (
                      <>
                        <Play size={14} className="fill-current ml-0.5" />
                        <span>{lang === 'bs' ? 'Nastavi' : 'Resume'}</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-current ml-0.5" />
                        <span>{lang === 'bs' ? 'Pusti' : 'Play'}</span>
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

