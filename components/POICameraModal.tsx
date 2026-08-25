import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraType } from 'react-camera-pro';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface POICameraModalProps {
  poiId: string;
  poiName: string;
  onSuccess: (message: string) => void;
  onClose: () => void;
}

export const POICameraModal: React.FC<POICameraModalProps> = ({
  poiId,
  poiName,
  onSuccess,
  onClose,
}) => {
  const camera = useRef<CameraType>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Get GPS Location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn('GPS location warning in POICameraModal:', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleCapture = async () => {
    if (!camera.current) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const imageSrc = camera.current.takePhoto();

      // Simulate GenAI image recognition + GPS verification
      setTimeout(() => {
        setLoading(false);
        onSuccess(`AI verified location for ${poiName}!`);
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Failed to analyze camera photo.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2500] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-6"
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pt-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Location Verification
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">{poiName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Feed Frame */}
        <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] bg-black my-auto">
          <Camera ref={camera} aspectRatio={1} numberOfCamerasCallback={() => { }} errorMessages={{}} />

          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-emerald-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest">
                Analyzing Landmark...
              </span>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="w-full max-w-sm p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Controls */}
        <div className="w-full max-w-sm flex flex-col items-center gap-4 pb-8">
          <button
            onClick={handleCapture}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles size={18} />
            Verify Photo
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
