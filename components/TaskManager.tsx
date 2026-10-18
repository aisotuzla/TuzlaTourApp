import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  CheckSquare,
  Circle,
  Compass,
  CreditCard,
  Headphones,
  MapPin,
  Plus,
  Receipt,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Language } from '../types';
import { Preferences } from '@capacitor/preferences';
import { EventCalendarView } from './EventCalendarView';
import { MediaAudioGuideTab } from './MediaAudioGuideTab';
import { ThreeDayPlanView } from './ThreeDayPlanView';
import { PracticalTravelInfo } from './PracticalTravelInfo';

type Mode = 'notebook' | 'calendar' | 'threeDayPlan' | 'practicalInfo' | 'media';
type NotebookSubTab = 'all' | 'itinerary' | 'tasks' | 'expenses';

type ExpenseItem = {
  id: number;
  name: string;
  amount: number;
  date: string;
};

type TaskItem = {
  id: number;
  text: string;
  completed: boolean;
  type: 'Shop' | 'To-Do';
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
    notebook: 'Notebook',
    all: 'All',
    expenses: 'Ledger',
    tasks: 'Tasks',
    expensePlaceholder: 'Item, e.g. Lunch at Restaurant Kapija',
    amountPlaceholder: 'KM',
    expenseTotal: 'Total',
    addExpense: 'Add',
    taskPlaceholder: 'New task...',
    shopping: 'Shop list',
    addTask: 'Add',
    emptyLedger: 'No expenses yet.',
    emptyTasks: 'No tasks yet.',
    addHint: 'Tap the plus button to add an entry.',
    itinerary: 'Itinerary',
    emptyItinerary: 'No itinerary items yet. Add hotels or restaurants from Tourist Info!',
    quickOverview: 'Quick Overview',
  },
  bs: {
    title: 'Lični planer',
    notebook: 'Notebook',
    all: 'Sve',
    expenses: 'Evidencija',
    tasks: 'Zadaci',
    expensePlaceholder: 'Stavka, npr. Čevapi u "Limenci"',
    amountPlaceholder: 'KM',
    expenseTotal: 'Ukupno',
    addExpense: 'Dodaj',
    taskPlaceholder: 'Novi zadatak...',
    shopping: 'Lista kupovine',
    addTask: 'Dodaj',
    emptyLedger: 'Nema troškova još uvijek.',
    emptyTasks: 'Nema zadataka još uvijek.',
    addHint: 'Dodirni plus za novu stavku.',
    itinerary: 'Plan puta',
    emptyItinerary: 'Još nema stavki u planu. Dodaj hotele ili restorane iz Turističkih info!',
    quickOverview: 'Brzi pregled',
  },
  de: {
    title: 'Persönliches Notizbuch',
    notebook: 'Notebook',
    all: 'Alle',
    expenses: 'Ledger',
    tasks: 'Aufgaben',
    expensePlaceholder: 'Eintrag, z. B. Kaffee in Sloboda',
    amountPlaceholder: 'KM',
    expenseTotal: 'Summe',
    addExpense: 'Hinzufügen',
    taskPlaceholder: 'Neue Aufgabe...',
    shopping: 'Einkaufsliste',
    addTask: 'Hinzufügen',
    emptyLedger: 'Noch keine Ausgaben.',
    emptyTasks: 'Noch keine Aufgaben.',
    addHint: 'Tippe auf das Plus, um einen Eintrag hinzuzufügen.',
    itinerary: 'Reiseplan',
    emptyItinerary: 'Noch keine Reiseplan-Einträge. Füge Hotels oder Restaurants aus Tourist Info hinzu!',
    quickOverview: 'Schnellübersicht',
  },
  tr: {
    title: 'Kişisel Not Defteri',
    notebook: 'Notebook',
    all: 'Tümü',
    expenses: 'Muhasebe',
    tasks: 'Görevler',
    expensePlaceholder: 'Kalem, örn. Sloboda\'da kahve',
    amountPlaceholder: 'KM',
    expenseTotal: 'Toplam',
    addExpense: 'Ekle',
    taskPlaceholder: 'Yeni görev...',
    shopping: 'Alışveriş listesi',
    addTask: 'Ekle',
    emptyLedger: 'Henüz masraf yok.',
    emptyTasks: 'Henüz görev yok.',
    addHint: 'Yeni giriş eklemek için artı düğmesine dokunun.',
    itinerary: 'Güzergah',
    emptyItinerary: 'Henüz güzergah öğesi yok. Otellerden veya restoranlardan ekleyin!',
    quickOverview: 'Hızlı Bakış',
  },
} as const;

