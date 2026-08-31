import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Language, Location } from '../types';
import { LOCATIONS, TRANSLATIONS } from '../constants';
import {
  Camera,
  Info,
  X,
  MapPin,
  Compass,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
} from 'lucide-react';
import {
  getARProjection,
  ARStage,
  DeviceOrientation,
  WGS84Location,
  smoothHeading,
} from '../utils/arProjection';
import { AppFeatures } from '../utils/platform';
import { useQuestRuntimePolicy } from '../hooks/useQuestRuntimePolicy';
import { useGeoapifyRoute } from '../hooks/useGeoapifyRoute';
import { ARPolylineCanvas } from './ARPolylineCanvas';
import { QrScannerModal } from './QrScannerModal';
import { POI_COLORS } from './Route_POI_QUEST_TARGET';

interface ARGuideProps {
  lang: Language;
  features: AppFeatures;
  onNavigate?: (poi: Location) => void;
  initialTarget?: Location | null;
  unlockedRewards?: string[];
  onRewardFound?: (id: string) => void;
}

const AR_LOCALIZATION: Record<
  Language,
  {
    startArTour: string;
    enableArSensors: string;
    arSensorsDesc: string;
    motionPermissionDenied: string;
    cameraUnavailable: string;
    gpsNotSupported: string;
    cameraActive: string;
    compassMode: string;
    startGuide: string;
    viewOnMap: string;
    targetLocked: string;
    stepOf: (step: number, total: number) => string;
    toTurn: string;
    totalRemaining: string;
    turnLeft: (deg: number) => string;
    turnRight: (deg: number) => string;
    metersAway: (m: number) => string;
    instructionsTitle: string;
    instructionsDesc: string;
    calibrationNeeded: string;
    endNavigation: string;
  }
