/**
 * Browser Text-to-Speech (TTS) engine using Web Speech API (window.speechSynthesis)
 */

let activeAudio: HTMLAudioElement | null = null;
let isAudioPaused = false;
// Dummy cache to keep legacy getAvailableVoices working (not used in backend mode)
let currentVoiceCache: SpeechSynthesisVoice[] = [];

// Initialize voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (currentVoiceCache.length === 0) {
    currentVoiceCache = window.speechSynthesis.getVoices();
  }
  return currentVoiceCache;
}

// Pre-load voices on browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    currentVoiceCache = window.speechSynthesis.getVoices();
  };
  getAvailableVoices();
}

/**
 * Finds the most suitable voice for given language code ('bs', 'en', 'de', 'tr')
 */
export function getBestVoice(targetLang: string): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const code = targetLang.toLowerCase();

  if (code === 'bs') {
    // 1. Highest priority: Microsoft Goran Online (Natural) - Bosnian (Bosnia and Herzegovina) from Edge / Windows
    const goranVoice = voices.find(v =>
      v.name.toLowerCase().includes('goran') ||
      (v.name.toLowerCase().includes('bosnian') && v.name.toLowerCase().includes('natural')) ||
      v.voiceURI?.toLowerCase().includes('goran') ||
      v.voiceURI?.toLowerCase().includes('bs-ba-goran')
    );
    if (goranVoice) return goranVoice;

    // 2. Any other native Bosnian voice (e.g., Microsoft Vesna or bs-BA)
    const nativeBsVoice = voices.find(v =>
      v.lang.toLowerCase() === 'bs-ba' ||
      v.lang.toLowerCase().startsWith('bs') ||
      v.name.toLowerCase().includes('bosnian')
    );
    if (nativeBsVoice) return nativeBsVoice;

    // 3. Natural / Neural Croatian & Serbian voices (very close phonetics & natural sounding)
    const naturalSlavic = voices.find(v =>
      (v.lang.startsWith('hr') || v.lang.startsWith('sr')) &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (naturalSlavic) return naturalSlavic;

    // 4. Standard Croatian, Serbian, or regional Slavic voices
    const standardSlavic = voices.find(v =>
      v.lang.startsWith('hr') ||
      v.lang.startsWith('sr') ||
      v.name.toLowerCase().includes('croatian') ||
      v.name.toLowerCase().includes('serbian')
    );
    if (standardSlavic) return standardSlavic;

    // 5. Secondary fallback: Slovenian, Czech, Polish or generic
    const otherSlavicVoice = voices.find(v => v.lang.startsWith('sl') || v.lang.startsWith('cs') || v.lang.startsWith('pl'));
    if (otherSlavicVoice) return otherSlavicVoice;
  } else if (code === 'de') {
    // 1. Natural German: Microsoft Conrad or Katja (Natural)
    const deNatural = voices.find(v =>
      (v.name.toLowerCase().includes('conrad') || v.name.toLowerCase().includes('katja') || v.name.toLowerCase().includes('natural')) &&
      v.lang.startsWith('de')
    );
    if (deNatural) return deNatural;
    const deVoice = voices.find(v => v.lang.startsWith('de'));
    if (deVoice) return deVoice;
  } else if (code === 'tr') {
    // 1. Natural Turkish: Microsoft Ahmet or Emel (Natural)
    const trNatural = voices.find(v =>
      (v.name.toLowerCase().includes('ahmet') || v.name.toLowerCase().includes('emel') || v.name.toLowerCase().includes('natural')) &&
      v.lang.startsWith('tr')
    );
    if (trNatural) return trNatural;
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    if (trVoice) return trVoice;
  } else {
    // 1. Highest priority: Microsoft Liam Online (Natural) - English (Canada)
    const liamVoice = voices.find(v =>
      v.name.toLowerCase().includes('liam') ||
      v.voiceURI?.toLowerCase().includes('liam') ||
      (v.name.toLowerCase().includes('natural') && v.lang.toLowerCase() === 'en-ca')
    );
    if (liamVoice) return liamVoice;

    // 2. Fallback: Microsoft Ana Multilingual Online - English (United States)
    const anaVoice = voices.find(v =>
      v.name.toLowerCase().includes('ana') ||
      v.voiceURI?.toLowerCase().includes('ana') ||
      (v.name.toLowerCase().includes('multilingual') && v.lang.toLowerCase().startsWith('en'))
    );
    if (anaVoice) return anaVoice;

    // 3. Other English Natural / Online voices
    const enNaturalVoice = voices.find(v =>
      (v.lang.startsWith('en') || v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en-CA') &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (enNaturalVoice) return enNaturalVoice;

    const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en-CA' || v.lang.startsWith('en'));
    if (enVoice) return enVoice;
  }

  // Fallback to default
  return voices.find(v => v.default) || voices[0] || null;
}

export interface PlayTTSOptions {
  text: string;
  lang: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (err: any) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

function fallbackToWebSpeech(options: PlayTTSOptions): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onError) options.onError(new Error('Audio and Speech Synthesis not supported'));
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(options.text);
    activeUtterance = utterance;

    const voice = getBestVoice(options.lang);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = options.lang;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };
    utterance.onend = () => {
      activeUtterance = null;
      if (options.onEnd) options.onEnd();
    };
    utterance.onpause = () => {
      if (options.onPause) options.onPause();
    };
    utterance.onresume = () => {
      if (options.onResume) options.onResume();
    };
    utterance.onerror = (e) => {
      activeUtterance = null;
      if (options.onError) options.onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    activeUtterance = null;
    if (options.onError) options.onError(err);
    return false;
  }
}

export function stopTTS() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
    isAudioPaused = false;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function pauseTTS() {
  if (activeAudio && !activeAudio.paused) {
    activeAudio.pause();
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeTTS() {
  if (activeAudio && activeAudio.paused) {
    activeAudio.play().catch(() => {});
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function isTTSSpeaking(): boolean {
  const isAudioSpeaking = !!activeAudio && !activeAudio.paused && !activeAudio.ended;
  const isSpeechSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  return isAudioSpeaking || isSpeechSpeaking;
}

export function isTTSPaused(): boolean {
  const isAudioPausedState = !!activeAudio && activeAudio.paused && !activeAudio.ended;
  const isSpeechPausedState = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused;
  return isAudioPausedState || isSpeechPausedState;
}

export function isTTSSupported(): boolean {
  return typeof Audio !== 'undefined' || (typeof window !== 'undefined' && 'speechSynthesis' in window);
}

export function playTTS(options: PlayTTSOptions): boolean {
  const {
    text,
    lang,
    onStart,
    onEnd,
    onPause,
    onResume,
    onError,
  } = options;

  // Stop any existing playback
  stopTTS();

  if (!isTTSSupported()) {
    console.warn('Audio playback not supported in this browser.');
    if (onError) onError(new Error('Audio not supported'));
    return false;
  }

  // 1. Try Microsoft Neural Voices MP3 stream via /api/tts
  try {
    const src = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
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
      console.warn('Neural MP3 audio load failed, falling back to Web Speech synthesis:', e);
      activeAudio = null;
      // Graceful fallback to client Web Speech API
      fallbackToWebSpeech(options);
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Neural MP3 audio play failed, falling back to Web Speech synthesis:', err);
        activeAudio = null;
        // Graceful fallback to client Web Speech API
        fallbackToWebSpeech(options);
      });
    }

    return true;
  } catch (err) {
    console.warn('Neural MP3 initialization failed, falling back to Web Speech synthesis:', err);
    activeAudio = null;
    return fallbackToWebSpeech(options);
  }
}


