import { Language } from '../types';
import historyBaRaw from '../public/tour-tts-backend/HistoryBA.md?raw';
import historyEnRaw from '../public/tour-tts-backend/HistoryEN.md?raw';
import historyDeRaw from '../public/tour-tts-backend/HistoryDE.md?raw';
import historyTrRaw from '../public/tour-tts-backend/HistoryTR.md?raw';

export interface HistoryPageNarration {
  title: Record<Language, string>;
  text: Record<Language, string>;
}

export const HISTORY_RAW_DOCUMENTS: Record<Language, string> = {
  bs: historyBaRaw,
  en: historyEnRaw,
  de: historyDeRaw,
  tr: historyTrRaw,
};

function splitHistoryMarkdown(raw: string, lang: Language): { page1: string; page2: string } {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  if (lang === 'bs') {
    // In HistoryBA.md: Page 1 covers lines 1-18 (up to Austro-Hungarian modernization).
    // Page 2 covers line 20 onwards (20th century, war, modern Tuzla).
    const page1 = lines.slice(0, 19).join('\n').trim();
    const page2 = lines.slice(19).join('\n').trim();
    return { page1, page2 };
  } else {
    // In HistoryEN.md, HistoryDE.md, HistoryTR.md:
    // Page 1 covers lines 1-16 (ending with WELCOME TO TUZLA banner).
    // Page 2 covers line 17 onwards (starts with Grad Tuzla / modernization).
    const page1 = lines.slice(0, 16).join('\n').trim();
    const page2 = lines.slice(16).join('\n').trim();
    return { page1, page2 };
  }
}

const parsedBS = splitHistoryMarkdown(historyBaRaw, 'bs');
const parsedEN = splitHistoryMarkdown(historyEnRaw, 'en');
const parsedDE = splitHistoryMarkdown(historyDeRaw, 'de');
const parsedTR = splitHistoryMarkdown(historyTrRaw, 'tr');

export const HISTORY_NARRATIONS: Record<number, HistoryPageNarration> = {
  0: {
    title: {
      bs: 'Historija Tuzle: Drevni počeci i rođenje grada (1. dio)',
      en: 'Tuzla History: Ancient Beginnings & The Birth of the City (Part 1)',
      de: 'Geschichte von Tuzla: Antike Anfänge & Geburt der Stadt (Teil 1)',
      tr: 'Tuzla Tarihi: Antik Başlangıçlar ve Şehrin Doğuşu (1. Bölüm)',
    },
    text: {
      bs: parsedBS.page1,
      en: parsedEN.page1,
      de: parsedDE.page1,
      tr: parsedTR.page1,
    },
  },
  1: {
    title: {
      bs: 'Historija Tuzle: 20. stoljeće, Kapija i savremena Tuzla (2. dio)',
      en: 'Tuzla History: 20th Century, Kapija & Modern Tuzla (Part 2)',
      de: 'Geschichte von Tuzla: 20. Jahrhundert, Kapija & Modernes Tuzla (Teil 2)',
      tr: 'Tuzla Tarihi: 20. Yüzyıl, Kapija ve Bugünkü Tuzla (2. Bölüm)',
    },
    text: {
      bs: parsedBS.page2,
      en: parsedEN.page2,
      de: parsedDE.page2,
      tr: parsedTR.page2,
    },
  },
};

export const HISTORY_FULL_TEXT: Record<Language, string> = {
  bs: historyBaRaw.trim(),
  en: historyEnRaw.trim(),
  de: historyDeRaw.trim(),
  tr: historyTrRaw.trim(),
};