> = {
  en: {
    startArTour: 'Start AR Tour Guide',
    enableArSensors: 'Enable AR Guide',
    arSensorsDesc: 'Experience real-time 3D camera navigation and interactive landmark discovery powered by Geoapify routing.',
    motionPermissionDenied: 'Motion sensor permission denied.',
    cameraUnavailable: 'Camera is unavailable in this browser.',
    gpsNotSupported: 'GPS location is not supported in this browser.',
    cameraActive: 'WebAR Camera Active',
    compassMode: 'Compass 360 Mode',
    startGuide: 'Start AR Guide',
    viewOnMap: 'View on Map',
    targetLocked: 'TARGET LOCKED',
    stepOf: (step, total) => `Step ${step} of ${total}`,
    toTurn: 'to turn',
    totalRemaining: 'total remaining',
    turnLeft: (deg) => `${deg}° LEFT`,
    turnRight: (deg) => `${deg}° RIGHT`,
    metersAway: (m) => `${m} meters away`,
    instructionsTitle: 'AR Guide Instructions',
    instructionsDesc: 'Point your device camera towards Tuzla landmarks to see live 3D AR badges and walking path overlays. Select any landmark and tap "Start AR Guide" to launch real-time turn-by-turn navigation!',
    calibrationNeeded: 'Compass Calibration Needed',
    endNavigation: 'End Navigation',
  },
  bs: {
    startArTour: 'Pokreni AR Vodič',
    enableArSensors: 'Omogući AR Vodič',
    arSensorsDesc: 'Iskusite 3D kameru uživo, navigaciju u realnom vremenu i otkrivanje znamenitosti pokretano Geoapify rutiranjem.',
    motionPermissionDenied: 'Pristup senzorima pokreta je odbijen.',
    cameraUnavailable: 'Kamera nije dostupna u ovom pregledniku.',
    gpsNotSupported: 'GPS lokacija nije podržana u ovom pregledniku.',
    cameraActive: 'WebAR Kamera Aktivna',
    compassMode: 'Kompas 360 Režim',
    startGuide: 'Započni AR Navigaciju',
    viewOnMap: 'Prikaži na mapi',
    targetLocked: 'CILJ ZAKLJUČAN',
    stepOf: (step, total) => `Korak ${step} od ${total}`,
    toTurn: 'do skretanja',
    totalRemaining: 'ukupno preostalo',
    turnLeft: (deg) => `${deg}° LIJEVO`,
    turnRight: (deg) => `${deg}° DESNO`,
    metersAway: (m) => `${m} metara udaljeno`,
    instructionsTitle: 'AR Uputstva za Vodiča',
    instructionsDesc: 'Usmjerite kameru uređaja prema znamenitostima Tuzle da vidite 3D AR oznake i stazu u realnom vremenu. Odaberite lokaciju i dodirnite "Započni AR Navigaciju" za turn-by-turn vođenje!',
    calibrationNeeded: 'Potrebna Kalibracija Kompasa',
    endNavigation: 'Završi Navigaciju',
  },
  de: {
    startArTour: 'AR-Tour starten',
    enableArSensors: 'AR-Guide aktivieren',
    arSensorsDesc: 'Erleben Sie Echtzeit-3D-Kameranavigation und interaktive Entdeckung von Sehenswürdigkeiten powered by Geoapify.',
    motionPermissionDenied: 'Bewegungssensor-Berechtigung verweigert.',
    cameraUnavailable: 'Kamera ist in diesem Browser nicht verfügbar.',
    gpsNotSupported: 'GPS-Standort wird in diesem Browser nicht unterstützt.',
    cameraActive: 'WebAR-Kamera aktiv',
    compassMode: 'Kompass 360 Modus',
    startGuide: 'AR-Navigation starten',
    viewOnMap: 'Auf Karte anzeigen',
    targetLocked: 'ZIEL ANVISIERT',
    stepOf: (step, total) => `Schritt ${step} von ${total}`,
    toTurn: 'bis Abbiegen',
    totalRemaining: 'insgesamt verbleibend',
    turnLeft: (deg) => `${deg}° LINKS`,
    turnRight: (deg) => `${deg}° RECHTS`,
    metersAway: (m) => `${m} Meter entfernt`,
    instructionsTitle: 'AR-Guide Anleitung',
    instructionsDesc: 'Richten Sie Ihre Kamera auf Sehenswürdigkeiten in Tuzla, um 3D-AR-Badges und Wegpfade zu sehen. Wählen Sie einen Ort und tippen Sie auf "AR-Navigation starten"!',
    calibrationNeeded: 'Kompass-Kalibrierung erforderlich',
    endNavigation: 'Navigation beenden',
  },
  tr: {
    startArTour: 'AR Rehberini Başlat',
    enableArSensors: 'AR Rehberini Etkinleştir',
    arSensorsDesc: 'Geoapify ile güçlendirilmiş gerçek zamanlı 3D kamera navigasyonu ve etkileşimli yer keşfini deneyimleyin.',
    motionPermissionDenied: 'Hareket sensörü izni reddedildi.',
    cameraUnavailable: 'Kamera bu tarayıcıda kullanılamıyor.',
    gpsNotSupported: 'GPS konumu bu tarayıcıda desteklenmiyor.',
    cameraActive: 'WebAR Kamera Aktif',
    compassMode: 'Pusula 360 Modu',
    startGuide: 'AR Navigasyonunu Başlat',
    viewOnMap: 'Haritada Gör',
    targetLocked: 'HEDEF KİLİTLENDİ',
    stepOf: (step, total) => `Adım ${step} / ${total}`,
    toTurn: 'dönüşe',
    totalRemaining: 'toplam kalan',
    turnLeft: (deg) => `${deg}° SOLA`,
    turnRight: (deg) => `${deg}° SAĞA`,
    metersAway: (m) => `${m} metre uzaklıkta`,
    instructionsTitle: 'AR Rehberi Talimatları',
    instructionsDesc: 'Tuzla simge yapılarına kameranızı doğrultun, 3D AR rozetlerini ve yürüyüş yollarını görün. Bir konum seçin ve "AR Navigasyonunu Başlat"a dokunun!',
    calibrationNeeded: 'Pusula Kalibrasyonu Gerekli',
    endNavigation: 'Navigasyonu Bitir',
  },
};

