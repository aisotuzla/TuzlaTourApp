import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Bell,
  BookOpen,
  Camera,
  Car,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  LoaderCircle,
  MapPin,
  Play,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Square,
  Target,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';
import { useGlobalApp } from '../contexts/GlobalAppContext';
import { useNetwork } from '../hooks/useNetwork';
import {
  QUEST_TARGETS,
  PHASE_1_POIS,
  PHASE_2_POIS,
  PHASE_3_POIS,
  isPoiRewardUnlocked,
  QuestTarget,
} from '../constants/questData';
import { findQuestTargetFromQr } from '../utils/qrMatcher';
import { requestPushToken } from '../utils/firebase';
import {
  DEFAULT_NOTIFICATION_CHANNEL_ID,
  getStoredPushToken,
} from '../utils/pushNotifications';

interface PlayerDashboardProps {
  lang: Language;
  onNavigateToTarget?: (target: { name: string; lat: number; lon: number }) => void;
}

interface DashboardData {
  profile?: { display_name?: string | null; leaderboard_opt_in?: boolean };
  xp_total?: number;
  level?: number;
  level_title?: string;
  next_level_xp?: number | null;
  xp_into_level?: number;
  xp_for_level?: number;
  quests_completed?: number;
  completed_quests?: Array<{
    quest_id: string;
    title?: Record<string, string>;
    xp_awarded: number;
    completed_at: string;
  }>;
  achievements?: Array<{
    id: string;
    title: string | Record<string, string>;
    description?: string | Record<string, string>;
    icon?: string;
    unlocked_at: string;
  }>;
  recent_xp?: Array<{
    amount: number;
    reason: string;
    description?: string;
    created_at: string;
  }>;
}

interface TodoItem {
  id: string | number;
  name: string;
}

