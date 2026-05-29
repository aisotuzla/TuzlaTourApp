import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import SecurityGuard from './components/SecurityGuard';
import LanguageSelector from './components/LanguageSelector';

const MapView = React.lazy(() => import('./components/MapView'));
const MapQuestView = React.lazy(() => import('./components/MapQuestView'));
const History = React.lazy(() => import('./components/History'));
const CityGuide = React.lazy(() => import('./components/CityGuide'));
const Gallery = React.lazy(() => import('./components/Gallery'));
const Wallet = React.lazy(() => import('./components/Wallet'));
const TaskManager = React.lazy(() => import('./components/TaskManager'));
const Food = React.lazy(() => import('./components/Food'));
const Accommodation = React.lazy(() => import('./components/Accommodation'));
const ARGuide = React.lazy(() => import('./components/ARGuide'));
const Parking = React.lazy(() => import('./components/Parking'));
const WorldCup2026 = React.lazy(() => import('./components/WorldCup2026'));
const SpecialCollection = React.lazy(() => import('./components/SpecialCollection'));

import { Menu, QrCode, Globe } from 'lucide-react';
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

  // Performance: Hide splash screen once React is ready
  useEffect(() => {
    const splash = document.getElementById('app-splash');
    if (splash) {
      // Small timeout to ensure the first React frame is rendered
      const timeout = setTimeout(() => {
        splash.classList.add('fade-out');
        // Remove from DOM after transition completes (matching 0.5s CSS)
        setTimeout(() => splash.remove(), 500);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, []);

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
            case AppTab.WORLD_CUP_2026: return <WorldCup2026 lang={lang} onBack={() => setActiveTab(AppTab.LANDING)} />;
            case AppTab.SPECIAL_COLLECTION: return <SpecialCollection lang={lang} onBack={() => setActiveTab(AppTab.LANDING)} />;
            case AppTab.TRAVEL_AGENCIES:
              return (
                <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Globe className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                      {lang === 'bs' ? 'PUTNIČKE AGENCIJE' : 'TRAVEL AGENCIES'}
                    </h1>
                    <p className="text-slate-500 mb-8 font-medium">
                      {lang === 'bs' 
                        ? 'Istražite najbolje ponude i destinacije naših partnerskih agencija.' 
                        : 'Explore the best offers and destinations from our partner agencies.'}
                    </p>
                    <button 
                      onClick={() => window.open('https://travelagency-icptuzla.wasmer.app/', '_blank')}
                      className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      {lang === 'bs' ? 'OTVORI STRANICU' : 'OPEN WEBSITE'}
                    </button>
                  </div>
                </div>
              );

            default: return <LandingPage lang={lang} onNavigate={navigateToTab} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <ImageProvider>

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
            <Menu className="w-8 h-8 text-blue-900 transition-transform group-hover:scale-110" />
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
    </ImageProvider>
  );
};

export default App;
