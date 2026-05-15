import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from "@vercel/analytics/react";
const Sidebar = lazy(() => import('./components/Sidebar'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const MapView = lazy(() => import('./components/MapView'));
const MapQuestView = lazy(() => import('./components/MapQuestView'));
const History = lazy(() => import('./components/History'));
const CityGuide = lazy(() => import('./components/CityGuide'));
const Gallery = lazy(() => import('./components/Gallery'));
const Wallet = lazy(() => import('./components/Wallet'));
const SecurityGuard = lazy(() => import('./components/SecurityGuard'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const Food = lazy(() => import('./components/Food'));
const Accommodation = lazy(() => import('./components/Accommodation'));
const ARGuide = lazy(() => import('./components/ARGuide'));
const Parking = lazy(() => import('./components/Parking'));
const WorldCup2026 = lazy(() => import('./components/WorldCup2026'));
const LanguageSelector = lazy(() => import('./components/LanguageSelector'));

import { Menu, QrCode } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AppTab, Language } from './types';
import { Preferences } from '@capacitor/preferences';
import { ImageProvider } from './hooks/ImageContext';
import FullScreenImageViewer from './components/FullScreenImageViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { getAppFeatures } from './utils/platform';
import ReloadPrompt from './components/ReloadPrompt';
import OfflineIndicator from './components/OfflineIndicator';

// TON Connect Imports
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Sui Connect is removed
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <TonConnectUIProvider manifestUrl="https://tuzla-tour-guide.vercel.app/tonconnect-manifest.json">
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LANDING);
  const [lang, setLang] = useState<Language>('bs');
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const [navigationTarget, setNavigationTarget] = useState<any | null>(null);
  const [autoOpenScanner, setAutoOpenScanner] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [history, setHistory] = useState<AppTab[]>([AppTab.LANDING]);
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
  const features = getAppFeatures();

  // Automatically open sidebar after 40 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDrawerOpen(true);
    }, 40000); // 40 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadUnlocked = async () => {
      const { value } = await Preferences.get({ key: 'tuzla_unlocked' });
      if (value) {
        try {
          setUnlockedRewards(JSON.parse(value));
        } catch {
          setUnlockedRewards(['mesa_selimovic']);
        }
      } else {
        setUnlockedRewards(['mesa_selimovic']);
      }
    };
    loadUnlocked();
  }, []);

  useEffect(() => {
    Preferences.set({ key: 'tuzla_unlocked', value: JSON.stringify(unlockedRewards) });
  }, [unlockedRewards]);

  const navigateToTab = (tab: AppTab, options?: { openScanner?: boolean }) => {
    if (tab !== activeTab) {
      setHistory(prev => [...prev, tab]);
      setActiveTab(tab);
    }
    if (options?.openScanner) {
      setAutoOpenScanner(true);
    } else {
      setAutoOpenScanner(false);
    }

    // Reset wallet unlock when leaving wallet tab (optional, depends on user preference)
    // For now we keep it session based within the current app life
    // But we could lock it if tab changes:
    // if (activeTab === AppTab.WALLET && tab !== AppTab.WALLET) setIsWalletUnlocked(false);

    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const handleBackButton = async () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return;
      }

      if (history.length > 1) {
        const newHistory = [...history];
        newHistory.pop(); // Remove current
        const previousTab = newHistory[newHistory.length - 1];
        setHistory(newHistory);
        setActiveTab(previousTab);
      } else {
        // We are at the root (Landing Page)
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
  }, [history, isDrawerOpen, lang]);



  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-blue-900 font-black uppercase text-xs tracking-widest animate-pulse">
            {lang === 'en' ? 'Loading Tuzla...' : 'Učitavanje...'}
          </p>
        </div>
      }>
        {(() => {
          switch (activeTab) {
            case AppTab.LANDING: return <LandingPage lang={lang} onNavigate={navigateToTab} />;
            case AppTab.CITY_GUIDE: return <CityGuide lang={lang} />;
            case AppTab.HISTORY: return <History lang={lang} />;
            case AppTab.MAP: return (
              <MapView
                lang={lang}
                features={features}
              />
            );
            case AppTab.QUEST: return (
              <MapQuestView
                lang={lang}
                features={features}
                unlockedRewards={unlockedRewards}
                onRewardFound={(id) =>
                  setUnlockedRewards((prev) => (prev.includes(id) ? prev : [...prev, id]))
                }
                onToggleAR={() => setActiveTab(AppTab.AR)}
                navigationTarget={navigationTarget}
                onClearNavigation={() => setNavigationTarget(null)}
                initialOpenScanner={autoOpenScanner}
              />
            );
            case AppTab.GALLERY: return <Gallery lang={lang} features={features} />;
            case AppTab.WALLET: return (
              <SecurityGuard
                lang={lang}
                isUnlocked={isWalletUnlocked}
                onUnlock={() => setIsWalletUnlocked(true)}
              >
                <Wallet lang={lang} />
              </SecurityGuard>
            );
            case AppTab.TASK_MANAGER: return <TaskManager lang={lang} />;
            case AppTab.FOOD: return <Food lang={lang} />;
            case AppTab.ACCOMMODATION: return <Accommodation lang={lang} />;
            case AppTab.AR: return (
              <ARGuide
                lang={lang}
                features={features}
                onNavigate={(poi) => {
                  setNavigationTarget(poi);
                  setActiveTab(AppTab.MAP);
                }}
              />
            );
            case AppTab.PARKING: return <Parking lang={lang} />;

            default: return <LandingPage lang={lang} onNavigate={navigateToTab} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <ImageProvider>
      <Analytics />
      <ReloadPrompt />
      <OfflineIndicator lang={lang} />

      {/* Modern Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-[88px] bg-white/80 backdrop-blur-md z-[80] border-b border-slate-100 flex items-center justify-between px-3 sm:px-6 shadow-sm">
        {/* LEFT: Menu Button & Logo */}
        <div className="flex items-center z-10 w-20">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center p-1 bg-transparent border-none transition-all active:scale-95 group focus:outline-none"
          >
            <motion.img
              animate={{
                y: [0, -12, 0, -12, 0, 0, 0, 0],
                rotate: [0, 0, 0, 0, 0, 360, 360, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.7, 0.85, 1],
              }}
              src="/assets/Gallery/QuestQRLocations/TuzlaMenuLogo.png"
              alt="Menu Logo"
              className="w-[60px] sm:h-[60px] object-contain transition-transform group-hover:scale-110"
            />
          </button>
        </div>

        {/* CENTER: App Title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-0 w-[55%] sm:w-auto pointer-events-none">
          <h1 className="text-[4.5vw] sm:text-xl lg:text-2xl font-black tracking-tight leading-none uppercase flex flex-row flex-wrap sm:flex-nowrap justify-center items-center gap-1 sm:gap-1.5 text-center">
            <span className="text-blue-900">Tuzla</span>
            <span className="text-blue-500">Tour</span>
            <span className="text-amber-500">Guide</span>
          </h1>
        </div>

        {/* RIGHT: Utility controls */}
        <div className="flex items-center justify-end z-10 w-20">
          <LanguageSelector currentLang={lang} onSelect={setLang} />
        </div>
      </header>

      {/* SVG Filter to remove black background from logos */}
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

      <div className="relative min-h-screen bg-white flex overflow-hidden pt-[88px]">
        {/* Main Sliding Drawer */}
        <Sidebar
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={navigateToTab}
          lang={lang}
        />

        <div
          className="flex-1 flex flex-col min-h-[calc(100vh-64px)] overflow-hidden"
          style={{
            filter: isDrawerOpen ? 'blur(4px)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <FullScreenImageViewer />
      {/* Floating QR Scan Button (Formerly AI Assistant position) */}
      <motion.button
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-[90] bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-white/20 active:scale-95 transition-transform"
        whileHover={{ scale: 1.1 }}
        onClick={() => navigateToTab(AppTab.QUEST, { openScanner: true })}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        title={lang === 'bs' ? 'Skeniraj QR' : 'Scan QR'}
      >
        <QrCode size={28} />
      </motion.button>
    </ImageProvider>
  );
};

export default App;
