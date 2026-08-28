// src/components/POICameraModal.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // or "motion/react"
import {
  X,
  Camera as CameraIcon,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  MapPin,
  Compass,
  SwitchCamera,
  Navigation,
  Info
} from "lucide-react";
import { CAMERA_TARGET_POIS, findCameraPoi } from "../utils/cameraPois";

export type Language = "bs" | "en";

export interface POICameraModalProps {
  /** Target POI ID (e.g., "kapija" | "mesa-selimovic" | "kralj-tvrtko") */
  poiId?: string;
  /** Or pass the full POI object if your parent screen already has it */
  poi?: {
    id: string;
    name: string | { bs: string; en: string };
    lat?: number;
    lon?: number;
    category?: string;
  };
  /** Optional custom display name override */
  poiName?: string | { bs: string; en: string };
  /** Target latitude override */
  targetLat?: number;
  /** Target longitude override */
  targetLon?: number;
  /** User's current GPS coordinates if already acquired by the app */
  userCoords?: { lat: number; lng: number } | null;
  /** Callback triggered when the monument is successfully identified */
  onSuccess: (targetId: string) => void;
  /** Callback to dismiss/close the modal */
  onClose: () => void;
  /** UI language ('bs' for Bosnian, 'en' for English) */
  lang?: Language;
  /** Maximum distance in meters considered in proximity (default: 250m) */
  maxDistanceMeters?: number;
}

