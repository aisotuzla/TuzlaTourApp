import React, { useEffect, useRef } from 'react';
import { useBreadcrumbTrail, PoiTarget, RoutePoint, HeadingSource } from '../hooks/useBreadcrumbsTrail';
import { DeviceOrientation } from '../utils/arProjection';

export interface ARBreadcrumbCanvasProps {
  target: PoiTarget | null;
  route: RoutePoint[];
  heading: HeadingSource;
  orientation?: DeviceOrientation | null;
  isActive?: boolean;
  onTargetLocked?: (target: PoiTarget) => void;
  className?: string;
}

export const ARBreadcrumbCanvas: React.FC<ARBreadcrumbCanvasProps> = ({
  target,
  route,
  heading,
  orientation,
  isActive = true,
  onTargetLocked,
  className = 'absolute inset-0 pointer-events-none z-15 w-full h-full',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ResizeObserver to ensure canvas size is pixel-crisp and matches viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const displayWidth = container.clientWidth || window.innerWidth;
      const displayHeight = container.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const canvas = canvasRef.current;
      if (canvas) {
        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
          canvas.width = displayWidth * dpr;
          canvas.height = displayHeight * dpr;
        }
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Connect the gamified breadcrumb trail hook
  useBreadcrumbTrail({
    canvasRef,
    route,
    target,
    heading,
    orientation,
    isActive,
    onTargetLocked,
  });

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default ARBreadcrumbCanvas;
