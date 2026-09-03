import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppTab, Language } from '../types';
import {
  Wallet,
  CheckSquare,
  Search,
  Home,
  Map,
  Gamepad2,
  BookOpen,
  Utensils,
  Bed,
  X,
  Phone,
  Play,
  Pause,
  History as HistoryIcon,
  Trophy
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onSelectTab, lang }) => {
  const navItems = [
    {
      id: AppTab.LANDING,
      icon: Home,
      label: { en: 'Home', bs: 'Početna', de: 'Startseite', tr: 'Ana Sayfa' },
    },
    {
      id: AppTab.CITY_GUIDE,
      icon: BookOpen,
      label: { en: 'City Guide', bs: 'Gradski Vodič', de: 'Stadtführer', tr: 'Şehir Rehberi' },
      isHeader: true,
    },
    {
      id: AppTab.HISTORY,
      icon: HistoryIcon,
      label: { en: 'History', bs: 'Historija', de: 'Geschichte', tr: 'Tarih' },
      isSubItem: true,
    },
    {
      id: AppTab.FOOD,
      icon: Utensils,
      label: { en: 'Food', bs: 'Hrana', de: 'Essen', tr: 'Yemek' },
      isSubItem: true,
    },
    {
      id: AppTab.ACCOMMODATION,
      icon: Bed,
      label: { en: 'Accommodation', bs: 'Smještaj', de: 'Unterkunft', tr: 'Konaklama' },
      isSubItem: true,
    },
    {
      id: AppTab.MAP,
      icon: Map,
      label: { en: 'Map', bs: 'Mapa', de: 'Karte', tr: 'Harita' },
    },
    {
      id: AppTab.QUEST,
      icon: Gamepad2,
      label: { en: 'Quest', bs: 'Potraga', de: 'Quest', tr: 'Görev' },
    },
    {
      id: AppTab.TASK_MANAGER,
      icon: CheckSquare,
      label: { en: 'Planner', bs: 'Planer', de: 'Planer', tr: 'Planlayıcı' },
    },
    {
      id: AppTab.WALLET,
      icon: Wallet,
      label: { en: 'Wallet', bs: 'Novčanik', de: 'Wallet', tr: 'Cüzdan' },
    },
  ];

  const handleSelect = (tab: AppTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md z-[101] shadow-2xl flex flex-col border-r border-white/20"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <span className="text-sm font-black uppercase tracking-widest text-blue-900 font-quicksand">Tuzla Tour</span>
              <button
                onClick={() => onClose()}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const label = item.label[lang as keyof typeof item.label] || item.label.en;
                const isSubItem = (item as any).isSubItem;
                const isHeader = (item as any).isHeader;

                return (
                  <button
                    key={item.id}
                    onClick={() => { handleSelect(item.id); }}
                    className={`w-full flex items-center gap-3.5 p-2.5 rounded-2xl transition-all duration-200 group text-left ${
                      isSubItem ? 'ml-5 w-[calc(100%-1.25rem)] py-2' : ''
                    } ${
                      isActive
                        ? item.id === AppTab.QUEST
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-400 font-black'
                          : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-blue-500 font-black'
                        : 'bg-slate-50 hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200/60 hover:border-blue-200/80'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                      isActive
                        ? item.id === AppTab.QUEST
                          ? 'bg-amber-400/30 text-slate-950'
                          : 'bg-white/20 text-white'
                        : 'bg-white text-slate-600 group-hover:text-blue-600 border border-slate-200/60 shadow-xs'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                    </div>
                    <span className={`tracking-wide ${isHeader ? 'text-base font-extrabold uppercase text-blue-950' : 'text-sm font-bold'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}

              <div className="pt-8 mt-2 flex flex-row items-center gap-6 px-4">
                {/* Minimalist Taxi Button - Large Icon, Aligned Left */}
                <button
                  onClick={() => window.confirm("Taxi 1525?") && (window.location.href = 'tel:1525')}
                  className="flex flex-col items-center group active:scale-95 transition-transform"
                >
                  <img
                    src="/assets/Gallery/QuestQRLocations/Taxi1525.webp"
                    alt="Taxi 1525"
                    className="w-24 h-24 object-contain mb-1 transition-transform group-hover:scale-105"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-900/60 group-hover:text-blue-600">Taxi 1525</span>
                </button>
              </div>
            </div>

            {/* Footer - Spacer */}
            <div className="p-4 border-t border-slate-100 text-center">

            </div>
          </motion.aside>
        </>
      )
      }
    </AnimatePresence >
  );
};

export default Sidebar;
