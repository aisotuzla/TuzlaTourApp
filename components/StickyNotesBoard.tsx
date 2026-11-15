import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StickyNote,
  PenTool,
  Type,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  RotateCcw,
  Eraser,
  Pin,
  Check,
  Palette
} from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { Language } from '../types';

export type NoteColor = 'yellow' | 'cyan' | 'green' | 'pink' | 'purple' | 'amber';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface StickyNoteItem {
  id: string;
  title: string;
  content: string;
  mode: 'text' | 'draw' | 'todo';
  drawingDataUrl?: string;
  checklist: ChecklistItem[];
  color: NoteColor;
  isPinned: boolean;
  updatedAt: string;
}

interface StickyNotesBoardProps {
  lang: Language;
  compact?: boolean;
}

const STORAGE_KEY = 'tuzla_sticker_notes_v1';

const colorStyles: Record<
  NoteColor,
  {
    bg: string;
    border: string;
    accent: string;
    tape: string;
    badge: string;
    contrastText: string;
  }
> = {
  yellow: {
    bg: 'bg-amber-50/95',
    border: 'border-amber-200',
    accent: 'bg-amber-400',
    tape: 'bg-amber-200/70',
    badge: 'bg-amber-100 text-amber-900',
    contrastText: 'text-amber-950',
  },
  cyan: {
    bg: 'bg-cyan-50/95',
    border: 'border-cyan-200',
    accent: 'bg-cyan-400',
    tape: 'bg-cyan-200/70',
    badge: 'bg-cyan-100 text-cyan-900',
    contrastText: 'text-cyan-950',
  },
  green: {
    bg: 'bg-emerald-50/95',
    border: 'border-emerald-200',
    accent: 'bg-emerald-400',
    tape: 'bg-emerald-200/70',
    badge: 'bg-emerald-100 text-emerald-900',
    contrastText: 'text-emerald-950',
  },
  pink: {
    bg: 'bg-rose-50/95',
    border: 'border-rose-200',
    accent: 'bg-rose-400',
    tape: 'bg-rose-200/70',
    badge: 'bg-rose-100 text-rose-900',
    contrastText: 'text-rose-950',
  },
  purple: {
    bg: 'bg-purple-50/95',
    border: 'border-purple-200',
    accent: 'bg-purple-400',
    tape: 'bg-purple-200/70',
    badge: 'bg-purple-100 text-purple-900',
    contrastText: 'text-purple-950',
  },
  amber: {
    bg: 'bg-orange-50/95',
    border: 'border-orange-200',
    accent: 'bg-orange-400',
    tape: 'bg-orange-200/70',
    badge: 'bg-orange-100 text-orange-900',
    contrastText: 'text-orange-950',
  },
};