/** Haversine formula to compute great-circle distance in meters */
export function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/** Resizes and compresses snapshot to ~1024px to minimize mobile bandwidth usage */
export const compressImageForUpload = (
  dataUrl: string,
  maxWidth = 1024,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const POICameraModal: React.FC<POICameraModalProps> = ({
  poiId,
  poi,
  poiName,
  targetLat,
  targetLon,
  userCoords: propUserCoords,
  onSuccess,
  onClose,
  lang = "bs",
  maxDistanceMeters = 250
}) => {
  // Resolve target landmark from the 3 designated locations
  const effectivePoiId = poi?.id || poiId || "kapija";
  const matchedPoi = findCameraPoi(effectivePoiId);

  const lat = targetLat ?? poi?.lat ?? matchedPoi?.lat ?? 44.538631;
  const lon = targetLon ?? poi?.lon ?? matchedPoi?.lon ?? 18.676906;

  const displayName =
    (typeof poiName === "object" ? poiName[lang] : poiName) ||
    (typeof poi?.name === "object" ? poi.name[lang] : poi?.name) ||
    matchedPoi?.name[lang] ||
    "Tuzla Znamenitost";

  const visualGuideText =
    matchedPoi?.visualCues[lang] ||
    (lang === "bs"
      ? "Kadrirajte prepoznatljive elemente spomenika unutar okvira."
      : "Align recognizable elements of the monument within the frame.");

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    name: string;
    confidence: number;
    explanation?: string;
    distanceMeters?: number | null;
  } | null>(null);

  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(
    propUserCoords || null
  );
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Live GPS Acquisition in PWA if not supplied by parent
  useEffect(() => {
    if (propUserCoords) {
      setDeviceCoords(propUserCoords);
      return;
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn("GPS unavailable:", err.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, [propUserCoords]);

  // Compute live proximity distance to target landmark
  const currentDistance =
    deviceCoords && lat && lon
      ? calculateHaversineMeters(deviceCoords.lat, deviceCoords.lng, lat, lon)
      : null;

  const isNearby = currentDistance !== null ? currentDistance <= maxDistanceMeters : true;

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("POICameraModal camera error:", err);
      setCameraActive(false);
      setCameraError(
        lang === "bs"
          ? "Kamera nije dostupna ili nema dozvolu. Možete odabrati fotografiju iz galerije."
          : "Camera not accessible or permission denied. You can select a photo from your gallery."
      );
    }
  }, [facingMode, lang]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture snapshot from active video stream
  const captureSnapshot = (): string | null => {
    if (capturedPreview) return capturedPreview;
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.85);
      }
    }
    return null;
  };

  // Verify photo with the backend route
  const handleVerify = async () => {
    const rawPhoto = captureSnapshot();
    if (!rawPhoto) {
      setErrorMsg(
        lang === "bs"
          ? "Nema slike za analizu. Pokrenite kameru ili odaberite fotografiju."
          : "No image to analyze. Please enable your camera or select a photo."
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // 1. Compress image client-side to save mobile bandwidth
      const compressed = await compressImageForUpload(rawPhoto, 1024, 0.8);
      setCapturedPreview(compressed);

      const base64Data = compressed.includes(";base64,")
        ? compressed.split(";base64,")[1]
        : compressed;

      // 2. Prepare payload
      const payload = {
        image: base64Data,
        candidates: [{ id: effectivePoiId, name: displayName }],
        userLat: deviceCoords?.lat,
        userLng: deviceCoords?.lng
      };

      // 3. Send request to backend
      const response = await fetch("/api/recognize-landmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (lang === "bs" ? "Analiza nije uspjela" : "Recognition failed"));
      }

      if (data.recognized && data.targetId) {
        // Mobile vibration haptic feedback
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([80, 50, 100]);
        }

        setResult({
          name: data.name || displayName,
          confidence: data.confidence || 0.92,
          explanation: data.explanation,
          distanceMeters: data.distanceMeters ?? currentDistance
        });

        // Trigger success callback after brief visual celebration
        setTimeout(() => {
          onSuccess(data.targetId);
        }, 1200);
      } else {
        setErrorMsg(
          data.explanation ||
          (lang === "bs"
            ? "Znamenitost nije prepoznata na fotografiji. Približite se i pokušajte ponovo."
            : "Landmark was not recognized. Please move closer and try again.")
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || (lang === "bs" ? "Greška prilikom provjere" : "Verification error"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCapturedPreview(ev.target.result as string);
        setErrorMsg(null);
        setResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setResult(null);
    setErrorMsg(null);
    startCamera();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2500] bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none overflow-y-auto"
      >
        {/* Header Bar */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Compass className="w-3 h-3" />
                {lang === "bs" ? "Kamera Verifikacija" : "Camera Verification"}
              </span>

              {/* Live Distance Pill */}
              {currentDistance !== null ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isNearby
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    }`}
                >
                  <Navigation className="w-2.5 h-2.5" />
                  ~{currentDistance}m
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                  <MapPin className="w-2.5 h-2.5" />
                  GPS traži signal...
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Monument Guide"
            >
              <Info className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Framing Guide Drawer */}
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto my-2 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed"
          >
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === "bs" ? "Savjet za fotografisanje:" : "Framing Guide:"}
            </div>
            <p>{visualGuideText}</p>
          </motion.div>
        )}

        {/* Camera Viewport */}
        <div className="relative w-full max-w-sm aspect-square mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.15)] bg-slate-900 my-auto flex items-center justify-center">
          {/* Live Video */}
          {!capturedPreview && (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
            />
          )}

          {/* Captured Preview */}
          {capturedPreview && (
            <div className="relative w-full h-full">
              <img
                src={capturedPreview}
                alt="Captured landmark"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRetake}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/10 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {lang === "bs" ? "Ponovi snimak" : "Retake"}
              </button>
            </div>
          )}

          {/* Permission / Fallback State */}
          {!capturedPreview && !cameraActive && (
            <div className="p-6 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                <CameraIcon className="w-8 h-8" />
              </div>
              <p className="text-xs font-medium text-slate-300 max-w-xs mx-auto">
                {cameraError || (lang === "bs" ? "Omogućite pristup kameri ili izaberite sliku." : "Enable camera access or pick a photo.")}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {lang === "bs" ? "Učitaj iz galerije" : "Select from Gallery"}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {!capturedPreview && cameraActive && (
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleToggleFacingMode}
                className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/10 transition active:scale-95 cursor-pointer"
                title="Switch Camera"
              >
                <SwitchCamera className="w-5 h-5 text-emerald-300" />
              </button>
            </div>
          )}

          {/* Loading HUD Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-emerald-400 z-20">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-white">
                  {lang === "bs" ? "Gemini AI Analiza..." : "Gemini AI Analyzing..."}
                </p>
              </div>
            </div>
          )}

          {/* Frame Reticle Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg pointer-events-none" />
        </div>

        {/* Feedback Messages */}
        <div className="w-full max-w-sm mx-auto space-y-2 mt-2">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-center space-y-1 shadow-lg shadow-emerald-500/20"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-black text-white text-base">
                {lang === "bs" ? "Uspješno Verifikovano!" : "Successfully Verified!"}
              </div>
              <p className="text-xs text-emerald-300 font-bold">{result.name}</p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-emerald-400/90 pt-1">
                <span>
                  {lang === "bs" ? "Sigurnost:" : "Confidence:"}{" "}
                  <strong>{(result.confidence * 100).toFixed(0)}%</strong>
                </span>
                {result.distanceMeters && (
                  <span>• <strong>~{result.distanceMeters}m</strong></span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3 pt-2 pb-4">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            {loading
              ? lang === "bs"
                ? "Verifikacija u toku..."
                : "Verifying..."
              : lang === "bs"
                ? "Verifikuj Spomenik"
                : "Verify Monument"}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-medium text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            {lang === "bs" ? "Učitaj sliku iz galerije telefona" : "Select photo from phone gallery"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};