interface LedgerEntry {
  id: string;
  timestamp: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const QUEST_TARGET_COORDS: Record<string, { lat: number; lon: number }> = {
  trg_slobode: { lat: 44.5395175, lon: 18.6749037 },
  stara_cesma: { lat: 44.538982, lon: 18.67558 },
  salt_square: { lat: 44.5382182, lon: 18.6759398 },
  palancinkara: { lat: 44.5383762, lon: 18.6775339 },
  slana_banja: { lat: 44.536961, lon: 18.687983 },
  panonika: { lat: 44.539076, lon: 18.679488 },
  slapovi: { lat: 44.5404243, lon: 18.6819408 },
  kapija: { lat: 44.53863, lon: 18.676805 },
  atelje_ismet: { lat: 44.5371465, lon: 18.6810454 },
  bingo_city_centar: { lat: 44.532177, lon: 18.651743 },
  mesa_selimovic: { lat: 44.5370993, lon: 18.6781216 },
  tvrtko_park: { lat: 44.5380826, lon: 18.6783327 },
};

const copy = {
  en: {
    bannerTag: 'Tuzla Tour Guide',
    bannerTitle: 'Explorer Dashboard & QR',
    bannerSubtitle: 'Tvoje putovanje kroz Tuzlu',
    guest: 'Gost istraživač',
    refresh: 'Refresh',
    loading: 'Loading profile…',
    retry: 'Retry',
    qrTitle: 'Location QR Scanner',
    qrSubtitle: 'Point your camera at the QR sign on the monument or venue',
    startCamera: 'Start Camera',
    stopCamera: 'Stop Camera',
    flipCamera: 'Flip Camera',
    scanSuccess: 'Location successfully unlocked!',
    alreadyScanned: 'Location already in your journal.',
    scanError: 'Unknown QR code.',
    tasksTitle: 'Tasks & Objectives',
    tasksSubtitle: 'Live quest steps & checklist',
    noTasks: 'All tasks completed!',
    nextTarget: 'Next Quest Target',
    navigateBtn: 'Navigate on Map',
    dashboardTitle: 'Player Progress & Game Stats',
    xp: 'Total XP',
    level: 'Level',
    quests: 'Quests',
    nextLevel: 'Next level',
    recentXp: 'Recent Activity',
    noRecent: 'No XP earned yet.',
    achievementsTitle: 'Achievements & Badges',
    achievementsSubtitle: 'Milestones earned across Tuzla',
    noAchievements: 'Badges appear here as you complete quest milestones.',
    completedTitle: 'Completed Quests & Locations',
    completedSubtitle: 'Verified footprints & rewards',
    noCompleted: 'No completed locations yet. Start scanning QR codes!',
    clearHistory: 'Clear scan history',
    confirmClear: 'Clear all history?',
    yesClear: 'Yes, clear',
    cancel: 'Cancel',
    viewReward: 'View Reward',
    watchVideo: 'Cinematic Video',
    pushTitle: 'Push & Local Notifications',
    pushSubtitle: 'Stay alerted about nearby landmarks and quest clues',
    pushEnabled: 'Push notifications enabled',
    enablePush: 'Enable Notifications',
    testPush: 'Send Test Notification',
    testSuccess: 'Test notification scheduled!',
    copyToken: 'Copy FCM Token',
    tokenCopied: 'Token copied!',
    faqTitle: 'Frequently Asked Questions (FAQ)',
    partnersTitle: 'Partner Agencies & Projects',
    gradskiParking: 'Gradski Parking Tuzla',
    nftZmajevi: 'NFT Zmajevi',
    aisoTuzla: 'AISO TUZLA',
  },
  bs: {
    bannerTag: 'Tuzla Tour Guide',
    bannerTitle: 'Istraživački panel & QR',
    bannerSubtitle: 'Tvoje putovanje kroz Tuzlu',
    guest: 'Gost istraživač',
    refresh: 'Osvježi',
    loading: 'Učitavanje profila…',
    retry: 'Pokušaj ponovo',
    qrTitle: 'QR skener lokacija',
    qrSubtitle: 'Usmjeri kameru prema QR kodu na info tabli ili lokalu',
    startCamera: 'Pokreni kameru',
    stopCamera: 'Zaustavi kameru',
    flipCamera: 'Promijeni kameru',
    scanSuccess: 'Lokacija je uspješno otključana!',
    alreadyScanned: 'Lokacija je već u vašoj evidenciji.',
    scanError: 'Nepoznat QR kod lokacije.',
    tasksTitle: 'Zadaci i ciljevi',
    tasksSubtitle: 'Aktivni koraci i kontrolna lista',
    noTasks: 'Svi zadaci su završeni!',
    nextTarget: 'Sljedeći cilj potrage',
    navigateBtn: 'Pokaži na mapi',
    dashboardTitle: 'Napredak igrača i bodovi',
    xp: 'Ukupno XP',
    level: 'Nivo',
    quests: 'Potrage',
    nextLevel: 'Sljedeći nivo',
    recentXp: 'Nedavne aktivnosti',
    noRecent: 'Još nema osvojenih bodova.',
    achievementsTitle: 'Postignuća i bedževi',
    achievementsSubtitle: 'Osvojene značke kroz istraživanje Tuzle',
    noAchievements: 'Bedževi se pojavljuju nakon završenih etapa potrage.',
    completedTitle: 'Otkrivene lokacije i riješeni zadaci',
    completedSubtitle: 'Potvrđene posjete i otključane nagrade',
    noCompleted: 'Još nema završenih lokacija. Započni skeniranje!',
    clearHistory: 'Obriši historiju skeniranja',
    confirmClear: 'Sigurno obrisati historiju?',
    yesClear: 'Da, obriši',
    cancel: 'Odustani',
    viewReward: 'Pogledaj nagradu',
    watchVideo: 'Video snimak',
    pushTitle: 'Push i lokalne obavijesti',
    pushSubtitle: 'Primajte automatska upozorenja za obližnje znamenitosti',
    pushEnabled: 'Obavijesti su aktivirane',
    enablePush: 'Uključi obavijesti',
    testPush: 'Testiraj obavijest',
    testSuccess: 'Testna obavijest je poslana!',
    copyToken: 'Kopiraj FCM token',
    tokenCopied: 'Token kopiran!',
    faqTitle: 'Često postavljana pitanja (FAQ)',
    partnersTitle: 'Partnerske agencije i projekti',
    gradskiParking: 'Gradski Parking Tuzla',
    nftZmajevi: 'NFT Zmajevi',
    aisoTuzla: 'AISO TUZLA',
  },
  de: {
    bannerTag: 'Tuzla Tour Guide',
    bannerTitle: 'Entdecker-Dashboard & QR',
    bannerSubtitle: 'Tvoje putovanje kroz Tuzlu',
    guest: 'Gost istraživač',
    refresh: 'Aktualisieren',
    loading: 'Lade Profil…',
    retry: 'Wiederholen',
    qrTitle: 'Standort QR-Scanner',
    qrSubtitle: 'Kamera auf den QR-Code vor Ort richten',
    startCamera: 'Kamera starten',
    stopCamera: 'Kamera stoppen',
    flipCamera: 'Kamera wechseln',
    scanSuccess: 'Ort erfolgreich freigeschaltet!',
    alreadyScanned: 'Ort bereits im Tagebuch erfasst.',
    scanError: 'Unbekannter QR-Code.',
    tasksTitle: 'Aufgaben & Ziele',
    tasksSubtitle: 'Aktive Quest-Schritte',
    noTasks: 'Alle Aufgaben erledigt!',
    nextTarget: 'Nächstes Ziel',
    navigateBtn: 'Auf Karte zeigen',
    dashboardTitle: 'Spielfortschritt & Punkte',
    xp: 'XP Gesamt',
    level: 'Level',
    quests: 'Quests',
    nextLevel: 'Nächstes Level',
    recentXp: 'Letzte Aktivitäten',
    noRecent: 'Noch keine XP erhalten.',
    achievementsTitle: 'Erfolge & Abzeichen',
    achievementsSubtitle: 'Freigeschaltete Abzeichen in Tuzla',
    noAchievements: 'Abzeichen werden mit Quest-Abschlüssen freigeschaltet.',
    completedTitle: 'Entdeckte Orte & Quests',
    completedSubtitle: 'Besuchte Sehenswürdigkeiten',
    noCompleted: 'Noch keine Orte entdeckt.',
    clearHistory: 'Verlauf löschen',
    confirmClear: 'Verlauf wirklich löschen?',
    yesClear: 'Ja, löschen',
    cancel: 'Abbrechen',
    viewReward: 'Belohnung ansehen',
    watchVideo: 'Video ansehen',
    pushTitle: 'Push-Benachrichtigungen',
    pushSubtitle: 'Erhalten Sie Hinweise zu Sehenswürdigkeiten in der Nähe',
    pushEnabled: 'Benachrichtigungen aktiviert',
    enablePush: 'Benachrichtigungen aktivieren',
    testPush: 'Test-Benachrichtigung',
    testSuccess: 'Testnachricht gesendet!',
    copyToken: 'FCM-Token kopieren',
    tokenCopied: 'Token kopiert!',
    faqTitle: 'Häufig gestellte Fragen (FAQ)',
    partnersTitle: 'Partneragenturen & Projekte',
    gradskiParking: 'Gradski Parking Tuzla',
    nftZmajevi: 'NFT Zmajevi',
    aisoTuzla: 'AISO TUZLA',
  },
  tr: {
    bannerTag: 'Tuzla Tour Guide',
    bannerTitle: 'Kaşif Paneli ve QR',
    bannerSubtitle: 'Tvoje putovanje kroz Tuzlu',
    guest: 'Gost istraživač',
    refresh: 'Yenile',
    loading: 'Profil yükleniyor…',
    retry: 'Tekrar dene',
    qrTitle: 'Konum QR Tarayıcı',
    qrSubtitle: 'Kameranızı mekandaki QR tabelasına tutun',
    startCamera: 'Kamerayı Başlat',
    stopCamera: 'Kamerayı Durdur',
    flipCamera: 'Kamerayı Değiştir',
    scanSuccess: 'Konum başarıyla açıldı!',
    alreadyScanned: 'Konum zaten günlüğünüzde mevcut.',
    scanError: 'Bilinmeyen QR kod.',
    tasksTitle: 'Görevler ve Hedefler',
    tasksSubtitle: 'Aktif adımlar ve kontrol listesi',
    noTasks: 'Tüm görevler tamamlandı!',
    nextTarget: 'Sıradaki Hedef',
    navigateBtn: 'Haritada Göster',
    dashboardTitle: 'Oyuncu İlerlemesi ve Puanlar',
    xp: 'Toplam XP',
    level: 'Seviye',
    quests: 'Görevler',
    nextLevel: 'Sonraki Seviye',
    recentXp: 'Son Aktiviteler',
    noRecent: 'Henüz puan kazanılmadı.',
    achievementsTitle: 'Başarımlar ve Rozetler',
    achievementsSubtitle: 'Tuzla keşif rozetleri',
    noAchievements: 'Rozetler görev tamamlandıkça görünür.',
    completedTitle: 'Tamamlanan Görevler ve Yerler',
    completedSubtitle: 'Onaylanan ziyaretler ve ödüller',
    noCompleted: 'Henüz tamamlanan yer yok.',
    clearHistory: 'Geçmişi temizle',
    confirmClear: 'Geçmiş silinsin mi?',
    yesClear: 'Evet, sil',
    cancel: 'İptal',
    viewReward: 'Ödülü Gör',
    watchVideo: 'Video İzle',
    pushTitle: 'Anlık Bildirimler',
    pushSubtitle: 'Yakındaki yerler için akıllı bildirimler alın',
    pushEnabled: 'Bildirimler etkin',
    enablePush: 'Bildirimleri Aç',
    testPush: 'Test Bildirimi Gönder',
    testSuccess: 'Test bildirimi gönderildi!',
    copyToken: 'FCM Belirtecini Kopyala',
    tokenCopied: 'Kopyalandı!',
    faqTitle: 'Sıkça Sorulan Sorular (SSS)',
    partnersTitle: 'Ortak Kuruluşlar ve Projeler',
    gradskiParking: 'Gradski Parking Tuzla',
    nftZmajevi: 'NFT Zmajevi',
    aisoTuzla: 'AISO TUZLA',
  },
};

const textFor = (value: unknown, lang: Language): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, string>;
    return record[lang] || record.en || record.bs || '';
  }
  return '';
};