const ARMarker: React.FC<{
  location: Location;
  lang: Language;
  isFocusedTarget: boolean;
  isOtherDimmed: boolean;
  onSelect: (loc: Location, distance: number) => void;
  domRef: React.RefObject<HTMLDivElement | null>;
  distRef: React.RefObject<HTMLSpanElement | null>;
  currentDistState: React.MutableRefObject<number>;
}> = ({ location, lang, isFocusedTarget, isOtherDimmed, onSelect, domRef, distRef, currentDistState }) => {
  const getCategoryColor = (category: string, target: boolean) => {
    if (target) return 'bg-amber-400 border-amber-500 text-amber-950 shadow-[0_0_25px_rgba(251,191,36,0.8)]';
    switch (category) {
      case 'nature':
        return 'bg-emerald-500 border-emerald-600 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
      case 'culture':
      case 'landmark':
        return 'bg-amber-500 border-amber-600 text-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
      case 'shopping':
      case 'food':
      case 'hotel':
        return 'bg-blue-500 border-blue-600 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]';
      default:
        return 'bg-slate-500 border-slate-600 text-slate-600 shadow-[0_0_20px_rgba(100,116,139,0.4)]';
    }
  };

  const colors = getCategoryColor(location.category, isFocusedTarget).split(' ');

  return (
    <div
      ref={domRef}
      className={`absolute pointer-events-auto transition-all duration-150 will-change-transform [display:none] ${isOtherDimmed ? 'opacity-20 blur-[2px] pointer-events-none scale-75' : 'opacity-100'
        }`}
    >
      <button
        onClick={() => onSelect(location, currentDistState.current)}
        className="flex flex-col items-center group focus:outline-none"
      >
        <div className="relative">
          <div
            className={`absolute inset-0 ${colors[0]} rounded-full blur-md ${isFocusedTarget ? 'animate-ping opacity-90' : 'animate-pulse opacity-60'
              }`}
          />
          <div
            className={`relative w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border-4 ${colors[1]} shadow-2xl group-hover:scale-110 transition-transform`}
          >
            {isFocusedTarget ? (
              <Target className={`w-7 h-7 ${colors[2]} animate-spin-slow`} />
            ) : (
              <MapPin className={`w-7 h-7 ${colors[2]}`} />
            )}
          </div>
        </div>
        <div
          className={`mt-2 px-4 py-1.5 ${isFocusedTarget ? 'bg-amber-950/90 border-amber-400' : 'bg-slate-950/85 border-white/30'
            } backdrop-blur-md rounded-full border shadow-xl flex items-center gap-1.5`}
        >
          <span className="text-white text-xs font-black whitespace-nowrap tracking-wide">
            {location.name[lang] || location.name.en}
          </span>
          <span ref={distRef} className="text-amber-300 text-[11px] font-bold">
            ...
          </span>
        </div>
      </button>
    </div>
  );
};

