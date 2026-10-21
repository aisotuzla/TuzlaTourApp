import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Search, 
  Star, 
  Heart, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { Language } from '../types';
import { TUZLA_BUS_LINES, BusLine, BUS_MENU_ITEMS, getActiveBusLines, searchBusLines } from '../src/data/busLines';

interface BusTabProps {
  lang: Language;
}

const BusTab: React.FC<BusTabProps> = ({ lang }) => {
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'menu'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'frequent' | 'urban' | 'suburban' | 'intercity'>('active');

  // Translation labels
  const labels = {
    en: {
      title: 'Tuzla Bus Lines',
      subtitle: 'Complete Public Transport Guide',
      searchPlaceholder: 'Search by line number, route, or destination...',
      view: {
        grid: 'Grid',
        list: 'List',
        menu: 'Menu'
      },
      filters: {
        all: 'All',
        active: 'Active',
        frequent: 'Frequent',
        urban: 'Urban',
        suburban: 'Suburban',
        intercity: 'Intercity'
      },
      lineCard: {
        active: 'Active',
        frequency: 'Every',
        operates: 'Operates',
        viewDetails: 'View Details'
      },
      lineDetails: {
        title: 'Line Details',
        route: 'Route',
        schedule: 'Schedule',
        frequency: 'Frequency',
        category: 'Category',
        description: 'Description',
        addToFavorites: 'Add to Favorites',
        removeFromFavorites: 'Remove from Favorites'
      },
      categories: {
        urban: 'Urban Lines',
        suburban: 'Suburban Lines',
        intercity: 'Intercity Lines'
      },
      stats: {
        totalLines: 'Total Lines',
        activeLines: 'Active',
        urbanLines: 'Urban',
        suburbanLines: 'Suburban',
        intercityLines: 'Intercity'
      },
      noResults: 'No bus lines found',
      tryDifferent: 'Try a different search or filter'
    },
    bs: {
      title: 'Tuzla Autobuske Linije',
      subtitle: 'Potpun Vodič za Javni Prevoz',
      searchPlaceholder: 'Pretražite po broju linije, ruti ili odredištu...',
      view: {
        grid: 'Grid',
        list: 'Lista',
        menu: 'Meni'
      },
      filters: {
        all: 'Sve',
        active: 'Aktivne',
        frequent: 'Česte',
        urban: 'Gradske',
        suburban: 'Prigradske',
        intercity: 'Međugradske'
      },
      lineCard: {
        active: 'Aktivna',
        frequency: 'Svake',
        operates: 'Radi',
        viewDetails: 'Pogledaj Detalje'
      },
      lineDetails: {
        title: 'Detalji Linije',
        route: 'Ruta',
        schedule: 'Raspored',
        frequency: 'Frekvencija',
        category: 'Kategorija',
        description: 'Opis',
        addToFavorites: 'Dodaj u Omiljene',
        removeFromFavorites: 'Ukloni iz Omiljenih'
      },
      categories: {
        urban: 'Gradske Linije',
        suburban: 'Prigradske Linije',
        intercity: 'Međugradske Linije'
      },
      stats: {
        totalLines: 'Ukupno Linija',
        activeLines: 'Aktivne',
        urbanLines: 'Gradske',
        suburbanLines: 'Prigradske',
        intercityLines: 'Međugradske'
      },
      noResults: 'Nema pronađenih linija',
      tryDifferent: 'Pokušajte drugu pretragu ili filter'
    },
    de: {
      title: 'Tuzla Buslinien',
      subtitle: 'Vollständiger Leitfaden für den öffentlichen Verkehr',
      searchPlaceholder: 'Suche nach Liniennummer, Route oder Ziel...',
      view: {
        grid: 'Raster',
        list: 'Liste',
        menu: 'Menü'
      },
      filters: {
        all: 'Alle',
        active: 'Aktiv',
        frequent: 'Häufig',
        urban: 'Stadt',
        suburban: 'Vorort',
        intercity: 'Stadtverbindungen'
      },
      lineCard: {
        active: 'Aktiv',
        frequency: 'Alle',
        operates: 'Betreibt',
        viewDetails: 'Details anzeigen'
      },
      lineDetails: {
        title: 'Linien Details',
        route: 'Route',
        schedule: 'Fahrplan',
        frequency: 'Frequenz',
        category: 'Kategorie',
        description: 'Beschreibung',
        addToFavorites: 'Zu Favoriten hinzufügen',
        removeFromFavorites: 'Aus Favoriten entfernen'
      },
      categories: {
        urban: 'Stadtlinien',
        suburban: 'Vorortlinien',
        intercity: 'Stadtverbindungen'
      },
      stats: {
        totalLines: 'Gesamtlinien',
        activeLines: 'Aktiv',
        urbanLines: 'Stadt',
        suburbanLines: 'Vorort',
        intercityLines: 'Stadtverbindungen'
      },
      noResults: 'Keine Linien gefunden',
      tryDifferent: 'Versuchen Sie eine andere Suche oder Filter'
    },
    tr: {
      title: 'Tuzla Otobüs Hatları',
      subtitle: 'Toplu Taşımacılık Rehberi',
      searchPlaceholder: 'Hat numarası, güzergah veya varış yerine göre ara...',
      view: {
        grid: 'Izgara',
        list: 'Liste',
        menu: 'Menü'
      },
      filters: {
        all: 'Tümü',
        active: 'Aktif',
        frequent: 'Sık',
        urban: 'Şehir İçi',
        suburban: 'Banliyö',
        intercity: 'Şehirlerarası'
      },
      lineCard: {
        active: 'Aktif',
        frequency: 'Her',
        operates: 'Çalışır',
        viewDetails: 'Detayları Gör'
      },
      lineDetails: {
        title: 'Hat Detayları',
        route: 'Güzergah',
        schedule: 'Program',
        frequency: 'Sıklık',
        category: 'Kategori',
        description: 'Açıklama',
        addToFavorites: 'Favorilere Ekle',
        removeFromFavorites: 'Favorilerden Kaldır'
      },
      categories: {
        urban: 'Şehir İçi Hatlar',
        suburban: 'Banliyö Hatları',
        intercity: 'Şehirlerarası Hatlar'
      },
      stats: {
        totalLines: 'Toplam Hat',
        activeLines: 'Aktif',
        urbanLines: 'Şehir İçi',
        suburbanLines: 'Banliyö',
        intercityLines: 'Şehirlerarası'
      },
      noResults: 'Hat bulunamadı',
      tryDifferent: 'Farklı bir arama veya filtre deneyin'
    }
  };

  const t = labels[lang] || labels.en;

  // Filtered lines
  const filteredLines = useMemo(() => {
    let lines = [...TUZLA_BUS_LINES];
    
    // Apply filter
    if (activeFilter === 'active') {
      lines = lines.filter(l => l.isActive);
    } else if (activeFilter === 'frequent') {
      lines = lines.filter(l => {
        const freq = parseInt(l.frequency.replace(/[^0-9]/g, '')) || 999;
        return freq <= 60;
      });
    } else if (activeFilter === 'urban') {
      lines = lines.filter(l => l.category === 'urban');
    } else if (activeFilter === 'suburban') {
      lines = lines.filter(l => l.category === 'suburban');
    } else if (activeFilter === 'intercity') {
      lines = lines.filter(l => l.category === 'intercity');
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      lines = lines.filter(l => 
        l.lineNumber.toLowerCase().includes(query) ||
        l.route.toLowerCase().includes(query) ||
        l.startPoint.toLowerCase().includes(query) ||
        l.endPoint.toLowerCase().includes(query)
      );
    }
    
    return lines;
  }, [searchQuery, activeFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: TUZLA_BUS_LINES.length,
    active: getActiveBusLines().length,
    urban: TUZLA_BUS_LINES.filter(l => l.category === 'urban').length,
    suburban: TUZLA_BUS_LINES.filter(l => l.category === 'suburban').length,
    intercity: TUZLA_BUS_LINES.filter(l => l.category === 'intercity').length
  }), []);

  // Toggle favorite
  const toggleFavorite = (lineId: string) => {
    setFavorites(prev => 
      prev.includes(lineId) 
        ? prev.filter(id => id !== lineId)
        : [...prev, lineId]
    );
  };

  // Is favorite
  const isFavorite = (lineId: string) => favorites.includes(lineId);

  // Clear search
  const clearSearch = () => setSearchQuery('');

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urban': return 'from-blue-500 to-blue-700';
      case 'suburban': return 'from-green-500 to-green-700';
      case 'intercity': return 'from-purple-500 to-purple-700';
      default: return 'from-slate-500 to-slate-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="p-4 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.title}</h2>
            <p className="text-xs text-slate-500">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('grid')}
            className={`p-2 rounded-lg transition-colors ${activeView === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-200'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`p-2 rounded-lg transition-colors ${activeView === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-200'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.filters.all}
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === 'active' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.filters.active}
          </button>
          <button
            onClick={() => setActiveFilter('frequent')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === 'frequent' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.filters.frequent}
          </button>
          <button
            onClick={() => setActiveFilter('urban')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === 'urban' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.filters.urban}
          </button>
          <button
            onClick={() => setActiveFilter('suburban')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === 'suburban' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.filters.suburban}
          </button>
          <button
            onClick={() => setActiveFilter('intercity')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === 'intercity' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.filters.intercity}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <AnimatePresence mode="wait">
          {activeView === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredLines.map((line, index) => (
                <motion.button
                  key={line.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedLine(line)}
                  className="bg-white rounded-xl p-4 shadow-lg border border-slate-200/80 hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 ${
                        line.isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                          : 'bg-slate-400'
                      }`}
                    >
                      {line.lineNumber}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{line.route}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {line.startPoint} → {line.endPoint}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(line.id);
                      }}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        isFavorite(line.id) 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-slate-300 hover:text-red-500 hover:bg-slate-100/50'
                      }`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          isFavorite(line.id) ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100/80 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{line.startTime} - {line.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {line.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t.lineCard.active}
                        </span>
                      )}
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                        {line.frequency}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : activeView === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredLines.map((line, index) => (
                <motion.button
                  key={line.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedLine(line)}
                  className="w-full bg-white rounded-xl p-4 shadow-lg border border-slate-200/80 hover:shadow-xl hover:scale-[1.01] transition-all text-left flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 ${
                      line.isActive 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                        : 'bg-slate-400'
                    }`}
                  >
                    {line.lineNumber}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{line.route}</h3>
                      {line.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t.lineCard.active}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {line.startPoint} → {line.endPoint}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs text-slate-500">
                      <div className="font-medium text-slate-700">{line.startTime} - {line.endTime}</div>
                      <div>{line.frequency}</div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(line.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorite(line.id) 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-slate-300 hover:text-red-500 hover:bg-slate-100/50'
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          isFavorite(line.id) ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                    
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {BUS_MENU_ITEMS.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-lg border border-slate-200/80 hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{item.label[lang] || item.label.en}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.description?.[lang] || item.description?.en || item.path}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {filteredLines.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Bus className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{t.noResults}</h3>
            <p className="text-sm text-slate-500">{t.tryDifferent}</p>
          </motion.div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-md">
        <div className="grid grid-cols-5 gap-3 text-center">
          <div>
            <div className="text-lg font-black text-blue-600">{stats.total}</div>
            <div className="text-xs text-slate-500">{t.stats.totalLines}</div>
          </div>
          <div>
            <div className="text-lg font-black text-green-600">{stats.active}</div>
            <div className="text-xs text-slate-500">{t.stats.activeLines}</div>
          </div>
          <div>
            <div className="text-lg font-black text-blue-500">{stats.urban}</div>
            <div className="text-xs text-slate-500">{t.stats.urbanLines}</div>
          </div>
          <div>
            <div className="text-lg font-black text-green-500">{stats.suburban}</div>
            <div className="text-xs text-slate-500">{t.stats.suburbanLines}</div>
          </div>
          <div>
            <div className="text-lg font-black text-purple-500">{stats.intercity}</div>
            <div className="text-xs text-slate-500">{t.stats.intercityLines}</div>
          </div>
        </div>
      </div>

      {/* Line Details Modal */}
      <AnimatePresence>
        {selectedLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedLine(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ${
                      selectedLine.isActive 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                        : 'bg-slate-400'
                    }`}
                  >
                    {selectedLine.lineNumber}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.lineDetails.title}</h2>
                    <p className="text-sm text-slate-500">{selectedLine.route}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLine(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                {/* Route */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-medium">{t.lineDetails.route}</div>
                    <div className="font-bold text-slate-900">{selectedLine.startPoint} → {selectedLine.endPoint}</div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl">
                  <Clock className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-medium">{t.lineDetails.schedule}</div>
                    <div className="font-bold text-slate-900">{selectedLine.startTime} - {selectedLine.endTime}</div>
                  </div>
                </div>

                {/* Frequency */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl">
                  <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-medium">{t.lineDetails.frequency}</div>
                    <div className="font-bold text-slate-900">{selectedLine.frequency}</div>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl">
                  <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Star className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-medium">{t.lineDetails.category}</div>
                    <div className="font-bold text-slate-900 capitalize">
                      {selectedLine.category}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedLine.description && (
                  <div className="p-3 bg-slate-50/80 rounded-xl">
                    <div className="text-xs text-slate-500 uppercase font-medium mb-1">{t.lineDetails.description}</div>
                    <p className="text-sm text-slate-600">
                      {selectedLine.description[lang] || selectedLine.description.en}
                    </p>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(selectedLine.id)}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isFavorite(selectedLine.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      isFavorite(selectedLine.id) ? 'fill-current' : ''
                    }`}
                  />
                  <span>
                    {isFavorite(selectedLine.id) 
                      ? t.lineDetails.removeFromFavorites 
                      : t.lineDetails.addToFavorites}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusTab;
