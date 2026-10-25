import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, X, Footprints, Clock, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface NavigationHudProps {
  isNavigating: boolean;
  selectedNavTarget: { name: string; lat: number; lon: number } | null;
  lang: Language;
  routeDistance: number | null;
  routeTime: number | null;
  isRouteLoading: boolean;
  onEndNavigation: () => void;
  targetColor?: string;
  onActivateArTrail?: () => void;
  isArTrailActive?: boolean;
}

export const NavigationHud: React.FC<NavigationHudProps> = ({
  isNavigating,
  selectedNavTarget,
  lang,
  routeDistance,
  routeTime,
  isRouteLoading,
  onEndNavigation,
  targetColor = '#10b981',
  onActivateArTrail,
  isArTrailActive = false,
}) => {
  return (
    <AnimatePresence>
      {isNavigating && selectedNavTarget && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center px-3.5"
          style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <motion.div
            drag
            dragMomentum={false}
            className="w-full max-w-[380px] pointer-events-auto cursor-grab active:cursor-grabbing bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl flex flex-col gap-3"
          >
            {/* Header Info */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5 items-center flex-1 min-w-0">
                <div
                  className="p-2.5 rounded-xl flex items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: `${targetColor}25`,
                    borderColor: `${targetColor}40`,
                    color: targetColor,
                  }}
                >
                  <Route size={20} className="animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[9px] uppercase font-black tracking-widest block truncate"
                    style={{ color: targetColor }}
                  >
                    {lang === 'bs' ? 'U Toku je Pješačka Ruta' : 'Walking Route in Progress'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h4 className="text-sm font-black text-white truncate max-w-[170px]">
                      {selectedNavTarget.name}
                    </h4>
                    {onActivateArTrail && (
                      <button
                        onClick={onActivateArTrail}
                        title={lang === 'bs' ? 'Aktiviraj AR Stazu' : 'Activate AR Trail'}
                        className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border shadow-sm active:scale-95 shrink-0"
                        style={{
                          backgroundColor: isArTrailActive ? targetColor : 'rgba(255, 255, 255, 0.08)',
                          borderColor: targetColor,
                          color: isArTrailActive ? '#090d16' : targetColor,
                          boxShadow: isArTrailActive ? `0 0 10px ${targetColor}88` : undefined,
                        }}
                      >
                        <Footprints size={11} style={{ color: isArTrailActive ? '#090d16' : targetColor }} />
                        <span>{isArTrailActive ? (lang === 'bs' ? 'AR Uključena' : 'AR Trail On') : (lang === 'bs' ? 'AR Staza' : 'AR Trail')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onEndNavigation}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Data Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Distance Card */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Footprints size={13} />
                  <span className="text-[11px] font-bold">{lang === 'bs' ? 'Udaljenost' : 'Distance'}</span>
                </div>
                <div className="mt-1.5 text-white font-black text-lg flex items-baseline gap-1">
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
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={13} />
                  <span className="text-[11px] font-bold">{lang === 'bs' ? 'Vrijeme' : 'Duration'}</span>
                </div>
                <div className="mt-1.5 text-white font-black text-lg flex items-baseline gap-1">
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
              <button
                onClick={onEndNavigation}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] shadow-lg shadow-red-600/20"
              >
                {lang === 'bs' ? 'Završi' : 'End'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
