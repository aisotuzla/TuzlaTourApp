import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Menu } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
import { Analytics } from "@vercel/analytics/react"
import CookieConsentBanner from './components/CookieConsentBanner';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LanguageSelector from './components/LanguageSelector';
import FullScreenImageViewer from './components/FullScreenImageViewer';
import ErrorBoundary from './components/ErrorBoundary';
import ReloadPrompt from './components/ReloadPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import MapQuestView from "./components/MapQuestView";
import { AppTab } from './types';
import { supabase } from './lib/supabaseClient';
import { QUEST_TARGETS } from './constants/questData';
import { ImageProvider } from './hooks/ImageContext';
import { GlobalAppProvider, useGlobalApp } from './contexts/GlobalAppContext';
import { AudioGuideProvider, useAudioGuide } from './contexts/AudioGuideContext';
import AudioControlBar from './components/AudioControlBar';
import { useDraggablePopups } from './hooks/useDraggablePopups';
import { useGeolocationWatcher } from './hooks/useGeolocationWatcher';
import { useGeofenceNotifications } from './hooks/useGeofenceNotifications';
import { SpeedInsights } from "@vercel/speed-insights/react"
import ARGuide from './components/ARGuide';
import { TvrtkoScratchCardModal } from './components/TvrtkoScratchCardModal';
import { KulinCharterModal } from './components/KulinCharterModal';

const KULIN_BAN_STONE_COORDS = { lat: 44.538791, lon: 18.678778 };

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MapView = React.lazy(() => import('./components/MapView'));
const History = React.lazy(() => import('./components/History'));
const CityGuide = React.lazy(() => import('./components/CityGuide'));
const Transportation = React.lazy(() => import('./components/Transportation'));
const PlayerDashboard = React.lazy(() => import('./components/PlayerDashboard'));
const TaskManager = React.lazy(() => import('./components/TaskManager'));
const Food = React.lazy(() => import('./components/Food'));
const Accommodation = React.lazy(() => import('./components/Accommodation'));
const getTabFromPath = (path: string): AppTab => {
  switch (path) {
    case '/': return AppTab.LANDING;
    case '/city-guide': return AppTab.CITY_GUIDE;
    case '/history': return AppTab.HISTORY;
    case '/transportation': return AppTab.TRANSPORTATION;
    case '/map': return AppTab.MAP;
    case '/quest': return AppTab.QUEST;
    case '/dashboard': return AppTab.QR_SCAN;
    case '/admin': return AppTab.QR_SCAN;
    case '/qr-scan': return AppTab.QR_SCAN;
    case '/task-manager': return AppTab.TASK_MANAGER;
    case '/food': return AppTab.FOOD;
    case '/accommodation': return AppTab.ACCOMMODATION;
    case '/ar': return AppTab.AR;
    default: return AppTab.LANDING;
  }
};

const getPathFromTab = (tab: AppTab): string => {
  switch (tab) {
    case AppTab.LANDING: return '/';
    case AppTab.CITY_GUIDE: return '/city-guide';
    case AppTab.HISTORY: return '/history';
    case AppTab.TRANSPORTATION: return '/transportation';
    case AppTab.MAP: return '/map';
    case AppTab.QUEST: return '/quest';
    case AppTab.QR_SCAN: return '/qr-scan';
    case AppTab.TASK_MANAGER: return '/task-manager';
    case AppTab.FOOD: return '/food';
    case AppTab.ACCOMMODATION: return '/accommodation';
    case AppTab.AR: return '/ar';
    default: return '/';
  }
};

