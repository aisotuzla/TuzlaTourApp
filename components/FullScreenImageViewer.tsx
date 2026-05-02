import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImage } from '../hooks/ImageContext';

const FullScreenImageViewer: React.FC = () => {
    const { 
        images, 
        currentIndex, 
        isOpen, 
        closeGallery, 
        nextImage, 
        prevImage 
    } = useImage();

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState<number | null>(null);
    
    // Pinch-to-zoom state
    const [isPinching, setIsPinching] = useState(false);
    const lastPinchDistance = useRef<number | null>(null);
    const lastPinchCenter = useRef<{ x: number; y: number } | null>(null);
    const pinchStartScale = useRef(1);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const currentImage = images[currentIndex];

    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, currentIndex]);

    const zoomIn = useCallback(() => {
        setScale(s => Math.min(5, s + 0.2));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(s => Math.max(0.5, s - 0.2));
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'AudioVolumeUp' || e.key === 'VolumeUp' || (e as any).keyCode === 24) {
                e.preventDefault();
                zoomIn();
            }
            if (e.key === 'AudioVolumeDown' || e.key === 'VolumeDown' || (e as any).keyCode === 25) {
                e.preventDefault();
                zoomOut();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, nextImage, prevImage, closeGallery, zoomIn, zoomOut]);

    // Prevent default browser pinch-to-zoom on the viewer
    useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (!container) return;

        const preventDefaultTouch = (e: TouchEvent) => {
            if (e.touches.length >= 2) {
                e.preventDefault();
            }
        };

        // Also prevent gesture events (Safari)
        const preventGesture = (e: Event) => {
            e.preventDefault();
        };

        container.addEventListener('touchmove', preventDefaultTouch, { passive: false });
        container.addEventListener('gesturestart', preventGesture);
        container.addEventListener('gesturechange', preventGesture);
        container.addEventListener('gestureend', preventGesture);

        return () => {
            container.removeEventListener('touchmove', preventDefaultTouch);
            container.removeEventListener('gesturestart', preventGesture);
            container.removeEventListener('gesturechange', preventGesture);
            container.removeEventListener('gestureend', preventGesture);
        };
    }, [isOpen]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!isOpen) return;
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        const newScale = Math.max(0.5, Math.min(5, scale + delta));
        setScale(newScale);
    }, [isOpen, scale]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Helper to get distance between two touch points
    const getTouchDistance = (t1: React.Touch, t2: React.Touch): number => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Helper to get center point between two touches
    const getTouchCenter = (t1: React.Touch, t2: React.Touch): { x: number; y: number } => {
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2,
        };
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch-to-zoom start
            setIsPinching(true);
            setIsDragging(false);
            setTouchStart(null);
            const dist = getTouchDistance(e.touches[0], e.touches[1]);
            lastPinchDistance.current = dist;
            pinchStartScale.current = scale;
            lastPinchCenter.current = getTouchCenter(e.touches[0], e.touches[1]);
        } else if (e.touches.length === 1) {
            if (scale > 1) {
                // Panning when zoomed
                setIsDragging(true);
                setDragStart({
                    x: e.touches[0].clientX - position.x,
                    y: e.touches[0].clientY - position.y
                });
            } else {
                // Swipe detection
                setTouchStart(e.touches[0].clientX);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch-to-zoom move
            const dist = getTouchDistance(e.touches[0], e.touches[1]);
            const center = getTouchCenter(e.touches[0], e.touches[1]);

            if (lastPinchDistance.current !== null) {
                const ratio = dist / lastPinchDistance.current;
                const newScale = Math.max(0.5, Math.min(5, pinchStartScale.current * ratio));
                setScale(newScale);

                // Pan toward pinch center for natural feel
                if (lastPinchCenter.current && newScale > 1) {
                    const dx = center.x - lastPinchCenter.current.x;
                    const dy = center.y - lastPinchCenter.current.y;
                    setPosition(prev => ({
                        x: prev.x + dx * 0.5,
                        y: prev.y + dy * 0.5,
                    }));
                }
            }

            lastPinchCenter.current = center;
        } else if (isDragging && e.touches.length === 1) {
            // Panning
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (isPinching) {
            // End pinch — if scaled down to ~1, snap back
            if (scale <= 1.05) {
                setScale(1);
                setPosition({ x: 0, y: 0 });
            }
            setIsPinching(false);
            lastPinchDistance.current = null;
            lastPinchCenter.current = null;
            return;
        }

        if (scale === 1 && touchStart !== null) {
            const touchEnd = e.changedTouches[0].clientX;
            const diff = touchStart - touchEnd;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextImage();
                else prevImage();
            }
        }
        setIsDragging(false);
        setTouchStart(null);
    };

    // Double-tap to zoom in/out
    const lastTapTime = useRef(0);
    const handleDoubleTap = useCallback((e: React.TouchEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            e.preventDefault();
            if (scale > 1) {
                // Reset zoom
                setScale(1);
                setPosition({ x: 0, y: 0 });
            } else {
                // Zoom in to 2.5x centered on tap position
                const touch = e.changedTouches[0];
                const container = containerRef.current;
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const tapX = touch.clientX - rect.left;
                    const tapY = touch.clientY - rect.top;
                    const newScale = 2.5;
                    setScale(newScale);
                    setPosition({
                        x: (centerX - tapX) * (newScale - 1) * 0.5,
                        y: (centerY - tapY) * (newScale - 1) * 0.5,
                    });
                } else {
                    setScale(2.5);
                }
            }
        }
        lastTapTime.current = now;
    }, [scale]);

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
            imgRef.current.style.transition = isDragging || isPinching ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }, [position, scale, isDragging, isPinching]);

    if (!isOpen || !currentImage) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden touch-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => { handleDoubleTap(e); handleTouchEnd(e); }}
        >
            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-4 z-[110]">
                <div className="flex bg-slate-900/80 rounded-full border border-white/10 p-1">
                    <button
                        onClick={zoomIn}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={zoomOut}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button
                        onClick={resetZoom}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
                <button
                    onClick={closeGallery}
                    title="Close Gallery"
                    aria-label="Close Gallery"
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 active:scale-90 shadow-lg"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        title="Previous Image"
                        aria-label="Previous Image"
                        className="absolute left-4 z-[110] p-3 text-blue-500 hover:text-blue-400 transition-all hover:scale-110 active:scale-90 drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100"
                    >
                        <ChevronLeft size={36} strokeWidth={4} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        title="Next Image"
                        aria-label="Next Image"
                        className="absolute right-4 z-[110] p-3 text-blue-500 hover:text-blue-400 transition-all hover:scale-110 active:scale-90 drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100"
                    >
                        <ChevronRight size={36} strokeWidth={4} />
                    </button>
                </>
            )}

            {/* Image Container */}
            <div
                className={`relative w-[98vw] h-[98vh] flex items-center justify-center transition-transform duration-75 ease-out ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    ref={imgRef}
                    src={currentImage}
                    alt="Gallery"
                    className="max-w-full max-h-full object-contain select-none pointer-events-none rounded-sm"
                />
            </div>

            {/* Info Badges */}
            <div className="absolute bottom-6 flex flex-col items-center gap-2 z-[110]">
                {images.length > 1 && (
                    <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black tracking-widest border border-blue-500 uppercase shadow-lg">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
                <div className="px-3 py-1 bg-slate-900/60 text-white/80 rounded-full text-[10px] border border-white/5 uppercase tracking-tighter">
                    {Math.round(scale * 100)}% ZOOM
                </div>
            </div>
        </div>
    );
};

export default FullScreenImageViewer;
