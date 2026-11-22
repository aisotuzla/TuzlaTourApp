import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Globe, MapPin } from 'lucide-react';
import { Language } from '../types';

interface KulinCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const KulinCharterModal: React.FC<KulinCharterModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[8500] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full h-full max-w-3xl max-h-[92vh] bg-black border-2 border-amber-400/80 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(245,158,11,0.4)] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-amber-400/30 bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <BookOpen className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {lang === 'bs' ? 'Pronađena tajna lokacija!' : 'Secret location found!'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> 44.538791, 18.678778
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    {lang === 'bs' ? '3D Povelja Kulina bana (1189)' : '3D Charter of Kulin Ban (1189)'}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3D Interactive Iframe */}
            <div className="flex-1 relative bg-[#2a2118]">
              <iframe
                src="/assets/Povelja%20Kulina%20bana%20%E2%80%93%20kameni%20spomenik.html"
                title={lang === 'bs' ? '3D Povelja Kulina bana' : '3D Charter of Kulin Ban'}
                className="w-full h-full border-0"
                style={{ minHeight: '380px' }}
                allow="accelerometer; autoplay; gyroscope"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-amber-400/30 bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-amber-300/80">
                {lang === 'bs'
                  ? 'Rotirajte i istražite 3D Povelju Kulina bana'
                  : 'Rotate and explore the 3D Charter of Kulin Ban'}
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                {lang === 'bs' ? 'Zatvori' : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