const AppContent: React.FC = () => {
  const {
    lang,
    setLang,
    features,
    unlockedRewards,
    setUnlockedRewards,
    isTvrtkoScratchOpen,
    setIsTvrtkoScratchOpen,
    isKulinCharterCubeOpen,
    setIsKulinCharterCubeOpen,
  } = useGlobalApp();
  const {
    currentNarration,
    isPlaying,
    isPaused,
    isMuted,
    playNarration,
    pauseNarration,
    resumeNarration,
    stopNarration,
    toggleMute,
    disableAudioGuide
  } = useAudioGuide();
  const navigate = useNavigate();
  const location = useLocation();
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const isLocationTab = location.pathname === '/map' || location.pathname === '/quest';
  useDraggablePopups();

  const { position: userGps } = useGeolocationWatcher({
    enabled: isLocationTab,
    requestPermission: isLocationTab,
  });
  useGeofenceNotifications({ userPosition: userGps, lang, enabled: true });

  const hasAutoOpenedCharterRef = useRef(false);

  // Automatically open 3D Charter of Kulin Ban HTML when user reaches coordinates 44.538791, 18.678778
  useEffect(() => {
    if (!userGps) return;
    const dist = getDistanceMeters(
      userGps.lat,
      userGps.lng,
      KULIN_BAN_STONE_COORDS.lat,
      KULIN_BAN_STONE_COORDS.lon
    );

    if (dist <= 20 && !hasAutoOpenedCharterRef.current) {
      hasAutoOpenedCharterRef.current = true;
      setIsKulinCharterCubeOpen(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (_) { }
      }
    }
  }, [userGps, setIsKulinCharterCubeOpen]);

  const activeTab = getTabFromPath(location.pathname);
  const [navigationTarget, setNavigationTarget] = useState<any | null>(null);
  const [autoOpenScanner, setAutoOpenScanner] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  const completeQuest = async (
    questId: string,
    qrPayload: string,
    position: { lat: number; lon: number } | null
  ): Promise<{ ok: boolean; code?: string; xp_awarded?: number; xp_total?: number; level?: number }> => {
    try {
      let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously({
          options: { data: { display_name: lang === 'bs' ? 'Gost istraživač' : 'Guest explorer' } }
        });
        if (signInError) throw signInError;
        sessionData = { session: signInData.session, user: signInData.user } as typeof sessionData;
      }

      if (!sessionData.session?.user) return { ok: false, code: 'auth_required' };

      const { data, error } = await (supabase as any).rpc('complete_tuzla_quest', {
        p_quest_id: questId,
        p_qr_payload: qrPayload,
        p_lat: position?.lat ?? null,
        p_lon: position?.lon ?? null
      });
      if (error) throw error;

      if (data?.ok) {
        setUnlockedRewards((previous) => previous.includes(questId) ? previous : [...previous, questId]);
      }
      return data || { ok: false, code: 'empty_response' };
    } catch (error) {
      console.error('[Quest] Secure completion failed:', error);
      const message = error instanceof Error ? error.message : 'quest_completion_failed';
      return { ok: false, code: message.toLowerCase().includes('anonymous') ? 'anonymous_sign_in_disabled' : 'quest_completion_failed' };
    }
  };

  const navigateToTab = (tab: AppTab, options?: { openScanner?: boolean }) => {
    const path = getPathFromTab(tab);
    if (location.pathname !== path) {
      navigate(path);
    }
    setAutoOpenScanner(options?.openScanner || false);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const handleBackButton = async () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return;
      }

      if (location.pathname !== '/') {
        navigate(-1);
      } else {
        const confirmed = window.confirm(lang === 'bs' ? 'Da li želite izaći iz aplikacije?' : 'Would you like to exit app?');
        if (confirmed) {
          CapApp.exitApp();
        }
      }
    };

    if (Capacitor.getPlatform() === 'web') return;

    const registration = CapApp.addListener('backButton', handleBackButton);

    return () => {
      registration.then(r => r.remove()).catch(() => { });
    };
  }, [isDrawerOpen, lang, location.pathname, navigate]);

  useEffect(() => {
    (window as any).playPoiAudio = (poiId: string, poiTitle: string, audioUrl?: string) => {
      const target = QUEST_TARGETS.find(t => t.id === poiId);
      const audioSrc = audioUrl || target?.audio;
      if (!audioSrc) return;
      if (currentNarration?.id === poiId && isPlaying) {
        pauseNarration();
        return;
      }
      playNarration({
        id: poiId,
        title: poiTitle,
        text: '',
        lang,
        audioSrc
      });
    };

    (window as any).openQRScan = () => {
      navigate('/qr-scan');
    };

    (window as any).openTvrtkoScratch = () => {
      setIsTvrtkoScratchOpen(true);
    };

    (window as any).openKulinCharter = () => {
      setIsKulinCharterCubeOpen(true);
    };

    return () => {
      delete (window as any).playPoiAudio;
      delete (window as any).openQRScan;
      delete (window as any).openTvrtkoScratch;
      delete (window as any).openKulinCharter;
    };
  }, [lang, currentNarration, isPlaying, playNarration, pauseNarration, navigate]);

  return (
    <ImageProvider>
      <ReloadPrompt />
      <OfflineIndicator lang={lang} />
      <CookieConsentBanner lang={lang} onConsentChange={setAnalyticsConsent} />
      {analyticsConsent && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}

      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[80] border-b border-slate-100 flex items-center justify-between px-3 sm:px-6 shadow-sm" style={{ height: 'calc(58px + env(safe-area-inset-top, 0px))', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center z-10 w-16 sm:w-20">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center p-0.7 bg-transparent border-none transition-all active:scale-95 group focus:outline-none"
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7 text-blue-900 transition-transform group-hover:scale-110" />
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-900 mt-0.5">Menu</span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-0 w-[55%] sm:w-auto pointer-events-none">
          <h1 className="text-[4vw] sm:text-xl lg:text-2xl font-black tracking-tight leading-none uppercase flex flex-row flex-wrap sm:flex-nowrap justify-center items-center gap-1 sm:gap-1.5 text-center">
            <span className="text-blue-900">Tuzla</span>
            <span className="text-blue-500">Tour</span>
            <span className="text-amber-500">Guide</span>
          </h1>
        </div>

        <div className="flex items-center justify-end z-10 w-16 sm:w-20">
          <LanguageSelector currentLang={lang} onSelect={setLang} />
        </div>
      </header>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="remove-black-background" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            1 1 1 0 -0.05
          " />
        </filter>
      </svg>

      <div className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-white flex overflow-hidden" style={{ paddingTop: 'calc(58px + env(safe-area-inset-top, 0px))' }}>
        <Sidebar
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={navigateToTab}
          lang={lang}
        />

        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            height: 'calc(100dvh - 58px - env(safe-area-inset-top, 0px))',
            minHeight: 'calc(100dvh - 58px - env(safe-area-inset-top, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain flex flex-col"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
          >
            <ErrorBoundary>
              <Suspense fallback={
                <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-blue-900 font-black uppercase text-xs tracking-widest animate-pulse">
                    {lang === 'en' ? 'Loading Tuzla...' : 'Učitavanje...'}
                  </p>
                </div>
              }>
                <Routes>
                    <Route path="/" element={<LandingPage lang={lang} onNavigate={navigateToTab} />} />
                    <Route path="/city-guide" element={<CityGuide lang={lang} />} />
                    <Route path="/history" element={<History lang={lang} />} />
                    <Route path="/transportation" element={<Transportation lang={lang} />} />
                    <Route path="/map" element={
                      <MapView
                        lang={lang}
                        features={features}
                        unlockedRewards={unlockedRewards}
                        navigationTarget={navigationTarget}
                        onClearNavigation={() => setNavigationTarget(null)}
                      />
                    } />
                    <Route path="/quest" element={
                      <MapQuestView
                        lang={lang}
                        features={features}
                        unlockedRewards={unlockedRewards}
                        onRewardFound={completeQuest}
                        navigationTarget={navigationTarget}
                        onClearNavigation={() => setNavigationTarget(null)}
                        initialOpenScanner={autoOpenScanner}
                      />
                    } />
                    <Route path="/dashboard" element={<Navigate to="/qr-scan" replace />} />
                    <Route path="/qr-scan" element={
                      <PlayerDashboard
                        lang={lang}
                        onNavigateToTarget={(target) => {
                          setNavigationTarget(target);
                          navigateToTab(AppTab.QUEST);
                        }}
                      />
                    } />
                    <Route path="/admin" element={<Navigate to="/qr-scan" replace />} />
                    <Route path="/task-manager" element={<TaskManager lang={lang} />} />
                    <Route
                      path="/food"
                      element={
                        <Food
                          lang={lang}
                          onNavigateToTarget={(target) => {
                            setNavigationTarget(target);
                            navigateToTab(AppTab.MAP);
                          }}
                        />
                      }
                    />
                    <Route path="/accommodation" element={<Accommodation lang={lang} />} />
                    <Route path="/ar" element={
                      <ARGuide
                        lang={lang}
                        features={features}
                        unlockedRewards={unlockedRewards}
                        onRewardFound={completeQuest}
                        initialTarget={navigationTarget}
                        onNavigate={(poi) => {
                          setNavigationTarget(poi);
                          navigateToTab(AppTab.MAP);
                        }}
                      />
                    } />

                  </Routes>
                </Suspense>
              </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Floating Global Audio Control Bar */}
      {currentNarration && (
        <AudioControlBar
          lang={lang}
          title={currentNarration.title}
          isPlaying={isPlaying}
          isPaused={isPaused}
          isMuted={isMuted}
          onPlay={resumeNarration}
          onPause={pauseNarration}
          onResume={resumeNarration}
          onStop={stopNarration}
          onToggleMute={toggleMute}
          onDisableAudioGuide={disableAudioGuide}
          onClose={stopNarration}
        />
      )}

      <FullScreenImageViewer />
      {/* King Tvrtko Celebration & Scratch Card Modal */}
      <TvrtkoScratchCardModal
        isOpen={isTvrtkoScratchOpen}
        onClose={() => setIsTvrtkoScratchOpen(false)}
        lang={lang}
        onNavigateToStone={() => {
          setNavigationTarget({
            name: lang === 'bs' ? 'Spomen-ploča Povelja Kulina bana' : 'Charter of Kulin Ban Stone',
            lat: KULIN_BAN_STONE_COORDS.lat,
            lon: KULIN_BAN_STONE_COORDS.lon,
          });
          navigateToTab(AppTab.QUEST);
        }}
      />

      {/* 3D Charter of Kulin Ban Cube Modal (Autoplays on coords 44.538791, 18.678778) */}
      <KulinCharterModal
        isOpen={isKulinCharterCubeOpen}
        onClose={() => setIsKulinCharterCubeOpen(false)}
        lang={lang}
      />
    </ImageProvider>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalAppProvider>
        <AudioGuideProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </BrowserRouter>
        </AudioGuideProvider>
      </GlobalAppProvider>
    </QueryClientProvider>
  );
};

export default App;