const formatTimestamp = (timestamp: string, lang: Language): string => {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) return timestamp;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  const locale = lang === 'bs' ? 'bs-BA' : lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ lang, onNavigateToTarget }) => {
  const t = copy[lang] || copy.en;
  const isOnline = useNetwork();
  const { unlockedRewards, setUnlockedRewards, setIsTvrtkoScratchOpen } = useGlobalApp();

  // 1. Dashboard State
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [guestId, setGuestId] = useState('');

  // 2. QR Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [scannerFeedback, setScannerFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingQrRef = useRef(false);

  // 3. Tasks (Todos) State
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [completedTodoIds, setCompletedTodoIds] = useState<Record<string | number, boolean>>({});
  const [todosLoading, setTodosLoading] = useState(true);

  // 4. Ledger & Completed Quests State
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeRewardHtml, setActiveRewardHtml] = useState<{ url: string; title: string } | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // 5. Push Notifications State
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [pushPending, setPushPending] = useState(false);

  // 6. FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Compute Next Quest Target
  const questPhases = useMemo(
    () => [
      { number: 1, ids: PHASE_1_POIS },
      { number: 2, ids: PHASE_2_POIS },
      { number: 3, ids: PHASE_3_POIS },
    ],
    []
  );

  const currentTarget = useMemo(() => {
    const nextId = questPhases.flatMap((p) => p.ids).find((id) => !isPoiRewardUnlocked(id, unlockedRewards));
    return nextId ? QUEST_TARGETS.find((target) => target.id === nextId) : undefined;
  }, [questPhases, unlockedRewards]);

  // Load Dashboard Data from Supabase RPC
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setDashboardError('');
    try {
      let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw signInError;
        sessionData = { session: signInData.session, user: signInData.user } as typeof sessionData;
      }

      if (sessionData.session?.user) {
        setGuestId(sessionData.session.user.id);
      }

      const { data: dashboardData, error: dashboardErr } = await (supabase as any).rpc('get_my_tuzla_dashboard');
      if (dashboardErr) {
        console.warn('Dashboard RPC notice:', dashboardErr.message);
      }
      if (dashboardData) {
        setData(dashboardData as DashboardData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setDashboardError(err instanceof Error ? err.message : 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Todos from Supabase
  const loadTodos = useCallback(async () => {
    setTodosLoading(true);
    try {
      const { data: todoData, error: todoErr } = await (supabase as any).from('todos').select('id, name');
      if (!todoErr && todoData) {
        setTodos(todoData as TodoItem[]);
      }
    } catch (err) {
      console.warn('Todos could not be loaded from Supabase:', err);
    } finally {
      setTodosLoading(false);
    }
  }, []);

  // Load Ledger from Preferences
  useEffect(() => {
    const loadSavedData = async () => {
      const { value } = await Preferences.get({ key: 'tuzla_scan_ledger' });
      if (value) {
        try {
          setLedger(JSON.parse(value));
        } catch {
          setLedger([]);
        }
      }
      const token = getStoredPushToken();
      if (token) setFcmToken(token);
    };
    void loadSavedData();
    void loadDashboard();
    void loadTodos();
  }, [loadDashboard, loadTodos]);

  // Cleanup Scanner on Unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle QR Decoding. Supabase is authoritative: never unlock locally before server approval.
  const processDecodedQr = async (decodedText: string) => {
    if (processingQrRef.current) return;
    processingQrRef.current = true;

    const showFailure = (message: string) => {
      setScannerFeedback({ text: message, type: 'error' });
      void stopScanner();
    };

    try {
      const trimmed = decodedText?.trim() ?? '';
      const target = findQuestTargetFromQr(trimmed);
      if (!target) {
        showFailure(t.scanError);
        return;
      }

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([100, 50, 100]); } catch (_) {}
      }

      if (!navigator.geolocation) {
        showFailure(lang === 'bs'
          ? 'GPS nije dostupan na ovom uređaju.'
          : 'GPS is unavailable on this device.');
        return;
      }

      let position: GeolocationPosition;
      try {
        position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });
      } catch (gpsError) {
        const gpsMessage = gpsError instanceof GeolocationPositionError && gpsError.code === gpsError.PERMISSION_DENIED
          ? (lang === 'bs' ? 'Dozvolite pristup lokaciji da biste potvrdili posjetu.' : 'Allow location access to verify this visit.')
          : (lang === 'bs' ? 'GPS lokacija nije dostupna. Pokušajte ponovo na otvorenom.' : 'Could not obtain GPS location. Please retry outdoors.');
        showFailure(gpsMessage);
        return;
      }

      const { data: completion, error: completionError } = await (supabase as any).rpc(
        'complete_tuzla_quest',
        {
          p_quest_id: target.id,
          p_qr_payload: trimmed,
          p_lat: position.coords.latitude,
          p_lon: position.coords.longitude,
        }
      );

      if (completionError) throw completionError;

      const result = completion as { ok?: boolean; code?: string; xp_awarded?: number; xp_total?: number; distance_meters?: number; radius_meters?: number } | null;
      const alreadyCompleted = result?.code === 'already_completed';

      if (!result?.ok && !alreadyCompleted) {
        const messages: Record<string, Record<Language, string>> = {
          qr_not_configured: {
            bs: 'QR kod ove lokacije još nije povezan sa serverom.',
            en: 'This location QR code is not configured on the server yet.',
            de: 'Dieser Standort-QR-Code ist noch nicht auf dem Server eingerichtet.',
            tr: 'Bu konumun QR kodu henüz sunucuda yapılandırılmadı.',
          },
          invalid_qr: {
            bs: 'QR kod ne odgovara ovoj lokaciji.',
            en: 'This QR code does not match this location.',
            de: 'Der QR-Code gehört nicht zu diesem Standort.',
            tr: 'Bu QR kodu bu konumla eşleşmiyor.',
          },
          outside_radius: {
            bs: 'Nalazite se izvan dozvoljenog GPS radijusa. Priđite lokaciji i pokušajte ponovo.',
            en: 'You are outside the allowed GPS radius. Move closer and try again.',
            de: 'Sie befinden sich außerhalb des GPS-Radius. Gehen Sie näher heran und versuchen Sie es erneut.',
            tr: 'İzin verilen GPS yarıçapının dışındasınız. Yaklaşın ve tekrar deneyin.',
          },
          gps_required: {
            bs: 'GPS lokacija je obavezna za potvrdu ove posjete.',
            en: 'GPS location is required to verify this visit.',
            de: 'Für die Bestätigung dieses Besuchs ist GPS erforderlich.',
            tr: 'Bu ziyareti doğrulamak için GPS konumu gereklidir.',
          },
          auth_required: {
            bs: 'Igračka sesija nije aktivna. Osvježite aplikaciju.',
            en: 'Your player session is not active. Please refresh the app.',
            de: 'Ihre Spielersitzung ist nicht aktiv. Bitte aktualisieren Sie die App.',
            tr: 'Oyuncu oturumunuz etkin değil. Lütfen uygulamayı yenileyin.',
          },
        };
        showFailure(messages[result?.code || '']?.[lang] || t.scanError);
        return;
      }

      // The server has confirmed either a new completion or an existing one.
      const timestamp = new Date().toISOString();
      const newLedger = [
        { id: target.id, timestamp },
        ...ledger.filter((item) => item.id !== target.id),
      ];
      setLedger(newLedger);
      await Preferences.set({ key: 'tuzla_scan_ledger', value: JSON.stringify(newLedger) });

      if (!unlockedRewards.includes(target.id)) {
        setUnlockedRewards((prev) => [...prev, target.id]);
      }

      await loadDashboard();

      if (alreadyCompleted) {
        setScannerFeedback({
          text: `${target.name[lang] || target.name.bs}: ${t.alreadyScanned}`,
          type: 'success',
        });
        void stopScanner();
        return;
      }

      if (target.id === 'tvrtko_park' || target.id === 'tvrtko') {
        void stopScanner();
        setTimeout(() => setIsTvrtkoScratchOpen(true), 350);
        return;
      }

      setScannerFeedback({
        text: `${t.scanSuccess} ${target.name[lang] || target.name.bs} (+${result?.xp_awarded ?? 0} XP)`,
        type: 'success',
      });
      setTimeout(() => setScannerFeedback(null), 3500);
      void stopScanner();

      if ((target as any).rewardHtml) {
        const rewardTitle = target.name[lang] || target.name.bs;
        setTimeout(() => {
          setActiveRewardHtml({ url: (target as any).rewardHtml!, title: rewardTitle });
        }, 600);
      }
    } catch (err) {
      console.error('Server-side quest verification failed:', err);
      showFailure(lang === 'bs'
        ? 'Verifikacija nije uspjela. Provjerite internet i pokušajte ponovo.'
        : 'Quest verification failed. Check your connection and try again.');
    } finally {
      processingQrRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScannerStatus('idle');
    setScannerError(null);
  };

  const startScanner = async (preferredCamId?: string) => {
    setIsScanning(true);
    setScannerStatus('loading');
    setScannerError(null);
    setScannerFeedback(null);

    await new Promise((r) => setTimeout(r, 350));

    const containerId = 'unified-qr-reader';
    const container = document.getElementById(containerId);
    if (!container) {
      setScannerStatus('error');
      setScannerError(lang === 'bs' ? 'Kamera nije spremna. Pokušajte ponovo.' : 'Scanner view not ready.');
      return;
    }

    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScannerStatus('error');
        setScannerError(lang === 'bs' ? 'Nema pronađenih kamera.' : 'No camera found on this device.');
        return;
      }

      setAvailableCameras(cameras);
      const selectedCamId =
        preferredCamId ||
        activeCameraId ||
        cameras.find((c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'))?.id ||
        cameras[0].id;
      setActiveCameraId(selectedCamId);

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: Math.floor(edge * 0.75), height: Math.floor(edge * 0.75) };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          void processDecodedQr(decodedText);
        },
        () => {}
      );

      setScannerStatus('active');
    } catch (err) {
      console.error('Camera start error:', err);
      setScannerStatus('error');
      setScannerError(lang === 'bs' ? 'Dozvola za kameru je odbijena ili nedostupna.' : 'Camera permission denied or camera unavailable.');
    }
  };

  const handleFlipCamera = async () => {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex((c) => c.id === activeCameraId);
    const nextCamera = availableCameras[(currentIndex + 1) % availableCameras.length];
    setActiveCameraId(nextCamera.id);
    if (isScanning) {
      await stopScanner();
      await startScanner(nextCamera.id);
    }
  };

  const handleClearLedger = async () => {
    await Preferences.remove({ key: 'tuzla_scan_ledger' });
    setLedger([]);
    setShowClearConfirm(false);
  };

  // Push Notifications Handlers
  const handleRegisterPush = async () => {
    setPushPending(true);
    setPushStatusMessage(null);
    try {
      if (Capacitor.isNativePlatform()) {
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive !== 'granted') {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== 'granted') throw new Error('Permission denied.');
        await PushNotifications.register();
        setPushStatusMessage(lang === 'bs' ? 'Registracija zatražena; čeka se token.' : 'Registration requested; awaiting token.');
      } else {
        const token = await requestPushToken();
        if (token) {
          setFcmToken(token);
          setPushStatusMessage(lang === 'bs' ? 'Obavijesti su uspješno uključene!' : 'Notifications successfully enabled!');
        } else {
          setPushStatusMessage(lang === 'bs' ? 'Obavijesti nisu podržane u ovom pregledniku.' : 'Push notifications unavailable in this browser.');
        }
      }
    } catch (err) {
      setPushStatusMessage(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setPushPending(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      const title = 'Tuzla Tour Guide';
      const body =
        lang === 'bs'
          ? 'Čestitamo! Lokalne i push obavijesti rade savršeno na vašem uređaju.'
          : 'Congratulations! Notifications are fully active on your device.';

      if (!Capacitor.isNativePlatform()) {
        if ('Notification' in window) {
          let perm = Notification.permission;
          if (perm === 'default') perm = await Notification.requestPermission();
          if (perm === 'granted') new Notification(title, { body });
        }
      } else {
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
        if (perm.display === 'granted') {
          if (Capacitor.getPlatform() === 'android') {
            await LocalNotifications.createChannel({
              id: DEFAULT_NOTIFICATION_CHANNEL_ID,
              name: 'Tuzla Notifications',
              importance: 5,
              vibration: true,
            });
          }
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Math.floor(Date.now() % 2_000_000),
                title,
                body,
                channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
                schedule: { at: new Date(Date.now() + 500) },
              },
            ],
          });
        }
      }
      setPushStatusMessage(t.testSuccess);
      setTimeout(() => setPushStatusMessage(null), 3500);
    } catch (err) {
      setPushStatusMessage(err instanceof Error ? err.message : 'Notification failed.');
    }
  };

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // Level progress percentage
  const progressPercent = data?.xp_for_level
    ? Math.min(100, Math.max(0, ((data.xp_into_level || 0) / data.xp_for_level) * 100))
    : 100;

  // FAQ Items Data
  const faqList: FaqItem[] = [
    {
      id: 1,
      icon: <Globe className="h-5 w-5 text-blue-500" />,
      question:
        lang === 'bs'
          ? 'Šta je Tuzla Tour App i kako funkcionišu Tuzla Quest nagrade?'
          : lang === 'de'
          ? 'Was ist die Tuzla Tour App und wie funktionieren die Tuzla Quest Belohnungen?'
          : lang === 'tr'
          ? 'Tuzla Tour Uygulaması nedir ve Tuzla Quest ödülleri nasıl çalışır?'
          : 'What is Tuzla Tour App & how does the Tuzla Quest reward system work?',
      answer:
        lang === 'bs'
          ? 'Tuzla Tour App je interaktivni turistički vodič sa 3D GPS navigacijom, kamerom sa AR vodičem i nagradnom igrom Tuzla Quest. Šetnjom kroz grad otkrivate kulturne znamenitosti, kafiće i hotele. Skeniranjem QR koda na licu mjesta otključavate naredne faze, interaktivne 3D prikaze i popuste!'
          : lang === 'de'
          ? 'Die Tuzla Tour App ist ein interaktiver Reiseführer mit 3D-GPS-Navigation, AR-Kameraguide und dem Tuzla Quest Gewinnspiel. Beim Erkunden der Stadt schalten Sie durch QR-Scans an Denkmälern neue Inhalte, 3D-Modelle und Rabatte frei!'
          : lang === 'tr'
          ? 'Tuzla Tour App, 3D GPS navigasyonu ve AR rehberi içeren interaktif bir turist rehberidir. Şehirde gezerken QR kodları tarayarak yeni etapların, 3D içeriklerin ve yerel indirimlerin kilidini açarsınız!'
          : 'Tuzla Tour App is an interactive city guide with 3D GPS navigation, an AR camera guide, and the Tuzla Quest game. By scanning on-site QR codes, you unlock subsequent stages, interactive 3D historical artifacts, and partner discounts!',
    },
    {
      id: 2,
      icon: <Compass className="h-5 w-5 text-sky-500" />,
      question:
        lang === 'bs'
          ? 'Kako funkcioniše 3D GPS navigacija i geofencing obavijesti?'
          : lang === 'de'
          ? 'Wie funktionieren die 3D-GPS-Navigation und Geofencing-Benachrichtigungen?'
          : lang === 'tr'
          ? '3D GPS navigasyonu ve geofencing bildirimleri nasıl çalışır?'
          : 'How does 3D GPS Navigation & Geofencing work?',
      answer:
        lang === 'bs'
          ? 'Aplikacija u realnom vremenu prati vašu GPS lokaciju u odnosu na atrakcije. Čim se približite na 25 metara od zadate tačke (POI), sistem šalje pametnu push obavijest koja vas poziva da uključite AR kameru i direktno pratite stazu do cilja.'
          : lang === 'de'
          ? 'Die App überwacht in Echtzeit Ihre GPS-Position relativ zu Sehenswürdigkeiten. Sobald Sie sich innerhalb von 25 Metern zu einem Ziel befinden, erhalten Sie eine Benachrichtigung für die AR-Führung.'
          : lang === 'tr'
          ? 'Uygulama, GPS konumunuzu hedeflere göre gerçek zamanlı izler. Bir hedefe 25 metre yaklaştığınızda akıllı bir bildirim alarak AR kamera rehberini açabilirsiniz.'
          : 'The app monitors your real-time distance to attractions. Once you enter a 25-meter radius around any Point of Interest (POI), a notification alerts you to activate the camera AR Guide to lead you to the exact spot.',
    },
    {
      id: 3,
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      question:
        lang === 'bs'
          ? 'Zašto aplikacija traži dozvole za lokaciju, kameru i obavijesti?'
          : lang === 'de'
          ? 'Warum benötigt die App Zugriff auf Standort, Kamera und Benachrichtigungen?'
          : lang === 'tr'
          ? 'Uygulama neden konum, kamera ve bildirim izinleri istiyor?'
          : 'Why does the app ask for location, camera, and notification permissions?',
      answer:
        lang === 'bs'
          ? 'Pristup lokaciji omogućava prikaz vašeg položaja na mapi i precizno vođenje. Kamera se koristi za skeniranje QR kodova i AR vodič. Dozvola za obavijesti šalje podsjetnike kada ste u blizini važnih znamenitosti.'
          : lang === 'de'
          ? 'Standortzugriff ermöglicht die Anzeige auf der Karte. Die Kamera wird zum Scannen von QR-Codes und AR-Navigation genutzt. Benachrichtigungen weisen auf nahe Sehenswürdigkeiten hin.'
          : lang === 'tr'
          ? 'Konum izni haritada yerinizi gösterir. Kamera QR tarama ve AR rehberi için gereklidir. Bildirimler ise yakındaki tarihi noktaları kaçırmamanızı sağlar.'
          : 'Location access displays your real-time position on maps. Camera access is strictly used for on-device QR scanning and AR guidance. Notification permission alerts you when nearby landmarks are reached.',
    },
    {
      id: 4,
      icon: <QrCode className="h-5 w-5 text-indigo-500" />,
      question:
        lang === 'bs'
          ? 'Kako skenirati QR kodove i osvojiti nagrade?'
          : lang === 'de'
          ? 'Wie scanne ich QR-Codes und erhalte Rabatte?'
          : lang === 'tr'
          ? 'QR kodları nasıl taratıp işletmelerde indirim kazanırım?'
          : 'How do I scan QR codes and redeem partner discounts?',
      answer:
        lang === 'bs'
          ? 'Otvorite ovaj tab "Napredak & QR" i kliknite na dugme "Pokreni kameru". Usmjerite kameru prema QR kodu. Aplikacija bilježi dokaz posjete, dodjeljuje vam XP bodove i otključava nagradni sadržaj!'
          : lang === 'de'
          ? 'Öffnen Sie diesen Tab und starten Sie die Kamera. Richten Sie die Kamera auf den QR-Code vor Ort, um Punkte und Belohnungen freizuschalten!'
          : lang === 'tr'
          ? 'Bu sekmedeki "Kamerayı Başlat" düğmesine tıklayın ve kameranızı mekanlardaki QR koda tutun. XP puanları ve hediyeler anında hesabınıza eklenir!'
          : 'Click "Start Camera" right here in this tab and point your camera at the QR sign. The app confirms your visit, awards XP points, and unlocks digital rewards!',
    },
    {
      id: 5,
      icon: <ShieldCheck className="h-5 w-5 text-cyan-500" />,
      question:
        lang === 'bs'
          ? 'Mogu li koristiti aplikaciju i mape offline bez interneta?'
          : lang === 'de'
          ? 'Kann ich die App und Karten offline ohne Internet nutzen?'
          : lang === 'tr'
          ? 'Uygulamayı ve haritaları internet olmadan çevrimdışı kullanabilir miyim?'
          : 'Can I use the app and maps offline without internet or roaming?',
      answer:
        lang === 'bs'
          ? 'Da! Tuzla Tour App koristi napredne vektorske offline mape i lokalno keširanje. Sve bilješke, planovi puta, evidencija posjeta i zvučni vodiči rade u potpunosti offline bez trošenja mobilnih podataka.'
          : lang === 'de'
          ? 'Ja! Die App nutzt moderne Vektorkarten und lokales Caching. Alle Notizen, Reisepläne und Audioguides funktionieren offline ohne Roaming-Gebühren.'
          : lang === 'tr'
          ? 'Evet! Çevrimdışı vektör haritalar ve yerel önbellek sayesinde seyahat planınız, sesli rehberler ve notlarınız internet olmadan da çalışır.'
          : 'Yes! Tuzla Tour App uses vector map tiles and offline local storage. Itineraries, expense logs, notes, and audio guides operate reliably offline without data roaming.',
    },
    {
      id: 6,
      icon: <ShieldCheck className="h-5 w-5 text-purple-500" />,
      question:
        lang === 'bs'
          ? 'Gdje se čuvaju moje bilješke, plan puta i lični podaci?'
          : lang === 'de'
          ? 'Wo werden meine Notizen, Reisepläne und persönlichen Daten gespeichert?'
          : lang === 'tr'
          ? 'Notlarım, seyahat planım ve kişisel verilerim nerede saklanıyor?'
          : 'Where are my notes, itinerary, and personal data stored?',
      answer:
        lang === 'bs'
          ? '100% Privacy by Design: sve vaše bilješke, to-do stavke i evidencija posjeta pohranjeni su primarno lokalno u memoriji vašeg uređaja. Sukladno GDPR standardima, vaša privatnost je u potpunosti zaštićena.'
          : lang === 'de'
          ? '100 % Datenschutz: Alle Daten und Notizen verbleiben auf Ihrem lokalen Speicher. Wir respektieren höchste GDPR-Datenschutzstandards.'
          : lang === 'tr'
          ? '%100 Gizlilik Odaklı Tasarım: Tüm notlarınız ve verileriniz telefonunuzda saklanır. GDPR standartlarına tam uyumludur.'
          : '100% Privacy by Design: All your personal checklists, itinerary notes, and footprints are preserved on your local device in compliance with GDPR standards.',
    },
  ];

  return (
    <div className="min-h-full w-full bg-slate-50/80 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── 1. HEAD BANNER ON TOP ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-5 sm:p-7 text-white shadow-xl border border-blue-600/30">
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-cyan-200">
                <Compass className="w-3.5 h-3.5 text-cyan-300" />
                {t.bannerTag}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {t.bannerTitle}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-blue-100">
                {t.bannerSubtitle}
              </p>
              {/* "Gost istraživač" directly under subtitle - NO CROWN ICON */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 border border-white/20 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {data?.profile?.display_name || t.guest}
                </span>
              </div>
            </div>

            {/* Refresh Button & ID */}
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  void loadDashboard();
                  void loadTodos();
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50 shadow-xs"
                title={t.refresh}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{t.refresh}</span>
              </button>
              {guestId && (
                <span className="text-[10px] font-mono text-blue-200/70">
                  ID: {guestId.slice(0, 8)}…
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. QR SCANNER ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t.qrTitle}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t.qrSubtitle}
                </p>
              </div>
            </div>
            {availableCameras.length > 1 && isScanning && (
              <button
                type="button"
                onClick={handleFlipCamera}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Camera size={13} />
                <span>{t.flipCamera}</span>
              </button>
            )}
          </div>

          {/* Scanner Viewport */}
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-950 aspect-square flex flex-col items-center justify-center">
            {/* Html5Qrcode video container */}
            <div
              id="unified-qr-reader"
              className={`w-full h-full ${isScanning ? 'block' : 'hidden'}`}
            />

            {!isScanning && (
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Camera className="h-7 w-7" />
                </div>
                <p className="text-xs text-slate-300 font-medium max-w-xs">
                  {t.qrSubtitle}
                </p>
                <button
                  type="button"
                  onClick={() => void startScanner()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  <QrCode size={16} />
                  <span>{t.startCamera}</span>
                </button>
              </div>
            )}

            {isScanning && (
              <>
                {/* Viewfinder reticle overlay */}
                <div className="pointer-events-none absolute inset-6 sm:inset-10 border-2 border-cyan-400/60 rounded-2xl">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-300 -translate-x-1 -translate-y-1" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-300 translate-x-1 -translate-y-1" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-300 -translate-x-1 translate-y-1" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-300 translate-x-1 translate-y-1" />
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
                </div>

                {/* Stop button overlay */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center z-20">
                  <button
                    type="button"
                    onClick={() => void stopScanner()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md px-4 py-1.5 text-xs font-black text-rose-300 border border-rose-500/30 hover:bg-rose-950/80 active:scale-95 transition-all"
                  >
                    <X size={14} />
                    <span>{t.stopCamera}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Scanner Feedback Alerts */}
          {scannerFeedback && (
            <div
              className={`mt-3 rounded-xl p-3 text-xs font-bold border transition-all ${
                scannerFeedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {scannerFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <CircleAlert size={16} className="text-amber-600 shrink-0" />
                )}
                <span>{scannerFeedback.text}</span>
              </div>
            </div>
          )}

          {scannerError && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-900 flex items-center gap-2">
              <CircleAlert size={16} className="text-rose-600 shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}
        </section>

        {/* ── 3. TASKS (TODOS) ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t.tasksTitle}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t.tasksSubtitle}
                </p>
              </div>
            </div>
            {todos.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 border border-blue-100">
                {todos.length} {lang === 'bs' ? 'stavki' : 'items'}
              </span>
            )}
          </div>

          {/* Next Quest Objective Card */}
          {currentTarget && (
            <div className="mb-3.5 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/50 p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                    🎯 {t.nextTarget}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-blue-950">
                    {currentTarget.name[lang] || currentTarget.name.bs}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-1 max-w-md">
                    {currentTarget.description[lang] || currentTarget.description.bs}
                  </p>
                </div>
                {onNavigateToTarget && QUEST_TARGET_COORDS[currentTarget.id] && (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToTarget({
                        name: currentTarget.name[lang] || currentTarget.name.bs,
                        lat: QUEST_TARGET_COORDS[currentTarget.id].lat,
                        lon: QUEST_TARGET_COORDS[currentTarget.id].lon,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
                  >
                    <MapPin size={13} />
                    <span>{t.navigateBtn}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Todo List from Supabase */}
          {todosLoading ? (
            <div className="flex items-center justify-center py-4 text-xs font-bold text-slate-400 gap-2">
              <LoaderCircle size={15} className="animate-spin" />
              <span>{t.loading}</span>
            </div>
          ) : todos.length > 0 ? (
            <div className="space-y-2">
              {todos.map((todo) => {
                const isChecked = !!completedTodoIds[todo.id];
                return (
                  <button
                    key={todo.id}
                    type="button"
                    onClick={() =>
                      setCompletedTodoIds((prev) => ({
                        ...prev,
                        [todo.id]: !prev[todo.id],
                      }))
                    }
                    className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left border transition-all ${
                      isChecked
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                        : 'border-slate-100 bg-slate-50/80 hover:bg-slate-100/70 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isChecked ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={16} className="text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs font-bold truncate ${
                          isChecked ? 'line-through text-slate-400 font-medium' : ''
                        }`}
                      >
                        {todo.name}
                      </span>
                    </div>
                    {isChecked && (
                      <span className="text-[10px] font-black uppercase text-emerald-600 shrink-0 ml-2">
                        {lang === 'bs' ? 'Završeno' : 'Done'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-3 text-center text-xs text-slate-400 font-medium">
              {t.noTasks}
            </div>
          )}
        </section>

        {/* ── 4. PLAYER DASHBOARD WITH GAME PROGRESS, POINTS ETC... ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {t.dashboardTitle}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'bs' ? 'Statistika istraživača i nivo napretka' : 'Explorer statistics and rank level'}
              </p>
            </div>
          </div>

          {/* 3 Compact Stat Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <Zap size={12} className="text-amber-500" />
                <span>{t.xp}</span>
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-black text-blue-950 leading-tight">
                {(data?.xp_total || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <Target size={12} className="text-blue-500" />
                <span>{t.level}</span>
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-black text-blue-950 leading-tight">
                {data?.level || 1}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                {data?.level_title || (lang === 'bs' ? 'Istraživač' : 'Explorer')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>{t.quests}</span>
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-black text-blue-950 leading-tight">
                {data?.quests_completed || ledger.length}
                <span className="text-xs font-normal text-slate-400">/12</span>
              </p>
            </div>
          </div>

          {/* XP Progress toward next level */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="text-[11px] text-slate-500 font-semibold">{t.nextLevel}</span>
              <span className="text-[11px] font-black text-blue-700">
                {data?.xp_into_level || 0} / {data?.xp_for_level || 500} XP
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Recent XP Activity Feed */}
          {data?.recent_xp && data.recent_xp.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                {t.recentXp}
              </span>
              <div className="divide-y divide-slate-100">
                {data.recent_xp.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="font-medium text-slate-700 truncate pr-2">
                      {item.description || item.reason}
                    </span>
                    <span className="shrink-0 font-black text-emerald-600">
                      +{item.amount} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 5. ADMIN DASHBOARD COMPLETELY REMOVED ── */}

        {/* ── 6. ACHIEVEMENTS ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t.achievementsTitle}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t.achievementsSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                id: 'first_step',
                title: lang === 'bs' ? 'Prvi korak' : 'First Step',
                desc: lang === 'bs' ? 'Skenirana 1 lokacija' : '1 scan completed',
                icon: '🚶‍♂️',
                unlocked: (data?.quests_completed || ledger.length) >= 1,
              },
              {
                id: 'salt_explorer',
                title: lang === 'bs' ? 'Slano srce' : 'Salt Heart',
                desc: lang === 'bs' ? 'Skenirana Panonika i trg' : 'Panonika explored',
                icon: '🌊',
                unlocked: (data?.quests_completed || ledger.length) >= 3,
              },
              {
                id: 'king_tvrtko',
                title: lang === 'bs' ? 'Kraljevski trag' : 'Royal Footprint',
                desc: lang === 'bs' ? 'Povelja i Tvrtko park' : 'King Tvrtko visited',
                icon: '📜',
                unlocked: (data?.quests_completed || ledger.length) >= 6,
              },
              {
                id: 'master_explorer',
                title: lang === 'bs' ? 'Gospodar Tuzle' : 'Master Explorer',
                desc: lang === 'bs' ? 'Sve lokacije završene' : 'All 12 quest spots',
                icon: '🏅',
                unlocked: (data?.quests_completed || ledger.length) >= 12,
              },
            ].map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl p-3 text-center border transition-all ${
                  badge.unlocked
                    ? 'border-blue-200 bg-blue-50/50 shadow-2xs'
                    : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <h4 className="text-xs font-black text-slate-900 truncate">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {badge.desc}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    badge.unlocked
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {badge.unlocked ? (lang === 'bs' ? 'Osvojeno' : 'Unlocked') : (lang === 'bs' ? 'Zaključano' : 'Locked')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. COMPLETED QUEST LIST ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t.completedTitle}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t.completedSubtitle}
                </p>
              </div>
            </div>
            {ledger.length > 0 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-100">
                {ledger.length} {lang === 'bs' ? 'lokacija' : 'locations'}
              </span>
            )}
          </div>

          {/* List of scanned locations */}
          {ledger.length > 0 ? (
            <div className="space-y-2">
              {ledger.map((entry) => {
                const target = QUEST_TARGETS.find((qt) => qt.id === entry.id);
                const title = target?.name[lang] || target?.name.bs || entry.id;
                return (
                  <div
                    key={`${entry.id}-${entry.timestamp}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 pl-6">
                        {formatTimestamp(entry.timestamp, lang)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-emerald-100/70 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                        +100 XP
                      </span>
                      {target?.rewardHtml && (
                        <button
                          type="button"
                          onClick={() => setActiveRewardHtml({ url: target.rewardHtml!, title })}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-100 active:scale-95 transition-all"
                        >
                          <BookOpen size={11} />
                          <span>{t.viewReward}</span>
                        </button>
                      )}
                      {target?.video && (
                        <button
                          type="button"
                          onClick={() => setPlayingVideo(target.video!)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                        >
                          <Play size={11} />
                          <span>{t.watchVideo}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Clear History Control */}
              <div className="pt-2 border-t border-slate-100">
                {showClearConfirm ? (
                  <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs">
                    <span className="font-bold text-rose-800">{t.confirmClear}</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleClearLedger}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase text-white active:scale-95"
                      >
                        {t.yesClear}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="rounded-lg bg-slate-200 px-2.5 py-1 text-[10px] font-black uppercase text-slate-700 active:scale-95"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>{t.clearHistory}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              {t.noCompleted}
            </div>
          )}
        </section>

        {/* ── 8. PUSH NOTIFICATION ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t.pushTitle}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t.pushSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  {fcmToken ? t.pushEnabled : (lang === 'bs' ? 'Status obavijesti' : 'Notification status')}
                </span>
                <span className="text-[11px] text-slate-500">
                  {fcmToken
                    ? (lang === 'bs' ? 'Uređaj je povezan za geofence i quest obavijesti.' : 'Device registered for push and geofence alerts.')
                    : (lang === 'bs' ? 'Uključite obavijesti za automatska upozorenja u blizini atrakcija.' : 'Enable alerts to get notified when near landmarks.')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {!fcmToken && (
                  <button
                    type="button"
                    onClick={() => void handleRegisterPush()}
                    disabled={pushPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Bell size={13} />
                    <span>{t.enablePush}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleSendTestNotification()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <Bell size={13} />
                  <span>{t.testPush}</span>
                </button>
              </div>
            </div>

            {pushStatusMessage && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-xs font-bold text-blue-900">
                {pushStatusMessage}
              </div>
            )}

            {fcmToken && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-100/70 p-2.5 text-xs">
                <span className="truncate font-mono text-[10px] text-slate-600">
                  Token: {fcmToken.slice(0, 24)}…
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200 active:scale-95"
                >
                  {copiedToken ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedToken ? t.tokenCopied : t.copyToken}</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── 9. FAQ ACCORDION ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {t.faqTitle}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'bs' ? 'Odgovori na najvažnija pitanja o aplikaciji i potrazi' : 'Key answers about the app and quest'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {faqList.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : item.id)}
                    className="w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-slate-100/80"
                  >
                    <div className="flex items-center gap-2.5 pr-2">
                      <div className="shrink-0">{item.icon}</div>
                      <span className="text-xs font-black text-slate-900">
                        {item.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-3.5 pb-3 text-[11px] leading-relaxed text-slate-600 border-t border-slate-100/80 pt-2">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 10. PARTNER AGENCIES AT BOTTOM ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {t.partnersTitle}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'bs' ? 'Službeni partneri i digitalni servisi' : 'Official partner agencies & digital services'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Gradski Parking Tuzla */}
            <a
              href="https://gradskiparkingtuzla.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl border-2 border-blue-600 bg-yellow-400 text-blue-950 font-black shadow-xs hover:bg-yellow-300 active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Car className="h-5 w-5 text-blue-900" />
                <span className="text-xs uppercase tracking-wider">{t.gradskiParking}</span>
              </div>
              <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
            </a>

            {/* NFT Zmajevi */}
            <a
              href="https://zmajevi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl border-2 border-purple-500 bg-white text-purple-700 font-black shadow-xs hover:bg-purple-50 active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🐉</span>
                <span className="text-xs uppercase tracking-wider">{t.nftZmajevi}</span>
              </div>
              <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
            </a>

            {/* AISO TUZLA */}
            <a
              href="https://aiso-tuzla.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-blue-600 text-yellow-300 font-black shadow-xs hover:bg-blue-700 active:scale-95 transition-all group border-2 border-blue-700"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/icons/aisologo.webp"
                  alt="AISO Logo"
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs uppercase tracking-wider">{t.aisoTuzla}</span>
              </div>
              <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
            </a>
          </div>
        </section>

      </div>

      {/* ── Interactive Reward HTML Modal ── */}
      <AnimatePresence>
        {activeRewardHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[7000] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          >
            <div className="w-full h-full max-w-3xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-950 to-slate-950 text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-black uppercase text-amber-300 truncate">
                    {activeRewardHtml.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRewardHtml(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 relative bg-black">
                <iframe
                  src={activeRewardHtml.url}
                  title={activeRewardHtml.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; gyroscope"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Video Lightbox Modal ── */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={playingVideo}
                autoPlay
                controls
                className="w-full max-h-[70vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerDashboard;
