import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

interface CookieConsentBannerProps {
  lang?: 'en' | 'bs' | 'de' | 'tr';
}

const COOKIE_CONSENT_KEY = 'tuzla_cookie_consent';
const COOKIE_CONSENT_VERSION = 'v2_20261116';

const messages: Record<string, { title: string; body: string; dismiss: string; privacy: string }> = {
  en: {
    title: 'A quick privacy note',
    body: 'We use essential storage for app settings. Vercel Analytics is cookieless and Speed Insights measures performance. No Google tracking or advertising cookies.',
    dismiss: 'Got it',
    privacy: 'Privacy & cookies',
  },
  bs: {
    title: 'Kratka obavijest o privatnosti',
    body: 'Koristimo neophodnu pohranu za postavke aplikacije. Vercel Analytics ne koristi kolačiće, a Speed Insights mjeri performanse. Nema Google praćenja ni reklamnih kolačića.',
    dismiss: 'U redu',
    privacy: 'Privatnost i kolačići',
  },
  de: {
    title: 'Kurzer Datenschutzhinweis',
    body: 'Wir verwenden notwendige Speicherung für App-Einstellungen. Vercel Analytics verwendet keine Cookies; Speed Insights misst die Leistung. Kein Google-Tracking und keine Werbe-Cookies.',
    dismiss: 'Verstanden',
    privacy: 'Datenschutz & Cookies',
  },
  tr: {
    title: 'Kısa gizlilik bildirimi',
    body: 'Uygulama ayarları için gerekli depolamayı kullanıyoruz. Vercel Analytics çerez kullanmaz; Speed Insights performansı ölçer. Google takibi veya reklam çerezleri yoktur.',
    dismiss: 'Anladım',
    privacy: 'Gizlilik ve çerezler',
  },
};

const readNotice = async (): Promise<string | null> => {
  try {
    const localValue = typeof window !== 'undefined'
      ? window.localStorage.getItem(COOKIE_CONSENT_KEY)
      : null;
    if (localValue) return localValue;

    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: COOKIE_CONSENT_KEY });
      return value;
    }
  } catch (error) {
    console.warn('Unable to read privacy notice preference:', error);
  }
  return null;
};

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ lang = 'en' }) => {
  const [showBanner, setShowBanner] = useState(false);
  const t = messages[lang] || messages.en;

  useEffect(() => {
    let active = true;
    void readNotice().then((value) => {
      if (!active) return;
      try {
        const saved = value ? JSON.parse(value) : null;
        setShowBanner(saved?.version !== COOKIE_CONSENT_VERSION);
      } catch {
        setShowBanner(true);
      }
    });
    return () => { active = false; };
  }, []);

  const dismiss = async () => {
    const value = JSON.stringify({
      version: COOKIE_CONSENT_VERSION,
      dismissedAt: new Date().toISOString(),
    });

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
      }
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key: COOKIE_CONSENT_KEY, value });
      }
    } catch (error) {
      console.warn('Unable to save privacy notice preference:', error);
    } finally {
      setShowBanner(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.aside
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="region"
          aria-label={t.title}
          className="fixed bottom-3 left-3 right-3 z-[2000] mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-700" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight text-slate-900">{t.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{t.body}</p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => void dismiss()}
                className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
              >
                {t.dismiss}
              </button>
              <a href="/COOKIE_POLICY.md" className="text-[10px] font-medium text-blue-700 underline underline-offset-2">
                {t.privacy}
              </a>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const hasCookieConsent = async (): Promise<boolean> => {
  try {
    const value = await readNotice();
    if (!value) return false;
    return JSON.parse(value)?.version === COOKIE_CONSENT_VERSION;
  } catch {
    return false;
  }
};

const checkCookieConsent = async (_category: 'performance' | 'functional' | 'marketing'): Promise<boolean> => false;

export default CookieConsentBanner;
export { checkCookieConsent, hasCookieConsent, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION };
