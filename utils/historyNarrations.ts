import { Language } from '../types';

export interface HistoryPageNarration {
  title: Record<Language, string>;
  text: Record<Language, string>;
  audioSrc?: Record<Language, string>;
}

export const HISTORY_RAW_DOCUMENTS: Record<Language, string> = {
  bs: '',
  en: '',
  de: '',
  tr: '',
};

export const HISTORY_NARRATIONS: Record<number, HistoryPageNarration> = {
  0: {
    title: {
      bs: 'Historija Tuzle: Drevni počeci i rođenje grada (1. dio)',
      en: 'Tuzla History: Ancient Beginnings & The Birth of the City (Part 1)',
      de: 'Geschichte von Tuzla: Antike Anfänge & Geburt der Stadt (Teil 1)',
      tr: 'Tuzla Tarihi: Antik Başlangıçlar ve Şehrin Doğuşu (1. Bölüm)',
    },
    text: {
      bs: 'Tuzla je jedno od najstarijih naseljenih mjesta u Evropi sa kontinuitetom života preko 6.000 godina.',
      en: 'Tuzla is one of the oldest settled places in Europe with continuity of life spanning over 6,000 years.',
      de: 'Tuzla ist eine der ältesten Siedlungen Europas mit einer über 6.000-jährigen Geschichte.',
      tr: 'Tuzla, 6.000 yılı aşkın kesintisiz yaşamıyla Avrupa\'nın en eski yerleşim yerlerinden biridir.',
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
      bs: 'Moderna Tuzla je simbol multikulturalnosti, industrijskog i obrazovnog razvoja, te jedinstvenih slanih jezera.',
      en: 'Modern Tuzla is a symbol of multiculturalism, industrial and educational progress, and unique salt lakes.',
      de: 'Das moderne Tuzla ist ein Symbol für Multikulturalismus, industrielle Entwicklung und einzigartige Salzseen.',
      tr: 'Modern Tuzla, çok kültürlülüğün, sanayi ve eğitim gelişiminin ve eşsiz tuz göllerinin sembolüdür.',
    },
    audioSrc: {
      bs: '/audio/HistoryBA.mp3',
      en: '/audio/HistoryEN.mp3',
      de: '/audio/HistoryDE.mp3',
      tr: '/audio/HistoryTR.mp3',
    },
  },

};
