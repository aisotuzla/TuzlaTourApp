import type { Language } from '../types';

export interface QuestProximityNotificationCopy {
  title: string;
  body: string;
}

type LocalizedNotificationCopy = Partial<Record<Language, QuestProximityNotificationCopy>>;

const DEFAULT_QUEST_PROXIMITY_NOTIFICATION: Record<Language, QuestProximityNotificationCopy> = {
  en: {
    title: "You're close!",
    body: "You're near {poiName}. Look for its QR code to complete this quest!",
  },
  bs: {
    title: 'Blizu ste!',
    body: 'Blizu ste lokacije {poiName}. Potražite QR kod da završite ovaj zadatak!',
  },
  de: {
    title: 'Sie sind ganz in der Nähe!',
    body: 'Sie sind in der Nähe von {poiName}. Suchen Sie nach dem QR-Code für diese Aufgabe!',
  },
  tr: {
    title: 'Çok yaklaştınız!',
    body: '{poiName} yakınındasınız. Görevi tamamlamak için QR kodunu bulun!',
  },
};

// Add a POI ID here to customize its copy; use {poiName} to insert its localized name.
export const QUEST_PROXIMITY_NOTIFICATION_TEMPLATES: Partial<
  Record<string, LocalizedNotificationCopy>
> = {
  trg_slobode: {
    en: {
      title: 'Freedom Square is close!',
      body: 'Find the QR plaque at {poiName}.',
    },
  },
};

export function getQuestProximityNotification(
  poiId: string,
  poiName: string,
  lang: Language,
): QuestProximityNotificationCopy {
  const defaultCopy = DEFAULT_QUEST_PROXIMITY_NOTIFICATION[lang];
  const copy = QUEST_PROXIMITY_NOTIFICATION_TEMPLATES[poiId]?.[lang] ?? defaultCopy;
  const interpolatePoiName = (text: string) => text.replace(/\{poiName\}/g, poiName);

  return {
    title: interpolatePoiName(copy.title),
    body: interpolatePoiName(copy.body),
  };
}
