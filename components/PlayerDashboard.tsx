import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Compass,
  ExternalLink,
  Globe,
  HelpCircle,
  MapPin,
  Play,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Target,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Preferences } from '@capacitor/preferences';

import { supabase } from '../lib/supabaseClient';
import { ensurePlayerSession } from '../lib/playerSession';
import { Language } from '../types';
import { useGlobalApp } from '../contexts/GlobalAppContext';
import { useNetwork } from '../hooks/useNetwork';
import {
  QUEST_TARGETS,
  PHASE_1_POIS,
  PHASE_2_POIS,
  PHASE_3_POIS,
  GRAND_FINALE_POIS,
  isPoiRewardUnlocked,
  QuestTarget,
} from '../constants/questData';

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
  palacinkara: { lat: 44.5383762, lon: 18.6775339 },
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
    bannerTitle: 'Explorer Dashboard',
    bannerSubtitle: 'Your journey through Tuzla',
    guest: 'Explorer',
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
    clearHistory: 'Reset quest & scan history',
    confirmClear: 'Clear scan history and reset the quest?',
    yesClear: 'Yes, clear',
    cancel: 'Cancel',
    viewReward: 'View Reward',
    watchVideo: 'Cinematic Video',
    faqTitle: 'Frequently Asked Questions (FAQ)',
    partnersTitle: 'Partner Agencies & Projects',
    gradskiParking: 'Gradski Parking Tuzla',
    nftZmajevi: 'NFT Zmajevi',
    aisoTuzla: 'AISO TUZLA',
  },
  bs: {
    bannerTag: 'Tuzla Tour Guide',
    bannerTitle: 'Istraživački panel',
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
    clearHistory: 'Resetuj potragu i historiju skeniranja',
    confirmClear: 'Obrisati historiju skeniranja i resetovati potragu?',
    yesClear: 'Da, obriši',
    cancel: 'Odustani',
    viewReward: 'Pogledaj nagradu',
    watchVideo: 'Video snimak',
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
    clearHistory: 'Quest und Scan-Verlauf zurücksetzen',
    confirmClear: 'Scan-Verlauf löschen und Quest zurücksetzen?',
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
    clearHistory: 'Görevi ve tarama geçmişini sıfırla',
    confirmClear: 'Tarama geçmişi silinip görev sıfırlansın mı?',
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
  const navigate = useNavigate();
  const t = copy[lang] || copy.en;
  const isOnline = useNetwork();
  const { unlockedRewards, setUnlockedRewards, resetQuestProgress, setIsTvrtkoScratchOpen, setActivePhaseCelebration } = useGlobalApp();

  // 1. Dashboard State
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [guestId, setGuestId] = useState('');

  // 4. Ledger & Completed Quests State
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeRewardHtml, setActiveRewardHtml] = useState<{ url: string; title: string } | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // 5. FAQ State
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
      const playerSession = await ensurePlayerSession(lang === 'bs' ? 'Gost istraživač' : 'Guest explorer');
      setGuestId(playerSession.user.id);

      const { data: dashboardData, error: dashboardErr } = await (supabase as any).rpc('get_my_tuzla_dashboard');
      if (dashboardErr) {
        console.warn('Dashboard RPC notice:', dashboardErr.message);
      }
      if (dashboardData) {
        setData(dashboardData as DashboardData);
        if (Array.isArray(dashboardData.completed_quests) && dashboardData.completed_quests.length > 0) {
          const completedIds = dashboardData.completed_quests.map((q: any) =>
            q.quest_id === 'palancinkara' ? 'palacinkara' : q.quest_id
          );
          setUnlockedRewards((prev) => {
            const merged = Array.from(new Set([...prev, ...completedIds]));
            return merged.length !== prev.length ? merged : prev;
          });
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setDashboardError(err instanceof Error ? err.message : 'Unable to load profile.');
    } finally {
      setLoading(false);
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
    };
    void loadSavedData();
    void loadDashboard();
  }, [loadDashboard]);

  const handleClearLedger = async () => {
    setDashboardError('');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session && !session.user.is_anonymous) {
        setDashboardError('Quest progress for this signed-in account is stored online and cannot be reset from this device.');
        return;
      }

      if (session) {
        const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
        if (signOutError) throw signOutError;
      }

      await resetQuestProgress();
      setLedger([]);
      setShowClearConfirm(false);
      setData(null);
      setGuestId('');
      await loadDashboard();
    } catch (error) {
      console.error('[Quest progress] Unable to reset quest history:', error);
      setDashboardError(error instanceof Error ? error.message : 'Unable to reset quest progress.');
    }
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
          ? 'Tuzla Tour App je turistički vodič s mapom, informacijama o gradu i potragom Tuzla Quest. U Questu pratite lokacije na mapi i skenirate zvanične QR kodove da biste napredovali kroz dostupne zadatke i sadržaje.'
          : lang === 'de'
            ? 'Die Tuzla Tour App ist ein Reiseführer mit Karte, Stadtinformationen und der Tuzla Quest-Schnitzeljagd. Im Quest folgen Sie den Standorten auf der Karte und scannen offizielle QR-Codes, um verfügbare Aufgaben und Inhalte freizuschalten.'
            : lang === 'tr'
              ? 'Tuzla Tour App; harita, şehir bilgileri ve Tuzla Quest adlı QR keşif oyununu içeren bir turist rehberidir. Quest bölümünde haritadaki konumları takip edip resmi QR kodlarını tarayarak mevcut görevlerde ve içeriklerde ilerlersiniz.'
              : 'Tuzla Tour App is a city guide with a map, local information, and the Tuzla Quest QR exploration game. Follow the locations on the map and scan official QR codes to progress through available tasks and content.',
    },
    {
      id: 2,
      icon: <Compass className="h-5 w-5 text-sky-500" />,
      question:
        lang === 'bs'
          ? 'Kako pronaći lokaciju i koristiti navigaciju?'
          : lang === 'de'
            ? 'Wie finde ich einen Ort und nutze die Navigation?'
            : lang === 'tr'
              ? 'Bir konumu nasıl bulur ve navigasyonu nasıl kullanırım?'
              : 'How do I find a location and use navigation?',
      answer:
        lang === 'bs'
          ? 'Otvorite mapu i izaberite tačku interesa. Ako želite prikaz svoje pozicije ili rutu, dozvolite lokaciju kada je uređaj zatraži. Dostupnost rute zavisi od internet veze i mapnog servisa.'
          : lang === 'de'
            ? 'Öffnen Sie die Karte und wählen Sie einen Ort aus. Wenn Sie Ihre Position oder eine Route anzeigen möchten, erlauben Sie den Standortzugriff, wenn das Gerät danach fragt. Routen können eine Internetverbindung und einen Kartendienst benötigen.'
            : lang === 'tr'
              ? 'Haritayı açıp bir konum seçin. Konumunuzu veya rotayı görmek istiyorsanız cihaz istediğinde konum izni verin. Rota için internet bağlantısı ve harita hizmeti gerekebilir.'
              : 'Open the map and select a point of interest. Allow location access if you want to see your position or use a route. Routing may require an internet connection and a map service.',
    },
    {
      id: 3,
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      question:
        lang === 'bs'
          ? 'Zašto aplikacija traži dozvolu za lokaciju i kameru?'
          : lang === 'de'
            ? 'Warum fragt die App nach Standort- und Kameraberechtigungen?'
            : lang === 'tr'
              ? 'Uygulama neden konum ve kamera izni istiyor?'
              : 'Why does the app ask for location and camera permissions?',
      answer:
        lang === 'bs'
          ? 'Lokacija se koristi za mapu i navigaciju. Kamera se koristi za skeniranje Quest QR kodova. Tokom Quest provjere aplikacija može poslati dostupne koordinate serveru. Dozvole možete odbiti ili opozvati u postavkama uređaja; funkcije koje ih koriste tada neće raditi.'
          : lang === 'de'
            ? 'Der Standort wird für Karte und Navigation verwendet. Die Kamera dient zum Scannen von Quest-QR-Codes. Bei einer Quest-Prüfung kann die App verfügbare Koordinaten an den Server senden. Berechtigungen können Sie in den Geräteeinstellungen ablehnen oder widerrufen.'
            : lang === 'tr'
              ? 'Konum, harita ve navigasyon için kullanılır. Kamera Quest QR kodlarını taramak içindir. Quest doğrulaması sırasında uygulama mevcut koordinatları sunucuya gönderebilir. İzinleri cihaz ayarlarından reddedebilir veya iptal edebilirsiniz.'
              : 'Location is used for maps and navigation. The camera is used to scan Quest QR codes. Quest verification may send available coordinates to the server. You can deny or revoke permissions in your device settings; features that need them will then be unavailable.',
    },
    {
      id: 4,
      icon: <QrCode className="h-5 w-5 text-indigo-500" />,
      question:
        lang === 'bs'
          ? 'Kako skenirati QR kodove i osvojiti nagrade?'
          : lang === 'de'
            ? 'Wie scanne ich Quest-QR-Codes?'
            : lang === 'tr'
              ? 'Quest QR kodlarını nasıl tararım?'
              : 'How do I scan Quest QR codes?',
      answer:
        lang === 'bs'
          ? 'Otvorite tab „Napredak & QR“, pokrenite kameru i skenirajte zvanični Quest QR kod na lokaciji. Aplikacija pokušava provjeriti skeniranje; nakon uspješne provjere prikazuje otključani napredak i sadržaj koji je dostupan za tu lokaciju. Popusti nisu garantovani.'
          : lang === 'de'
            ? 'Öffnen Sie „Fortschritt & QR“, starten Sie die Kamera und scannen Sie den offiziellen Quest-QR-Code vor Ort. Nach erfolgreicher Prüfung zeigt die App den freigeschalteten Fortschritt und verfügbaren Inhalt an. Rabatte sind nicht garantiert.'
            : lang === 'tr'
              ? '„İlerleme & QR“ sekmesini açın, kamerayı başlatın ve konumdaki resmi Quest QR kodunu tarayın. Doğrulama başarılı olursa uygulama açılan ilerlemeyi ve konum için mevcut içeriği gösterir. İndirim garantisi yoktur.'
              : 'Open “Progress & QR,” start the camera, and scan the official Quest QR code at the location. If verification succeeds, the app shows unlocked progress and content available for that location. Discounts are not guaranteed.',
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
          ? 'Dio podataka i mapa može biti dostupan iz keša, a planer i bilješke koriste lokalnu pohranu. Navigacija, Quest provjera skeniranja, događaji i vanjski sadržaj mogu zahtijevati internet.'
          : lang === 'de'
            ? 'Einige Karten- und App-Daten können aus dem Cache verfügbar sein; Notizen und Reisepläne nutzen lokale Speicherung. Navigation, Quest-Prüfung, Veranstaltungen und externe Inhalte können eine Internetverbindung benötigen.'
            : lang === 'tr'
              ? 'Bazı harita ve uygulama verileri önbellekten kullanılabilir; notlar ve seyahat planı yerel depolamayı kullanır. Navigasyon, Quest doğrulaması, etkinlikler ve harici içerikler internet bağlantısı gerektirebilir.'
              : 'Some map and app data may be available from cache, while notes and itineraries use local storage. Navigation, Quest scan verification, events, and external content may require an internet connection.',
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
          ? 'Postavke, planer i bilješke mogu se čuvati lokalno na uređaju. Quest koristi pseudonimni Supabase gostujući identifikator, a provjera skeniranja može poslati ID zadatka, QR vrijednost i dostupne koordinate. Reset lokalne historije ne mora obrisati serverske zapise.'
          : lang === 'de'
            ? 'Einstellungen, Reiseplan und Notizen können lokal gespeichert werden. Quest verwendet eine pseudonyme Supabase-Gastkennung; bei der Scan-Prüfung können Aufgaben-ID, QR-Wert und verfügbare Koordinaten gesendet werden. Das Zurücksetzen des lokalen Verlaufs löscht nicht unbedingt Serverdaten.'
            : lang === 'tr'
              ? 'Ayarlar, seyahat planı ve notlar cihazda yerel olarak saklanabilir. Quest, takma adlı bir Supabase misafir kimliği kullanır; tarama doğrulaması görev kimliğini, QR değerini ve mevcut koordinatları gönderebilir. Yerel geçmişi sıfırlamak sunucu kayıtlarını mutlaka silmez.'
              : 'Settings, itineraries, and notes may be stored locally. Quest uses a pseudonymous Supabase guest identifier; scan verification may submit the task ID, QR value, and available coordinates. Resetting local history does not necessarily delete server records.',
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

        {dashboardError && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
            {dashboardError}
          </p>
        )}

        {/* ── 2. QR SCANNER CTA (UNIFIED SINGLE SCANNER ON QUEST MAP) ── */}
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
                  {lang === 'bs'
                    ? 'Skenirajte QR kodove direktno kroz interaktivnu mapu potrage'
                    : 'Scan QR codes directly inside the interactive quest map'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 text-center space-y-3 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl border border-blue-500/20 text-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                {lang === 'bs' ? 'Mapa potrage & Kompas' : 'Quest Map & Compass'}
              </h3>
              <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto">
                {lang === 'bs'
                  ? 'Pratite kompas, priđite unutar 25m od lokacije i skenirajte QR kod za osvajanje nagrade i prelazak u novu fazu!'
                  : 'Follow the compass, get within 25m of the location and scan the QR code to win rewards and advance!'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/quest')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-300 active:scale-95 transition-all"
            >
              <QrCode size={16} />
              <span>{lang === 'bs' ? 'Otvori Potragu & Skeniraj' : 'Open Quest & Scan'}</span>
            </button>
          </div>
        </section>

        {/* ── 3. TASKS (TODOS) ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Target className="h-5 w-5" />
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
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-900 active:scale-95"
                  >
                    <MapPin size={14} />
                    <span>{t.navigateBtn}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* All 12 POI objectives: completed locations are intentionally muted/darkened. */}
          <div className="mt-4">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-950">
                {lang === 'bs' ? 'Svih 12 lokacija' : lang === 'de' ? 'Alle 12 Orte' : lang === 'tr' ? '12 Konumun Tamamı' : 'All 12 Locations'}
              </h3>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-black tabular-nums text-blue-700">
                {QUEST_TARGETS.filter((poi) => isPoiRewardUnlocked(poi.id, unlockedRewards) || (data?.completed_quests || []).some((q) => q.quest_id === poi.id)).length}/12
                {' '}{lang === 'bs' ? 'otključano' : lang === 'de' ? 'entdeckt' : lang === 'tr' ? 'açıldı' : 'unlocked'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUEST_TARGETS.map((poi, index) => {
                const completed = isPoiRewardUnlocked(poi.id, unlockedRewards) ||
                  (data?.completed_quests || []).some((q) => q.quest_id === poi.id);
                const poiName = poi.name[lang] || poi.name.bs;
                const coordinates = QUEST_TARGET_COORDS[poi.id];
                return (
                  <div
                    key={poi.id}
                    className={`flex min-h-[62px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${completed
                      ? 'border-slate-300 bg-slate-200/90 text-slate-500 shadow-inner'
                      : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white text-blue-950 shadow-xs'
                      }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black tabular-nums ${completed ? 'bg-slate-400 text-white' : 'bg-gradient-to-br from-blue-600 to-blue-800 text-amber-300'
                      }`}>
                      {completed ? <CheckCircle2 size={17} /> : String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-xs font-extrabold leading-snug ${completed ? 'text-slate-600' : 'text-blue-950'
                        }`}>{poiName}</span>
                      <span className={`mt-0.5 block text-[10px] font-bold uppercase tracking-wide ${completed ? 'text-slate-500' : 'text-blue-600'
                        }`}>
                        {completed
                          ? (lang === 'bs' ? 'Otključano' : lang === 'de' ? 'Freigeschaltet' : lang === 'tr' ? 'Açıldı' : 'Unlocked')
                          : (lang === 'bs' ? 'Čeka na otkrivanje' : lang === 'de' ? 'Noch zu entdecken' : lang === 'tr' ? 'Keşfedilmeyi bekliyor' : 'Ready to discover')}
                      </span>
                    </span>
                    {onNavigateToTarget && coordinates && !completed && (
                      <button
                        type="button"
                        aria-label={`${lang === 'bs' ? 'Navigacija do' : 'Navigate to'} ${poiName}`}
                        onClick={() => onNavigateToTarget({ name: poiName, lat: coordinates.lat, lon: coordinates.lon })}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/70 bg-gradient-to-b from-yellow-300 to-amber-400 text-blue-950 shadow-sm transition-all active:scale-95"
                      >
                        <MapPin size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
                id: 'phase_1',
                phaseNumber: 1 as const,
                title: lang === 'bs' ? 'Čaršija' : 'Old Town',
                desc: lang === 'bs' ? 'Kapija, Trg slobode, Česma, Meša' : 'Kapija, Freedom Sq, Fountain, Meša',
                rewardHint: lang === 'bs' ? '🎁 3D Stara česma' : '🎁 3D Old Fountain',
                icon: '🏛️',
                accentColor: 'border-slate-300 bg-slate-100/70 hover:border-slate-400',
                badgeBg: 'bg-slate-500 text-white',
                unlocked: PHASE_1_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards)),
              },
              {
                id: 'phase_2',
                phaseNumber: 2 as const,
                title: lang === 'bs' ? 'Bosansko kraljevstvo' : 'Bosnian Kingdom',
                desc: lang === 'bs' ? 'Tvrtko park, Palačinkara, Solni trg' : 'Tvrtko Park, Crêperie, Salt Sq',
                rewardHint: lang === 'bs' ? '👑 3D Povelja Kulina bana' : '👑 3D Charter of Kulin Ban',
                icon: '👑',
                accentColor: 'border-green-300 bg-green-50/70 hover:border-green-400',
                badgeBg: 'bg-green-600 text-white',
                unlocked: PHASE_2_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards)),
              },
              {
                id: 'phase_3',
                phaseNumber: 3 as const,
                title: lang === 'bs' ? 'Panonski mornar' : 'Pannonian Sailor',
                desc: lang === 'bs' ? 'Panonika, Slapovi, Slana Banja, Atelje' : 'Panonika, Waterfalls, Banja, Atelier',
                rewardHint: lang === 'bs' ? '🎫 Digitalni vaučer' : '🎫 Digital Voucher',
                icon: '⛵',
                accentColor: 'border-sky-300 bg-sky-50/70 hover:border-sky-400',
                badgeBg: 'bg-sky-500 text-white',
                unlocked: PHASE_3_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards)),
              },
              {
                id: 'grand_finale',
                phaseNumber: null,
                title: lang === 'bs' ? 'Pobjednik Slanog Grada' : 'Salt City Winner',
                desc: lang === 'bs' ? 'Bingo City Center finale' : 'Bingo City Center finale',
                rewardHint: null,
                icon: '🏆',
                accentColor: 'border-red-300 bg-red-50/70',
                badgeBg: 'bg-red-600 text-white',
                unlocked: GRAND_FINALE_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards)),
              },
            ].map((badge) => (
              <div
                key={badge.id}
                onClick={() => {
                  if (badge.unlocked && badge.phaseNumber) {
                    setActivePhaseCelebration(badge.phaseNumber);
                  }
                }}
                className={`rounded-xl p-3 text-center border transition-all ${badge.unlocked
                  ? `${badge.accentColor} shadow-2xs ${badge.phaseNumber ? 'cursor-pointer active:scale-95' : ''}`
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
                {badge.unlocked && badge.rewardHint && (
                  <p className="text-[9px] font-bold text-amber-600 line-clamp-1 mt-1">
                    {badge.rewardHint}
                  </p>
                )}
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${badge.unlocked
                    ? badge.badgeBg
                    : 'bg-slate-200 text-slate-500'
                    }`}
                >
                  {badge.unlocked ? (lang === 'bs' ? 'Osvojeno · Pogledaj' : 'Unlocked · View') : (lang === 'bs' ? 'Zaključano' : 'Locked')}
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

        {/* ── 8. FAQ ACCORDION ── */}
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

        {/* ── 9. PARTNER AGENCIES AT BOTTOM ── */}
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
