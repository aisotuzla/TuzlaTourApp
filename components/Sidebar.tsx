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
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: AppTab.CITY_GUIDE,
      icon: BookOpen,
      label: { en: 'City Guide', bs: 'Gradski Vodič', de: 'Stadtführer', tr: 'Şehir Rehberi' },
      isHeader: true,
      color: 'text-blue-900'
    },
    {
      id: AppTab.HISTORY,
      icon: HistoryIcon,
      label: { en: 'History', bs: 'Historija', de: 'Geschichte', tr: 'Tarih' },
      isSubItem: true,
      color: 'bg-blue-50/50 text-blue-800'
    },
    {
      id: AppTab.FOOD,
      icon: Utensils,
      label: { en: 'Food', bs: 'Hrana', de: 'Essen', tr: 'Yemek' },
      isSubItem: true,
      color: 'bg-blue-50/30 text-blue-700'
    },
    {
      id: AppTab.ACCOMMODATION,
      icon: Bed,
      label: { en: 'Accommodation', bs: 'Smještaj', de: 'Unterkunft', tr: 'Konaklama' },
      isSubItem: true,
      color: 'bg-blue-50/10 text-blue-600'
    },
    {
      id: AppTab.MAP,
      icon: Map,
      label: { en: 'Map', bs: 'Mapa', de: 'Karte', tr: 'Harita' },
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: AppTab.QUEST,
      icon: Gamepad2,
      label: { en: 'Quest', bs: 'Potraga', de: 'Quest', tr: 'Görev' },
      color: 'bg-blue-200 text-blue-800'
    },
    {
      id: AppTab.TASK_MANAGER,
      icon: CheckSquare,
      label: { en: 'Planner', bs: 'Planer', de: 'Planer', tr: 'Planlayıcı' },
      color: 'bg-blue-400 text-blue-900'
    },
    {
      id: AppTab.WALLET,
      icon: Wallet,
      label: { en: 'Wallet', bs: 'Novčanik', de: 'Wallet', tr: 'Cüzdan' },
      color: 'bg-blue-500 text-white'
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

              <button
                onClick={() => onClose()}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
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
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group text-left ${isSubItem ? 'ml-6 w-[calc(100%-1.5rem)] py-2' : ''
                      } ${isActive
                        ? (item.id === AppTab.QUEST ? 'bg-amber-500 text-white shadow-xl scale-[1.02]' : 'bg-blue-600 text-white shadow-lg')
                        : `${item.color} hover:opacity-100 hover:scale-[1.01]`
                      } ${!isActive && !isHeader ? 'opacity-80' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                    <span className={`tracking-wide ${isHeader ? 'text-lg font-black uppercase' : 'text-sm font-bold'}`}>
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
