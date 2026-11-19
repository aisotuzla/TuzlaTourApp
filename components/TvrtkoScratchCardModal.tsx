import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Trophy, MapPin, Eye, Compass, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';

const TVRTKO_SCRATCH_FALLBACK_URL =
  'https://www.scraaatch.com/en/s/57d1dbd743604036a8561c7a593d286c';

interface TvrtkoScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigateToStone?: () => void;
}

export const TvrtkoScratchCardModal: React.FC<TvrtkoScratchCardModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateToStone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasTriggeredConfettiRef = useRef(false);

  // Trigger grand celebration confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsScratched(false);
      setScratchProgress(0);
      hasTriggeredConfettiRef.current = false;

      // Haptic feedback
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([150, 60, 150]);
        } catch (_) {}
      }

      // Initial celebration cannon
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#3b82f6', '#ffffff'],
        });
      } catch (_) {}
    }
  }, [isOpen]);

  // Initialize and paint scratch card canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 380;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Rich metallic golden gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.3, '#d97706');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(0.7, '#b45309');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle decorative speckles / pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 40; i++) {
      const rx = (i * 37) % width;
      const ry = (i * 61) % height;
      const r = (i % 4) + 1;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border inner line
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Scratch instruction text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 20px "Quicksand", system-ui, sans-serif';
    ctx.fillStyle = '#1e1b4b';
    ctx.fillText(lang === 'bs' ? '🪙 OGREBI OVDJE' : '🪙 SCRATCH HERE', width / 2, height / 2 - 20);

    ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
    ctx.fillStyle = '#312e81';
    ctx.fillText(
      lang === 'bs' ? 'Otkrij tajnu Kralja Tvrtka' : 'Reveal King Tvrtko secret',
      width / 2,
      height / 2 + 15
    );
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow container dimensions to settle in DOM
      const timer = setTimeout(() => {
        initCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initCanvas]);

  // Scratch action drawing
  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, 22, 0, Math.PI * 2);
    }
    ctx.stroke();

    lastPosRef.current = { x, y };

    // Check progress periodically (every 5 scratches or randomly)
    if (Math.random() > 0.4) {
      checkScratchPercentage();
    }
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let transparentPixels = 0;
      const totalSampled = data.length / 16; // sample every 4th pixel (step by 16 in RGBA array)

      for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = Math.min(100, Math.round((transparentPixels / totalSampled) * 100));
      setScratchProgress(percent);

      // Auto-reveal if scratched 40% or more
      if (percent >= 40 && !isScratched) {
        handleFullReveal();
      }
    } catch (_) {}
  };

  const handleFullReveal = () => {
    setIsScratched(true);
    setScratchProgress(100);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (!hasTriggeredConfettiRef.current) {
      hasTriggeredConfettiRef.current = true;
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#ec4899', '#38bdf8', '#10b981'],
        });
      } catch (_) {}
    }
  };

  // Pointer event helpers
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    lastPosRef.current = { x, y };
    scratchAt(x, y);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    scratchAt(x, y);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    checkScratchPercentage();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[8000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
        >
          {/* Scratch Card Modal Overlay: covers ~70% of screen */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-[92vw] max-w-sm sm:max-w-md h-[72vh] max-h-[640px] bg-gradient-to-b from-slate-900 via-[#1a1429] to-slate-950 border-2 border-amber-400/80 rounded-3xl shadow-[0_20px_60px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden"
          >
            {/* Header / Celebration banner */}
            <div className="relative px-5 pt-4 pb-3 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-600/20 border-b border-amber-400/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                  <Trophy className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                    {lang === 'bs' ? '🎉 Čestitamo! Otključano' : '🎉 Congratulations! Unlocked'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                    Scratch For Reward
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle / Instructions */}
            <div className="px-5 py-2 bg-slate-900/60 flex items-center justify-between text-[11px] text-amber-200/80 font-bold border-b border-white/5 shrink-0">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                {isScratched
                  ? lang === 'bs'
                    ? 'Tajna je otkrivena!'
                    : 'Secret Revealed!'
                  : lang === 'bs'
                  ? 'Prstom pređite preko kartice'
                  : 'Scratch card with your finger'}
              </span>
              {!isScratched && (
                <button
                  type="button"
                  onClick={handleFullReveal}
                  className="text-amber-400 hover:text-amber-300 underline font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  {lang === 'bs' ? 'Otkrij sve' : 'Reveal All'}
                </button>
              )}
            </div>

            {/* Central Scratch Container */}
            <div className="relative flex-1 p-3.5 flex flex-col items-center justify-center overflow-hidden">
              <div
                ref={containerRef}
                className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-slate-950 shadow-inner flex flex-col"
              >
                {/* ── Beneath Canvas: Revealed Content ── */}
                <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-stone-900 via-stone-950 to-black select-none">
                  {/* Revealed Image: TuzlaBanKulinStone.webp */}
                  <div className="flex-1 relative w-full overflow-hidden flex items-center justify-center p-2">
                    <img
                      src="/assets/Gallery/QuestQRLocations/TuzlaBanKulinStone.webp"
                      alt="Tuzla Ban Kulin Stone"
                      className="w-full h-full object-contain rounded-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                      onError={(e) => {
                        // Fallback in case of secondary path
                        (e.target as HTMLImageElement).src = '/assets/TuzlaBanKulinStone.webp';
                      }}
                    />
                  </div>

                  {/* ── Text at bottom: "I am in this park. Find Me" ── */}
                  <div className="px-4 py-3 bg-gradient-to-t from-black via-stone-900/95 to-transparent flex flex-col items-center text-center shrink-0">
                    <p className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
                      "I am in this park. Find Me"
                    </p>
                    <p className="text-[11px] font-bold text-amber-100/70 mt-0.5">
                      {lang === 'bs'
                        ? '🏛️ Spomen-ploča Povelje Kulina bana nalazi se ovdje u parku Kralja Tvrtka!'
                        : '🏛️ The memorial stone of Charter of Kulin Ban is right here in King Tvrtko Park!'}
                    </p>
                  </div>
                </div>

                {/* ── Scratch Canvas Layer on top ── */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  className={`absolute inset-0 w-full h-full cursor-pointer touch-none z-10 transition-opacity duration-700 ${
                    isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  style={{ touchAction: 'none' }}
                />
              </div>
            </div>

            {/* Footer with Hint / Coordinates navigation action */}
            <div className="px-5 pb-4 pt-2 bg-slate-900/80 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="flex min-w-0 flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>44.538791, 18.678778</span>
                </div>
                <a
                  href={TVRTKO_SCRATCH_FALLBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-300 underline underline-offset-2 hover:text-amber-200"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {lang === 'bs' ? 'Kartica ne radi? Probaj online' : 'Card not working? Try online'}
                </a>
              </div>

              {onNavigateToStone && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToStone();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  {lang === 'bs' ? 'Pronađi me' : 'Find Me'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

