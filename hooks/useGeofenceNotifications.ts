import { useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getDistance } from '../utils/geoUtils';
import { Language } from '../types';
import { QUEST_TARGET_COORDS } from '../constants/questData';

export interface GeofenceZone {
  id: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  exitRadiusMeters?: number;
  title: { en: string; bs: string; de?: string; tr?: string };
  body: { en: string; bs: string; de?: string; tr?: string };
}

const CHANNEL_ID = 'tuzla_geofence_channel';
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes cooldown between re-triggering for the same POI

export const DEFAULT_GEOFENCES: GeofenceZone[] = [
  {
    id: 'trg_slobode',
    lat: QUEST_TARGET_COORDS.trg_slobode.lat,
    lon: QUEST_TARGET_COORDS.trg_slobode.lon,
    radiusMeters: 65,
    exitRadiusMeters: 90,
    title: {
      en: '🏛️ Welcome to Freedom Square!',
      bs: '🏛️ Dobrodošli na Trg slobode!',
      de: '🏛️ Willkommen auf dem Freiheitsplatz!',
      tr: '🏛️ Özgürlük Meydanı\'na Hoş Geldiniz!',
    },
    body: {
      en: 'You are at the largest square in BiH. Explore the historical fountain, amphitheater and archaeological artifacts.',
      bs: 'Nalazite se na najvećem trgu u BiH. Istražite česmu, amfiteatar i arheološku postavku.',
      de: 'Sie befinden sich auf dem größten Platz in Bosnien und Herzegowina.',
      tr: 'Bosna Hersek\'in en büyük meydanındasınız.',
    },
  },
  {
    id: 'stara_cesma',
    lat: QUEST_TARGET_COORDS.stara_cesma.lat,
    lon: QUEST_TARGET_COORDS.stara_cesma.lon,
    radiusMeters: 25,
    exitRadiusMeters: 60,
    title: {
      en: '💧 Historical Fountain (Stara Česma)',
      bs: '💧 Stara Česma',
      de: '💧 Historischer Brunnen (Stara Česma)',
      tr: '💧 Tarihi Çeşme (Stara Česma)',
    },
    body: {
      en: 'You are within 25m of Stara Česma! Turn on your AR guide and scan the QR code to unlock your reward.',
      bs: 'Nalazite se na 25m od Stare Česme! Uključite AR vodič i skenirajte QR kod za nagradu.',
      de: 'Sie sind 25 m vom Brunnen entfernt! Starten Sie den AR-Guide und scannen Sie den QR-Code.',
      tr: 'Tarihi Çeşmeye 25 metre mesafedesiniz! AR rehberini açın ve ödül için QR kodunu tarayın.',
    },
  },
  {
    id: 'salt_square',
    lat: QUEST_TARGET_COORDS.salt_square.lat,
    lon: QUEST_TARGET_COORDS.salt_square.lon,
    radiusMeters: 25,
    exitRadiusMeters: 80,
    title: {
      en: '🧂 Salt Square (Solni Trg)',
      bs: '🧂 Solni trg',
      de: '🧂 Salzplatz (Solni Trg)',
      tr: '🧂 Tuz Meydanı (Solni Trg)',
    },
    body: {
      en: 'Uncover thousands of years of salt extraction heritage and the replica of a Neolithic salt well.',
      bs: 'Otkrijte hiljadugodišnju tradiciju proizvodnje soli i repliku neolitskog bunara.',
      de: 'Entdecken Sie die jahrtausendealte Salztradition.',
      tr: 'Tuzla\'nın bin yıllık tuz çıkarma mirasını keşfedin.',
    },
  },
  {
    id: 'kapija',
    lat: QUEST_TARGET_COORDS.kapija.lat,
    lon: QUEST_TARGET_COORDS.kapija.lon,
    radiusMeters: 15,
    exitRadiusMeters: 70,
    title: {
      en: '🕊️ Kapija Memorial',
      bs: '🕊️ Memorijalni centar Kapija',
      de: '🕊️ Gedenkstätte Kapija',
      tr: '🕊️ Kapija Anıtı',
    },
    body: {
      en: 'A historic spot of reflection and remembrance in the heart of Tuzla old town.',
      bs: 'Mjesto sjećanja i pijeteta u samom srcu stare gradske jezgre.',
      de: 'Ein Ort des Gedenkens im Herzen der Altstadt von Tuzla.',
      tr: 'Tuzla eski şehir merkezinde tarihi bir anma noktası.',
    },
  },
  {
    id: 'panonika',
    lat: QUEST_TARGET_COORDS.panonika.lat,
    lon: QUEST_TARGET_COORDS.panonika.lon,
    radiusMeters: 50,
    exitRadiusMeters: 110,
    title: {
      en: '🌊 Pannonian Salt Lakes',
      bs: '🌊 Panonska slana jezera',
      de: '🌊 Pannonische Salzseen',
      tr: '🌊 Panonika Tuz Gölleri',
    },
    body: {
      en: 'Europe\'s only artificial salt lakes! Don\'t forget to visit the geological museum and salt waterfalls.',
      bs: 'Jedina slana jezera u Evropi! Posjetite geološku postavku i ljekovite slane slapove.',
      de: 'Die einzigen Salzseen Europas mit Heilwirkung.',
      tr: 'Avrupa\'nın tek tuz gölleri kompleksindesiniz!',
    },
  },
  {
    id: 'slana_banja',
    lat: QUEST_TARGET_COORDS.slana_banja.lat,
    lon: QUEST_TARGET_COORDS.slana_banja.lon,
    radiusMeters: 75,
    exitRadiusMeters: 105,
    title: {
      en: '🌲 Slana Banja Park',
      bs: '🌲 Park Slana Banja',
      de: '🌲 Slana Banja Park',
      tr: '🌲 Slana Banja Parkı',
    },
    body: {
      en: 'Relaxing pine promenades, sports recreational areas, and monument memorials.',
      bs: 'Uživajte u šetnji borovom šumom, sportskim terenima i spomen-parku.',
      de: 'Genießen Sie Spaziergänge im Pinienwald und den Park.',
      tr: 'Çam ağaçları arasında yürüyüş ve dinlenme parkı.',
    },
  },
  {
    id: 'slapovi',
    lat: QUEST_TARGET_COORDS.slapovi.lat,
    lon: QUEST_TARGET_COORDS.slapovi.lon,
    radiusMeters: 20,
    exitRadiusMeters: 75,
    title: {
      en: '💦 Panonika Waterfalls',
      bs: '💦 Slani slapovi',
      de: '💦 Salzwasserfälle',
      tr: '💦 Tuz Şelaleleri',
    },
    body: {
      en: 'Outdoor open-air aerosol inhalation park and cascading salt water streams.',
      bs: 'Otvoreno inhalatorno lječilište i kaskadni slani slapovi.',
      de: 'Freiluft-Inhalationspark und kaskadierendes Salzwasser.',
      tr: 'Açık hava tuz buharı inhalasyon alanı ve şelaleler.',
    },
  },
  {
    id: 'tvrtko_park',
    lat: QUEST_TARGET_COORDS.tvrtko_park.lat,
    lon: QUEST_TARGET_COORDS.tvrtko_park.lon,
    radiusMeters: 30,
    exitRadiusMeters: 75,
    title: {
      en: '👑 King Tvrtko I Monument',
      bs: '👑 Spomenik Kralju Tvrtku I',
      de: '👑 König Tvrtko I. Denkmal',
      tr: '👑 Kral Tvrtko I Anıtı',
    },
    body: {
      en: 'Monument honoring the first Bosnian king in Tuzla Central City Park.',
      bs: 'Veličanstveni spomenik prvom bosanskom kralju u Gradskom parku.',
      de: 'Denkmal für den ersten bosnischen König im Stadtpark.',
      tr: 'Şehir parkında ilk Bosna Kralı anıtı.',
    },
  },
  {
    id: 'mesa_selimovic',
    lat: QUEST_TARGET_COORDS.mesa_selimovic.lat,
    lon: QUEST_TARGET_COORDS.mesa_selimovic.lon,
    radiusMeters: 25,
    exitRadiusMeters: 70,
    title: {
      en: '✍️ Meša Selimović & Ismet Mujezinović',
      bs: '✍️ Meša Selimović i Ismet Mujezinović',
      de: '✍️ Meša Selimović & Ismet Mujezinović Denkmal',
      tr: '✍️ Meşa Selimoviç & İsmet Mujezinoviç Heykeli',
    },
    body: {
      en: 'Bronze sculptures of the great literary icon and master painter of Tuzla.',
      bs: 'Skulpture književnog velikana i slavnog slikara na Korzu.',
      de: 'Skulpturen der großen Tuzlaer Persönlichkeiten auf dem Korzo.',
      tr: 'Korzo caddesinde Tuzlalı yazar ve ressam heykelleri.',
    },
  },
  {
    id: 'atelje_ismet',
    lat: QUEST_TARGET_COORDS.atelje_ismet.lat,
    lon: QUEST_TARGET_COORDS.atelje_ismet.lon,
    radiusMeters: 45,
    exitRadiusMeters: 70,
    title: {
      en: '🎨 Atelier Ismet Mujezinović',
      bs: '🎨 Atelje Ismet Mujezinović',
      de: '🎨 Atelier Ismet Mujezinović',
      tr: '🎨 İsmet Mujezinović Atölyesi',
    },
    body: {
      en: 'Historic home and memorial art gallery of the acclaimed painter.',
      bs: 'Istorijska kuća i memorijalna galerija proslavljenog bosanskog slikara.',
      de: 'Gedenkgalerie und Atelier des gefeierten bosnischen Malers.',
      tr: 'Ünlü ressamın tarihi evi ve anma galerisi.',
    },
  },
  {
    id: 'palancinkara',
    lat: QUEST_TARGET_COORDS.palancinkara.lat,
    lon: QUEST_TARGET_COORDS.palancinkara.lon,
    radiusMeters: 30,
    exitRadiusMeters: 65,
    title: {
      en: '🥞 Pancake Bagi',
      bs: '🥞 Palačinkara Bagi',
      de: '🥞 Pfannkuchen Bagi',
      tr: '🥞 Bagi Krep Evi',
    },
    body: {
      en: 'Sweet break alert! Famous Tuzla gourmet crepes and desserts await.',
      bs: 'Vrijeme za slatku pauzu! Čuvene tuzlanske palačinke i poslastice.',
      de: 'Zeit für eine süße Pause mit berühmten Palatschinken.',
      tr: 'Tatlı molası! Tuzla\'nın ünlü krepleri sizi bekliyor.',
    },
  },
  {
    id: 'bingo_city_centar',
    lat: QUEST_TARGET_COORDS.bingo_city_centar.lat,
    lon: QUEST_TARGET_COORDS.bingo_city_centar.lon,
    radiusMeters: 70,
    exitRadiusMeters: 125,
    title: {
      en: '🛍️ Bingo City Center Tuzla',
      bs: '🛍️ Bingo City Centar Tuzla',
      de: '🛍️ Bingo City Center Tuzla',
      tr: '🛍️ Bingo City Center Tuzla',
    },
    body: {
      en: 'Premier shopping, dining and cinema destination in the Tuzla region.',
      bs: 'Glavna destinacija za kupovinu, zabavu i restorane u regiji.',
      de: 'Zentrales Shopping-, Gastronomie- und Unterhaltungszentrum.',
      tr: 'Bölgenin en büyük alışveriş, sinema ve eğlence merkezi.',
    },
  },
];

