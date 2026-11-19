import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

interface CookieConsentBannerProps {
  lang?: 'en' | 'bs' | 'de' | 'tr';
  onConsentChange?: (performance: boolean) => void;
}

interface SavedConsent {
  version: string;
  necessary: true;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = 'tuzla_cookie_consent';
const COOKIE_CONSENT_VERSION = 'v2_202611';

const readStoredConsent = async (): Promise<SavedConsent | null> => {
  const { value } = Capacitor.isNativePlatform()
    ? await Preferences.get({ key: COOKIE_CONSENT_KEY })
    : { value: typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_CONSENT_KEY) : null };

  if (!value) return null;

  try {
    const saved = JSON.parse(value) as SavedConsent;
    return saved.version === COOKIE_CONSENT_VERSION ? saved : null;
  } catch (error) {
    console.warn('[CookieConsent] Stored consent could not be parsed:', error);
    return null;
  }
};

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  lang = 'en',
  onConsentChange,
}) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let active = true;

    const loadConsent = async () => {
      try {
        const consent = await readStoredConsent();
        if (!active) return;

        onConsentChange?.(consent?.performance ?? false);
        setShowBanner(lang === 'bs' && !consent);
      } catch (error) {
        console.error('[CookieConsent] Unable to load saved consent:', error);
        if (active) {
          onConsentChange?.(false);
          setShowBanner(lang === 'bs');
        }
      }
    };

    void loadConsent();
    return () => {
      active = false;
    };
  }, [lang, onConsentChange]);

  const saveConsent = async (performance: boolean) => {
    const consent: SavedConsent = {
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      performance,
      functional: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    const value = JSON.stringify(consent);

    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key: COOKIE_CONSENT_KEY, value });
      } else {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
      }

      onConsentChange?.(performance);
      setShowBanner(false);
    } catch (error) {
      console.error('[CookieConsent] Unable to save consent:', error);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && lang === 'bs' && (
        <motion.aside
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-label="Postavke kolačića"
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[2000] border-t border-slate-200 bg-white/95 px-3 pt-2.5 shadow-[0_-4px_18px_rgba(15,23,42,0.12)] backdrop-blur-md"
          style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
              <p className="text-[11px] leading-4 text-slate-700">
                Koristimo neophodne kolačiće za rad aplikacije. Opcionalna analitika nam pomaže da je unaprijedimo.{' '}
                <a href="/COOKIE_POLICY.md" className="font-semibold text-blue-700 underline underline-offset-2">
                  Više informacija
                </a>
              </p>
            </div>
            <div className="flex shrink-0 gap-2 pl-6 sm:pl-0">
              <button
                type="button"
                onClick={() => void saveConsent(false)}
                className="min-h-8 rounded-lg border border-slate-300 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Samo neophodni
              </button>
              <button
                type="button"
                onClick={() => void saveConsent(true)}
                className="min-h-8 rounded-lg bg-blue-700 px-2.5 text-[11px] font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Dozvoli analitiku
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const checkCookieConsent = async (category: 'performance' | 'functional' | 'marketing'): Promise<boolean> => {
  try {
    return (await readStoredConsent())?.[category] ?? false;
  } catch (error) {
    console.error('[CookieConsent] Unable to check consent:', error);
    return false;
  }
};

const hasCookieConsent = async (): Promise<boolean> => {
  try {
    return Boolean(await readStoredConsent());
  } catch (error) {
    console.error('[CookieConsent] Unable to check saved consent:', error);
    return false;
  }
};

export default CookieConsentBanner;
export { checkCookieConsent, hasCookieConsent, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION };
