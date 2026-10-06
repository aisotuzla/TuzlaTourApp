import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Square, BellOff, X } from 'lucide-react';
import { Language } from '../types';

interface AudioControlBarProps {
  lang: Language;
  title?: string;
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onDisableAudioGuide?: () => void;
  onClose?: () => void;
}

export const AudioControlBar: React.FC<AudioControlBarProps> = ({
  lang,
  title,
  isPlaying,
  isPaused,
  isMuted,
  onPlay,
  onPause,
  onResume,
  onStop,
  onToggleMute,
  onDisableAudioGuide,
  onClose
}) => {
  const [showLongPressHint, setShowLongPressHint] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  const handlePlayPause = () => {
    triggerHaptic();
    if (isPlaying && !isPaused) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onPlay();
    }
  };

  const handleMuteToggle = () => {
    triggerHaptic();
    onToggleMute();
  };

  const handleStop = () => {
    triggerHaptic();
    onStop();
  };

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[94%] max-w-md animate-fadeIn"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-950/92 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-white">
        {/* Left: Animated Sound Status & Location Title */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
          <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${isPlaying && !isPaused ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/10 text-white/80'}`}>
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : isPlaying && !isPaused ? (
              <Volume2 className="w-4 h-4 animate-bounce" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              {lang === 'bs' ? 'Audio Vodič' : 'AI Audio Guide'}
            </div>
            <div className="text-xs font-bold text-white truncate">
              {title || (lang === 'bs' ? 'Naracija lokacije' : 'Location narration')}
            </div>
          </div>
        </div>

        {/* Right: Controls Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold transition-all active:scale-90 ${isPlaying && !isPaused
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            title={isPlaying && !isPaused ? (lang === 'bs' ? 'Pauziraj naraciju' : 'Pause narration') : (lang === 'bs' ? 'Pokreni naraciju' : 'Start narration')}
          >
            {isPlaying && !isPaused ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
          </button>

          {/* Mute / Unmute */}
          <button
            onClick={handleMuteToggle}
            className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold transition-all active:scale-90 ${isMuted
                ? 'bg-red-500/80 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            title={isMuted ? (lang === 'bs' ? 'Uključi zvuk naracije' : 'Turn narration on') : (lang === 'bs' ? 'Isključi zvuk naracije' : 'Turn narration off')}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 hover:bg-red-500/80 text-white transition-all active:scale-90"
            title={lang === 'bs' ? 'Prekini naraciju za ovu lokaciju' : 'End narration for this location'}
          >
            <Square size={14} className="fill-current" />
          </button>

          {/* Optional: Close / Disable Tour Narration */}
          {onDisableAudioGuide && (
            <button
              onClick={() => {
                triggerHaptic();
                onDisableAudioGuide();
              }}
              onMouseEnter={() => setShowLongPressHint(true)}
              onMouseLeave={() => setShowLongPressHint(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={lang === 'bs' ? 'Isključi audio vodič za ostatak ture' : 'Turn off narration for the rest of your tour'}
            >
              <BellOff size={14} />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {showLongPressHint && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[10px] px-2.5 py-1 rounded-md border border-white/10 shadow-lg whitespace-nowrap pointer-events-none">
          {lang === 'bs' ? 'Isključi audio vodič za ostatak ture' : 'Turn off narration for the rest of your tour'}
        </div>
      )}
    </div>
  );
};
export default AudioControlBar;