const readState = async (): Promise<{ expenses: ExpenseItem[]; tasks: TaskItem[]; itinerary: ItineraryItem[] }> => {
  if (typeof window === 'undefined') {
    return { expenses: [], tasks: [], itinerary: [] };
  }

  try {
    const { value: raw } = await Preferences.get({ key: storageKey });
    if (!raw) return { expenses: [], tasks: [], itinerary: [] };
    const parsed = JSON.parse(raw) as { expenses?: ExpenseItem[]; tasks?: TaskItem[]; itinerary?: ItineraryItem[] };
    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
    };
  } catch {
    return { expenses: [], tasks: [], itinerary: [] };
  }
};

const TaskManager: React.FC<TaskManagerProps> = ({ lang }) => {
  const t = copy[lang] ?? copy.en;
  const [view, setView] = useState<Mode>('notebook');
  const [notebookSubTab, setNotebookSubTab] = useState<NotebookSubTab>('all');

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [taskText, setTaskText] = useState('');
  const [isShopping, setIsShopping] = useState(false);

  useEffect(() => {
    const loadInitialState = async () => {
      const state = await readState();
      setExpenses(state.expenses);
      setTasks(state.tasks);
      setItinerary(state.itinerary);
      setIsLoaded(true);
    };
    loadInitialState();
  }, []);

  // Sync with Preferences when state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    const data = JSON.stringify({ expenses, tasks, itinerary });

    // Fire and forget
    Preferences.set({ key: storageKey, value: data });
  }, [expenses, tasks, itinerary, isLoaded]);

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

  const addExpense = () => {
    const amount = Number.parseFloat(expAmount);
    if (!expName.trim() || Number.isNaN(amount)) return;

    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: expName.trim(),
        amount,
        date: new Date().toLocaleDateString(),
      },
    ]);
    setExpName('');
    setExpAmount('');
  };

  const addTask = () => {
    if (!taskText.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: taskText.trim(),
        completed: false,
        type: isShopping ? 'Shop' : 'To-Do',
      },
    ]);
    setTaskText('');
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItinerary = (id: number) => {
    setItinerary((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const deleteItinerary = (id: number) => {
    setItinerary((prev) => prev.filter((item) => item.id !== id));
  };

  // Render components for sections
  const renderItineraryContent = () => (
    <div className="space-y-3">
      {itinerary.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500 text-center">
          {t.emptyItinerary}
        </div>
      ) : (
        itinerary.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200">
            <button
              onClick={() => toggleItinerary(item.id)}
              className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2"
            >
              {item.checked ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-blue-300 shrink-0" />
              )}
              <div className="min-w-0">
                <div className={`text-base font-black truncate ${item.checked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {item.name}
                </div>
                <div className="text-xs text-slate-500 truncate">{item.address}</div>
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                item.type === 'Hotel' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                item.type === 'Restaurant' ? 'bg-green-50 text-green-700 border border-green-100' :
                'bg-yellow-50 text-yellow-700 border border-yellow-100'
              }`}>
                {item.type}
              </span>
              <button
                onClick={() => deleteItinerary(item.id)}
                className="rounded-full border border-red-100 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
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

  const renderTasksContent = () => (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
            placeholder={t.taskPlaceholder}
            className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-base font-medium text-slate-900 outline-none focus:border-blue-400"
          />
          <button
            onClick={() => setIsShopping((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all ${
              isShopping ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-700 border border-blue-100'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {t.shopping}
          </button>
          <button
            onClick={addTask}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            {t.addTask}
          </button>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">{t.addHint}</p>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500 text-center">
            {t.emptyTasks}
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200">
              <button
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-blue-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className={`text-base font-black truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.text}
                  </div>
                  <div className="text-xs text-slate-500">{task.type}</div>
                </div>
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="rounded-full border border-red-100 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 shrink-0"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderExpensesContent = () => (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
          <input
            value={expName}
            onChange={(e) => setExpName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addExpense(); }}
            placeholder={t.expensePlaceholder}
            className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-base font-medium text-slate-900 outline-none focus:border-blue-400"
          />
          <input
            value={expAmount}
            onChange={(e) => setExpAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addExpense(); }}
            placeholder={t.amountPlaceholder}
            type="number"
            inputMode="decimal"
            className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-base font-medium text-slate-900 outline-none focus:border-blue-400"
          />
          <button
            onClick={addExpense}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            {t.addExpense}
          </button>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">{t.addHint}</p>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500 text-center">
            {t.emptyLedger}
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200">
              <div className="min-w-0 flex-1 pr-2">
                <div className="text-base font-black text-slate-900 truncate">{expense.name}</div>
                <div className="text-xs text-slate-500">{expense.date}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-full bg-blue-50 px-3.5 py-1 text-sm font-black text-blue-700">
                  {expense.amount.toFixed(2)} KM
                </div>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="rounded-full border border-red-100 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-[1.5rem] border border-blue-100 bg-[linear-gradient(135deg,_rgba(59,130,246,0.1),_rgba(255,255,255,0.95))] p-5">
        <div className="text-xs font-black uppercase tracking-[0.28em] text-blue-500">{t.expenseTotal}</div>
        <div className="mt-1 text-3xl font-black text-blue-900">{total} KM</div>
      </div>
    </div>
  );

  const renderQuickOverviewAside = () => (
    <aside className="rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#eff6ff_100%)] p-5 shadow-sm h-fit">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-blue-500">
        <CreditCard className="h-4 w-4" />
        {t.quickOverview}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-2xl bg-white p-4 border border-blue-50 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'bs' ? 'Plan puta' : lang === 'tr' ? 'Güzergah' : lang === 'de' ? 'Reiseplan' : 'Itinerary'}
          </div>
          <div className="mt-1 text-2xl font-black text-blue-900">{itinerary.length}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-blue-50 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'bs' ? 'Zadaci' : lang === 'tr' ? 'Görevler' : lang === 'de' ? 'Aufgaben' : 'Tasks'}
          </div>
          <div className="mt-1 text-2xl font-black text-blue-900">{tasks.length}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-blue-50 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'bs' ? 'Shop stavke' : lang === 'tr' ? 'Alışveriş' : lang === 'de' ? 'Einkaufsliste' : 'Shop items'}
          </div>
          <div className="mt-1 text-2xl font-black text-blue-900">
            {tasks.filter((task) => task.type === 'Shop').length}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-blue-50 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'bs' ? 'Troškovi' : lang === 'tr' ? 'Masraflar' : lang === 'de' ? 'Ausgaben' : 'Expenses'}
          </div>
          <div className="mt-1 text-2xl font-black text-blue-900">{expenses.length} <span className="text-sm font-semibold text-slate-500">({total} KM)</span></div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32">
      <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
        <div className="bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_55%,_#38bdf8_100%)] px-6 py-8 text-white sm:px-8">
          <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.28em] text-cyan-100">
            <BookOpen className="h-5 w-5" />
            {lang === 'bs' ? 'Lični organizer' : lang === 'tr' ? 'Kişisel Organizatör' : lang === 'de' ? 'Persönlicher Organizer' : 'Personal Organizer'}
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
            {lang === 'en'
              ? 'Your unified notebook for itinerary, tasks, shopping, and travel ledger.'
              : lang === 'de'
                ? 'Dein einheitliches Notizbuch für Reiseplan, Aufgaben, Einkäufe und Reisekosten.'
                : lang === 'tr'
                  ? 'Güzergah, görevler, alışveriş ve seyahat harcamalarınız için tek not defteri.'
                  : 'Tvoja jedinstvena bilježnica za plan puta, zadatke, kupovinu i evidenciju troškova.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setView('notebook')}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-black transition-all ${
                view === 'notebook' ? 'bg-white text-blue-900 shadow-lg' : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              {t.notebook}
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-black transition-all ${
                view === 'calendar' ? 'bg-white text-blue-900 shadow-lg' : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
              {lang === 'bs' ? 'Kalendar događaja' : lang === 'de' ? 'Veranstaltungskalender' : lang === 'tr' ? 'Etkinlik Takvimi' : 'Calendar of Events'}
            </button>
            <button
              onClick={() => setView('threeDayPlan')}
              className={`rounded-2xl px-6 py-4 text-base font-black transition-all ${
                view === 'threeDayPlan' ? 'bg-white text-blue-900 shadow-lg' : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              {lang === 'bs' ? '3 Dnevni plan' : lang === 'de' ? '3-Tage-Plan' : lang === 'tr' ? '3 Günlük Plan' : '3 Day Plan'}
            </button>
            <button
              onClick={() => setView('practicalInfo')}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-black transition-all ${
                view === 'practicalInfo' ? 'bg-white text-blue-900 shadow-lg' : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <Compass className="h-5 w-5" />
              {lang === 'bs' ? 'Praktične info' : lang === 'de' ? 'Praktische Infos' : lang === 'tr' ? 'Pratik Bilgiler' : 'Practical Info'}
            </button>
            <button
              onClick={() => setView('media')}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-black transition-all ${
                view === 'media' ? 'bg-white text-blue-900 shadow-lg' : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/20'
              }`}
            >
              <Headphones className="h-5 w-5" />
              {lang === 'bs' ? 'Media' : 'Media'}
            </button>
          </div>
        </div>

        {!isLoaded ? (
          <div className="flex justify-center items-center py-20 min-h-[300px]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'calendar' ? (
          <div className="p-6 sm:p-8">
            <EventCalendarView lang={lang} />
          </div>
        ) : view === 'threeDayPlan' ? (
          <div className="p-6 sm:p-8 w-full">
            <ThreeDayPlanView
              lang={lang}
              onSwitchToPracticalInfo={() => setView('practicalInfo')}
            />
          </div>
        ) : view === 'practicalInfo' ? (
          <div className="p-6 sm:p-8 w-full">
            <PracticalTravelInfo
              lang={lang}
              onSwitchToItinerary={() => setView('threeDayPlan')}
            />
          </div>
        ) : view === 'media' ? (
          <div className="p-6 sm:p-8 w-full">
            <MediaAudioGuideTab lang={lang} />
          </div>
        ) : view === 'notebook' ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Notebook Sub-tabs navigation */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100/80 p-1.5 w-fit border border-slate-200/60">
              <button
                onClick={() => setNotebookSubTab('all')}
                className={`rounded-xl px-4 py-2 text-sm font-black transition-all ${
                  notebookSubTab === 'all'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setNotebookSubTab('itinerary')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-black transition-all ${
                  notebookSubTab === 'itinerary'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="h-4 w-4 text-blue-600" />
                {t.itinerary} ({itinerary.length})
              </button>
              <button
                onClick={() => setNotebookSubTab('tasks')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-black transition-all ${
                  notebookSubTab === 'tasks'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                {t.tasks} ({tasks.length})
              </button>
              <button
                onClick={() => setNotebookSubTab('expenses')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-black transition-all ${
                  notebookSubTab === 'expenses'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="h-4 w-4 text-amber-600" />
                {t.expenses} ({total} KM)
              </button>
            </div>

            {/* Display content based on active subtab */}
            {notebookSubTab === 'all' ? (
              <div className="space-y-6">
                {/* Quick stats counter */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600/70">{t.itinerary}</div>
                    <div className="mt-1 text-2xl font-black text-blue-900">{itinerary.length}</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-600/70">{t.tasks}</div>
                    <div className="mt-1 text-2xl font-black text-emerald-900">{tasks.length}</div>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-amber-600/70">{t.shopping}</div>
                    <div className="mt-1 text-2xl font-black text-amber-900">{tasks.filter((item) => item.type === 'Shop').length}</div>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-600/70">{t.expenseTotal}</div>
                    <div className="mt-1 text-2xl font-black text-indigo-900">{total} KM</div>
                  </div>
                </div>

                {/* 3 Unified Sections */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Itinerary Column */}
                  <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-50">
                      <div className="flex items-center gap-2 font-black text-blue-900 text-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {t.itinerary}
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-700">
                        {itinerary.length}
                      </span>
                    </div>
                    {renderItineraryContent()}
                  </div>

                  {/* Tasks Column */}
                  <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-50">
                      <div className="flex items-center gap-2 font-black text-blue-900 text-lg">
                        <CheckSquare className="h-5 w-5 text-emerald-600" />
                        {t.tasks}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700">
                        {tasks.length}
                      </span>
                    </div>
                    {renderTasksContent()}
                  </div>

                  {/* Expenses Column */}
                  <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-50">
                      <div className="flex items-center gap-2 font-black text-blue-900 text-lg">
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
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  {notebookSubTab === 'itinerary' && renderItineraryContent()}
                  {notebookSubTab === 'tasks' && renderTasksContent()}
                  {notebookSubTab === 'expenses' && renderExpensesContent()}
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
        className="block mt-6 overflow-hidden rounded-[1.5rem] border border-blue-100 shadow-sm transition-transform hover:scale-[1.02]"
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
