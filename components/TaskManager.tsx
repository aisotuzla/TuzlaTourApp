import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Compass,
  CreditCard,
  Headphones,
  MapPin,
  Plus,
  Receipt,
  Trash2,
  TrendingUp,
  Bus,
} from 'lucide-react';
import { Language } from '../types';
import { Preferences } from '@capacitor/preferences';
import { EventCalendarView } from './EventCalendarView';
import { MediaAudioGuideTab } from './MediaAudioGuideTab';
import { ThreeDayPlanView } from './ThreeDayPlanView';
import { PracticalTravelInfo } from './PracticalTravelInfo';
import { TransportTab } from './TransportTab';

type Mode = 'notebook' | 'transport' | 'calendar' | 'threeDayPlan' | 'practicalInfo' | 'media';
type NotebookSubTab = 'all' | 'itinerary' | 'expenses';

type ExpenseItem = {
  id: number;
  name: string;
  amount: number;
  date: string;
};

type ItineraryItem = {
  id: number;
  name: string;
  address: string;
  type: 'Hotel' | 'Restaurant' | 'Attraction';
  checked: boolean;
};

interface TaskManagerProps {
  lang: Language;
}

const storageKey = 'tuzla_task_manager_v1';

const copy = {
  en: {
    title: 'Personal Notebook',
    subtitle: 'Your unified notebook for itinerary and travel expenses.',
    notebook: 'Notebook',
    all: 'All',
    expenses: 'Expenses',
    expensePlaceholder: 'Item, e.g. Lunch at Restaurant Kapija',
    amountPlaceholder: 'Amount (KM)',
    expenseTotal: 'Total Expenses',
    entriesCount: 'Entries',
    avgExpense: 'Average',
    addExpense: 'Add',
    emptyLedger: 'No expenses recorded yet.',
    addHint: 'Enter item details and tap Add to log an expense.',
    itinerary: 'Itinerary',
    emptyItinerary: 'No itinerary items yet. Add hotels or restaurants from Tourist Info!',
    quickOverview: 'Quick Overview',
  },
  bs: {
    title: 'Lični planer',
    subtitle: 'Tvoja jedinstvena bilježnica za plan puta i evidenciju troškova.',
    notebook: 'Planer',
    all: 'Sve',
    expenses: 'Troškovi',
    expensePlaceholder: 'Stavka, npr. Ćevapi u Limenci',
    amountPlaceholder: 'Iznos (KM)',
    expenseTotal: 'Ukupni troškovi',
    entriesCount: 'Stavke',
    avgExpense: 'Prosjek',
    addExpense: 'Dodaj',
    emptyLedger: 'Nema zabilježenih troškova.',
    addHint: 'Unesi stavku i iznos, pa pritisni Dodaj.',
    itinerary: 'Plan puta',
    emptyItinerary: 'Još nema stavki u planu. Dodaj hotele ili restorane iz Turističkih info!',
    quickOverview: 'Brzi pregled',
  },
  de: {
    title: 'Persönliches Notizbuch',
    subtitle: 'Dein einheitliches Notizbuch für Reiseplan und Reisekosten.',
    notebook: 'Notizbuch',
    all: 'Alle',
    expenses: 'Ausgaben',
    expensePlaceholder: 'Eintrag, z. B. Kaffee in Sloboda',
    amountPlaceholder: 'Betrag (KM)',
    expenseTotal: 'Gesamtausgaben',
    entriesCount: 'Einträge',
    avgExpense: 'Durchschnitt',
    addExpense: 'Hinzufügen',
    emptyLedger: 'Noch keine Ausgaben erfasst.',
    addHint: 'Eintrag und Betrag eingeben, dann Hinzufügen tippen.',
    itinerary: 'Reiseplan',
    emptyItinerary: 'Noch keine Reiseplan-Einträge. Füge Hotels oder Restaurants aus Tourist Info hinzu!',
    quickOverview: 'Schnellübersicht',
  },
  tr: {
    title: 'Kişisel Not Defteri',
    subtitle: 'Güzergah ve seyahat harcamalarınız için kişisel not defteriniz.',
    notebook: 'Not Defteri',
    all: 'Tümü',
    expenses: 'Harcamalar',
    expensePlaceholder: 'Kalem, örn. Sloboda\'da kahve',
    amountPlaceholder: 'Tutar (KM)',
    expenseTotal: 'Toplam Harcama',
    entriesCount: 'Kayıt',
    avgExpense: 'Ortalama',
    addExpense: 'Ekle',
    emptyLedger: 'Henüz kayıtlı harcama yok.',
    addHint: 'Harcama adı ve tutarını girip Ekle düğmesine dokunun.',
    itinerary: 'Güzergah',
    emptyItinerary: 'Henüz güzergah öğesi yok. Turistik bilgilerden ekleyin!',
    quickOverview: 'Hızlı Bakış',
  },
} as const;

