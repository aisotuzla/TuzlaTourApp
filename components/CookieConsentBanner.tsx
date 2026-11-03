import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Settings, ShieldCheck } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

interface CookieConsentBannerProps {
  lang?: 'en' | 'bs' | 'de' | 'tr';
}

interface CookieConsentState {
  necessary: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
  showBanner: boolean;
  showSettings: boolean;
}

const COOKIE_CONSENT_KEY = 'tuzla_cookie_consent';
const COOKIE_CONSENT_VERSION = 'v1_202611';

// Translations
const translations: Record<string, any> = {
  en: {
    title: 'We Value Your Privacy',
    subtitle: 'We use cookies to enhance your experience',
    description: 'Cookies help us improve our app, provide analytics, and remember your preferences. We never sell your data.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    customize: 'Customize',
    save: 'Save Preferences',
    close: 'Close',
    settingsTitle: 'Cookie Settings',
    necessary: {
      title: 'Strictly Necessary',
      description: 'Essential for the app to function. Cannot be disabled.',
    },
    performance: {
      title: 'Performance & Analytics',
      description: 'Help us understand how you use the app (Google Analytics, Vercel Analytics).',
    },
    functional: {
      title: 'Functional',
      description: 'Remember your preferences (language, game progress).',
    },
    marketing: {
      title: 'Marketing',
      description: 'Currently not used. For future advertising features.',
    },
    learnMore: 'Learn More',
    cookiePolicy: 'Cookie Policy',
    privacyPolicy: 'Privacy Policy',
    poweredBy: 'Powered by',
    consentNote: 'You can change your preferences at any time in the footer.',
  },
  bs: {
    title: 'Poštujemo Vašu Privatnost',
    subtitle: 'Koristimo kolačiće za poboljšanje iskustva',
    description: 'Kolačići nam pomažu da unaprijedimo aplikaciju, pružimo analitiku i zapamtimo Vaše postavke. Nikada ne prodajemo Vaše podatke.',
    acceptAll: 'Prihvati Sve',
    rejectAll: 'Odbij Sve',
    customize: 'Prilagodi',
    save: 'Sačuvaj Postavke',
    close: 'Zatvori',
    settingsTitle: 'Postavke Kolačića',
    necessary: {
      title: 'Strogo Neophodni',
      description: 'Neophodni za funkcionalnost aplikacije. Ne mogu se isključiti.',
    },
    performance: {
      title: 'Performanse & Analitika',
      description: 'Pomažu nam da razumijemo kako koristite aplikaciju (Google Analytics, Vercel Analytics).',
    },
    functional: {
      title: 'Funkcionalni',
      description: 'Pamtimo Vaše postavke (jezik, napredak u igri).',
    },
    marketing: {
      title: 'Marketing',
      description: 'Trenutno se ne koriste. Za buduće oglašavanje.',
    },
    learnMore: 'Saznaj Više',
    cookiePolicy: 'Politika Kolačića',
    privacyPolicy: 'Politika Privatnosti',
    poweredBy: 'Pokreće',
    consentNote: 'Možete promijeniti postavke u bilo kojem trenutku u podnožju.',
  },
  de: {
    title: 'Wir respektieren Ihre Privatsphäre',
    subtitle: 'Wir verwenden Cookies zur Verbesserung Ihrer Erfahrung',
    description: 'Cookies helfen uns, unsere App zu verbessern, Analysen bereitzustellen und Ihre Präferenzen zu speichern. Wir verkaufen Ihre Daten niemals.',
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    customize: 'Anpassen',
    save: 'Einstellungen speichern',
    close: 'Schließen',
    settingsTitle: 'Cookie-Einstellungen',
    necessary: {
      title: 'Absolut notwendig',
      description: 'Unverzichtbar für die Funktionsfähigkeit der App. Kann nicht deaktiviert werden.',
    },
    performance: {
      title: 'Leistung & Analyse',
      description: 'Hilft uns zu verstehen, wie Sie die App nutzen (Google Analytics, Vercel Analytics).',
    },
    functional: {
      title: 'Funktional',
      description: 'Speichert Ihre Präferenzen (Sprache, Spielstand).',
    },
    marketing: {
      title: 'Marketing',
      description: 'Derzeit nicht verwendet. Für zukünftige Werbefunktionen.',
    },
    learnMore: 'Mehr erfahren',
    cookiePolicy: 'Cookie-Richtlinie',
    privacyPolicy: 'Datenschutzrichtlinie',
    poweredBy: 'Betrieben von',
    consentNote: 'Sie können Ihre Präferenzen jederzeit im Footer ändern.',
  },
  tr: {
    title: 'Gizliliğinize Önem Veriyoruz',
    subtitle: 'Deneyiminizi geliştirmek için çerez kullanıyoruz',
    description: 'Çerezler, uygulamamızı geliştirmemize, analiz sağlamamıza ve tercihlerinizi hatırlamamıza yardımcı olur. Verilerinizi asla satmayız.',
    acceptAll: 'Tümünü Kabul Et',
    rejectAll: 'Tümünü Reddet',
    customize: 'Özelleştir',
    save: 'Tercihleri Kaydet',
    close: 'Kapat',
    settingsTitle: 'Çerez Ayarları',
    necessary: {
      title: 'Zorunlu',
      description: 'Uygulamanın çalışması için gerekli. Devre dışı bırakılamaz.',
    },
    performance: {
      title: 'Performans & Analitik',
      description: 'Uygulamayı nasıl kullandığınızı anlamamıza yardımcı olur (Google Analytics, Vercel Analytics).',
    },
    functional: {
      title: 'Fonksiyonel',
      description: 'Tercihlerinizi hatırlar (dil, oyun ilerlemesi).',
    },
    marketing: {
      title: 'Pazarlama',
      description: 'Şu anda kullanılmıyor. Gelecekteki reklam özellikleri için.',
    },
    learnMore: 'Daha Fazla Bilgi',
    cookiePolicy: 'Çerez Politikası',
    privacyPolicy: 'Gizlilik Politikası',
    poweredBy: 'Tarafından Sağlanmaktadır',
    consentNote: 'Tercihlerinizi istediğiniz zaman altbilgide değiştirebilirsiniz.',
  },
};

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ lang = 'en' }) => {
  const t = translations[lang] || translations.en;
  
  const [state, setState] = useState<CookieConsentState>({
    necessary: true,
    performance: false,
    functional: false,
    marketing: false,
    showBanner: false,
    showSettings: false,
  });

  // Load saved consent
  useEffect(() => {
    const loadConsent = async () => {
      try {
        const { value } = await Preferences.get({ key: COOKIE_CONSENT_KEY });
        if (value) {
          const saved = JSON.parse(value);
          // Check if consent version matches
          if (saved.version === COOKIE_CONSENT_VERSION) {
            setState(prev => ({
              ...prev,
              necessary: true, // Always true
              performance: saved.performance || false,
              functional: saved.functional || false,
              marketing: saved.marketing || false,
              showBanner: false,
            }));
          } else {
            // Version mismatch, show banner for re-consent
            setState(prev => ({ ...prev, showBanner: true }));
          }
        } else {
          // No consent stored, show banner
          setState(prev => ({ ...prev, showBanner: true }));
        }
      } catch (error) {
        console.error('Error loading cookie consent:', error);
        setState(prev => ({ ...prev, showBanner: true }));
      }
    };

    // Check if we need to show the banner
    const checkIfBannerNeeded = async () => {
      // For web, check localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.version === COOKIE_CONSENT_VERSION) {
            setState(prev => ({
              ...prev,
              necessary: true,
              performance: parsed.performance || false,
              functional: parsed.functional || false,
              marketing: parsed.marketing || false,
              showBanner: false,
            }));
            return;
          }
        }
      }
      
      // For Capacitor, check Preferences
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        await loadConsent();
      } else {
        // Web environment
        loadConsent();
      }
    };

    checkIfBannerNeeded();
  }, [lang]);

  // Save consent
  const saveConsent = async (consent: Omit<CookieConsentState, 'showBanner' | 'showSettings'>) => {
    const consentData = {
      version: COOKIE_CONSENT_VERSION,
      necessary: true, // Always true
      performance: consent.performance,
      functional: consent.functional,
      marketing: consent.marketing,
      timestamp: new Date().toISOString(),
    };

    try {
      // Save to localStorage (web)
      if (typeof window !== 'undefined') {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
      }
      
      // Save to Capacitor Preferences (mobile)
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        await Preferences.set({ key: COOKIE_CONSENT_KEY, value: JSON.stringify(consentData) });
      }

      // Update state
      setState(prev => ({
        ...prev,
        ...consent,
        showBanner: false,
        showSettings: false,
      }));

      // Apply consent to tracking scripts
      applyConsent(consent);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  // Apply consent to tracking scripts
  const applyConsent = (consent: Omit<CookieConsentState, 'showBanner' | 'showSettings'>) => {
    // Google Analytics
    if (typeof window !== 'undefined') {
      if (consent.performance) {
        // Enable Google Analytics
        if ((window as any).gtag) {
          // Already loaded
        } else {
          // Load Google Analytics
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtag/js?id=G-988LD92552';
          script.onload = () => {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).gtag = function() {
              (window as any).dataLayer.push(arguments);
            };
            (window as any).gtag('js', new Date());
            (window as any).gtag('config', 'G-988LD92552', { anonymize_ip: true });
          };
          document.head.appendChild(script);
        }
      } else {
        // Disable Google Analytics
        if ((window as any).gtag) {
          (window as any).gtag('config', 'G-988LD92552', { send_page_view: false });
        }
      }
    }
  };

  // Handle accept all
  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      performance: true,
      functional: true,
      marketing: false,
    });
  };

  // Handle reject all (only non-necessary)
  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      performance: false,
      functional: false,
      marketing: false,
    });
  };

  // Handle customize
  const handleCustomize = () => {
    setState(prev => ({ ...prev, showSettings: true }));
  };

  // Handle save settings
  const handleSaveSettings = () => {
    saveConsent({
      necessary: true,
      performance: state.performance,
      functional: state.functional,
      marketing: state.marketing,
    });
  };

  // Toggle cookie category
  const toggleCategory = (category: keyof Omit<CookieConsentState, 'showBanner' | 'showSettings'>) => {
    if (category === 'necessary') return; // Cannot be disabled
    setState(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Close banner (without saving)
  const handleClose = () => {
    setState(prev => ({ ...prev, showBanner: false }));
  };

  if (!state.showBanner && !state.showSettings) {
    return null;
  }

  return (
    <AnimatePresence>
      {state.showBanner && !state.showSettings && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[2000] bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl"
        >
          {/* Banner Content */}
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-black text-blue-900 uppercase tracking-tight">
                    {t.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">
                    {t.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl">
                    {t.description}
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                aria-label={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCustomize}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t.customize}
              </button>
              
              <button
                onClick={handleRejectAll}
                className="px-4 py-2.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold text-sm sm:text-base transition-colors"
              >
                {t.rejectAll}
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {t.acceptAll}
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.poweredBy} Tuzla Tour App</span>
              </div>
              <div className="flex gap-4">
                <a href="/COOKIE_POLICY.md" className="hover:text-blue-600 transition-colors underline">
                  {t.cookiePolicy}
                </a>
                <a href="/PRIVACY_POLICY.md" className="hover:text-blue-600 transition-colors underline">
                  {t.privacyPolicy}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Modal */}
      {state.showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2001] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setState(prev => ({ ...prev, showSettings: false }))}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-3xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-white" />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {t.settingsTitle}
                </h2>
              </div>
              <button
                onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                {t.consentNote}
              </p>

              {/* Cookie Categories */}
              <div className="space-y-4">
                {/* Necessary */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={state.necessary}
                      disabled
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900">{t.necessary.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{t.necessary.description}</p>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => toggleCategory('performance')}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={state.performance}
                      readOnly
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900">{t.performance.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{t.performance.description}</p>
                    </div>
                  </div>
                </div>

                {/* Functional */}
                <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => toggleCategory('functional')}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={state.functional}
                      readOnly
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900">{t.functional.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{t.functional.description}</p>
                    </div>
                  </div>
                </div>

                {/* Marketing */}
                <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => toggleCategory('marketing')}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={state.marketing}
                      readOnly
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900">{t.marketing.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{t.marketing.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  {t.close}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold transition-colors"
                >
                  {t.rejectAll}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {t.save}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 flex gap-4 text-xs text-slate-500">
              <a href="/COOKIE_POLICY.md" className="hover:text-blue-600 transition-colors underline">
                {t.cookiePolicy}
              </a>
              <a href="/PRIVACY_POLICY.md" className="hover:text-blue-600 transition-colors underline">
                {t.privacyPolicy}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to check consent for a specific category
const checkCookieConsent = async (category: 'performance' | 'functional' | 'marketing'): Promise<boolean> => {
  try {
    // Check localStorage first (web)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === COOKIE_CONSENT_VERSION) {
          return parsed[category] || false;
        }
      }
    }
    
    // Check Capacitor Preferences (mobile)
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const { value } = await Preferences.get({ key: COOKIE_CONSENT_KEY });
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed.version === COOKIE_CONSENT_VERSION) {
          return parsed[category] || false;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking cookie consent:', error);
    return false;
  }
};

// Helper function to check if any consent was given
const hasCookieConsent = async (): Promise<boolean> => {
  try {
    // Check localStorage first (web)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.version === COOKIE_CONSENT_VERSION;
      }
    }
    
    // Check Capacitor Preferences (mobile)
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const { value } = await Preferences.get({ key: COOKIE_CONSENT_KEY });
      if (value) {
        const parsed = JSON.parse(value);
        return parsed.version === COOKIE_CONSENT_VERSION;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking cookie consent:', error);
    return false;
  }
};

export default CookieConsentBanner;
export { checkCookieConsent, hasCookieConsent, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION };
