import React, { useState, useEffect } from 'react';
import styles from './WaterSplash.module.css';

/**
 * Information stored for each droplet.
 */
type Drop = {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  duration: number;
  depth: number;
  scale: number;
  rotation: number;
};

type Ripple = {
  id: number;
  x: number;
  y: number;
};

/**
 * WaterSplash component – fills the whole screen.
 * When the user clicks/taps it creates a 360-degree 3D teardrop splash.
 */
export const WaterSplash = () => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = Date.now();

      // Impact Ripple (Rubber ball hitting lake)
      const newRipple = { id: now, x, y };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== now));
      }, 600);

      // Generate 24 droplets for a dense 360-degree splash
      const dropCount = 24;
      const newDrops: Drop[] = Array.from({ length: dropCount }, (_, i) => {
        const angleDeg = (360 / dropCount) * i + (Math.random() * 10 - 5);
        const angleRad = (angleDeg * Math.PI) / 180;

        return {
          id: now + i,
          x,
          y,
          angle: angleRad,
          distance: 120 + Math.random() * 180, // Farther reach
          duration: 0.7 + Math.random() * 0.5,
          depth: Math.random() * 60 - 30, // 3D depth simulation
          scale: 0.6 + Math.random() * 0.6,
          rotation: angleDeg + 90, // Teardrop points away from impact
        };
      });

      setDrops((prev) => [...prev, ...newDrops]);

      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => !newDrops.includes(d)));
      }, 1200);
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => window.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, []);

  return (
    <div className={styles.splashContainer}>
      {/* Visual Impact Center (Ripple) */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}

      {/* Outward 3D Teardrops */}
      {drops.map((drop) => (
        <div
          key={drop.id}
          className={`${styles.drop} ${styles.animateDrop}`}
          style={{
            '--startX': `${drop.x}px`,
            '--startY': `${drop.y}px`,
            '--angle': `${drop.angle}rad`,
            '--distance': `${drop.distance}px`,
            '--duration': `${drop.duration}s`,
            '--depth': `${drop.depth}px`,
            '--endScale': drop.scale,
            '--rotation': `${drop.rotation}deg`,
            '--easing': 'cubic-bezier(0.1, 0.5, 0.5, 1)',
            left: 0,
            top: 0,
          } as Record<string, string | number>}
        />
      ))}
    </div>
  );
};

export default WaterSplash;
