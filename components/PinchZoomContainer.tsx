import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, RotateCcw } from 'lucide-react';

interface PinchZoomContainerProps {
  children: React.ReactNode;
  maxScale?: number;
  minScale?: number;
}

// Helper: check if target is inside an interactive map or media element that has its own multi-touch handlers
const isExcludedTarget = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('.maplibregl-map') ||
    target.closest('.maplibregl-canvas') ||
    target.closest('.mapboxgl-map') ||
    target.closest('canvas.ar-canvas') ||
    target.closest('[role="dialog"]') ||
    target.closest('input') ||
    target.closest('textarea') ||
    target.closest('video')
  );
};

export const PinchZoomContainer: React.FC<PinchZoomContainerProps> = ({
  children,
  maxScale = 2.0,
  minScale = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // Refs to track gestures without causing re-renders during 60fps touchmove
  const stateRef = useRef({
    scale: 1.0,
    translateX: 0,
    translateY: 0,
    isPinching: false,
    isPanning: false,
    isUnlocked: false,
    initialDistance: 0,
    initialScale: 1.0,
    startX: 0,
    startY: 0,
    lastTouchX: 0,
    lastTouchY: 0,
    lastTapTime: 0,
    pinchStartTranslateX: 0,
    pinchStartTranslateY: 0,
    pinchStartMidpointX: 0,
    pinchStartMidpointY: 0,
  });

  const applyTransform = useCallback((nextScale: number, nextTranslateX: number, nextTranslateY: number) => {
    const el = containerRef.current;
    if (!el) return;

    el.style.transformOrigin = '50% 50%';
    el.style.transform =
      nextScale <= 1.05
        ? 'none'
        : `translate3d(${nextTranslateX}px, ${nextTranslateY}px, 0) scale(${nextScale})`;
  }, []);

  const clampScale = useCallback((nextScale: number) => (
    Math.min(Math.max(nextScale, minScale), maxScale)
  ), [minScale, maxScale]);

  const clampPan = useCallback((nextScale: number, translateX: number, translateY: number) => {
    const el = containerRef.current;
    if (!el || nextScale <= 1.05) return { x: 0, y: 0 };

    const viewport = el.parentElement?.getBoundingClientRect();
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const maxPanX = (viewportWidth * (nextScale - 1)) / 2;
    const maxPanY = (viewportHeight * (nextScale - 1)) / 2;

    return {
      x: Math.max(Math.min(translateX, maxPanX), -maxPanX),
      y: Math.max(Math.min(translateY, maxPanY), -maxPanY),
    };
  }, []);

  const resetZoom = useCallback(() => {
    stateRef.current.scale = 1.0;
    stateRef.current.translateX = 0;
    stateRef.current.translateY = 0;
    stateRef.current.isPinching = false;
    stateRef.current.isPanning = false;
    stateRef.current.isUnlocked = false;
    setIsUnlocked(false);
    setScale(1.0);
    setTranslate({ x: 0, y: 0 });

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.15s ease-out';
      containerRef.current.style.transform = 'none';
      window.setTimeout(() => {
        if (containerRef.current) containerRef.current.style.transition = '';
      }, 160);
    }
  }, []);

  const zoomTo = useCallback((nextScale: number) => {
    const finalScale = clampScale(nextScale);

    if (finalScale <= 1.05) {
      resetZoom();
      return;
    }

    const bounded = clampPan(finalScale, 0, 0);
    stateRef.current.scale = finalScale;
    stateRef.current.translateX = bounded.x;
    stateRef.current.translateY = bounded.y;
    stateRef.current.isUnlocked = true;
    setIsUnlocked(true);
    setScale(finalScale);
    setTranslate(bounded);
    applyTransform(finalScale, bounded.x, bounded.y);
  }, [applyTransform, clampPan, clampScale, resetZoom]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isExcludedTarget(e.target)) return;
    if (stateRef.current.isUnlocked || stateRef.current.scale > 1.05) {
      resetZoom();
    } else {
      stateRef.current.isUnlocked = true;
      setIsUnlocked(true);
      zoomTo(maxScale);
    }
  }, [maxScale, resetZoom, zoomTo]);

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

    const handleTouchStart = (e: TouchEvent) => {
      if (isExcludedTarget(e.target)) return;

      const now = Date.now();
      if (e.touches.length === 1) {
        if (now - stateRef.current.lastTapTime < 300) {
          e.preventDefault();
          if (stateRef.current.isUnlocked || stateRef.current.scale > 1.05) {
            // Double-tap while unlocked: lock and reset to 1x
            resetZoom();
          } else {
            // Double-tap: unlock pinch to zoom x2
            stateRef.current.isUnlocked = true;
            setIsUnlocked(true);
            zoomTo(maxScale);
          }
          stateRef.current.lastTapTime = 0;
          return;
        }
        stateRef.current.lastTapTime = now;

        // If unlocked and zoomed in, allow single-finger panning
        if (stateRef.current.isUnlocked && stateRef.current.scale > 1.05) {
          stateRef.current.isPanning = true;
          stateRef.current.lastTouchX = e.touches[0].clientX;
          stateRef.current.lastTouchY = e.touches[0].clientY;
        }
      }

      if (e.touches.length === 2) {
        // Pinch to zoom is locked until unlocked by double tap!
        if (!stateRef.current.isUnlocked && stateRef.current.scale <= 1.05) {
          return;
        }

        // Two fingers detected and zoom is unlocked: begin pinch gesture
        stateRef.current.isPinching = true;
        stateRef.current.isPanning = false;
        stateRef.current.initialDistance = getTouchDistance(e);
        stateRef.current.initialScale = stateRef.current.scale;
        const mid = getTouchMidpoint(e);
        stateRef.current.startX = mid.x;
        stateRef.current.startY = mid.y;
        stateRef.current.pinchStartTranslateX = stateRef.current.translateX;
        stateRef.current.pinchStartTranslateY = stateRef.current.translateY;
        stateRef.current.pinchStartMidpointX = mid.x;
        stateRef.current.pinchStartMidpointY = mid.y;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isExcludedTarget(e.target)) return;

      // Handle two-finger pinch to zoom (only active when unlocked)
      if (e.touches.length === 2 && stateRef.current.isPinching) {
        if (!stateRef.current.isUnlocked && stateRef.current.scale <= 1.05) {
          return;
        }
        e.preventDefault(); // Prevent standard browser scroll while pinching
        const currentDistance = getTouchDistance(e);
        if (stateRef.current.initialDistance > 0) {
          const ratio = currentDistance / stateRef.current.initialDistance;
          const newScale = clampScale(stateRef.current.initialScale * ratio);
          const mid = getTouchMidpoint(e);
          const dx = mid.x - stateRef.current.pinchStartMidpointX;
          const dy = mid.y - stateRef.current.pinchStartMidpointY;
          const bounded = clampPan(
            newScale,
            stateRef.current.pinchStartTranslateX + dx,
            stateRef.current.pinchStartTranslateY + dy
          );

          stateRef.current.scale = newScale;
          stateRef.current.translateX = bounded.x;
          stateRef.current.translateY = bounded.y;
          applyTransform(newScale, bounded.x, bounded.y);
        }
        return;
      }

      // Handle panning when unlocked and zoomed in (> 1.05x)
      if (e.touches.length === 1 && stateRef.current.isPanning && stateRef.current.scale > 1.05) {
        const dx = e.touches[0].clientX - stateRef.current.lastTouchX;
        const dy = e.touches[0].clientY - stateRef.current.lastTouchY;

        stateRef.current.lastTouchX = e.touches[0].clientX;
        stateRef.current.lastTouchY = e.touches[0].clientY;

        const bounded = clampPan(
          stateRef.current.scale,
          stateRef.current.translateX + dx,
          stateRef.current.translateY + dy
        );
        stateRef.current.translateX = bounded.x;
        stateRef.current.translateY = bounded.y;
        applyTransform(stateRef.current.scale, bounded.x, bounded.y);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && stateRef.current.isPinching) {
        stateRef.current.isPinching = false;
        let finalScale = stateRef.current.scale;
        if (finalScale < 1.05) {
          resetZoom();
          return;
        }

        finalScale = clampScale(finalScale);
        const bounded = clampPan(finalScale, stateRef.current.translateX, stateRef.current.translateY);
        stateRef.current.scale = finalScale;
        stateRef.current.translateX = bounded.x;
        stateRef.current.translateY = bounded.y;
        setScale(finalScale);
        setTranslate(bounded);

        if (el) {
          el.style.transition = 'transform 0.15s ease-out';
          applyTransform(finalScale, bounded.x, bounded.y);
          setTimeout(() => {
            if (el) el.style.transition = '';
          }, 160);
        }
      }

      if (e.touches.length === 0) {
        stateRef.current.isPanning = false;
        if (stateRef.current.scale <= 1.05) {
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
  }, [applyTransform, clampPan, clampScale, maxScale, resetZoom, zoomTo]);

  return (
    <div
      className="relative w-full min-h-full flex-1 flex flex-col"
      onDoubleClick={handleDoubleClick}
    >
      {/* Zoom Indicator and Quick Lock/Reset Button (Visible only when unlocked or zoomed in) */}
      {(scale > 1.05 || isUnlocked) && (
        <div className="fixed top-16 right-4 z-[9999] flex items-center gap-2 bg-slate-900/95 text-amber-300 border border-amber-400/60 shadow-2xl rounded-full px-3 py-1.5 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black tracking-wide">{scale.toFixed(1)}x</span>
          <span className="text-[10px] text-amber-200/80 font-bold tracking-wider uppercase">Unlocked</span>
          <button
            type="button"
            onClick={resetZoom}
            className="ml-1 p-1 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Lock & Reset Zoom (1x)"
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
          touchAction: 'pan-y',
          overflowAnchor: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};


