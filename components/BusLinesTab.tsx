import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bus, Clock, Search, Filter, X, ChevronDown, ChevronUp, MapPin, Star, Heart } from 'lucide-react';
import { Language } from '../types';
import { TUZLA_BUS_LINES, BusLine, getActiveBusLines, searchBusLines, getFrequentBusLines } from '../src/data/busLines';

interface BusLinesTabProps {
  lang: Language;
  onLineSelect?: (line: BusLine) => void;
  isFavorite?: (lineId: string) => boolean;
  onToggleFavorite?: (lineId: string) => void;
}

const BusLinesTab: React.FC<BusLinesTabProps> = ({ 
  lang, 
  onLineSelect, 
  isFavorite = () => false, 
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'frequent' | 'favorites'>('active');
  const [expandedCategory, setExpandedCategory] = useState<'urban' | 'suburban' | 'intercity' | null>('urban');
  const [sortBy, setSortBy] = useState<'number' | 'frequency' | 'time'>('number');

  // Translation labels
  const labels = {
    en: {
      title: 'Tuzla Bus Lines',
      searchPlaceholder: 'Search lines, routes, or stops...',
      filters: {
        all: 'All Lines',
        active: 'Active Now',
        frequent: 'Frequent (< 60 min)',
        favorites: 'Favorites'
      },
      categories: {
        urban: 'Urban Lines',
        suburban: 'Suburban Lines',
        intercity: 'Intercity Lines'
      },
      sort: {
        number: 'By Number',
        frequency: 'By Frequency',
        time: 'By Start Time'
      },
      lineInfo: {
        line: 'Line',
        route: 'Route',
        operates: 'Operates',
        frequency: 'Frequency',
        every: 'Every'
      },
      actions: {
        viewDetails: 'View Details',
        addFavorite: 'Add to Favorites',
        removeFavorite: 'Remove from Favorites'
      },
      stats: {
        totalLines: 'Total Lines',
        activeLines: 'Active Lines',
        earliest: 'Earliest',
        latest: 'Latest'
      },
      noResults: 'No bus lines found',
      noDescription: 'Try adjusting your search or filters'
    },
    bs: {
      title: 'Tuzla Autobuske Linije',
      searchPlaceholder: 'Pretražite linije, rute ili stajališta...',
      filters: {
        all: 'Sve Linije',
        active: 'Aktivne Sada',
        frequent: 'Česte (< 60 min)',
        favorites: 'Omiljene'
      },
      categories: {
        urban: 'Gradske Linije',
        suburban: 'Prigradske Linije',
        intercity: 'Međugradske Linije'
      },
      sort: {
        number: 'Po Broju',
        frequency: 'Po Frekvenciji',
        time: 'Po Vremenu Polaska'
      },
      lineInfo: {
        line: 'Linija',
        route: 'Ruta',
        operates: 'Radi',
        frequency: 'Frekvencija',
        every: 'Svake'
      },
      actions: {
        viewDetails: 'Pogledaj Detalje',
        addFavorite: 'Dodaj u Omiljene',
        removeFavorite: 'Ukloni iz Omiljenih'
      },
      stats: {
        totalLines: 'Ukupno Linija',
        activeLines: 'Aktivne Linije',
        earliest: 'Najraniji',
        latest: 'Najkasniji'
      },
      noResults: 'Nema pronađenih linija',
      noDescription: 'Pokušajte prilagoditi pretragu ili filtere'
    },
    de: {
      title: 'Tuzla Buslinien',
      searchPlaceholder: 'Suche nach Linien, Routen oder Haltestellen...',
      filters: {
        all: 'Alle Linien',
        active: 'Aktiv Jetzt',
        frequent: 'Häufig (< 60 min)',
        favorites: 'Favoriten'
      },
      categories: {
        urban: 'Stadtlinien',
        suburban: 'Vorortlinien',
        intercity: 'Stadtverbindungen'
      },
      sort: {
        number: 'Nach Nummer',
        frequency: 'Nach Frequenz',
        time: 'Nach Abfahrtszeit'
      },
      lineInfo: {
        line: 'Linie',
        route: 'Route',
        operates: 'Betreibt',
        frequency: 'Frequenz',
        every: 'Alle'
      },
      actions: {
        viewDetails: 'Details anzeigen',
        addFavorite: 'Zu Favoriten hinzufügen',
        removeFavorite: 'Aus Favoriten entfernen'
      },
      stats: {
        totalLines: 'Gesamtlinien',
        activeLines: 'Aktive Linien',
        earliest: 'Früheste',
        latest: 'Späteste'
      },
      noResults: 'Keine Linien gefunden',
      noDescription: 'Versuchen Sie, Ihre Suche oder Filter anzupassen'
    },
    tr: {
      title: 'Tuzla Otobüs Hatları',
      searchPlaceholder: 'Hatları, güzergahları veya durakları ara...',
      filters: {
        all: 'Tüm Hatlar',
        active: 'Şu Anda Aktif',
        frequent: 'Sık (< 60 dk)',
        favorites: 'Favoriler'
      },
      categories: {
        urban: 'Şehir İçi Hatlar',
        suburban: 'Banliyö Hatları',
        intercity: 'Şehirlerarası Hatlar'
      },
      sort: {
        number: 'Numaraya Göre',
        frequency: 'Frekansa Göre',
        time: 'Kalkış Saatine Göre'
      },
      lineInfo: {
        line: 'Hat',
        route: 'Güzergah',
        operates: 'Çalışır',
        frequency: 'Sıklık',
        every: 'Her'
      },
      actions: {
        viewDetails: 'Detayları Gör',
        addFavorite: 'Favorilere Ekle',
        removeFavorite: 'Favorilerden Kaldır'
      },
      stats: {
        totalLines: 'Toplam Hat',
        activeLines: 'Aktif Hat',
        earliest: 'En Erken',
        latest: 'En Geç'
      },
      noResults: 'Hat bulunamadı',
      noDescription: 'Aramanızı veya filtreleri ayarlamayı deneyin'
    }
  };

  const t = labels[lang] || labels.en;

  // Filter and sort lines
  const filteredLines = useMemo(() => {
    let lines = [...TUZLA_BUS_LINES];
    
    // Apply filter
    if (activeFilter === 'active') {
      lines = lines.filter(l => l.isActive);
    } else if (activeFilter === 'frequent') {
      lines = getFrequentBusLines(60);
    } else if (activeFilter === 'favorites') {
      lines = lines.filter(l => isFavorite(l.id));
    }
    
    // Apply search
    if (searchQuery) {
      lines = searchBusLines(searchQuery);
    }
    
    // Apply category filter if expanded
    if (expandedCategory) {
      lines = lines.filter(l => l.category === expandedCategory);
    }
    
    // Sort
    lines.sort((a, b) => {
      if (sortBy === 'number') {
        return a.lineNumber.localeCompare(b.lineNumber, undefined, { numeric: true });
      } else if (sortBy === 'frequency') {
        const freqA = parseInt(a.frequency.replace(/[^0-9]/g, '')) || 999;
        const freqB = parseInt(b.frequency.replace(/[^0-9]/g, '')) || 999;
        return freqA - freqB;
      } else {
        return a.startTime.localeCompare(b.startTime);
      }
    });
    
    return lines;
  }, [searchQuery, activeFilter, expandedCategory, sortBy, isFavorite]);

  // Group lines by category
  const linesByCategory = useMemo(() => {
    const categories = ['urban', 'suburban', 'intercity'] as const;
    const result: Record<string, BusLine[]> = {};
    
    categories.forEach(cat => {
      result[cat] = filteredLines.filter(l => l.category === cat);
    });
    
    return result;
  }, [filteredLines]);

  // Stats
  const stats = useMemo(() => ({
    total: TUZLA_BUS_LINES.length,
    active: getActiveBusLines().length,
    frequent: getFrequentBusLines(60).length,
    earliest: '05:00',
    latest: '23:00'
  }), []);

  const toggleCategory = (category: 'urban' | 'suburban' | 'intercity' | null) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.title}</h2>
            <p className="text-xs text-slate-500">{stats.active} {t.stats.activeLines}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(prev => prev === 'number' ? 'frequency' : prev === 'frequency' ? 'time' : 'number')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            title={t.sort[sortBy]}
          >
            {sortBy === 'number' && <span className="text-xs">#</span>}
            {sortBy === 'frequency' && <Clock className="w-4 h-4" />}
            {sortBy === 'time' && <MapPin className="w-4 h-4" />}
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
          {(Object.entries(t.filters) as [string, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as 'all' | 'active' | 'frequent' | 'favorites')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeFilter === key 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {filteredLines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Bus className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{t.noResults}</h3>
            <p className="text-sm text-slate-500">{t.noDescription}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Category Sections */}
            {(['urban', 'suburban', 'intercity'] as const).map((category) => {
              const categoryLines = linesByCategory[category];
              if (categoryLines.length === 0) return null;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200/80 overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(expandedCategory === category ? null : category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-slate-900">{t.categories[category]}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {categoryLines.length}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        expandedCategory === category ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Lines in Category */}
                  {expandedCategory === category && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="divide-y divide-slate-100/80"
                    >
                      {categoryLines.map((line, index) => (
                        <motion.button
                          key={line.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onLineSelect?.(line)}
                          className="w-full p-3 hover:bg-slate-50/50 transition-colors text-left flex items-center gap-3"
                        >
                          {/* Line Number Badge */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                            style={{ backgroundColor: line.isActive ? '#1d4ed8' : '#6b7280' }}
                          >
                            {line.lineNumber}
                          </div>
                          
                          {/* Line Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 truncate">{line.route}</h3>
                              {line.isActive && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === 'bs' ? 'Aktivna' : lang === 'de' ? 'Aktiv' : lang === 'tr' ? 'Aktif' : 'Active'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {line.startPoint} → {line.endPoint}
                            </p>
                          </div>
                          
                          {/* Time & Favorite */}
                          <div className="flex items-center gap-2">
                            <div className="text-right text-xs text-slate-500">
                              <div className="font-medium text-slate-700">{line.startTime} - {line.endTime}</div>
                              <div>{line.frequency}</div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite?.(line.id);
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
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-black text-blue-600">{stats.total}</div>
            <div className="text-xs text-slate-500">{t.stats.totalLines}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-green-600">{stats.active}</div>
            <div className="text-xs text-slate-500">{t.stats.activeLines}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-purple-600">{stats.earliest}</div>
            <div className="text-xs text-slate-500">{t.stats.earliest}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-orange-600">{stats.latest}</div>
            <div className="text-xs text-slate-500">{t.stats.latest}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BusLinesTab;
