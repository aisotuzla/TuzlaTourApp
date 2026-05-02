import React, { useEffect, useRef } from 'react';
import { X, Camera, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './ParkQuestViewer.module.css';

interface ParkQuestViewerProps {
  onClose: () => void;
  onOpenScanner: () => void;
  lang: 'en' | 'bs';
}

declare global {
  interface Window {
    pannellum: any;
  }
}

const ParkQuestViewer: React.FC<ParkQuestViewerProps> = ({ onClose, onOpenScanner, lang }) => {
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

      pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
        "default": {
          "firstScene": "entrance",
          "sceneFadeDuration": 1000,
          "type": "flat",
          "autoLoad": true,
          "showControls": true,
          "hotSpotDebug": false
        },
        "scenes": {
          "entrance": {
            "title": lang === 'bs' ? "Ulaz u Park - Centralni Gradski Park" : "Park Entrance - Central City Park",
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko7.webp",
            "hotSpots": [
              { "pitch": -5, "yaw": 0, "type": "scene", "text": lang === 'bs' ? "Uđi u park" : "Walk into the Park", "sceneId": "path1" }
            ]
          },
          "path1": {
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko8.webp",
            "hotSpots": [
              { "pitch": -5, "yaw": 0, "type": "scene", "text": lang === 'bs' ? "Nastavi put" : "Continue Path", "sceneId": "path2" },
              { "pitch": -5, "yaw": 180, "type": "scene", "text": lang === 'bs' ? "Nazad na ulaz" : "Back to Entrance", "sceneId": "entrance" }
            ]
          },
          "path2": {
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko9.webp",
            "hotSpots": [
              { "pitch": -5, "yaw": 0, "type": "scene", "text": lang === 'bs' ? "Priđi trgu" : "Approach the Plaza", "sceneId": "closer" },
              { "pitch": -5, "yaw": 180, "type": "scene", "text": lang === 'bs' ? "Nazad" : "Back", "sceneId": "path1" }
            ]
          },
          "closer": {
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko10.webp",
            "hotSpots": [
              { "pitch": -2, "yaw": 0, "type": "scene", "text": lang === 'bs' ? "Idi do spomenika" : "Go to the Statue", "sceneId": "statue_view" },
              { "pitch": -5, "yaw": 180, "type": "scene", "text": lang === 'bs' ? "Nazad" : "Back", "sceneId": "path2" }
            ]
          },
          "statue_view": {
            "title": "King Tvrtko I Monument",
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko11.webp",
            "hotSpots": [
              { "pitch": 5, "yaw": 0, "type": "scene", "text": lang === 'bs' ? "Pogledaj izbliza" : "Look Closer", "sceneId": "statue_closeup" },
              { 
                "pitch": -12, 
                "yaw": 12, 
                "type": "info", 
                "text": lang === 'bs' ? "PRONAĐENO! Klikni da skeniraš QR kod." : "FOUND! Click to scan the QR code.",
                "clickHandlerFunc": () => {
                  onOpenScanner();
                }
              },
              { "pitch": -5, "yaw": 180, "type": "scene", "text": lang === 'bs' ? "Nazad" : "Back", "sceneId": "closer" }
            ]
          },
          "statue_closeup": {
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko12.webp",
            "hotSpots": [
              { "pitch": 10, "yaw": 0, "type": "scene", "text": lang === 'bs' ? "Pogledaj krunu" : "Look up to Crown", "sceneId": "statue_top" },
              { "pitch": -5, "yaw": 180, "type": "scene", "text": lang === 'bs' ? "Nazad" : "Back", "sceneId": "statue_view" }
            ]
          },
          "statue_top": {
            "panorama": "/assets/Gallery/QuestQRLocations/Tvrko pannellum/KraljTvrko13.webp",
            "hotSpots": [
              { "pitch": -10, "yaw": 180, "type": "scene", "text": lang === 'bs' ? "Nazad" : "Back", "sceneId": "statue_closeup" }
            ]
          }
        }
      });
    };

    initViewer();

    return () => {
      if (pannellumInstance.current) {
        pannellumInstance.current.destroy();
      }
    };
  }, [lang, onOpenScanner]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={styles.overlay}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className={styles.title}>{lang === 'bs' ? 'POTRAGA: Gradski Park' : 'QUEST: City Park'}</h2>
            <p className={styles.subtitle}>{lang === 'bs' ? 'Pronađi skriveni QR kod kod kipa kralja' : 'Find the hidden QR code near the statue!'}</p>
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
            <span>{lang === 'bs' ? 'Navigiraj strelicama' : 'Navigate using arrows'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParkQuestViewer;
