import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Check, Sparkles, Crown, Compass, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';

export interface PhaseCelebrationModalProps {
  phase: 1 | 2 | 3 | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onContinue?: () => void;
}

export const PhaseCelebrationModal: React.FC<PhaseCelebrationModalProps> = ({
  phase,
  isOpen,
  onClose,
  lang,
  onContinue,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Trigger celebration effects on open
  useEffect(() => {
    if (isOpen && phase) {
      setDownloadSuccess(false);

      // Gentle haptic feedback on supported mobile devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 60, 180]);
        } catch (_) {}
      }

      // Phase-specific celebration confetti
      try {
        if (phase === 1) {
          // Phase 1: Old Town heritage silver, gold & slate confetti
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#f59e0b', '#94a3b8', '#ffffff', '#cbd5e1'],
          });
        } else if (phase === 2) {
          // Phase 2: Medieval Bosnian Kingdom royal emerald, gold & deep amber
          confetti({
            particleCount: 110,
            spread: 85,
            origin: { y: 0.55 },
            colors: ['#16a34a', '#eab308', '#ca8a04', '#15803d', '#fef08a', '#78350f'],
          });
        } else if (phase === 3) {
          // Phase 3: Pannonian Sailor azure ocean, cyan, gold & sapphire
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#0284c7', '#38bdf8', '#06b6d4', '#fbbf24', '#ffffff', '#0369a1'],
          });
        }
      } catch (_) {}
    }
  }, [isOpen, phase]);

  if (!isOpen || !phase) return null;

  // Asset configurations for each phase
  const config = {
    1: {
      assetUrl: '/assets/stara_cesma_3d.html',
      filename: 'Stara_Cesma_Tuzla_3D.html',
      badge: {
        bs: 'STARA ČARŠIJA · FAZA 1',
        en: 'OLD TOWN · PHASE 1',
        de: 'ALTSTADT · PHASE 1',
        tr: 'ESKİ ŞEHİR · AŞAMA 1',
      },
      title: {
        bs: 'Čestitamo! Završena faza: Stara Čaršija',
        en: 'Congratulations! Finished "Old Town"',
        de: 'Glückwunsch! Phase abgeschlossen: Altstadt',
        tr: 'Tebrikler! "Eski Şehir" tamamlandı',
      },
      subtitle: {
        bs: 'Otključali ste 3D model Stare česme! Sačuvajte ga na telefonu i ponovno oživite uspomene iz Tuzle bilo kada.',
        en: 'You unlocked the 3D model of Stara Česma! Download it to your phone and revisit your time spent in Tuzla anytime.',
        de: 'Sie haben das 3D-Modell von Stara Česma freigeschaltet! Laden Sie es auf Ihr Telefon herunter, um Ihre Zeit in Tuzla jederzeit wiederzuerleben.',
        tr: 'Stara Česma\'nın 3D modelini açtınız! İstediğiniz zaman Tuzla\'daki anılarınızı tazelemek için telefonunuza indirin.',
      },
      downloadLabel: {
        bs: 'Preuzmi 3D model na telefon',
        en: 'Download 3D Model to Phone',
        de: '3D-Modell herunterladen',
        tr: '3D Modeli Telefona İndir',
      },
      continueLabel: {
        bs: 'Nastavi potragu',
        en: 'Continue Quest',
        de: 'Quest fortsetzen',
        tr: 'Göreve Devam Et',
      },
      theme: {
        border: 'border-slate-400/60 shadow-[0_20px_60px_rgba(148,163,184,0.3)]',
        headerBg: 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900',
        badgeBg: 'bg-slate-700/60 text-slate-200 border-slate-500/40',
        titleColor: 'text-white',
        btnPrimary: 'bg-gradient-to-r from-slate-200 to-white text-slate-950 hover:from-white hover:to-slate-100 shadow-lg shadow-white/10',
        btnSecondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600/50',
      },
    },
    2: {
      assetUrl: '/assets/povelja_kulina_bana_3d.html',
      filename: 'Povelja_Kulina_Bana_3D.html',
      badge: {
        bs: 'BOSANSKO KRALJEVSTVO · FAZA 2',
        en: 'BOSNIAN KINGDOM · PHASE 2',
        de: 'BOSNISCHES KÖNIGREICH · PHASE 2',
        tr: 'BOSNA KRALLIĞI · AŞAMA 2',
      },
      title: {
        bs: 'Čestitamo! Završeno Bosansko kraljevstvo',
        en: 'Congratulations! Finished "Bosnian Kingdom"',
        de: 'Glückwunsch! Bosnisches Königreich abgeschlossen',
        tr: 'Tebrikler! "Bosna Krallığı" tamamlandı',
      },
      subtitle: {
        bs: 'Kraljevska nagrada: Kameni spomenik Povelje Kulina bana (1189) u 3D prikazu. Preuzmite ga na telefon!',
        en: 'Royal Medieval Reward: 3D stone monument of the Charter of Kulin Ban (1189). Download it to your phone!',
        de: 'Königliche mittelalterliche Belohnung: 3D-Steinmonument der Charta von Kulin Ban (1189). Auf das Telefon herunterladen!',
        tr: 'Kraliyet Orta Çağ Ödülü: Kulin Ban Tüzüğü (1189) 3D taş anıtı. Telefonunuza indirin!',
      },
      downloadLabel: {
        bs: 'Preuzmi 3D spomenik na telefon',
        en: 'Download 3D Monument to Phone',
        de: '3D-Monument herunterladen',
        tr: '3D Anıtı Telefona İndir',
      },
      continueLabel: {
        bs: 'Nastavi potragu',
        en: 'Continue Quest',
        de: 'Quest fortsetzen',
        tr: 'Göreve Devam Et',
      },
      theme: {
        border: 'border-amber-400/80 shadow-[0_20px_70px_rgba(245,158,11,0.35)]',
        headerBg: 'bg-gradient-to-r from-amber-950 via-stone-950 to-amber-950',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
        titleColor: 'text-amber-200',
        btnPrimary: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 hover:brightness-110 shadow-lg shadow-amber-500/30',
        btnSecondary: 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40',
      },
    },
    3: {
      assetUrl: '/assets/digital_voucher_pannonian_sailor.webp',
      filename: 'Digital_Voucher_Pannonian_Sailor.webp',
      badge: {
        bs: 'PANONSKI MORNAR · FAZA 3',
        en: 'PANNONIAN SAILOR · PHASE 3',
        de: 'PANNONISCHER SEEMANN · PHASE 3',
        tr: 'PANNONIAN DENİZCİ · AŞAMA 3',
      },
      title: {
        bs: 'Čestitamo! Završen Panonski mornar',
        en: 'Congratulations! Finished "Pannonian Sailor"',
        de: 'Glückwunsch! Pannonischer Seemann abgeschlossen',
        tr: 'Tebrikler! "Pannonian Denizci" tamamlandı',
      },
      subtitle: {
        bs: 'Osvojili ste ekskluzivni digitalni vaučer Panonskog mornara! Sačuvajte ga na telefonu i nastavite igru prema Grand Finalu.',
        en: 'You received the exclusive Pannonian Sailor digital voucher! Save it on your phone and continue playing towards the Grand Finale.',
        de: 'Sie haben den exklusiven digitalen Gutschein für den Pannonischen Seemann erhalten! Auf dem Telefon speichern und weiterspielen.',
        tr: 'Özel Pannonian Denizci dijital kuponunu kazandınız! Telefonunuza kaydedin ve Büyük Finale doğru oynamaya devam edin.',
      },
      downloadLabel: {
        bs: 'Preuzmi digitalni vaučer',
        en: 'Download Digital Voucher',
        de: 'Digitalen Gutschein herunterladen',
        tr: 'Dijital Kuponu İndir',
      },
      continueLabel: {
        bs: 'Nastavi igru prema finalu',
        en: 'Continue to Play',
        de: 'Weiterspielen',
        tr: 'Oyuna Devam Et',
      },
      theme: {
        border: 'border-sky-400/80 shadow-[0_20px_70px_rgba(56,189,248,0.35)]',
        headerBg: 'bg-gradient-to-r from-sky-950 via-slate-950 to-sky-950',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/50',
        titleColor: 'text-sky-200',
        btnPrimary: 'bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 text-slate-950 hover:brightness-110 shadow-lg shadow-sky-500/30',
        btnSecondary: 'bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40',
      },
    },
  }[phase];

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(config.assetUrl);
      if (!response.ok) throw new Error('Network response failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = config.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 3000);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.warn('[Celebration] Blob download failed, falling back to direct anchor:', err);
      const link = document.createElement('a');
      link.href = config.assetUrl;
      link.download = config.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleContinue = () => {
    onClose();
    if (onContinue) onContinue();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[8600] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className={`w-full h-full max-w-3xl max-h-[92vh] bg-slate-950 border-2 rounded-[2rem] overflow-hidden flex flex-col ${config.theme.border}`}
        >
          {/* Header */}
          <div className={`p-4 sm:p-5 border-b border-white/10 ${config.theme.headerBg} shrink-0`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  phase === 1
                    ? 'bg-slate-200 text-slate-900'
                    : phase === 2
                    ? 'bg-amber-400 text-stone-950 border border-yellow-300'
                    : 'bg-sky-400 text-slate-950 border border-cyan-300'
                }`}>
                  {phase === 1 && <Sparkles className="w-6 h-6" />}
                  {phase === 2 && <Crown className="w-6 h-6 fill-stone-950" />}
                  {phase === 3 && <Compass className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.theme.badgeBg}`}>
                      {config.badge[lang] || config.badge.en}
                    </span>
                    {phase === 2 && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> 1189.
                      </span>
                    )}
                  </div>
                  <h3 className={`text-base sm:text-lg font-black tracking-tight uppercase ${config.theme.titleColor}`}>
                    {config.title[lang] || config.title.en}
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed mt-0.5 max-w-xl">
                    {config.subtitle[lang] || config.subtitle.en}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Content Area */}
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
            {phase === 1 && (
              <div className="w-full h-full relative bg-[#9fc3d8]">
                <iframe
                  src={config.assetUrl}
                  title={config.title[lang] || config.title.en}
                  className="w-full h-full border-0"
                  style={{ minHeight: '360px' }}
                  allow="accelerometer; autoplay; gyroscope"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[11px] font-bold text-white pointer-events-none border border-white/20 shadow-md">
                  {lang === 'bs' ? 'Dodirnite i rotirajte 3D fontanu' : 'Drag to rotate 3D fountain'}
                </div>
              </div>
            )}

            {phase === 2 && (
              <div className="w-full h-full relative bg-[#1c1815]">
                {/* Medieval styled banner frame */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1 rounded-full bg-amber-950/80 backdrop-blur-md text-[11px] font-bold text-amber-200 border border-amber-500/40 shadow-lg pointer-events-none flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  {lang === 'bs' ? '3D Kameni spomenik Povelje Kulina bana' : '3D Stone Monument of Charter of Kulin Ban'}
                </div>
                <iframe
                  src={config.assetUrl}
                  title={config.title[lang] || config.title.en}
                  className="w-full h-full border-0"
                  style={{ minHeight: '360px' }}
                  allow="accelerometer; autoplay; gyroscope"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-stone-950/75 backdrop-blur-md text-[11px] font-bold text-amber-200/90 pointer-events-none border border-amber-500/30 shadow-md">
                  {lang === 'bs' ? 'Dodirnite i rotirajte kameni spomenik' : 'Drag to rotate the stone monument'}
                </div>
              </div>
            )}

            {phase === 3 && (
              <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center bg-radial from-sky-950 via-slate-950 to-black overflow-y-auto">
                <div className="relative group max-w-md w-full">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-amber-300 opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="relative rounded-2xl overflow-hidden border-2 border-sky-300/60 shadow-2xl bg-slate-900">
                    <img
                      src={config.assetUrl}
                      alt="Digital Voucher - Pannonian Sailor"
                      className="w-full h-auto object-contain max-h-[50vh] sm:max-h-[55vh] mx-auto block"
                      loading="eager"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-sky-300 font-bold mt-3 text-center">
                  {lang === 'bs' ? 'Digitalni vaučer za završenu 3. fazu potrage' : 'Digital voucher for completing Phase 3 of the quest'}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className={`p-3.5 sm:p-4 border-t border-white/10 ${config.theme.headerBg} flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0`}>
            <div className="flex items-center gap-2 text-xs text-slate-300 order-2 sm:order-1 text-center sm:text-left">
              <span className="font-semibold text-slate-400">
                {lang === 'bs' ? 'Format datoteke:' : 'File format:'}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                {config.filename}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
              {/* Download / Save Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${config.theme.btnPrimary}`}
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-green-700" />
                    <span>{lang === 'bs' ? 'Preuzeto na telefon!' : 'Downloaded!'}</span>
                  </>
                ) : isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'bs' ? 'Preuzimanje...' : 'Downloading...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{config.downloadLabel[lang] || config.downloadLabel.en}</span>
                  </>
                )}
              </button>

              {/* Continue Playing Button */}
              <button
                onClick={handleContinue}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${config.theme.btnSecondary}`}
              >
                <span>{config.continueLabel[lang] || config.continueLabel.en}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhaseCelebrationModal;