const readState = async (): Promise<{ expenses: ExpenseItem[]; itinerary: ItineraryItem[] }> => {
  if (typeof window === 'undefined') {
    return { expenses: [], itinerary: [] };
  }

  try {
    const { value: raw } = await Preferences.get({ key: storageKey });
    if (!raw) return { expenses: [], itinerary: [] };
    const parsed = JSON.parse(raw) as { expenses?: ExpenseItem[]; itinerary?: ItineraryItem[] };
    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
    };
  } catch {
    return { expenses: [], itinerary: [] };
  }
};

const TaskManager: React.FC<TaskManagerProps> = ({ lang }) => {
  const t = copy[lang] ?? copy.en;
  const [view, setView] = useState<Mode>('notebook');
  const [notebookSubTab, setNotebookSubTab] = useState<NotebookSubTab>('all');

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');

  useEffect(() => {
    const loadInitialState = async () => {
      const state = await readState();
      setExpenses(state.expenses);
      setItinerary(state.itinerary);
      setIsLoaded(true);
    };
    loadInitialState();
  }, []);

  // Sync with Preferences when state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    const data = JSON.stringify({ expenses, itinerary });
    Preferences.set({ key: storageKey, value: data });
  }, [expenses, itinerary, isLoaded]);

  // Listen for itinerary updates from other components (external updates to Preferences)
  useEffect(() => {
    const handler = async () => {
      const saved = await readState();
      setItinerary(saved.itinerary);
    };
    window.addEventListener('itinerary-updated', handler);
    return () => window.removeEventListener('itinerary-updated', handler);
  }, []);

  const total = useMemo(
    () => expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2),
    [expenses]
  );

  const averageExpense = useMemo(() => {
    if (expenses.length === 0) return '0.00';
    return (expenses.reduce((acc, curr) => acc + curr.amount, 0) / expenses.length).toFixed(2);
  }, [expenses]);

  const addExpense = () => {
    const amount = Number.parseFloat(expAmount);
    if (!expName.trim() || Number.isNaN(amount) || amount <= 0) return;

    setExpenses((prev) => [
      {
        id: Date.now(),
        name: expName.trim(),
        amount,
        date: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);
    setExpName('');
    setExpAmount('');
  };

  const deleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItinerary = (id: number) => {
    setItinerary((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const deleteItinerary = (id: number) => {
    setItinerary((prev) => prev.filter((item) => item.id !== id));
  };

  // Render Itinerary section
  const renderItineraryContent = () => (
    <div className="space-y-3">
      {itinerary.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-white p-6 sm:p-8 text-sm text-slate-500 text-center">
          {t.emptyItinerary}
        </div>
      ) : (
        itinerary.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl sm:rounded-[1.5rem] border border-blue-100 bg-white p-3.5 sm:p-4 shadow-sm transition-all hover:border-blue-200"
          >
            <button
              onClick={() => toggleItinerary(item.id)}
              className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2 min-h-[44px]"
            >
              {item.checked ? (
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300 shrink-0" />
              )}
              <div className="min-w-0">
                <div
                  className={`text-sm sm:text-base font-black truncate ${
                    item.checked ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}
                >
                  {item.name}
                </div>
                <div className="text-xs text-slate-500 truncate">{item.address}</div>
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                  item.type === 'Hotel'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : item.type === 'Restaurant'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                }`}
              >
                {item.type}
              </span>
              <button
                onClick={() => deleteItinerary(item.id)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 active:scale-95"
                aria-label="Delete itinerary item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Render Expanded Expenses section
  const renderExpensesContent = () => (
    <div className="space-y-4">
      {/* Expanded Expense Summary Banner */}
      <div className="rounded-2xl sm:rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(135deg,_#1e3a8a_0%,_#2563eb_60%,_#38bdf8_100%)] p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
              <Receipt className="h-4 w-4" />
              {t.expenseTotal}
            </div>
            <div className="mt-1 text-3xl sm:text-4xl font-black tracking-tight">{total} KM</div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-xl bg-white/15 px-3.5 py-2 backdrop-blur-xs border border-white/20">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-100">{t.entriesCount}</div>
              <div className="text-lg font-black text-white">{expenses.length}</div>
            </div>
            <div className="rounded-xl bg-white/15 px-3.5 py-2 backdrop-blur-xs border border-white/20">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-cyan-100">
                <TrendingUp className="h-3 w-3" />
                {t.avgExpense}
              </div>
              <div className="text-lg font-black text-white">{averageExpense} KM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Touch-optimized Add Expense Form */}
      <div className="rounded-2xl sm:rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3">
          <input
            value={expName}
            onChange={(e) => setExpName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addExpense();
            }}
            placeholder={t.expensePlaceholder}
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex gap-2.5">
            <div className="relative flex-1 sm:max-w-[180px]">
              <input
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addExpense();
                }}
                placeholder={t.amountPlaceholder}
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={addExpense}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm sm:text-base font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span>{t.addExpense}</span>
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">{t.addHint}</p>
      </div>

      {/* Expenses History List */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="rounded-2xl sm:rounded-[1.5rem] border border-dashed border-blue-200 bg-white p-6 sm:p-8 text-sm text-slate-500 text-center">
            {t.emptyLedger}
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-2xl sm:rounded-[1.5rem] border border-blue-100 bg-white p-3.5 sm:p-4 shadow-sm transition-all hover:border-blue-200"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-sm sm:text-base font-black text-slate-900 truncate">{expense.name}</div>
                <div className="text-xs text-slate-400">{expense.date}</div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="rounded-full bg-blue-50 px-3.5 py-1.5 text-sm sm:text-base font-black text-blue-700 border border-blue-100/70">
                  {expense.amount.toFixed(2)} KM
                </div>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 active:scale-95"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderQuickOverviewAside = () => (
    <aside className="rounded-2xl sm:rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#eff6ff_100%)] p-5 shadow-sm h-fit space-y-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
        <CreditCard className="h-4 w-4" />
        {t.quickOverview}
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-1">
        <div className="rounded-2xl bg-white p-4 border border-blue-50 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'bs' ? 'Plan puta' : lang === 'tr' ? 'Güzergah' : lang === 'de' ? 'Reiseplan' : 'Itinerary'}
          </div>
          <div className="mt-1 text-2xl font-black text-blue-900">{itinerary.length}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-blue-50 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'bs' ? 'Ukupno troškovi' : lang === 'tr' ? 'Toplam Masraf' : lang === 'de' ? 'Gesamtausgaben' : 'Total Spent'}
          </div>
          <div className="mt-1 text-2xl font-black text-blue-900">
            {total} <span className="text-sm font-semibold text-slate-500">KM</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 pb-32">
      <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-blue-100 bg-white shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
        {/* Header Hero */}
        <div className="bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_55%,_#38bdf8_100%)] px-4 py-6 sm:px-8 sm:py-8 text-white">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-cyan-100">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            {lang === 'bs'
              ? 'Lični organizer'
              : lang === 'tr'
              ? 'Kişisel Organizatör'
              : lang === 'de'
              ? 'Persönlicher Organizer'
              : 'Personal Organizer'}
          </div>
          <h1 className="mt-2 sm:mt-3 text-3xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80">
            {t.subtitle}
          </p>

          {/* Mode Switcher Buttons - Horizontally Scrollable on Mobile */}
          <div className="mt-5 sm:mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:pb-0">
            <button
              onClick={() => setView('notebook')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-black transition-all ${
                view === 'notebook'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              {t.notebook}
            </button>
            <button
              onClick={() => setView('transport')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-black transition-all ${
                view === 'transport'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <Bus className="h-4 w-4 sm:h-5 sm:w-5" />
              {lang === 'bs' ? 'Transport' : lang === 'de' ? 'Transport' : lang === 'tr' ? 'Ulaşım' : 'Transport'}
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-black transition-all ${
                view === 'calendar'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              {lang === 'bs'
                ? 'Kalendar događaja'
                : lang === 'de'
                ? 'Veranstaltungskalender'
                : lang === 'tr'
                ? 'Etkinlik Takvimi'
                : 'Calendar of Events'}
            </button>
            <button
              onClick={() => setView('threeDayPlan')}
              className={`shrink-0 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-black transition-all ${
                view === 'threeDayPlan'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              {lang === 'bs' ? '3 Dnevni plan' : lang === 'de' ? '3-Tage-Plan' : lang === 'tr' ? '3 Günlük Plan' : '3 Day Plan'}
            </button>
            <button
              onClick={() => setView('practicalInfo')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-black transition-all ${
                view === 'practicalInfo'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
              {lang === 'bs' ? 'Praktične info' : lang === 'de' ? 'Praktische Infos' : lang === 'tr' ? 'Pratik Bilgiler' : 'Practical Info'}
            </button>
            <button
              onClick={() => setView('media')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-black transition-all ${
                view === 'media'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
              {lang === 'bs' ? 'Media' : 'Media'}
            </button>
          </div>
        </div>

        {!isLoaded ? (
          <div className="flex justify-center items-center py-20 min-h-[300px]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'transport' ? (
          <div className="p-4 sm:p-8 w-full">
            <TransportTab lang={lang} />
          </div>
        ) : view === 'calendar' ? (
          <div className="p-4 sm:p-8">
            <EventCalendarView lang={lang} />
          </div>
        ) : view === 'threeDayPlan' ? (
          <div className="p-4 sm:p-8 w-full">
            <ThreeDayPlanView
              lang={lang}
              onSwitchToPracticalInfo={() => setView('practicalInfo')}
            />
          </div>
        ) : view === 'practicalInfo' ? (
          <div className="p-4 sm:p-8 w-full">
            <PracticalTravelInfo
              lang={lang}
              onSwitchToItinerary={() => setView('threeDayPlan')}
            />
          </div>
        ) : view === 'media' ? (
          <div className="p-4 sm:p-8 w-full">
            <MediaAudioGuideTab lang={lang} />
          </div>
        ) : view === 'notebook' ? (
          <div className="p-4 sm:p-8 space-y-6">
            {/* Notebook Sub-tabs navigation: Mobile segmented control style */}
            <div className="grid grid-cols-3 sm:flex sm:w-fit items-center gap-1 sm:gap-2 rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200/60">
              <button
                onClick={() => setNotebookSubTab('all')}
                className={`flex items-center justify-center rounded-xl py-2.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-black transition-all min-h-[44px] ${
                  notebookSubTab === 'all'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setNotebookSubTab('itinerary')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm font-black transition-all min-h-[44px] ${
                  notebookSubTab === 'itinerary'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
                <span className="truncate">{t.itinerary} ({itinerary.length})</span>
              </button>
              <button
                onClick={() => setNotebookSubTab('expenses')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm font-black transition-all min-h-[44px] ${
                  notebookSubTab === 'expenses'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 shrink-0" />
                <span className="truncate">{t.expenses} ({total} KM)</span>
              </button>
            </div>

            {/* Sub-tab content */}
            {notebookSubTab === 'all' ? (
              <div className="space-y-6">
                {/* Quick stats counter: 2-column wide layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-blue-600">{t.itinerary}</div>
                      <div className="mt-1 text-2xl sm:text-3xl font-black text-blue-900">{itinerary.length}</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/70 flex items-center justify-center text-blue-600">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">{t.expenseTotal}</div>
                      <div className="mt-1 text-2xl sm:text-3xl font-black text-indigo-900">{total} KM</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 flex items-center justify-center text-indigo-600">
                      <Receipt className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* 2-Column Unified Sections: 50% Itinerary, 50% Expenses */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  {/* Itinerary Column */}
                  <div className="rounded-2xl sm:rounded-[1.75rem] border border-blue-100 bg-white p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-50">
                      <div className="flex items-center gap-2 font-black text-blue-900 text-lg sm:text-xl">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {t.itinerary}
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-700">
                        {itinerary.length}
                      </span>
                    </div>
                    {renderItineraryContent()}
                  </div>

                  {/* Expenses Column - Expanded full half-width on desktop */}
                  <div className="rounded-2xl sm:rounded-[1.75rem] border border-blue-100 bg-white p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-50">
                      <div className="flex items-center gap-2 font-black text-blue-900 text-lg sm:text-xl">
                        <Receipt className="h-5 w-5 text-amber-600" />
                        {t.expenses}
                      </div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-black text-amber-700">
                        {total} KM
                      </span>
                    </div>
                    {renderExpensesContent()}
                  </div>
                </div>
              </div>
            ) : notebookSubTab === 'expenses' ? (
              /* Dedicated Expanded Expenses Tab View */
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {renderExpensesContent()}
                </div>
                {renderQuickOverviewAside()}
              </div>
            ) : (
              /* Dedicated Itinerary Tab View */
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
                <div>
                  {renderItineraryContent()}
                </div>
                {renderQuickOverviewAside()}
              </div>
            )}
          </div>
        ) : null}
      </section>

      <a
        href="https://tuzla.bingocitycenter.ba"
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-6 overflow-hidden rounded-2xl sm:rounded-[1.5rem] border border-blue-100 shadow-sm transition-transform hover:scale-[1.01]"
      >
        <img
          src="/assets/BCC.webp"
          alt="Bingo City Center"
          className="w-full h-auto object-cover"
        />
      </a>

      {/* Spacer for bottom navigation safety */}
      <div className="h-20" />
    </div>
  );
};

export default TaskManager;
