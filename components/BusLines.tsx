import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bus, Clock, MapPin, Search, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';

// Bus line data extracted from the source
export interface BusLine {
  id: string;
  lineNumber: string;
  route: string;
  startPoint: string;
  endPoint: string;
  startTime: string;
  endTime: string;
  frequency: string;
  isActive: boolean;
  color?: string;
}

interface BusLinesProps {
  lang: Language;
  onLineSelect?: (lineId: string) => void;
}

const BusLines: React.FC<BusLinesProps> = ({ lang, onLineSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'frequent'>('all');

  // All bus lines data from Tuzla
  const allBusLines: BusLine[] = useMemo(() => [
    { id: '1', lineNumber: '1', route: 'Grabovica - Krojcica', startPoint: 'Grabovica', endPoint: 'Krojcica', startTime: '06:15', endTime: '21:10', frequency: '~75 min', isActive: true, color: '#1d4ed8' },
    { id: '3', lineNumber: '3', route: 'Moluhe - B.Gradina', startPoint: 'Moluhe', endPoint: 'B.Gradina', startTime: '05:30', endTime: '21:35', frequency: '~60 min', isActive: true, color: '#1d4ed8' },
    { id: '6', lineNumber: '6', route: 'Mandici - Ši Selo', startPoint: 'Mandici', endPoint: 'Ši Selo', startTime: '06:00', endTime: '21:00', frequency: '~65 min', isActive: true, color: '#1d4ed8' },
    { id: '9A', lineNumber: '9A', route: 'Puracic - Tuzla AS istok', startPoint: 'Puracic', endPoint: 'Tuzla AS istok', startTime: '05:30', endTime: '22:00', frequency: '~50 min', isActive: true, color: '#1d4ed8' },
    { id: '9B', lineNumber: '9B', route: 'Gracanica AS - Tuzla AS Istok', startPoint: 'Gracanica AS', endPoint: 'Tuzla AS Istok', startTime: '05:20', endTime: '20:30', frequency: '~30 min', isActive: true, color: '#1d4ed8' },
    { id: '10A', lineNumber: '10A', route: 'Živinice AS - Tuzla AS', startPoint: 'Živinice AS', endPoint: 'Tuzla AS', startTime: '06:10', endTime: '22:00', frequency: '~20 min', isActive: true, color: '#1d4ed8' },
    { id: '10B', lineNumber: '10B', route: 'Banovici AS - Tuzla AS', startPoint: 'Banovici AS', endPoint: 'Tuzla AS', startTime: '05:35', endTime: '19:05', frequency: '~35 min', isActive: true, color: '#1d4ed8' },
    { id: '10C', lineNumber: '10C', route: 'Kladanj AS - Tuzla AS', startPoint: 'Kladanj AS', endPoint: 'Tuzla AS', startTime: '05:10', endTime: '20:30', frequency: '~115 min', isActive: true, color: '#1d4ed8' },
    { id: '11', lineNumber: '11', route: 'Tuzla - Kalesija', startPoint: 'Tuzla', endPoint: 'Kalesija', startTime: '05:55', endTime: '18:55', frequency: '~65 min', isActive: true, color: '#1d4ed8' },
    { id: '13A', lineNumber: '13A', route: 'Kalesija - Tuzla', startPoint: 'Kalesija', endPoint: 'Tuzla', startTime: '05:35', endTime: '19:00', frequency: '~38 min', isActive: true, color: '#1d4ed8' },
    { id: '13B', lineNumber: '13B', route: 'Sapna - Tuzla', startPoint: 'Sapna', endPoint: 'Tuzla', startTime: '05:15', endTime: '15:15', frequency: '~120 min', isActive: true, color: '#1d4ed8' },
    { id: '14', lineNumber: '14', route: 'Kiseljak - Slavinovici', startPoint: 'Kiseljak', endPoint: 'Slavinovici', startTime: '05:30', endTime: '21:55', frequency: '~60 min', isActive: true, color: '#1d4ed8' },
    { id: '18', lineNumber: '18', route: 'Gornja Lipnica - Slavinovici', startPoint: 'Gornja Lipnica', endPoint: 'Slavinovici', startTime: '05:35', endTime: '22:00', frequency: '~65 min', isActive: true, color: '#1d4ed8' },
    { id: '19', lineNumber: '19', route: 'Mramor - Solina', startPoint: 'Mramor', endPoint: 'Solina', startTime: '05:55', endTime: '22:10', frequency: '~60 min', isActive: true, color: '#1d4ed8' },
    { id: '20', lineNumber: '20', route: 'Poljice - Tuzla AS Istok', startPoint: 'Poljice', endPoint: 'Tuzla AS Istok', startTime: '05:40', endTime: '19:00', frequency: '~80 min', isActive: true, color: '#1d4ed8' },
    { id: '24A', lineNumber: '24A', route: 'AS Srebrenik - Tuzla AS Istok', startPoint: 'AS Srebrenik', endPoint: 'Tuzla AS Istok', startTime: '05:20', endTime: '22:25', frequency: '~40 min', isActive: true, color: '#1d4ed8' },
    { id: '27', lineNumber: '27', route: 'Gracanica AS - Lukavica (Dom kulture)', startPoint: 'Gracanica AS', endPoint: 'Lukavica (Dom kulture)', startTime: '06:25', endTime: '19:25', frequency: '~85 min', isActive: false, color: '#6b7280' },
    { id: '30', lineNumber: '30', route: 'Obodnica Donja - Ši Selo', startPoint: 'Obodnica Donja', endPoint: 'Ši Selo', startTime: '05:45', endTime: '20:00', frequency: '~153 min', isActive: false, color: '#6b7280' },
    { id: '31', lineNumber: '31', route: 'Gornji Pasci - Solina', startPoint: 'Gornji Pasci', endPoint: 'Solina', startTime: '05:40', endTime: '22:05', frequency: '~60 min', isActive: false, color: '#6b7280' },
    { id: '32', lineNumber: '32', route: 'Kozlovac - Ši Selo', startPoint: 'Kozlovac', endPoint: 'Ši Selo', startTime: '06:30', endTime: '17:30', frequency: '~95 min', isActive: false, color: '#6b7280' },
    { id: '33', lineNumber: '33', route: 'Celic - Tuzla AS Zapad', startPoint: 'Celic', endPoint: 'Tuzla AS Zapad', startTime: '05:40', endTime: '18:30', frequency: '~90 min', isActive: false, color: '#6b7280' },
    { id: '34', lineNumber: '34', route: 'Aerodrom Tuzla - Tuzla AS Istok', startPoint: 'Aerodrom Tuzla', endPoint: 'Tuzla AS Istok', startTime: '07:00', endTime: '23:00', frequency: '~120 min', isActive: false, color: '#6b7280' },
    { id: '40', lineNumber: '40', route: 'Jaruke - Lukavac AS', startPoint: 'Jaruke', endPoint: 'Lukavac AS', startTime: '05:40', endTime: '18:00', frequency: '~240 min', isActive: false, color: '#6b7280' },
    { id: '44', lineNumber: '44', route: 'Orahovica - Lukavac AS', startPoint: 'Orahovica', endPoint: 'Lukavac AS', startTime: '05:45', endTime: '17:50', frequency: '~175 min', isActive: false, color: '#6b7280' },
    { id: '45', lineNumber: '45', route: 'Turija - Lukavac', startPoint: 'Turija', endPoint: 'Lukavac', startTime: '05:40', endTime: '16:10', frequency: '~130 min', isActive: false, color: '#6b7280' },
    { id: '47', lineNumber: '47', route: 'Bokavici - Lukavac AS', startPoint: 'Bokavici', endPoint: 'Lukavac AS', startTime: '06:25', endTime: '19:20', frequency: '~173 min', isActive: false, color: '#6b7280' },
    { id: '49', lineNumber: '49', route: 'Prline - Lukavac AS', startPoint: 'Prline', endPoint: 'Lukavac AS', startTime: '06:10', endTime: '18:00', frequency: '~175 min', isActive: false, color: '#6b7280' },
    { id: '52', lineNumber: '52', route: 'Kovacica - Paš Bunar', startPoint: 'Kovacica', endPoint: 'Paš Bunar', startTime: '05:30', endTime: '16:00', frequency: '~98 min', isActive: false, color: '#6b7280' },
  ], []);

  // Filter lines based on search and active filter
  const filteredLines = useMemo(() => {
    return allBusLines.filter(line => {
      const matchesSearch = searchQuery === '' || 
        line.lineNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.startPoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.endPoint.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || 
        (activeFilter === 'active' && line.isActive) ||
        (activeFilter === 'frequent' && parseInt(line.frequency) <= 60);
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, allBusLines]);

  // Featured lines (first 12 visible in the grid)
  const featuredLines = useMemo(() => {
    return allBusLines.filter(line => line.isActive).slice(0, 12);
  }, [allBusLines]);

  // Translation labels
  const labels = {
    en: {
      title: 'Tuzla Bus Lines',
      subtitle: 'Public Transport Network',
      searchPlaceholder: 'Search by line number or destination...',
      allLines: 'All Lines',
      activeLines: 'Active Lines',
      frequentLines: 'Frequent (< 60 min)',
      lineNumber: 'Line',
      route: 'Route',
      operatingHours: 'Operating Hours',
      frequency: 'Frequency',
      viewDetails: 'View Details',
      viewAllLines: 'View All Lines',
      noResults: 'No bus lines found matching your search.',
      featured: 'Featured Lines',
    },
    bs: {
      title: 'Tuzla Autobuske Linije',
      subtitle: 'Javna Prevozna Mreža',
      searchPlaceholder: 'Pretražite po broju linije ili odredištu...',
      allLines: 'Sve Linije',
      activeLines: 'Aktivne Linije',
      frequentLines: 'Česte (< 60 min)',
      lineNumber: 'Linija',
      route: 'Ruta',
      operatingHours: 'Radno Vrijeme',
      frequency: 'Frekvencija',
      viewDetails: 'Pogledaj Detalje',
      viewAllLines: 'Pogledaj Sve Linije',
      noResults: 'Nema pronađenih autobuskih linija za vašu pretragu.',
      featured: 'Istaknute Linije',
    },
    de: {
      title: 'Tuzla Buslinien',
      subtitle: 'Öffentliches Verkehrsnetz',
      searchPlaceholder: 'Suche nach Liniennummer oder Ziel...',
      allLines: 'Alle Linien',
      activeLines: 'Aktive Linien',
      frequentLines: 'Häufig (< 60 min)',
      lineNumber: 'Linie',
      route: 'Route',
      operatingHours: 'Betriebszeiten',
      frequency: 'Frequenz',
      viewDetails: 'Details anzeigen',
      viewAllLines: 'Alle Linien anzeigen',
      noResults: 'Keine Buslinien zu Ihrer Suche gefunden.',
      featured: 'Empfohlene Linien',
    },
    tr: {
      title: 'Tuzla Otobüs Hatları',
      subtitle: 'Toplu Taşımacılık Ağı',
      searchPlaceholder: 'Hat numarası veya varış yerine göre arama...',
      allLines: 'Tüm Hatlar',
      activeLines: 'Aktif Hatlar',
      frequentLines: 'Sık (< 60 dk)',
      lineNumber: 'Hat',
      route: 'Güzergah',
      operatingHours: 'Çalışma Saatleri',
      frequency: 'Sıklık',
      viewDetails: 'Detayları Gör',
      viewAllLines: 'Tüm Hatları Gör',
      noResults: 'Aramanıza uygun otobüs hattı bulunamadı.',
      featured: 'Öne Çıkan Hatlar',
    },
  };

  const t = labels[lang] || labels.en;

  const toggleExpand = (lineId: string) => {
    setExpandedLine(expandedLine === lineId ? null : lineId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-slate-600 text-sm md:text-base">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-lg border border-slate-200/80">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/50 text-slate-700 hover:bg-white'}`}
          >
            {t.allLines}
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'active' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/50 text-slate-700 hover:bg-white'}`}
          >
            {t.activeLines}
          </button>
          <button
            onClick={() => setActiveFilter('frequent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'frequent' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/50 text-slate-700 hover:bg-white'}`}
          >
            {t.frequentLines}
          </button>
        </div>
      </div>

      {/* Featured Lines Grid */}
      {searchQuery === '' && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">{t.featured}</h2>
            <button
              onClick={() => document.getElementById('all-lines')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {t.viewAllLines}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredLines.map((line) => (
              <div
                key={line.id}
                onClick={() => onLineSelect?.(line.id)}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-200/80 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                    style={{ backgroundColor: line.color || '#1d4ed8' }}
                  >
                    {line.lineNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{line.startPoint}</h3>
                    <p className="text-sm text-slate-500 truncate">{line.endPoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{line.startTime} - {line.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{line.frequency}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100/80">
                  <p className="text-xs text-slate-500 truncate">{line.route}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Lines Table */}
      <section id="all-lines" className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900">{t.allLines}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filteredLines.length} {lang === 'bs' ? 'linija' : lang === 'de' ? 'Linien' : lang === 'tr' ? 'hat' : 'lines'} found
          </p>
        </div>
        
        {filteredLines.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Bus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t.noResults}</h3>
            <p className="text-sm text-slate-500">
              {lang === 'bs' ? 'Pokušajte s drugom pretragom.' : 
               lang === 'de' ? 'Versuchen Sie eine andere Suche.' : 
               lang === 'tr' ? 'Farklı bir arama deneyin.' : 'Try a different search.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {filteredLines.map((line) => (
              <div
                key={line.id}
                onClick={() => onLineSelect?.(line.id)}
                className={`p-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedLine === line.id ? 'bg-slate-50/80' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                      style={{ backgroundColor: line.color || '#1d4ed8' }}
                    >
                      {line.lineNumber}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{line.route}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{line.startPoint} → {line.endPoint}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="font-medium text-slate-900">{line.startTime} - {line.endTime}</div>
                      <div className="text-xs text-slate-500">{line.frequency}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(line.id);
                      }}
                      className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                      {expandedLine === line.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedLine === line.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-200/80"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Bus className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{t.lineNumber}</div>
                          <div className="text-slate-500">{line.lineNumber}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{t.operatingHours}</div>
                          <div className="text-slate-500">{line.startTime} - {line.endTime}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{t.frequency}</div>
                          <div className="text-slate-500">{line.frequency}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLineSelect?.(line.id);
                      }}
                      className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {t.viewDetails}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-slate-200/80">
          <div className="text-2xl font-black text-blue-600">{allBusLines.length}</div>
          <div className="text-sm text-slate-500">
            {lang === 'bs' ? 'Ukupno linija' : lang === 'de' ? 'Gesamtlinien' : lang === 'tr' ? 'Toplam Hat' : 'Total Lines'}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-slate-200/80">
          <div className="text-2xl font-black text-green-600">{allBusLines.filter(l => l.isActive).length}</div>
          <div className="text-sm text-slate-500">
            {lang === 'bs' ? 'Aktivne linije' : lang === 'de' ? 'Aktive Linien' : lang === 'tr' ? 'Aktif Hatlar' : 'Active Lines'}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-slate-200/80">
          <div className="text-2xl font-black text-purple-600">05:00</div>
          <div className="text-sm text-slate-500">
            {lang === 'bs' ? 'Najraniji polazak' : lang === 'de' ? 'Früheste Abfahrt' : lang === 'tr' ? 'En Erken Kalkış' : 'Earliest Departure'}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-slate-200/80">
          <div className="text-2xl font-black text-orange-600">23:00</div>
          <div className="text-sm text-slate-500">
            {lang === 'bs' ? 'Najkasniji dolazak' : lang === 'de' ? 'Späteste Ankunft' : lang === 'tr' ? 'En Geç Varış' : 'Latest Arrival'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusLines;