const labels = {
  en: {
    heading: 'Sticker Notes & Canvas',
    subheading: 'Sketch with touch/pen or type quick notes & to-do checklists.',
    newNote: 'New Sticky Note',
    textMode: 'Type Note',
    drawMode: 'Pen Canvas',
    todoMode: 'To-Do List',
    noteTitlePlaceholder: 'Note title (e.g. Souvenirs, Meeting point)...',
    noteContentPlaceholder: 'Write your thoughts, memory, taxi notes, or addresses here...',
    todoPlaceholder: 'Add a new checklist task...',
    addTodo: 'Add Task',
    clearCanvas: 'Clear Drawing',
    undo: 'Undo Stroke',
    eraser: 'Eraser',
    pin: 'Pin note',
    delete: 'Delete note',
    emptyBoard: 'No sticky notes yet. Tap "New Sticky Note" to scribble or type something!',
    penColor: 'Pen Color',
    penSize: 'Pen Size',
    penBlack: 'Black',
    penBlue: 'Navy',
    penRed: 'Red',
    penGreen: 'Green',
    penGold: 'Gold',
    saved: 'Saved locally',
  },
  bs: {
    heading: 'Sticker Bilješke & Crtež',
    subheading: 'Pišite dodirom/olovkom, kucajte brze bilješke ili vodite to-do listu.',
    newNote: 'Nova bilješka',
    textMode: 'Tekst',
    drawMode: 'Olovka / Crtež',
    todoMode: 'To-Do Lista',
    noteTitlePlaceholder: 'Naslov bilješke (npr. Suveniri, Mjesto sastanka)...',
    noteContentPlaceholder: 'Upišite svoje misli, adrese, zabilješke ili taxi brojeve...',
    todoPlaceholder: 'Dodaj novu stavku u listu...',
    addTodo: 'Dodaj',
    clearCanvas: 'Očisti crtež',
    undo: 'Poništi liniju',
    eraser: 'Gumica',
    pin: 'Zakači bilješku',
    delete: 'Obriši bilješku',
    emptyBoard: 'Još nema bilješki. Dodirnite "Nova bilješka" da nacrtate ili zapišete nešto!',
    penColor: 'Boja olovke',
    penSize: 'Debljina',
    penBlack: 'Crna',
    penBlue: 'Plava',
    penRed: 'Crvena',
    penGreen: 'Zelena',
    penGold: 'Zlatna',
    saved: 'Spremljeno na uređaju',
  },
  de: {
    heading: 'Haftnotizen & Zeichenfläche',
    subheading: 'Zeichnen mit Touch/Stift oder schnelle Notizen & Checklisten tippen.',
    newNote: 'Neue Notiz',
    textMode: 'Text',
    drawMode: 'Stift / Zeichnen',
    todoMode: 'To-Do-Liste',
    noteTitlePlaceholder: 'Titel der Notiz (z. B. Souvenirs, Treffpunkt)...',
    noteContentPlaceholder: 'Gedanken, Adressen oder Notizen hier aufschreiben...',
    todoPlaceholder: 'Neue Aufgabe hinzufügen...',
    addTodo: 'Hinzufügen',
    clearCanvas: 'Zeichnung löschen',
    undo: 'Rückgängig',
    eraser: 'Radierer',
    pin: 'Anheften',
    delete: 'Löschen',
    emptyBoard: 'Noch keine Haftnotizen. Tippe auf "Neue Notiz", um loszulegen!',
    penColor: 'Stiftfarbe',
    penSize: 'Stärke',
    penBlack: 'Schwarz',
    penBlue: 'Blau',
    penRed: 'Rot',
    penGreen: 'Grün',
    penGold: 'Gold',
    saved: 'Lokal gespeichert',
  },
  tr: {
    heading: 'Yapışkan Notlar & Çizim',
    subheading: 'Dokunmatik/kalemle çizin veya hızlı notlar & yapılacaklar listesi yazın.',
    newNote: 'Yeni Not',
    textMode: 'Metin',
    drawMode: 'Kalem / Çizim',
    todoMode: 'Yapılacaklar',
    noteTitlePlaceholder: 'Not başlığı (örn. Hediyelikler, Buluşma noktası)...',
    noteContentPlaceholder: 'Düşüncelerinizi, adresleri veya notları buraya yazın...',
    todoPlaceholder: 'Yeni görev ekle...',
    addTodo: 'Ekle',
    clearCanvas: 'Çizimi Temizle',
    undo: 'Geri Al',
    eraser: 'Silgi',
    pin: 'Sabitle',
    delete: 'Sil',
    emptyBoard: 'Henüz yapışkan not yok. Başlamak için "Yeni Not"a dokunun!',
    penColor: 'Kalem Rengi',
    penSize: 'Kalınlık',
    penBlack: 'Siyah',
    penBlue: 'Mavi',
    penRed: 'Kırmızı',
    penGreen: 'Yeşil',
    penGold: 'Altın',
    saved: 'Cihaza kaydedildi',
  },
} as const;

// Responsive HTML5 Canvas Component for drawing with finger/stylus/pen
interface NoteCanvasProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  lang: Language;
}

