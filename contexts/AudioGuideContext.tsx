import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { playTTS, stopTTS, pauseTTS, resumeTTS, isTTSSpeaking, isTTSPaused, isTTSSupported } from '../utils/tts';

export interface ActiveNarration {
  id: string;
  title: string;
  text: string;
  lang: Language;
}

interface AudioGuideContextProps {
  currentNarration: ActiveNarration | null;
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isAudioGuideDisabled: boolean;
  playNarration: (narration: ActiveNarration) => void;
  pauseNarration: () => void;
  resumeNarration: () => void;
  stopNarration: () => void;
  toggleMute: () => void;
  disableAudioGuide: () => void;
  enableAudioGuide: () => void;
}

const AudioGuideContext = createContext<AudioGuideContextProps | undefined>(undefined);

export const AudioGuideProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentNarration, setCurrentNarration] = useState<ActiveNarration | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioGuideDisabled, setIsAudioGuideDisabled] = useState<boolean>(false);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, []);

  const stopNarration = useCallback(() => {
    stopTTS();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentNarration(null);
  }, []);

  const playNarration = useCallback((narration: ActiveNarration) => {
    if (isAudioGuideDisabled) return;

    // If same narration is currently playing, pause/toggle
    if (currentNarration?.id === narration.id && isPlaying) {
      if (isPaused) {
        resumeTTS();
        setIsPaused(false);
      } else {
        pauseTTS();
        setIsPaused(true);
      }
      return;
    }

    stopTTS();
    setCurrentNarration(narration);
    setIsPlaying(true);
    setIsPaused(false);

    if (isMuted) return;

    playTTS({
      text: narration.text,
      lang: narration.lang,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentNarration(null);
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentNarration(null);
      }
    });
  }, [currentNarration, isPlaying, isPaused, isMuted, isAudioGuideDisabled]);

  const pauseNarration = useCallback(() => {
    pauseTTS();
    setIsPaused(true);
  }, []);

  const resumeNarration = useCallback(() => {
    resumeTTS();
    setIsPaused(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        stopTTS();
      } else if (currentNarration && !isPaused) {
        playTTS({
          text: currentNarration.text,
          lang: currentNarration.lang,
          onEnd: () => {
            setIsPlaying(false);
            setCurrentNarration(null);
          }
        });
      }
      return next;
    });
  }, [currentNarration, isPaused]);

  const disableAudioGuide = useCallback(() => {
    stopNarration();
    setIsAudioGuideDisabled(true);
  }, [stopNarration]);

  const enableAudioGuide = useCallback(() => {
    setIsAudioGuideDisabled(false);
  }, []);

  return (
    <AudioGuideContext.Provider
      value={{
        currentNarration,
        isPlaying,
        isPaused,
        isMuted,
        isAudioGuideDisabled,
        playNarration,
        pauseNarration,
        resumeNarration,
        stopNarration,
        toggleMute,
        disableAudioGuide,
        enableAudioGuide
      }}
    >
      {children}
    </AudioGuideContext.Provider>
  );
};

export const useAudioGuide = (): AudioGuideContextProps => {
  const ctx = useContext(AudioGuideContext);
  if (!ctx) {
    throw new Error('useAudioGuide must be used within an AudioGuideProvider');
  }
  return ctx;
};
