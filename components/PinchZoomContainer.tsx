import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, RotateCcw } from 'lucide-react';

interface PinchZoomContainerProps {
  children: React.ReactNode;
  maxScale?: number;
  minScale?: number;
}

export const PinchZoomContainer: React.FC<PinchZoomContainerProps> = ({
  children,
  maxScale = 2.0,
  minScale = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs to track gestures without causing re-renders during 60fps touchmove
  const stateRef = useRef({
    scale: 1.0,
    translateX: 0,
    translateY: 0,
    isPinching: false,
    isPanning: false,
    initialDistance: 0,
    initialScale: 1.0,
    startX: 0,
    startY: 0,
    lastTouchX: 0,
    lastTouchY: 0,
    lastTapTime: 0,
  });

  const resetZoom = useCallback(() => {
    stateRef.current.scale = 1.0;
    stateRef.current.translateX = 0;
    stateRef.current.translateY = 0;
    stateRef.current.isPinching = false;
    stateRef.current.isPanning = false;
    setScale(1.0);
    setTranslate({ x: 0, y: 0 });

    if (containerRef.current) {
      containerRef.current.style.transform = 'none';
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Helper: compute Euclidean distance between two touches
    const getTouchDistance = (e: TouchEvent): number => {
      if (e.touches.length < 2) return 0;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    // Helper: compute midpoint between two touches
    const getTouchMidpoint = (e: TouchEvent): { x: number; y: number } => {
      if (e.touches.length < 2) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    };

    // Helper: check if target is inside an interactive map or AR video that has its own multi-touch handlers
    const isExcludedTarget = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest('.maplibregl-map') ||
        target.closest('.maplibregl-canvas') ||
        target.closest('.mapboxgl-map') ||
        target.closest('canvas.ar-canvas') ||
        target.closest('video')
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isExcludedTarget(e.target)) return;

      const now = Date.now();
      // Double-tap to reset if currently zoomed
      if (e.touches.length === 1) {
        if (now - stateRef.current.lastTapTime < 300 && stateRef.current.scale > 1.05) {
          e.preventDefault();
          resetZoom();
          stateRef.current.lastTapTime = 0;
          return;
        }
        stateRef.current.lastTapTime = now;

        // If already zoomed, allow single-finger panning
        if (stateRef.current.scale > 1.05) {
          stateRef.current.isPanning = true;
          stateRef.current.lastTouchX = e.touches[0].clientX;
          stateRef.current.lastTouchY = e.touches[0].clientY;
        }
      }

      if (e.touches.length === 2) {
        // Two fingers detected: begin pinch gesture
        stateRef.current.isPinching = true;
        stateRef.current.isPanning = false;
        stateRef.current.initialDistance = getTouchDistance(e);
        stateRef.current.initialScale = stateRef.current.scale;
        const mid = getTouchMidpoint(e);
        stateRef.current.startX = mid.x;
        stateRef.current.startY = mid.y;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isExcludedTarget(e.target)) return;

      // Handle two-finger pinch to zoom
      if (e.touches.length === 2 && stateRef.current.isPinching) {
        e.preventDefault(); // Prevent standard browser scroll while pinching
        const currentDistance = getTouchDistance(e);
        if (stateRef.current.initialDistance > 0) {
          const ratio = currentDistance / stateRef.current.initialDistance;
          let newScale = stateRef.current.initialScale * ratio;
          // Clamp scale to maxScale (2.0x) and minScale (1.0x)
          newScale = Math.min(Math.max(newScale, minScale * 0.9), maxScale * 1.05);

          stateRef.current.scale = newScale;

          // Apply transform directly for 60fps performance
          if (el) {
            el.style.transformOrigin = '50% 50%';
            el.style.transform = `scale(${newScale}) translate(${stateRef.current.translateX}px, ${stateRef.current.translateY}px)`;
          }
        }
        return;
      }

      // Handle panning when zoomed in (> 1.05x)
      if (e.touches.length === 1 && stateRef.current.isPanning && stateRef.current.scale > 1.05) {
        const dx = e.touches[0].clientX - stateRef.current.lastTouchX;
        const dy = e.touches[0].clientY - stateRef.current.lastTouchY;

        stateRef.current.lastTouchX = e.touches[0].clientX;
        stateRef.current.lastTouchY = e.touches[0].clientY;

        // Limit panning bounds based on current scale
        const maxPanX = (window.innerWidth * (stateRef.current.scale - 1)) / (2 * stateRef.current.scale);
        const maxPanY = (window.innerHeight * (stateRef.current.scale - 1)) / (2 * stateRef.current.scale);

        stateRef.current.translateX = Math.max(Math.min(stateRef.current.translateX + dx / stateRef.current.scale, maxPanX), -maxPanX);
        stateRef.current.translateY = Math.max(Math.min(stateRef.current.translateY + dy / stateRef.current.scale, maxPanY), -maxPanY);

        if (el) {
          el.style.transform = `scale(${stateRef.current.scale}) translate(${stateRef.current.translateX}px, ${stateRef.current.translateY}px)`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && stateRef.current.isPinching) {
        stateRef.current.isPinching = false;
        // Snap to valid range
        let finalScale = stateRef.current.scale;
        if (finalScale < 1.08) {
          resetZoom();
          return;
        } else if (finalScale > maxScale) {
          finalScale = maxScale;
          stateRef.current.scale = maxScale;
        }

        setScale(finalScale);
        setTranslate({ x: stateRef.current.translateX, y: stateRef.current.translateY });

        if (el) {
          el.style.transition = 'transform 0.15s ease-out';
          el.style.transform = `scale(${finalScale}) translate(${stateRef.current.translateX}px, ${stateRef.current.translateY}px)`;
          setTimeout(() => {
            if (el) el.style.transition = '';
          }, 160);
        }
      }

      if (e.touches.length === 0) {
        stateRef.current.isPanning = false;
        if (stateRef.current.scale <= 1.08) {
          resetZoom();
        }
      }
    };

    // Attach passive: false to allow e.preventDefault() during two-finger pinch
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [maxScale, minScale, resetZoom]);

  return (
    <div className="relative w-full min-h-full flex-1 flex flex-col">
      {/* Zoom Indicator and Quick Reset Button (Visible only when zoomed in) */}
      {scale > 1.05 && (
        <div className="fixed top-16 right-4 z-[9999] flex items-center gap-2 bg-slate-900/90 text-amber-300 border border-amber-400/50 shadow-2xl rounded-full px-3 py-1.5 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black tracking-wide">{scale.toFixed(1)}x</span>
          <button
            type="button"
            onClick={resetZoom}
            className="ml-1 p-1 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Reset Zoom (1x)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Scalable Viewport Target */}
      <div
        ref={containerRef}
        className="w-full min-h-full flex-1 flex flex-col will-change-transform"
        style={{
          touchAction: 'pan-x pan-y pinch-zoom',
        }}
      >
        {children}
      </div>
    </div>
  );
};

