import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Play, X, Trophy, BookOpen, Camera, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { QUEST_TARGETS } from '../constants/questData';
import { findQuestTargetFromQr } from '../utils/qrMatcher';
import { Preferences } from '@capacitor/preferences';
import { useGlobalApp } from '../contexts/GlobalAppContext';

export interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  unlockedRewards: string[];
  onRewardFound: (id: string, qrPayload: string, position: { lat: number; lon: number } | null) => Promise<{ ok: boolean; code?: string; xp_awarded?: number; xp_total?: number; level?: number }>;
  onSelectVideo?: (videoUrl: string) => void;
  isUtilityMode?: boolean;
  enableInfiniteAnimations?: boolean;
  scannerFps?: number;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  unlockedRewards,
  onRewardFound,
  onSelectVideo,
  isUtilityMode = false,
  enableInfiniteAnimations = true,
  scannerFps = 15,
}) => {
  const [scannerFeedback, setScannerFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string } | null>(null);
  const [activeRewardHtml, setActiveRewardHtml] = useState<{ url: string; title: string } | null>(null);
  const { setIsTvrtkoScratchOpen } = useGlobalApp();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanInProgressRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  const scannerContainerId = 'map-quest-reader';

  // Scanner initialization lifecycle
  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      // Delay to let AnimatePresence spring animation render and size the container
      const timer = setTimeout(() => {
        if (!cancelled) startScanner();
      }, 350);
      return () => {
        cancelled = true;
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    const container = document.getElementById(scannerContainerId);
    if (!container) {
      console.warn('[QR Scanner] Container not found:', scannerContainerId);
      return;
    }

    setCameraError(null);
    setIsStartingCamera(true);

    // Stop any existing scanner instance first
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (_) {
        /* ignore cleanup errors */
      }
      html5QrCodeRef.current = null;
    }

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId, { verbose: false });
      html5QrCodeRef.current = html5QrCode;

      const onScanSuccess = async (decodedText: string) => {
        const trimmedText = decodedText?.trim() ?? '';
        const target = findQuestTargetFromQr(trimmedText);

        if (!target) {
          setScannerFeedback({
            text:
              lang === 'bs'
                ? 'Pogrešan QR kod. Skenirajte QR kod s pravog mjesta.'
                : 'Wrong QR code. Scan the QR code for the correct location.',
            type: 'error',
          });
          return;
        }

        // Haptic feedback on device if supported
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch (_) { }
        }

        // Record in local scan ledger for history tracking
        try {
          const { value } = await Preferences.get({ key: 'tuzla_scan_ledger' });
          let ledger: any[] = [];
          if (value) {
            try {
              ledger = JSON.parse(value);
            } catch (_) { }
          }

          if (!ledger.some((entry) => entry.id === target.id)) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString(lang === 'bs' ? 'bs-BA' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateStr = now.toLocaleDateString(lang === 'bs' ? 'bs-BA' : 'en-US', {
              month: 'short',
              day: 'numeric',
            });
            const updatedLedger = [{ id: target.id, timestamp: `${dateStr}, ${timeStr}` }, ...ledger];
            await Preferences.set({ key: 'tuzla_scan_ledger', value: JSON.stringify(updatedLedger) });
          }
        } catch (e) {
          console.warn('[QR Scanner] Ledger update skipped:', e);
        }

        if (unlockedRewards.includes(target.id)) {
          if (target.id === 'tvrtko_park' || target.id === 'tvrtko') {
            onClose();
            setTimeout(() => {
              setIsTvrtkoScratchOpen(true);
            }, 300);
            return;
          }
          setScannerFeedback({
            text:
              lang === 'bs'
                ? `${target.name.bs} je već otključan.`
                : `${target.name.en} is already unlocked.`,
            type: 'success',
          });
          setTimeout(() => setScannerFeedback(null), 3000);
          onClose();
          return;
        }

        if (scanInProgressRef.current) return;
        scanInProgressRef.current = true;

        const getGpsFix = () => new Promise<{ lat: number; lon: number } | null>((resolve) => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
          );
        });

        const gpsFix = await getGpsFix();
        let completion: { ok: boolean; code?: string; xp_awarded?: number; xp_total?: number; level?: number };
        try {
          completion = await onRewardFound(target.id, trimmedText, gpsFix);
        } catch (_) {
          completion = { ok: false, code: 'quest_completion_failed' };
        }

        if (!completion?.ok) {
          const code = completion?.code || 'quest_completion_failed';
          const messages: Record<string, Record<string, string>> = {
            qr_not_configured: {
              en: "This location's QR code has not been activated for online rewards yet.",
              bs: "QR kod ove lokacije još nije aktiviran za online nagrade.",
              de: "Der QR-Code dieses Ortes ist noch nicht für Online-Belohnungen aktiviert.",
              tr: "Bu konumun QR kodu çevrimiçi ödüller için henüz etkinleştirilmedi."
            },
            quest_location_missing: {
              en: "The GPS position for this quest is not configured yet.",
              bs: "GPS lokacija ove potrage još nije podešena.",
              de: "Die GPS-Position dieser Quest ist noch nicht eingerichtet.",
              tr: "Bu görevin GPS konumu henüz ayarlanmamiş."
            },
            quest_not_found_or_inactive: {
              en: "This quest is currently unavailable.",
              bs: "Ova potraga trenutno nije dostupna.",
              de: "Diese Quest ist derzeit nicht verfügbar.",
              tr: "Bu görev şu anda kullanilamiyor."
            },
            invalid_qr: {
              en: 'This QR code is not activated for quest rewards yet.',
              bs: 'Ovaj QR kod još nije aktiviran za nagrade potrage.',
              de: 'Dieser QR-Code ist noch nicht für Quest-Belohnungen aktiviert.',
              tr: 'Bu QR kodu görev ödülleri için henüz etkinleştirilmedi.'
            },
            outside_radius: {
              en: 'You are outside the allowed GPS area. Move closer to the location and try again.',
              bs: 'Nalazite se izvan dozvoljene GPS zone. Priđite lokaciji i pokušajte ponovo.',
              de: 'Du bist außerhalb des erlaubten GPS-Bereichs. Gehe näher an den Ort und versuche es erneut.',
              tr: 'İzin verilen GPS alaninin dişindasiniz. Konuma yaklaşin ve tekrar deneyin.'
            },
            gps_required: {
              en: 'Location permission is required. Enable GPS and scan again.',
              bs: 'Potrebna je dozvola za lokaciju. Uključite GPS i skenirajte ponovo.',
              de: 'Der Standortzugriff ist erforderlich. Aktiviere GPS und scanne erneut.',
              tr: 'Konum izni gerekiyor. GPS açip tekrar tarayin',
            },
            already_completed: {
              en: 'You have already completed this quest.',
              bs: 'Ovu potragu ste već završili.',
              de: 'Du hast diese Quest bereits abgeschlossen.',
              tr: 'Bu görevi zaten tamamladiniz.'
            },
            auth_required: {
              en: 'Guest player session is unavailable. Please try again.',
              bs: 'Sesija gosta nije dostupna. Pokušajte ponovo.',
              de: 'Die Gast-Sitzung ist nicht verfügbar. Bitte versuche es erneut.',
              tr: 'Misafir oyuncu oturumu kullanilamiyor. Lütfen tekrar deneyin.'
            },
            anonymous_sign_in_disabled: {
              en: 'Guest play is not enabled yet. Please try again later.',
              bs: 'Igranje kao gost još nije omogućeno. Pokušajte kasnije.',
              de: 'Gastmodus ist noch nicht aktiviert. Bitte später erneut versuchen.',
              tr: 'Misafir modu henüz etkin değil. Daha sonra tekrar deneyin.'
            },
            quest_completion_failed: {
              en: 'Could not verify this quest. Please try again.',
              bs: 'Potragu nije moguće potvrditi. Pokušajte ponovo.',
              de: 'Die Quest konnte nicht bestätigt werden. Bitte versuche es erneut.',
              tr: 'Görev doğrulanamadi. Lütfen tekrar deneyin.'
            }
          };
          setScannerFeedback({ text: messages[code]?.[lang] || messages.quest_completion_failed[lang], type: 'error' });
          setTimeout(() => {
            setScannerFeedback(null);
            scanInProgressRef.current = false;
          }, 4500);
          return;
        }

        // Special celebration and scratch card for King Tvrtko
        if (target.id === 'tvrtko_park' || target.id === 'tvrtko') {
          scanInProgressRef.current = false;
          onClose();
          setTimeout(() => {
            setIsTvrtkoScratchOpen(true);
          }, 350);
          return;
        }

        scanInProgressRef.current = false;
        setScannerFeedback({
          text:
            lang === 'bs'
              ? `Nagrada za ${target.name.bs} otključana! +${completion.xp_awarded || 0} XP`
              : `Reward unlocked for ${target.name.en}! +${completion.xp_awarded || 0} XP`,
          type: 'success',
        });
        setTimeout(() => setScannerFeedback(null), 3000);
        onClose();

        // Auto-open reward HTML if this target has one (e.g. Povelja Kulina Bana for Trg Slobode)
        if (target.rewardHtml) {
          const rewardTitle = target.name[lang as keyof typeof target.name] || target.name.en || target.name.bs;
          setTimeout(() => {
            setActiveRewardHtml({ url: target.rewardHtml!, title: rewardTitle });
          }, 800);
        }
      };

      const qrConfig = {
        fps: Math.max(scannerFps, 15),
        qrbox: { width: Math.min(window.innerWidth * 0.7, 260), height: Math.min(window.innerWidth * 0.7, 260) },
        disableFlip: false,
      };

      try {
        await html5QrCode.start({ facingMode: 'environment' }, qrConfig, onScanSuccess, () => { });
        setIsStartingCamera(false);
        if (!isOpenRef.current) {
          stopScanner();
          return;
        }
      } catch (err) {
        console.warn('[QR Scanner] Environment camera failed, trying fallback to any camera...', err);
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            const backCam = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];
            await html5QrCode.start(backCam.id, qrConfig, onScanSuccess, () => { });
            setIsStartingCamera(false);
            if (!isOpenRef.current) {
              stopScanner();
              return;
            }
          } else {
            throw new Error('No cameras found on device.');
          }
        } catch (fallbackErr: any) {
          console.error('[QR Scanner] Fallback failed:', fallbackErr);
          setIsStartingCamera(false);
          setCameraError(
            lang === 'bs'
              ? 'Kamera nije dostupna ili nema dozvole. Omogućite pristup kameri i pokušajte ponovo.'
              : 'Camera unavailable or permission denied. Enable camera access and try again.'
          );
        }
      }
    } catch (err: any) {
      console.error('[QR Scanner] Initialization error:', err);
      setIsStartingCamera(false);
      setCameraError(
        lang === 'bs'
          ? 'Greška pri pokretanju kamere. Pokušajte ponovo.'
          : 'Error initializing camera. Please retry.'
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (_) {
        /* ignore stop errors */
      }
      html5QrCodeRef.current = null;
    }
  };

  const unlockedItems = QUEST_TARGETS.filter((item) => unlockedRewards.includes(item.id));
  const lockedItems = QUEST_TARGETS.filter((item) => !unlockedRewards.includes(item.id));


  return (
    <>
      {/* SCANNER OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[2000] bg-black flex flex-col pt-32"
          >
            {/* LASER SCANNER FRAME */}
            <div className="relative w-full h-[40vh] flex flex-col items-center justify-center mb-12">
              {!isUtilityMode && (
                <>
                  <div className="absolute top-0 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute top-0 right-1/3 translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-sky-500/25 blur-[55px] rounded-full pointer-events-none" />
                </>
              )}

              <div className="relative w-72 h-72">
                {/* Real Camera Feed */}
                <div
                  id={scannerContainerId}
                  className="absolute inset-0 rounded-2xl overflow-clip bg-black border-2 border-sky-400/30 shadow-[0_0_60px_rgba(56,189,248,0.25),0_0_90px_rgba(245,158,11,0.15)]"
                  style={{ backgroundColor: 'black', minWidth: '280px', minHeight: '280px' }}
                />

                {/* Camera Starting State */}
                {isStartingCamera && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 rounded-2xl p-4 text-center gap-2">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 border-t-amber-400 animate-spin" />
                      <Camera className="w-4 h-4 text-sky-400 absolute inset-0 m-auto" />
                    </div>
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      {lang === 'bs' ? 'Pokretanje kamere...' : 'Starting camera...'}
                    </span>
                  </div>
                )}

                {/* Camera Error State with Retry */}
                {cameraError && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 rounded-2xl p-5 text-center gap-2.5">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                    <p className="text-xs font-bold text-slate-200 leading-snug">{cameraError}</p>
                    <button onClick={() => startScanner()} className="w-full mt-2 py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md">
                      <RefreshCw size={12} />
                      {lang === 'bs' ? 'Ponovo' : 'Retry'}
                    </button>
                  </div>
                )}

                {/* Cyber Frame Decor */}
                <div className="absolute -inset-4 border-2 border-white/5 rounded-[2.5rem] pointer-events-none" />
                <div
                  className={`absolute -inset-1 border rounded-[1.5rem] pointer-events-none ${enableInfiniteAnimations ? 'animate-pulse' : ''
                    }`}
                  style={{
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 0 25px rgba(56, 189, 248, 0.2), inset 0 0 20px rgba(245, 158, 11, 0.15)'
                  }}
                />

                {/* Modern Golden and Glowing Blue Corner Brackets */}
                {/* Top-Left: Golden */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl shadow-[0_0_15px_rgba(251,191,36,0.85)] z-20 pointer-events-none" />
                {/* Top-Right: Glowing Blue */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-2xl shadow-[0_0_15px_rgba(56,189,248,0.9)] z-20 pointer-events-none" />
                {/* Bottom-Left: Glowing Blue */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-2xl shadow-[0_0_15px_rgba(56,189,248,0.9)] z-20 pointer-events-none" />
                {/* Bottom-Right: Golden */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-2xl shadow-[0_0_15px_rgba(251,191,36,0.85)] z-20 pointer-events-none" />

                {/* Central Targeting Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30">
                  <div className="w-12 h-12 border border-sky-400/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" />
                  </div>
                </div>

                {/* Modern and Powerful Laser Line: Golden Core with Glowing Blue Aura */}
                {enableInfiniteAnimations ? (
                  <motion.div
                    animate={{ top: ['4%', '96%', '4%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 w-full pointer-events-none z-20 flex flex-col items-center"
                  >
                    {/* Glowing light curtain sweep trail (upwards) */}
                    <div className="w-full h-8 bg-gradient-to-t from-amber-400/35 via-sky-400/20 to-transparent blur-xs -mb-1" />

                    {/* Core Laser Bar */}
                    <div className="relative w-full h-[3px] bg-gradient-to-r from-transparent via-sky-400 via-amber-300 via-amber-200 via-sky-400 to-transparent shadow-[0_0_16px_#fbbf24,0_0_32px_#38bdf8,0_0_50px_#0284c7]">
                      <div className="absolute inset-0 h-[1.5px] bg-white blur-[0.5px]" />
                      {/* Left & Right Plasma Focus Nodes */}
                      <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#38bdf8,0_0_5px_#fbbf24]" />
                      <div className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-sky-300 shadow-[0_0_10px_#fbbf24,0_0_5px_#38bdf8]" />
                    </div>

                    {/* Glowing light curtain sweep trail (downwards) */}
                    <div className="w-full h-8 bg-gradient-to-b from-amber-400/35 via-sky-400/20 to-transparent blur-xs -mt-1" />
                  </motion.div>
                ) : (
                  <div className="absolute left-0 top-1/2 w-full h-[3px] -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-400 via-amber-300 via-sky-400 to-transparent shadow-[0_0_20px_#fbbf24,0_0_35px_#38bdf8] z-20 pointer-events-none" />
                )}
              </div>

              <div className="mt-8 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
                  </span>
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400 bg-clip-text text-transparent font-black text-xs uppercase tracking-[0.3em]">
                    Quantum Laser Scanner
                  </span>
                </div>
                <span className="text-sky-100/60 text-[10px] font-bold uppercase tracking-widest text-center px-12 leading-relaxed">
                  Position QR code within the frame to unlock rewards
                </span>
              </div>
            </div>

            {/* REWARD SECTIONS */}
            <div className="flex-1 overflow-y-auto px-6 pb-20 hide-scrollbar space-y-12">
              {/* SECTION: UNLOCKED */}
              {unlockedItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                      {lang === 'bs' ? 'Otključane Nagrade' : 'Unlocked Rewards'}
                    </h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {unlockedItems.map((item) => {
                      const itemName = item.name[lang as keyof typeof item.name] || item.name.en || item.name.bs;
                      return (
                        <div key={item.id} className="flex flex-col gap-2">
                          <motion.div
                            layout
                            className="group relative h-32 rounded-3xl overflow-hidden border border-amber-400/40 bg-white/5 shadow-xl transition-all active:scale-95 cursor-pointer"
                            onClick={() => {
                              if (item.id === 'tvrtko_park' || item.id === 'tvrtko') {
                                setIsTvrtkoScratchOpen(true);
                              } else if (item.rewardHtml) {
                                setActiveRewardHtml({ url: item.rewardHtml, title: itemName });
                              } else if (item.video) {
                                setActiveVideoModal({ url: item.video, title: itemName });
                                if (onSelectVideo) onSelectVideo(item.video);
                              } else if ((item as any).website) {
                                window.open((item as any).website, '_blank');
                              }
                            }}
                          >
                            <img
                              src={item.Image}
                              alt={itemName}
                              className={`w-full h-full object-cover brightness-[0.7] ${isUtilityMode ? '' : 'group-hover:brightness-100 transition-all duration-500'
                                }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent p-5 flex flex-col justify-center">
                              <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">
                                {lang === 'bs' ? 'Otključano' : 'Unlocked'}
                              </span>
                              <h3 className="text-lg font-black text-white uppercase leading-none tracking-tight">
                                {itemName}
                              </h3>
                            </div>
                            {item.rewardHtml && (
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-tr from-amber-700 to-amber-500 border border-amber-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/40 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {item.video && !item.rewardHtml && (
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-tr from-amber-400 to-yellow-400 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-slate-950 fill-slate-950 ml-0.5" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-500 w-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                          </motion.div>
                          {'}'}{'}'}

                          ){'}'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: LOCKED */}
              {lockedItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Lock className="w-5 h-5 text-slate-500" />
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                      {lang === 'bs' ? 'Preostali Zadaci' : 'Remaining Quests'}
                    </h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {lockedItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative h-28 rounded-3xl overflow-hidden border border-white/5 bg-slate-900/50"
                      >
                        <img
                          src={item.Image}
                          alt="Locked"
                          className={`w-full h-full object-cover grayscale brightness-[0.3] ${isUtilityMode ? 'blur-sm' : 'blur-xl'
                            }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-8">
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">
                              Find to Unlock
                            </span>
                            <h3 className="text-md font-black text-slate-600 uppercase leading-none tracking-tight italic">
                              SECRET LOCATION
                            </h3>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-700" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 rounded-3xl flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCANNER FEEDBACK TOAST */}
      <AnimatePresence>
        {scannerFeedback && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 370, damping: 24 }}
            className={`fixed bottom-24 left-6 right-6 z-[3000] p-5 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.35)] flex items-center gap-4 ${scannerFeedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${scannerFeedback.type === 'success' ? 'bg-white/20' : 'bg-white/20'
                }`}
            >
              {scannerFeedback.type === 'success' ? (
                <Trophy className="w-6 h-6 text-white" />
              ) : (
                <X className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                {scannerFeedback.type === 'success'
                  ? lang === 'bs'
                    ? 'Čestitamo'
                    : 'Congratulations'
                  : lang === 'bs'
                    ? 'Greška skeniranja'
                    : 'Scan error'}
              </span>
              <span className="text-base font-black uppercase leading-none tracking-tight">
                {scannerFeedback.text}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UNLOCKED POI CINEMATIC VIDEO MODAL */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[7000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full max-w-2xl bg-black border border-white/15 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                    <Play className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      {lang === 'bs' ? 'Cinematic Video' : 'Cinematic Video'}
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      {activeVideoModal.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative w-full aspect-video sm:max-h-[60vh] bg-black flex items-center justify-center">
                <video
                  src={activeVideoModal.url}
                  autoPlay
                  controls
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  {lang === 'bs' ? 'Tuzla Tour Audio-Vizuelni Vodič' : 'Tuzla Tour Audio-Visual Guide'}
                </span>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                >
                  {lang === 'bs' ? 'Zatvori Video' : 'Close Video'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REWARD HTML MODAL (e.g. Povelja Kulina Bana for Trg Slobode) */}
      <AnimatePresence>
        {activeRewardHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[7000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6"
          >
            <div className="w-full h-full max-w-3xl max-h-[90vh] bg-black border border-amber-500/30 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-950/80 to-slate-950/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      {lang === 'bs' ? '🏆 Nagrada' : '🏆 Reward'}
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      {activeRewardHtml.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRewardHtml(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Iframe Content */}
              <div className="flex-1 relative bg-[#1b1511]">
                <iframe
                  src={activeRewardHtml.url}
                  title={activeRewardHtml.title}
                  className="w-full h-full border-0"
                  style={{ minHeight: '400px' }}
                  allow="accelerometer; autoplay; gyroscope"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-amber-500/20 bg-gradient-to-r from-amber-950/80 to-slate-950/80 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-amber-400/70">
                  {lang === 'bs' ? 'Povelja Kulina bana — 1189' : 'Charter of Kulin Ban — 1189'}
                </span>
                <button
                  onClick={() => setActiveRewardHtml(null)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                >
                  {lang === 'bs' ? 'Zatvori' : 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
