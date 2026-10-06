/**
 * Browser Text-to-Speech (TTS) engine using Web Speech API (window.speechSynthesis)
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
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

export function stopTTS() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function pauseTTS() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeTTS() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

export function isTTSSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

export function isTTSPaused(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.paused;
  }
  return false;
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function playTTS({
  text,
  lang,
  rate = 1.0,
  pitch = 1.0,
  onStart,
  onEnd,
  onPause,
  onResume,
  onError
}: PlayTTSOptions): boolean {
  if (!isTTSSupported()) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  try {
    stopTTS();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance; // Prevent garbage collection bug in Chrome

    const voice = getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'bs' ? 'bs-BA' : lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'en-CA';
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onpause = () => {
      if (onPause) onPause();
    };

    utterance.onresume = () => {
      if (onResume) onResume();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('TTS error:', e);
        if (onError) onError(e);
      } else {
        if (onEnd) onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Failed to trigger speech synthesis:', err);
    if (onError) onError(err);
    return false;
  }
}
