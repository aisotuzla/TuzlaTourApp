import React, { useEffect, useRef } from 'react';
import { X, Camera, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Reusing same styles as ParkQuestViewer for consistency
import styles from './ParkQuestViewer.module.css';

interface StreetViewerProps {
  panoramaUrl: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  lang: 'en' | 'bs';
}

declare global {
  interface Window {
    pannellum: any;
  }
}

const StreetViewer: React.FC<StreetViewerProps> = ({ panoramaUrl, title, subtitle, onClose, lang }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumInstance = useRef<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Wait for Pannellum to be available in global scope (index.html)
    const initViewer = () => {
      if (typeof window.pannellum === 'undefined') {
        setTimeout(initViewer, 100);
        return;
      }

      // Initialize a standalone equirectangular panorama
      pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
        "type": "equirectangular",
        "panorama": panoramaUrl,
        "autoLoad": true,
        "showControls": true,
        "hotSpotDebug": false,
        "compass": false,
      });
    };

    initViewer();

    return () => {
      if (pannellumInstance.current) {
        pannellumInstance.current.destroy();
      }
    };
  }, [panoramaUrl]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={styles.overlay}
      style={{ zIndex: 9999 }}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} className={styles.closeBtn}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className={styles.viewerContainer}>
        <div ref={viewerRef} className={styles.viewer} />
        
        {/* HUD Elements */}
        <div className={styles.hud}>
          <div className={styles.instructionBox}>
            <Camera className="w-4 h-4 text-white/60" />
            <span>{lang === 'bs' ? 'Navigiraj prstom/mišem za 360° pogled' : 'Drag to look around in 360°'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreetViewer;
