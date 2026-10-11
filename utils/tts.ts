/**
 * Audio playback engine – MP3 only (no TTS / Web Speech API)
 */

let activeAudio: HTMLAudioElement | null = null;
let isAudioPaused = false;

export interface PlayTTSOptions {
  text: string;
  lang: string;
  audioSrc?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (err: any) => void;
}

export function stopTTS() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
    isAudioPaused = false;
  }
}

export function pauseTTS() {
  if (activeAudio && !activeAudio.paused) {
    activeAudio.pause();
  }
}

export function resumeTTS() {
  if (activeAudio && activeAudio.paused) {
    activeAudio.play().catch(() => {});
  }
}

export function isTTSSpeaking(): boolean {
  return !!activeAudio && !activeAudio.paused && !activeAudio.ended;
}

export function isTTSPaused(): boolean {
  return !!activeAudio && activeAudio.paused && !activeAudio.ended;
}

export function isTTSSupported(): boolean {
  return typeof Audio !== 'undefined';
}

export function playTTS(options: PlayTTSOptions): boolean {
  const { audioSrc, onStart, onEnd, onPause, onResume, onError } = options;

  // Stop any existing playback
  stopTTS();

  if (!isTTSSupported()) {
    if (onError) onError(new Error('Audio not supported'));
    return false;
  }

  // Only play pre-recorded MP3 files
  if (!audioSrc) {
    if (onError) onError(new Error('No audio source provided'));
    return false;
  }

  try {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = audioSrc;
    activeAudio = audio;
    isAudioPaused = false;

    let hasStarted = false;

    audio.addEventListener('play', () => {
      if (!hasStarted) {
        hasStarted = true;
        if (onStart) onStart();
      }
    });

    audio.addEventListener('pause', () => {
      isAudioPaused = true;
      if (onPause) onPause();
    });

    audio.addEventListener('playing', () => {
      if (isAudioPaused) {
        isAudioPaused = false;
        if (onResume) onResume();
      }
    });

    audio.addEventListener('ended', () => {
      activeAudio = null;
      if (onEnd) onEnd();
    });

    audio.addEventListener('error', (e) => {
      console.warn(`Audio (${audioSrc}) failed to load:`, e);
      activeAudio = null;
      if (onError) onError(e);
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`Audio (${audioSrc}) play failed:`, err);
        activeAudio = null;
        if (onError) onError(err);
      });
    }

    return true;
  } catch (err) {
    console.warn('Audio playback initialization error:', err);
    activeAudio = null;
    if (onError) onError(err);
    return false;
  }
}