export const ARGuide: React.FC<ARGuideProps> = ({
  lang,
  features,
  onNavigate,
  initialTarget = null,
  unlockedRewards = [],
  onRewardFound,
}) => {
  const { policy } = useQuestRuntimePolicy(features);
  const t = AR_LOCALIZATION[lang] || AR_LOCALIZATION.en;
  const globalT = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'AR' | 'HORIZON'>(features.isAndroidLight ? 'HORIZON' : 'AR');
  const [showHelp, setShowHelp] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isForeground, setIsForeground] = useState(true);

  // Target Quest Focus Mode state
  const [targetPoi, setTargetPoi] = useState<Location | null>(initialTarget);
  const [selectedLocation, setSelectedLocation] = useState<{ loc: Location; dist: number } | null>(null);
  const [localUnlockedRewards, setLocalUnlockedRewards] = useState<string[]>(unlockedRewards);

  // Automated 5m Geofence Scanner Modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Location & Orientation State
  const userLocationRef = useRef<WGS84Location | null>(null);
  const [userLocationState, setUserLocationState] = useState<WGS84Location | null>(null);
  const orientationRef = useRef<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [orientationState, setOrientationState] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);

  // Animation Loop Refs
  const lastFrameTimeRef = useRef<number>(0);
  const markerRefs = useRef<
    Record<string, { dom: HTMLDivElement | null; dist: HTMLSpanElement | null; currentDist: number }>
  >({});
  const smoothedAlphaRef = useRef<number | null>(null);

  // Relative Bearing tracking for reticle and chevrons
  const [targetRelativeBearing, setTargetRelativeBearing] = useState<number | null>(null);
  const [targetDistance, setTargetDistance] = useState<number | null>(null);

  // Geoapify Routing Hook
  const {
    fullPolyline,
    steps,
    activeStepIndex,
    activeStep,
    distanceToNextStep,
    distanceToDestination,
  } = useGeoapifyRoute({
    origin: userLocationState,
    destination: targetPoi ? { lat: targetPoi.coordinates[0], lng: targetPoi.coordinates[1] } : null,
    enabled: !!targetPoi && !!userLocationState,
    onReachDestination: () => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (_) { }
      }
      setIsQrModalOpen(true);
    },
  });

  // Handle Document Visibility Changes
  useEffect(() => {
    const handleVisibility = () => {
      setIsForeground(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Camera Management
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(t.cameraUnavailable);
        setCameraActive(false);
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: policy.arFx.cameraWidth },
          height: { ideal: policy.arFx.cameraHeight },
          frameRate: { ideal: policy.arFx.cameraIdealFps, max: policy.arFx.cameraMaxFps },
        },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera start failed, falling back to panorama:', err);
      setCameraActive(false);
    }
  }, [policy.arFx, t.cameraUnavailable]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!permissionGranted || !isForeground) {
      if (cameraActive) stopCamera();
      return;
    }
    if (viewMode === 'AR' && !cameraActive) {
      startCamera();
    } else if (viewMode === 'HORIZON' && cameraActive) {
      stopCamera();
    }
  }, [viewMode, permissionGranted, isForeground, cameraActive, startCamera, stopCamera]);

  // GPS Geolocation Watcher
  useEffect(() => {
    if (!permissionGranted || !isForeground) return;

    if (!navigator.geolocation) {
      setError(t.gpsNotSupported);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc: WGS84Location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          elevation: pos.coords.altitude ?? 0,
        };
        userLocationRef.current = newLoc;
        setUserLocationState(newLoc);
      },
      (err) => {
        console.warn('AR Geolocation error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [permissionGranted, isForeground, t.gpsNotSupported]);

  // Sensor Fusion (iOS webkitCompassHeading vs Android W3C Device Orientation)
  useEffect(() => {
    if (!permissionGranted || !isForeground) return;

    let hasAbsolute = false;

    const handleOrientation = (e: DeviceOrientationEvent, isAbs: boolean) => {
      if (hasAbsolute && !isAbs) return;
      if (isAbs) hasAbsolute = true;

      let alpha: number | null = null;
      if ((e as any).webkitCompassHeading !== undefined) {
        // iOS Safari Compass Heading (0..360 deg CW from Magnetic North)
        alpha = (e as any).webkitCompassHeading;
        if ((e as any).webkitCompassAccuracy !== undefined) {
          setHeadingAccuracy((e as any).webkitCompassAccuracy);
        }
      } else if (e.alpha !== null) {
        // Standard Android W3C Alpha
        alpha = (360 - e.alpha) % 360;
      }

      // Smooth heading with Exponential Moving Average
      if (alpha !== null) {
        alpha = smoothHeading(alpha, smoothedAlphaRef.current, 0.18);
        smoothedAlphaRef.current = alpha;
      }

      const screenAngle = window.screen?.orientation?.angle || (window.orientation as number) || 0;
      if (alpha !== null) {
        alpha = (alpha + screenAngle) % 360;
      }

      const beta = e.beta ?? 90;
      const gamma = e.gamma ?? 0;

      const newOrient: DeviceOrientation = { alpha, beta, gamma };
      orientationRef.current = newOrient;
      setOrientationState(newOrient);
    };

    const handleAbsolute = (e: DeviceOrientationEvent) => handleOrientation(e, true);
    const handleRelative = (e: DeviceOrientationEvent) => handleOrientation(e, false);

    window.addEventListener('deviceorientationabsolute', handleAbsolute as any);
    window.addEventListener('deviceorientation', handleRelative as any);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleAbsolute as any);
      window.removeEventListener('deviceorientation', handleRelative as any);
    };
  }, [permissionGranted, isForeground]);

  // Master AR Render Loop (Target 30-60 FPS)
  useEffect(() => {
    if (!permissionGranted || !isForeground) return;

    let frameId: number;
    const targetFps = policy.arFx.targetFps || 30;
    const frameInterval = 1000 / targetFps;

    const loop = (timestamp: number) => {
      frameId = requestAnimationFrame(loop);

      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed < frameInterval) return;
      lastFrameTimeRef.current = timestamp;

      const userLoc = userLocationRef.current;
      const orient = orientationRef.current;
      if (!userLoc || orient.alpha === null) return;

      // Update 3D AR Marker positions
      if (viewMode === 'AR') {
        LOCATIONS.forEach((loc) => {
          const refs = markerRefs.current[loc.id];
          if (!refs || !refs.dom) return;

          const proj = getARProjection(userLoc, orient, {
            lat: loc.coordinates[0],
            lng: loc.coordinates[1],
          });
          refs.currentDist = proj.distance;

          if (!proj.isVisible || proj.stage === ARStage.LONG_RANGE) {
            refs.dom.style.display = 'none';
          } else {
            refs.dom.style.display = 'block';
            refs.dom.style.left = `${proj.x}%`;
            refs.dom.style.top = `${proj.y}%`;
            refs.dom.style.transform = `translate(-50%, -50%) scale(${proj.scale})`;
            if (refs.dist) refs.dist.textContent = `${Math.round(proj.distance)}m`;
          }
        });
      }

      // Track relative bearing to active target / maneuver turn
      if (targetPoi) {
        const targetProj = getARProjection(userLoc, orient, {
          lat: targetPoi.coordinates[0],
          lng: targetPoi.coordinates[1],
        });
        setTargetRelativeBearing(targetProj.relativeBearing);
        setTargetDistance(targetProj.distance);
      } else if (activeStep) {
        const stepProj = getARProjection(userLoc, orient, {
          lat: activeStep.lat,
          lng: activeStep.lng,
        });
        setTargetRelativeBearing(stepProj.relativeBearing);
        setTargetDistance(stepProj.distance);
      } else {
        setTargetRelativeBearing(null);
        setTargetDistance(null);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [permissionGranted, isForeground, viewMode, policy.arFx.targetFps, targetPoi, activeStep]);

  // Sensor Permission Handler
  const requestPermission = async () => {
    setError(null);
    try {
      const OrientationEvent = (window as any).DeviceOrientationEvent;
      if (OrientationEvent && typeof OrientationEvent.requestPermission === 'function') {
        const res = await OrientationEvent.requestPermission();
        if (res !== 'granted') {
          setError(t.motionPermissionDenied);
          return;
        }
      }
      setPermissionGranted(true);
    } catch (err) {
      console.warn('AR permission request error:', err);
      setPermissionGranted(true);
    }
  };

  const handleStartQuestTarget = (loc: Location) => {
    setTargetPoi(loc);
    setSelectedLocation(null);
  };

  const handleClearQuestTarget = () => {
    setTargetPoi(null);
    setTargetRelativeBearing(null);
    setTargetDistance(null);
  };

  const handleRewardFoundInternal = (id: string) => {
    if (!localUnlockedRewards.includes(id)) {
      const updated = [...localUnlockedRewards, id];
      setLocalUnlockedRewards(updated);
    }
    if (onRewardFound) {
      onRewardFound(id);
    }
  };

  // Chevrons & Reticle Offscreen Angles
  const isTargetOffscreenLeft = targetRelativeBearing !== null && targetRelativeBearing < -15;
  const isTargetOffscreenRight = targetRelativeBearing !== null && targetRelativeBearing > 15;
  const isTargetInCenterVision =
    targetRelativeBearing !== null && Math.abs(targetRelativeBearing) <= 15;

  return (
    <div className="relative w-full h-[calc(100vh-88px)] bg-slate-950 overflow-hidden select-none flex flex-col font-quicksand">
      {/* TOP 40% - AR VIEWPORT & CAMERA */}
      <div className="relative w-full h-[40%] flex-shrink-0 bg-slate-950 overflow-hidden border-b border-amber-500/40 shadow-xl">
        {/* 1. CAMERA & PASS-THROUGH VIEWPORT */}
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-950">
            <iframe
              src="/assets/Gallery/QuestQRLocations/Tvrko%20pannellum/pannellum/pannellum.htm?panorama=../tz.jpg&autoLoad=true"
              className="w-full h-full border-none pointer-events-auto opacity-80"
              title="Tuzla 360 Panorama"
              allow="gyroscope; accelerometer"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
          </div>
        )}

        {/* 2. REAL-TIME 3D CANVAS PATH POLYLINE LAYER */}
        {permissionGranted && (
          <ARPolylineCanvas
            polyline={fullPolyline}
            userLocation={userLocationState}
            orientation={orientationState}
            maxHorizonMeters={40}
            isActive={viewMode === 'AR' && isForeground}
          />
        )}

        {/* 3. DYNAMIC 3D AR POI MARKERS */}
        {permissionGranted && (
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${viewMode === 'AR' ? 'opacity-100' : 'opacity-20'
              }`}
          >
            {LOCATIONS.map((loc) => {
              if (!markerRefs.current[loc.id]) {
                markerRefs.current[loc.id] = { dom: null, dist: null, currentDist: Infinity };
              }
              const refs = markerRefs.current[loc.id];
              const isFocused = targetPoi?.id === loc.id;
              const isDimmed = !!targetPoi && targetPoi.id !== loc.id;

              return (
                <ARMarker
                  key={loc.id}
                  location={loc}
                  lang={lang}
                  isFocusedTarget={isFocused}
                  isOtherDimmed={isDimmed}
                  onSelect={(l, d) => setSelectedLocation({ loc: l, dist: d })}
                  domRef={{
                    get current() {
                      return refs.dom;
                    },
                    set current(v) {
                      refs.dom = v;
                    },
                  }}
                  distRef={{
                    get current() {
                      return refs.dist;
                    },
                    set current(v) {
                      refs.dist = v;
                    },
                  }}
                  currentDistState={{
                    get current() {
                      return refs.currentDist;
                    },
                    set current(v) {
                      refs.currentDist = v;
                    },
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 4. QUEST FOCUS MODE: CENTER VISION TARGET RETICLE (±15°) */}
        {permissionGranted && targetPoi && isTargetInCenterVision && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
              <div className="absolute w-32 h-32 rounded-full border-2 border-amber-400/60 animate-ping" />
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-amber-400 flex items-center justify-center animate-spin-slow bg-amber-500/10 backdrop-blur-[2px] shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-amber-950/90 border border-amber-400 rounded-full shadow-2xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">
                  {t.targetLocked} • {targetDistance ? `${Math.round(targetDistance)}m` : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. SIDE HUD DIRECTIONAL GUIDANCE CHEVRONS (>15°) */}
        {permissionGranted && (targetPoi || activeStep) && (
          <>
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-300 ${isTargetOffscreenLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                }`}
            >
              <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-400/80 px-3 py-2 rounded-2xl backdrop-blur-md shadow-2xl animate-pulse">
                <ChevronLeft className="w-6 h-6 text-amber-400 animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-amber-400 font-black text-[10px] uppercase tracking-widest">
                    {targetRelativeBearing !== null
                      ? t.turnLeft(Math.round(Math.abs(targetRelativeBearing)))
                      : 'LEFT'}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-300 ${isTargetOffscreenRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                }`}
            >
              <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-400/80 px-3 py-2 rounded-2xl backdrop-blur-md shadow-2xl animate-pulse">
                <div className="flex flex-col text-right">
                  <span className="text-amber-400 font-black text-[10px] uppercase tracking-widest">
                    {targetRelativeBearing !== null
                      ? t.turnRight(Math.round(targetRelativeBearing))
                      : 'RIGHT'}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>
            </div>
          </>
        )}

        {/* TOP CONTROLS BADGE */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-30 pointer-events-none">
          {!targetPoi && (
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
              <div className={`w-2 h-2 rounded-full animate-pulse ${cameraActive ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">
                {cameraActive ? t.cameraActive : t.compassMode}
              </span>
            </div>
          )}

          <div className="flex gap-2 pointer-events-auto ml-auto">
            <button
              onClick={() => setViewMode(viewMode === 'AR' ? 'HORIZON' : 'AR')}
              className="bg-blue-600/90 hover:bg-blue-600 p-2 rounded-xl border border-white/20 text-white shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-1 px-2.5"
            >
              {viewMode === 'AR' ? <Compass className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span className="text-[10px] font-bold uppercase tracking-wider">{viewMode}</span>
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="bg-slate-900/80 hover:bg-slate-800 p-2 rounded-xl border border-white/20 text-white shadow-xl backdrop-blur-md transition-all active:scale-95"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM 60% - AR GUIDE SCREEN DASHBOARD */}
      <div className="relative w-full h-[60%] flex-1 bg-slate-900/95 backdrop-blur-2xl overflow-y-auto p-4 space-y-4 border-t border-amber-500/40 rounded-t-[2.5rem] shadow-2xl flex flex-col">
        {/* COMPASS CALIBRATION BADGE */}
        {headingAccuracy !== null && headingAccuracy > 20 && (
          <div className="w-full bg-amber-500/90 text-slate-950 px-4 py-2 rounded-2xl text-xs font-black uppercase text-center animate-pulse shadow-md border border-amber-300">
            ⚠️ {t.calibrationNeeded}
          </div>
        )}

        {/* TURN-BY-TURN GUIDANCE BANNER */}
        {permissionGranted && targetPoi && activeStep && (
          <div className="bg-slate-950/90 border border-amber-400/50 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              {activeStep.type.includes('Right') ? (
                <Navigation className="w-5 h-5 rotate-90 text-amber-400" />
              ) : activeStep.type.includes('Left') ? (
                <Navigation className="w-5 h-5 -rotate-90 text-amber-400" />
              ) : activeStep.type.includes('Arrival') ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Navigation className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {t.stepOf(activeStepIndex + 1, steps.length)}
                </span>
                <span className="text-[10px] font-bold text-slate-300 truncate">
                  {targetPoi.name[lang] || targetPoi.name.en}
                </span>
              </div>
              <h3 className="text-xs font-black text-white leading-snug truncate">{activeStep.text}</h3>
              <p className="text-[10px] font-bold text-amber-300/90 mt-0.5">
                {Math.round(distanceToNextStep)} m {t.toTurn} • {Math.round(distanceToDestination)} m {t.totalRemaining}
              </p>
            </div>
            <button
              onClick={handleClearQuestTarget}
              title={t.endNavigation}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SELECTED POI CARD */}
        {selectedLocation && !targetPoi && (
          <div className="bg-slate-950/90 rounded-2xl p-4 shadow-xl border border-amber-400/40 text-white space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  {selectedLocation.loc.category}
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedLocation.loc.name[lang] || selectedLocation.loc.name.en}
                </h3>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  {t.metersAway(Math.round(selectedLocation.dist))}
                </p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-1.5 bg-white/10 rounded-full text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
              {selectedLocation.loc.description[lang] || selectedLocation.loc.description.en}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleStartQuestTarget(selectedLocation.loc)}
                className="py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Target className="w-4 h-4" />
                {t.startGuide}
              </button>
              <button
                onClick={() => onNavigate?.(selectedLocation.loc)}
                className="py-2.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <MapPin className="w-4 h-4" />
                {t.viewOnMap}
              </button>
            </div>
          </div>
        )}

        {/* POI QUEST LOCATIONS DASHBOARD LIST */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {lang === 'bs' ? 'Znamenitosti & Vodič' : 'Landmarks & Guide'}
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              {LOCATIONS.length} {lang === 'bs' ? 'lokacija' : 'locations'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {LOCATIONS.map((loc) => {
              const isUnlocked = localUnlockedRewards.includes(loc.id);
              const isSelected = selectedLocation?.loc.id === loc.id;
              const customColor = POI_COLORS[loc.id] || '#3b82f6';

              return (
                <div
                  key={loc.id}
                  onClick={() => handleStartQuestTarget(loc)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                      : 'bg-slate-950/70 border-white/10 hover:border-amber-400/40'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md"
                      style={{ backgroundColor: customColor }}
                    >
                      {isUnlocked ? '★' : '📍'}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-white">
                        {loc.name[lang] || loc.name.en}
                      </h5>
                      <span className="text-[10px] font-bold text-slate-400">
                        {loc.category} • {isUnlocked ? (lang === 'bs' ? 'Otključano' : 'Unlocked') : (lang === 'bs' ? 'Dodirnite za AR Vodič' : 'Tap for AR Guide')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HELP MODAL */}
      {showHelp && (
        <div className="absolute top-16 left-4 right-4 bg-slate-900/95 border border-amber-400/40 rounded-3xl p-5 text-white text-xs z-50 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-black text-amber-400 uppercase tracking-widest">{t.instructionsTitle}</h4>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            {t.instructionsDesc}
          </p>
        </div>
      )}

      {/* START PERMISSION OVERLAY */}
      {!permissionGranted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50 p-8 text-center backdrop-blur-md">
          <Compass className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{t.enableArSensors}</h2>
          <p className="text-slate-300 text-xs max-w-xs mb-6 leading-relaxed">
            {t.arSensorsDesc}
          </p>
          {error && <p className="text-amber-400 text-xs font-bold mb-4">{error}</p>}
          <button
            onClick={requestPermission}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-sm font-black rounded-2xl shadow-2xl hover:brightness-110 active:scale-95 transition-all"
          >
            {t.startArTour}
          </button>
        </div>
      )}

      {/* 8. AUTOMATED 5M GEOFENCE QR SCANNER MODAL */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        lang={lang}
        unlockedRewards={localUnlockedRewards}
        onRewardFound={handleRewardFoundInternal}
      />
    </div>
  );
};

export default ARGuide;