const NoteCanvas: React.FC<NoteCanvasProps> = ({ initialDataUrl, onSave, lang }) => {
  const t = labels[lang] ?? labels.en;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const colors = [
    { value: '#1e293b', label: t.penBlack, bg: 'bg-slate-800' },
    { value: '#2563eb', label: t.penBlue, bg: 'bg-blue-600' },
    { value: '#dc2626', label: t.penRed, bg: 'bg-red-600' },
    { value: '#16a34a', label: t.penGreen, bg: 'bg-emerald-600' },
    { value: '#d97706', label: t.penGold, bg: 'bg-amber-600' },
  ];

  const pushHistory = useCallback((canvas: HTMLCanvasElement) => {
    const data = canvas.toDataURL('image/png');
    setHistory((prev) => [...prev.slice(-15), data]);
    onSave(data);
  }, [onSave]);

  // Set up high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 360;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = initialDataUrl;
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }, [initialDataUrl]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
    pushHistory(canvas);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, 240);
    pushHistory(canvas);
  };

  const handleUndo = () => {
    if (history.length <= 1) {
      handleClear();
      setHistory([]);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop(); // Remove current
    const prevData = nextHistory[nextHistory.length - 1];
    setHistory(nextHistory);

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, 240);

    if (prevData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, 240);
        onSave(prevData);
      };
      img.src = prevData;
    } else {
      onSave('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Canvas Tool Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 p-2 border border-slate-200/60 shadow-2xs backdrop-blur-xs">
        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setColor(c.value);
                setIsEraser(false);
              }}
              title={c.label}
              className={`h-7 w-7 rounded-full border-2 transition-transform ${c.bg} ${
                !isEraser && color === c.value
                  ? 'scale-110 border-blue-600 ring-2 ring-blue-400/40'
                  : 'border-white/80 hover:scale-105'
              }`}
            />
          ))}
          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            title={t.eraser}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
              isEraser
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Line Thickness & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            {[2, 4, 7].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setLineWidth(size)}
                className={`px-2 py-0.5 text-[10px] font-black rounded-md transition-colors ${
                  lineWidth === size ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {size === 2 ? 'Fine' : size === 4 ? 'Med' : 'Bold'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUndo}
            title={t.undo}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            title={t.clearCanvas}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Drawing Canvas Board */}
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300/80 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-[240px] w-full cursor-crosshair touch-none select-none bg-white"
          style={{ touchAction: 'none' }}
        />
        <div className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Touch / Pen Ready
        </div>
      </div>
    </div>
  );
};

export const StickyNotesBoard: React.FC<StickyNotesBoardProps> = ({ lang, compact = false }) => {
  const t = labels[lang] ?? labels.en;
  const [notes, setNotes] = useState<StickyNoteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newTodoText, setNewTodoText] = useState<Record<string, string>>({});

  // Load saved notes from Capacitor Preferences
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (value) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotes(parsed);
            setIsLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Error reading sticky notes from preferences:', err);
      }

      // Default sample starter notes
      const initialNotes: StickyNoteItem[] = [
        {
          id: 'note-starter-1',
          title: lang === 'bs' ? 'Suveniri & Pokloni' : 'Souvenirs & Gifts',
          content:
            lang === 'bs'
              ? '1. Tuzlanska so sa Kapije\n2. Domaća baklava kod Sebilja\n3. Razglednica Panonskih jezera'
              : '1. Tuzla salt grinder souvenir\n2. Homemade baklava by Sebilj\n3. Pannonian Lakes postcard',
          mode: 'todo',
          checklist: [
            { id: '1', text: lang === 'bs' ? 'Kupiti so sa Kapije' : 'Buy Tuzla artisan salt', done: true },
            { id: '2', text: lang === 'bs' ? 'Slikati se kod česme' : 'Photo at historic fountain', done: false },
            { id: '3', text: lang === 'bs' ? 'Probati tuzlanske ćevape' : 'Taste authentic Tuzla ćevapi', done: false },
          ],
          color: 'yellow',
          isPinned: true,
          updatedAt: new Date().toLocaleDateString(),
        },
        {
          id: 'note-starter-2',
          title: lang === 'bs' ? 'Taxi & Brze info' : 'Taxi & Quick Notes',
          content:
            lang === 'bs'
              ? 'Tuzla Taxi centrala: 1517\nAutobuska stanica: Bosne Srebrene 60\nHotel Salis recepcija: 035 300 000'
              : 'Tuzla Taxi Dispatch: 1517\nCentral Bus Station: Bosne Srebrene 60\nHotel Salis reception: 035 300 000',
          mode: 'text',
          checklist: [],
          color: 'cyan',
          isPinned: false,
          updatedAt: new Date().toLocaleDateString(),
        },
      ];
      setNotes(initialNotes);
      setIsLoaded(true);
    };

    loadNotes();
  }, [lang]);

  // Persist notes on state change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(notes),
    }).catch((err) => console.warn('Failed to save sticky notes:', err));
  }, [notes, isLoaded]);

  const addNote = () => {
    const availableColors: NoteColor[] = ['yellow', 'cyan', 'green', 'pink', 'purple', 'amber'];
    const chosenColor = availableColors[Math.floor(Math.random() * availableColors.length)];

    const newNote: StickyNoteItem = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      mode: 'text',
      checklist: [],
      color: chosenColor,
      isPinned: false,
      updatedAt: new Date().toLocaleDateString(),
    };

    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<StickyNoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toLocaleDateString() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const changeColor = (id: string, color: NoteColor) => {
    updateNote(id, { color });
  };

  const addTodoItem = (noteId: string) => {
    const text = (newTodoText[noteId] || '').trim();
    if (!text) return;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          checklist: [...(n.checklist || []), { id: `todo-${Date.now()}`, text, done: false }],
        };
      })
    );

    setNewTodoText((prev) => ({ ...prev, [noteId]: '' }));
  };

  const toggleTodoItem = (noteId: string, todoId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          checklist: (n.checklist || []).map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)),
        };
      })
    );
  };

  const removeTodoItem = (noteId: string, todoId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          checklist: (n.checklist || []).filter((t) => t.id !== todoId),
        };
      })
    );
  };

  // Sort pinned first
  const sortedNotes = [...notes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const noteColors: NoteColor[] = ['yellow', 'cyan', 'green', 'pink', 'purple', 'amber'];

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-blue-100">
        <div>
          <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-slate-900">
            <StickyNote className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            <span>{t.heading}</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
              {notes.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{t.subheading}</p>
        </div>

        <button
          onClick={addNote}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{t.newNote}</span>
        </button>
      </div>

      {/* Sticky Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="rounded-2xl sm:rounded-[1.75rem] border-2 border-dashed border-amber-200 bg-amber-50/40 p-8 text-center">
          <StickyNote className="mx-auto h-10 w-10 text-amber-400" />
          <p className="mt-3 text-sm font-medium text-slate-600">{t.emptyBoard}</p>
          <button
            onClick={addNote}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-900 shadow-sm hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>{t.newNote}</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {sortedNotes.map((note) => {
            const style = colorStyles[note.color] ?? colorStyles.yellow;

            return (
              <div
                key={note.id}
                className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-[1.5rem] border ${style.border} ${style.bg} p-4 sm:p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5`}
              >
                {/* Visual Post-it Tape / Pin Sticker */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div
                    className={`h-4 w-16 sm:w-20 rounded-xs shadow-2xs backdrop-blur-xs ${style.tape} rotate-[-1deg] border border-black/5`}
                  />
                </div>

                {/* Card Top Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1 pb-3 border-b border-black/5">
                  {/* Mode switcher tabs (Text / Draw / To-Do) */}
                  <div className="flex items-center rounded-xl bg-white/80 p-0.5 border border-black/5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateNote(note.id, { mode: 'text' })}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black transition-all ${
                        note.mode === 'text'
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.textMode}
                    >
                      <Type className="h-3 w-3" />
                      <span className="hidden sm:inline">{t.textMode}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNote(note.id, { mode: 'draw' })}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black transition-all ${
                        note.mode === 'draw'
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.drawMode}
                    >
                      <PenTool className="h-3 w-3" />
                      <span className="hidden sm:inline">{t.drawMode}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNote(note.id, { mode: 'todo' })}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black transition-all ${
                        note.mode === 'todo'
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.todoMode}
                    >
                      <CheckSquare className="h-3 w-3" />
                      <span className="hidden sm:inline">{t.todoMode}</span>
                    </button>
                  </div>

                  {/* Actions: Pin, Color picker, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      title={t.pin}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        note.isPinned
                          ? 'bg-red-500 text-white border-red-600 shadow-2xs'
                          : 'bg-white/80 text-slate-500 border-black/5 hover:bg-white'
                      }`}
                    >
                      <Pin className={`h-3.5 w-3.5 ${note.isPinned ? 'rotate-45' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      title={t.delete}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/5 bg-white/80 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Title Input */}
                <div className="mt-3">
                  <input
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    placeholder={t.noteTitlePlaceholder}
                    className="w-full bg-transparent text-base sm:text-lg font-black tracking-tight text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Note Main Content depending on mode */}
                <div className="mt-2 flex-1">
                  {note.mode === 'draw' ? (
                    <NoteCanvas
                      initialDataUrl={note.drawingDataUrl}
                      onSave={(dataUrl) => updateNote(note.id, { drawingDataUrl: dataUrl })}
                      lang={lang}
                    />
                  ) : note.mode === 'todo' ? (
                    <div className="space-y-2.5">
                      {/* Todo input */}
                      <div className="flex gap-1.5">
                        <input
                          value={newTodoText[note.id] || ''}
                          onChange={(e) =>
                            setNewTodoText((prev) => ({ ...prev, [note.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addTodoItem(note.id);
                          }}
                          placeholder={t.todoPlaceholder}
                          className="flex-1 rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => addTodoItem(note.id)}
                          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                        >
                          {t.addTodo}
                        </button>
                      </div>

                      {/* Checklist items */}
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {(!note.checklist || note.checklist.length === 0) ? (
                          <div className="py-4 text-center text-xs text-slate-400">
                            {lang === 'bs' ? 'Nema zadataka. Unesite stavku gore!' : 'No tasks yet. Add one above!'}
                          </div>
                        ) : (
                          note.checklist.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-2.5 py-1.5 border border-black/5"
                            >
                              <button
                                type="button"
                                onClick={() => toggleTodoItem(note.id, item.id)}
                                className="flex items-center gap-2 text-left flex-1 min-w-0"
                              >
                                {item.done ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400 shrink-0" />
                                )}
                                <span
                                  className={`text-xs sm:text-sm truncate ${
                                    item.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTodoItem(note.id, item.id)}
                                className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Text Note Mode */
                    <div className="space-y-2">
                      <textarea
                        value={note.content}
                        onChange={(e) => updateNote(note.id, { content: e.target.value })}
                        placeholder={t.noteContentPlaceholder}
                        rows={compact ? 4 : 6}
                        className="w-full resize-none rounded-xl border border-black/5 bg-white/70 p-3 text-sm font-medium leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500/30"
                      />
                      {note.drawingDataUrl && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Attached sketch:
                          </span>
                          <img
                            src={note.drawingDataUrl}
                            alt="Drawing snippet"
                            className="h-8 rounded border border-black/10 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Note Footer: Color Bar & Date */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5">
                  {/* Color dots picker */}
                  <div className="flex items-center gap-1">
                    {noteColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => changeColor(note.id, c)}
                        className={`h-4 w-4 rounded-full border border-black/10 transition-transform ${
                          colorStyles[c].accent
                        } ${note.color === c ? 'scale-125 ring-2 ring-black/20' : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400">
                    {t.saved} • {note.updatedAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

