import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, X, Footprints, Clock, Loader2, Compass } from 'lucide-react';
import { Language } from '../types';

interface NavigationHudProps {
  isNavigating: boolean;
  selectedNavTarget: { name: string; lat: number; lon: number } | null;
  lang: Language;
  routeDistance: number | null;
  routeTime: number | null;
  isRouteLoading: boolean;
  onEndNavigation: () => void;
  onOpenAR?: () => void;
}

export const NavigationHud: React.FC<NavigationHudProps> = ({
  isNavigating,
  selectedNavTarget,
  lang,
  routeDistance,
  routeTime,
  isRouteLoading,
  onEndNavigation,
  onOpenAR,
}) => {
  return (
    <AnimatePresence>
      {isNavigating && selectedNavTarget && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute inset-x-0 bottom-4 z-30 pointer-events-none flex items-end justify-center px-4"
        >
          <div className="w-full max-w-md pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
                  <Route size={20} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400">
                    {lang === 'bs' ? 'Navigacija Mape' : 'Map Navigation'}
                  </span>
                  <h4 className="text-sm font-extrabold text-white line-clamp-1">
                    {selectedNavTarget.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={onEndNavigation}
                className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all active:scale-95"
                title={lang === 'bs' ? 'Završi navigaciju' : 'End navigation'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Data Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Distance Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Footprints size={13} />
                  <span className="text-[11px] font-bold">{lang === 'bs' ? 'Udaljenost' : 'Distance'}</span>
                </div>
                <div className="mt-1 text-white font-black text-lg flex items-baseline gap-1">
                  {isRouteLoading ? (
                    <Loader2 className="animate-spin text-emerald-400" size={18} />
                  ) : routeDistance !== null ? (
                    routeDistance >= 1000 ? (
                      <>
                        {(routeDistance / 1000).toFixed(1)}
                        <span className="text-xs text-emerald-400 font-bold">km</span>
                      </>
                    ) : (
                      <>
                        {Math.round(routeDistance)}
                        <span className="text-xs text-emerald-400 font-bold">m</span>
                      </>
                    )
                  ) : (
                    '--'
                  )}
                </div>
              </div>

              {/* Duration Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={13} />
                  <span className="text-[11px] font-bold">{lang === 'bs' ? 'Vrijeme' : 'Duration'}</span>
                </div>
                <div className="mt-1 text-white font-black text-lg flex items-baseline gap-1">
                  {isRouteLoading ? (
                    <Loader2 className="animate-spin text-emerald-400" size={18} />
                  ) : routeTime !== null ? (
                    <>
                      {Math.ceil(routeTime / 60)}
                      <span className="text-xs text-emerald-400 font-bold">min</span>
                    </>
                  ) : (
                    '--'
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onOpenAR && (
                <button
                  onClick={onOpenAR}
                  className="flex-1 py-2.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  <Compass size={15} />
                  {lang === 'bs' ? 'Otvori AR Vodič' : 'Open AR Guide'}
                </button>
              )}
              <button
                onClick={onEndNavigation}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-red-600/30"
              >
                <X size={15} />
                {lang === 'bs' ? 'Završi Navigaciju' : 'End Navigation'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