function getZoneNotificationId(zoneId: string): number {
  let hash = 0;
  for (let i = 0; i < zoneId.length; i++) {
    hash = (hash << 5) - hash + zoneId.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 100000) + 1000;
}

export interface UseGeofenceNotificationsProps {
  userPosition: { lat: number; lng: number } | null;
  lang: Language;
  enabled?: boolean;
  zones?: GeofenceZone[];
}

export function useGeofenceNotifications({
  userPosition,
  lang,
  enabled = true,
  zones = DEFAULT_GEOFENCES,
}: UseGeofenceNotificationsProps) {
  const insideZonesRef = useRef<Set<string>>(new Set());
  const lastTriggeredTimeRef = useRef<Map<string, number>>(new Map());
  const permissionsInitializedRef = useRef(false);

  // Initialize notification channel and permissions on startup
  useEffect(() => {
    if (!enabled || permissionsInitializedRef.current) return;
    permissionsInitializedRef.current = true;

    const setupNotifications = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          // Create Android notification channel
          await LocalNotifications.createChannel({
            id: CHANNEL_ID,
            name: 'Tuzla Tour Proximity Alerts',
            description: 'Notifies when entering proximity of historical landmarks and sights',
            importance: 4, // HIGH
            visibility: 1, // PUBLIC
            vibration: true,
            sound: 'default',
          }).catch((err) => {
            console.warn('LocalNotifications createChannel warn:', err);
          });

          // Check & request permissions
          const perm = await LocalNotifications.checkPermissions();
          if (perm.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }
        } else if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        }
      } catch (e) {
        console.warn('Notification setup notice:', e);
      }
    };

    setupNotifications();
  }, [enabled]);

  // Proximity check on every GPS position update
  useEffect(() => {
    if (!enabled || !userPosition) return;

    const triggerNotification = async (zone: GeofenceZone) => {
      const title = zone.title[lang] || zone.title.en || zone.title.bs;
      const body = zone.body[lang] || zone.body.en || zone.body.bs;
      const notifId = getZoneNotificationId(zone.id);

      if (Capacitor.isNativePlatform()) {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: notifId,
                title,
                body,
                channelId: CHANNEL_ID,
                smallIcon: 'ic_launcher',
                schedule: { at: new Date(Date.now() + 100) },
                extra: { poiId: zone.id },
              },
            ],
          });
        } catch (err) {
          console.warn('Failed to schedule local notification:', err);
        }
      } else if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(title, {
            body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-96x96.png',
          });
        } catch (err) {
          console.warn('Web notification display failed:', err);
        }
      }
    };

    zones.forEach((zone) => {
      const distance = getDistance(userPosition.lat, userPosition.lng, zone.lat, zone.lon);
      const isInside = insideZonesRef.current.has(zone.id);
      const exitRadius = zone.exitRadiusMeters ?? (zone.radiusMeters + 25);

      if (distance <= zone.radiusMeters) {
        if (!isInside) {
          insideZonesRef.current.add(zone.id);

          const lastTrigger = lastTriggeredTimeRef.current.get(zone.id) || 0;
          const now = Date.now();

          if (now - lastTrigger > COOLDOWN_MS) {
            lastTriggeredTimeRef.current.set(zone.id, now);
            triggerNotification(zone);
          }
        }
      } else if (distance > exitRadius) {
        if (isInside) {
          insideZonesRef.current.delete(zone.id);
        }
      }
    });
  }, [userPosition, lang, enabled, zones]);
}

