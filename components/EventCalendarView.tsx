import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  Tag, 
  Ticket, 
  Radio, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Search, 
  Filter,
  Trash2
} from 'lucide-react';
import { Language } from '../types';
import { CalendarEventItem, EventExtractionResult } from '../types/events';
import { INITIAL_CALENDAR_EVENTS, extractEventFromText } from '../utils/eventExtractor';
import { Preferences } from '@capacitor/preferences';

interface CalendarViewProps {
  lang: Language;
}

const EVENTS_STORAGE_KEY = 'tuzla_events_calendar_v1';

const MONTH_NAMES_BS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_BS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const EventCalendarView: React.FC<CalendarViewProps> = ({ lang }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // 0-indexed (7 = August)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>('2026-08-18');
  
  const [events, setEvents] = useState<CalendarEventItem[]>(INITIAL_CALENDAR_EVENTS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Extraction Tool State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [rawNewsInput, setRawNewsInput] = useState<string>('');
  const [aiExtractionResult, setAiExtractionResult] = useState<EventExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Load persistent custom added events
  useEffect(() => {
    const loadStoredEvents = async () => {
      try {
        const { value } = await Preferences.get({ key: EVENTS_STORAGE_KEY });
        if (value) {
          const parsed: CalendarEventItem[] = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEvents(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load calendar events', err);
      }
    };
    loadStoredEvents();
  }, []);

  // Save to preferences when events change
  const saveEvents = async (updatedEvents: CalendarEventItem[]) => {
    setEvents(updatedEvents);
    try {
      await Preferences.set({ key: EVENTS_STORAGE_KEY, value: JSON.stringify(updatedEvents) });
    } catch (err) {
      console.error('Failed to save calendar events', err);
    }
  };

  const months = lang === 'bs' ? MONTH_NAMES_BS : MONTH_NAMES_EN;
  const days = lang === 'bs' ? DAYS_BS : DAYS_EN;

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    // Adjust JS day (0 is Sun) to European Monday-first (0 is Mon)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysArray: { dateStr: string | null; dayNumber: number | null; isCurrentMonth: boolean }[] = [];

    // Empty padding slots for days before 1st of month
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push({ dateStr: null, dayNumber: null, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const fullDateStr = `${selectedYear}-${monthStr}-${dayStr}`;
      daysArray.push({ dateStr: fullDateStr, dayNumber: d, isCurrentMonth: true });
    }

    return daysArray;
  }, [selectedYear, selectedMonth]);

  // Filter events for the selected day or overall filter
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    events.forEach((evt) => {
      if (!map[evt.start_date]) {
        map[evt.start_date] = [];
      }
      map[evt.start_date].push(evt);
    });
    return map;
  }, [events]);

  const filteredSelectedDayEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    let list = eventsByDate[selectedDateStr] || [];
    if (activeCategory !== 'All') {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue_name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [eventsByDate, selectedDateStr, activeCategory, searchQuery]);

  const upcomingEventsInMonth = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    let list = events.filter((e) => e.start_date.startsWith(monthPrefix));
    if (activeCategory !== 'All') {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue_name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [events, selectedYear, selectedMonth, activeCategory, searchQuery]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      if (selectedYear > 2026) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(11);
      }
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      if (selectedYear < 2027) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(0);
      }
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleAiExtract = () => {
    if (!rawNewsInput.trim()) return;
    setIsExtracting(true);
    setTimeout(() => {
      const res = extractEventFromText(rawNewsInput, selectedYear);
      setAiExtractionResult(res);
      setIsExtracting(false);
    }, 600);
  };

  const handleApproveAiEvent = () => {
    if (!aiExtractionResult || !aiExtractionResult.event) return;
    const newEvt: CalendarEventItem = {
      ...aiExtractionResult.event,
      id: `ai-evt-${Date.now()}`,
      source_portal: 'RSS/Portal AI Extractor'
    };
    saveEvents([newEvt, ...events]);
    setSelectedDateStr(newEvt.start_date);
    setShowAiModal(false);
    setRawNewsInput('');
    setAiExtractionResult(null);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveEvents(updated);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Top Controls & Year Switch */}
      <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
              {lang === 'bs' ? 'Događaji i Kalendar' : 'Events Calendar'}
            </h2>
            <p className="text-xs font-semibold text-slate-500 sm:text-sm">
              {lang === 'bs'
                ? 'Tuzla Tour Guide • Kalendar dešavanja 2026 / 2027'
                : 'Tuzla Tour Guide • Event Calendar 2026 / 2027'}
            </p>
          </div>
        </div>

        {/* Year Selector Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setSelectedYear(2026)}
            className={`rounded-2xl px-5 py-2.5 text-sm font-black transition-all ${
              selectedYear === 2026
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2026
          </button>
          <button
            onClick={() => setSelectedYear(2027)}
            className={`rounded-2xl px-5 py-2.5 text-sm font-black transition-all ${
              selectedYear === 2027
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2027
          </button>
          
          <button
            onClick={() => setShowAiModal(true)}
            className="ml-2 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            <span>{lang === 'bs' ? 'AI Event Extractor' : 'AI Event Extractor'}</span>
          </button>
        </div>
      </div>

      {/* Month Header Nav & Search Bar */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-3 shadow-xs">
          <button
            onClick={handlePrevMonth}
            disabled={selectedYear === 2026 && selectedMonth === 0}
            className="rounded-xl border border-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-lg font-black text-slate-800 sm:text-xl">
            {months[selectedMonth]} {selectedYear}
          </span>

          <button
            onClick={handleNextMonth}
            disabled={selectedYear === 2027 && selectedMonth === 11}
            className="rounded-xl border border-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bs' ? 'Pretraži događaje...' : 'Search events...'}
              className="w-full rounded-2xl border border-blue-100 bg-white py-2.5 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">{lang === 'bs' ? 'Sve Kategorije' : 'All Categories'}</option>
            <option value="Sports">Sports</option>
            <option value="Concerts & Music">Concerts & Music</option>
            <option value="Culture & Theatre">Culture & Theatre</option>
            <option value="Nightlife">Nightlife</option>
            <option value="Exhibitions & Art">Exhibitions & Art</option>
            <option value="Community & Workshops">Community & Workshops</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout: Calendar Boxes vs Event Details */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Calendar Grid Box */}
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2 gap-1 text-center">
            {days.map((day, idx) => (
              <div key={idx} className="py-2 text-xs font-black uppercase tracking-wider text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Day Boxes */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((item, index) => {
              if (!item.isCurrentMonth || !item.dateStr) {
                return (
                  <div
                    key={index}
                    className="min-h-[70px] sm:min-h-[90px] rounded-2xl border border-transparent bg-slate-50/50 opacity-30"
                  />
                );
              }

              const dayEvents = eventsByDate[item.dateStr] || [];
              const isSelected = selectedDateStr === item.dateStr;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`group relative flex min-h-[75px] sm:min-h-[95px] flex-col justify-between rounded-2xl border p-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                      : hasEvents
                      ? 'border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : hasEvents
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.dayNumber}
                    </span>

                    {hasEvents && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>

                  {/* Badges for events inside box */}
                  <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`truncate rounded-lg px-1.5 py-0.5 text-[9px] font-bold ${
                          evt.category === 'Sports'
                            ? 'bg-emerald-100 text-emerald-800'
                            : evt.category === 'Concerts & Music'
                            ? 'bg-purple-100 text-purple-800'
                            : evt.category === 'Culture & Theatre'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-black text-slate-400 pl-1">
                        +{dayEvents.length - 2} {lang === 'bs' ? 'još' : 'more'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Details for Selected Day & Month Overview */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                  {lang === 'bs' ? 'Događaji za dan' : 'Selected Day Events'}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedDateStr || (lang === 'bs' ? 'Odaberite datum' : 'Select a date')}
                </h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 border border-blue-100">
                {filteredSelectedDayEvents.length} {lang === 'bs' ? 'Događaja' : 'Events'}
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredSelectedDayEvents.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-slate-400">
                  {lang === 'bs'
                    ? 'Nema zakazanih događaja za ovaj datum.'
                    : 'No scheduled events for this date.'}
                </div>
              ) : (
                filteredSelectedDayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="relative rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-blue-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                        {evt.category}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="mt-2 text-base font-black text-slate-900 leading-snug">
                      {evt.title}
                    </h4>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span>{evt.start_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        <span className="truncate">{evt.venue_name}</span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {evt.description}
                    </p>

                    {evt.ticket_info && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{evt.ticket_info}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Month Highlights List */}
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/30 p-5 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {lang === 'bs' ? 'Svi događaji u mjesecu' : 'All Events in Month'} ({months[selectedMonth]})
            </h4>
            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {upcomingEventsInMonth.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedDateStr(e.start_date)}
                  className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 cursor-pointer hover:border-blue-300"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-black text-slate-800 truncate">{e.title}</div>
                    <div className="text-[10px] text-slate-500">{e.venue_name}</div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">
                    {e.start_date.split('-').slice(1).join('/')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI EVENT EXTRACTION AGENT MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">AI Event Extraction Agent</h3>
                    <p className="text-xs text-blue-200">Tuzla Tour Guide • Portal & RSS Feed Parser</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                Nalijepite neobrađeni tekst sa tuzlanskih portala (npr. tuzlanski.ba, tip.ba, bkctuzla.ba) ili RSS feed-a. AI Agent će automatski izdvojiti datum, satnicu, lokaciju i kategoriju u validan JSON format te dodati događaj u kalendar!
              </p>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Neobrađeni tekst / Portal vijest:
                </label>
                <textarea
                  rows={4}
                  value={rawNewsInput}
                  onChange={(e) => setRawNewsInput(e.target.value)}
                  placeholder="Npr: Sutra od 19:00 sati na stadionu Tušanj u Tuzli igra se velika utakmica između FK Sloboda i FK Sarajevo. Ulaznice su u prodaji po cijeni od 5 KM..."
                  className="w-full rounded-2xl border border-slate-200 p-4 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleAiExtract}
                disabled={isExtracting || !rawNewsInput.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isExtracting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analiziraj i Ekstraktuj (JSON Schema)</span>
                  </>
                )}
              </button>

              {/* Extraction Results */}
              {aiExtractionResult && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Strukturirani JSON Rezultat
                    </span>
                    <div className="flex items-center gap-2">
                      {aiExtractionResult.is_valid_event ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                          <CheckCircle className="h-3 w-3" /> Valid Event ({Math.round(aiExtractionResult.confidence_score * 100)}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-800">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {aiExtractionResult.is_valid_event && aiExtractionResult.event ? (
                    <div className="space-y-2 text-xs font-medium text-slate-800">
                      <div><strong className="text-slate-900">Naslov:</strong> {aiExtractionResult.event.title}</div>
                      <div><strong className="text-slate-900">Kategorija:</strong> {aiExtractionResult.event.category}</div>
                      <div><strong className="text-slate-900">Datum & Vrijeme:</strong> {aiExtractionResult.event.start_date} u {aiExtractionResult.event.start_time}</div>
                      <div><strong className="text-slate-900">Lokacija:</strong> {aiExtractionResult.event.venue_name}, {aiExtractionResult.event.city}</div>
                      <div><strong className="text-slate-900">Opis:</strong> {aiExtractionResult.event.description}</div>

                      <button
                        onClick={handleApproveAiEvent}
                        className="mt-3 w-full rounded-xl bg-emerald-600 py-3 text-xs font-black text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
                      >
                        Odobri i Dodaj u Kalendar
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 font-semibold">
                      Razlog odbijanja: {aiExtractionResult.rejection_reason}
                    </div>
                  )}

                  {/* Raw JSON Preview */}
                  <details className="mt-2 text-[10px] font-mono text-slate-600">
                    <summary className="cursor-pointer font-bold text-slate-700">Prikaži sirovi JSON output</summary>
                    <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-green-400 overflow-x-auto">
                      {JSON.stringify(aiExtractionResult, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
