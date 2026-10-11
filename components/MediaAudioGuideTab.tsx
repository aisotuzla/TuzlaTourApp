import React, { useState } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import { Language } from '../types';
import { playTTS, pauseTTS, resumeTTS, stopTTS } from '../utils/tts';

interface AudioFile {
  src: string;
  label: string;
}

// Hard‑coded list of MP3 assets from the public/audio folder.
const audioFiles: AudioFile[] = [
  { src: '/audio/CityGuideEN.mp3', label: 'City Guide (English)' },
  { src: '/audio/HistoryBA.mp3', label: 'History (Bosnian)' },
  { src: '/audio/HistoryDE.mp3', label: 'History (German)' },
  { src: '/audio/HistoryEN.mp3', label: 'History (English)' },
  { src: '/audio/HistoryTR1.mp3', label: 'History (Turkish – Part 1)' },
  { src: '/audio/HistoryTR2.mp3', label: 'History (Turkish – Part 2)' },
];

/**
 * Simple media tab – lists MP3 files with a single play/pause button per entry.
 * No TTS text processing – we only play the pre‑recorded audio files.
 */
export const MediaAudioGuideTab: React.FC<{ lang: Language }> = ({ lang }) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (file: AudioFile) => {
    // Stop any existing playback first.
    stopTTS();
    setCurrentSrc(file.src);
    setIsPlaying(true);
    playTTS({
      audioSrc: file.src,
      onEnd: () => {
        setIsPlaying(false);
        setCurrentSrc(null);
      },
      text: '',
      lang: ''
    });
  };

  const handlePause = () => {
    pauseTTS();
    setIsPlaying(false);
  };

  const handleResume = () => {
    resumeTTS();
    setIsPlaying(true);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Headphones className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-black text-slate-900">{lang === 'bs' ? 'Audio Vodič' : 'Audio Guide'}</h3>
        </div>
        <ul className="space-y-2">
          {audioFiles.map((file) => (
            <li key={file.src} className="p-3 bg-white/80 rounded-lg shadow">
              <button onClick={() => handlePlay(file)} className="flex items-center gap-2 p-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30">
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium">{file.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
