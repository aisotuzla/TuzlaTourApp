import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import {
    QrCode,
    ArrowLeftRight,
    BookOpen,
    Play,
    Trash2,
    AlertCircle,
    Car,
    Globe,
    Navigation,
    CircleCheck,
    ChevronDown,
    ChevronUp,
    X,
    Camera,
    RefreshCw,
} from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { useGlobalApp } from '../contexts/GlobalAppContext';
import { QUEST_TARGETS, PHASE_1_POIS, PHASE_2_POIS, PHASE_3_POIS, isPoiRewardUnlocked } from '../constants/questData';
import { findQuestTargetFromQr } from '../utils/qrMatcher';
import { Preferences } from '@capacitor/preferences';
import { AppFaqAndContact } from './AppFaqAndContact';

const QUEST_TARGET_COORDS: Record<string, { lat: number; lon: number }> = {
    trg_slobode: { lat: 44.5395175, lon: 18.6749037 },
    stara_cesma: { lat: 44.538982, lon: 18.675580 },
    salt_square: { lat: 44.5382182, lon: 18.6759398 },
    palancinkara: { lat: 44.5383762, lon: 18.6775339 },
    slana_banja: { lat: 44.536961, lon: 18.687983 },
    panonika: { lat: 44.539076, lon: 18.679488 },
    slapovi: { lat: 44.5404243, lon: 18.6819408 },
    kapija: { lat: 44.53863, lon: 18.676805 },
    atelje_ismet: { lat: 44.5371465, lon: 18.6810454 },
    bingo_city_centar: { lat: 44.532177, lon: 18.651743 },
    mesa_selimovic: { lat: 44.5370993, lon: 18.6781216 },
    tvrtko_park: { lat: 44.5380826, lon: 18.6783327 },
};

interface QRScanProps {
    lang: Language;
    onNavigateToTarget: (target: { name: string; lat: number; lon: number }) => void;
}

interface LedgerEntry {
    id: string;
    timestamp: string;
}

interface Todo {
    id: string | number;
    name: string;
}

const TODO_LABELS: Record<Language, { title: string; loading: string; empty: string; error: string }> = {
    en: { title: 'Todos', loading: 'Loading todos...', empty: 'No todos found.', error: 'Could not load todos.' },
    bs: { title: 'Zadaci', loading: 'Učitavanje zadataka...', empty: 'Nema zadataka.', error: 'Učitavanje zadataka nije uspjelo.' },
    de: { title: 'Aufgaben', loading: 'Aufgaben werden geladen...', empty: 'Keine Aufgaben gefunden.', error: 'Aufgaben konnten nicht geladen werden.' },
    tr: { title: 'Görevler', loading: 'Görevler yükleniyor...', empty: 'Görev bulunamadı.', error: 'Görevler yüklenemedi.' },
};

const QRScan: React.FC<QRScanProps> = ({ lang, onNavigateToTarget }) => {
    const [bamValue, setBamValue] = useState<string>('');
    const [conversionMode, setConversionMode] = useState<'BAM_TO_EUR' | 'EUR_TO_BAM'>('BAM_TO_EUR');
    const [isScanning, setIsScanning] = useState(false);
    const [scannerFeedback, setScannerFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [scannerStatus, setScannerStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [playingVideoError, setPlayingVideoError] = useState<string | null>(null);
    const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
    const [activeRewardHtml, setActiveRewardHtml] = useState<{ url: string; title: string } | null>(null);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [todosLoading, setTodosLoading] = useState(true);
    const [todosError, setTodosError] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isOnline = useNetwork();
    const t = TRANSLATIONS[lang];
    const { unlockedRewards, setUnlockedRewards } = useGlobalApp();

    const questPhases = useMemo(() => [
        { number: 1, ids: PHASE_1_POIS },
        { number: 2, ids: PHASE_2_POIS },
        { number: 3, ids: PHASE_3_POIS },
    ], []);

    const currentTarget = useMemo(() => {
        const nextId = questPhases.flatMap(p => p.ids).find(id => !isPoiRewardUnlocked(id, unlockedRewards));
        return nextId ? QUEST_TARGETS.find(t => t.id === nextId) : undefined;
    }, [questPhases, unlockedRewards]);

    const convertedValue = bamValue
        ? conversionMode === 'BAM_TO_EUR'
            ? (parseFloat(bamValue) / 1.95583).toFixed(2)
            : (parseFloat(bamValue) * 1.95583).toFixed(2)
        : '0.00';

    // Load ledger from storage
    useEffect(() => {
        const loadLedger = async () => {
            const { value } = await Preferences.get({ key: 'tuzla_scan_ledger' });
            if (value) {
                try { setLedger(JSON.parse(value)); } catch { setLedger([]); }
            }
        };
        loadLedger();
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadTodos = async () => {
            try {
                const { supabase } = await import('../lib/supabaseclient');
                const { data, error } = await supabase.from('todos').select('id, name');

                if (error) {
                    console.error('Unable to load todos from Supabase:', error);
                    if (isActive) setTodosError(error.message);
                    return;
                }

                if (isActive) setTodos(data ?? []);
            } catch (error: unknown) {
                console.error('Unable to load todos from Supabase:', error);
                if (isActive) {
                    setTodosError(error instanceof Error ? error.message : 'An unexpected error occurred.');
                }
            } finally {
                if (isActive) setTodosLoading(false);
            }
        };

        void loadTodos();
        return () => {
            isActive = false;
        };
    }, []);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const processDecodedQr = async (decodedText: string) => {
        const trimmed = decodedText?.trim() ?? '';
        const target = findQuestTargetFromQr(trimmed);
        if (!target) {
            setScannerFeedback({ text: lang === 'bs' ? 'Nepoznat QR kod lokacije.' : 'Unknown location QR code.', type: 'error' });
            return;
        }

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate([100, 50, 100]); } catch (_) {}
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString(lang === 'bs' ? 'bs-BA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString(lang === 'bs' ? 'bs-BA' : 'en-US', { month: 'short', day: 'numeric' });
        const timestamp = `${dateStr}, ${timeStr}`;

        const exists = ledger.some(item => item.id === target.id);
        if (exists) {
            setScannerFeedback({ text: lang === 'bs' ? `${target.name.bs} je već u vašoj knjizi.` : `${target.name.en} is already in your ledger.`, type: 'success' });
            setTimeout(() => setScannerFeedback(null), 3000);
            stopScanner();
            return;
        }

        const newLedger = [{ id: target.id, timestamp }, ...ledger];
        setLedger(newLedger);
        await Preferences.set({ key: 'tuzla_scan_ledger', value: JSON.stringify(newLedger) });

        if (!unlockedRewards.includes(target.id)) {
            setUnlockedRewards(prev => [...prev, target.id]);
        }

        setScannerFeedback({ text: lang === 'bs' ? `Otključana lokacija: ${target.name.bs}!` : `Unlocked location: ${target.name.en}!`, type: 'success' });
        setTimeout(() => setScannerFeedback(null), 3000);
        stopScanner();

        // Auto-open reward HTML if this target has one (e.g. StaraCesma.html or PoveljaKulinaBana.html)
        if ((target as any).rewardHtml) {
            const rewardTitle = target.name[lang as keyof typeof target.name] || target.name.en || target.name.bs;
            setTimeout(() => {
                setActiveRewardHtml({ url: (target as any).rewardHtml!, title: rewardTitle });
            }, 700);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (_) {}
            scannerRef.current = null;
        }
        setIsScanning(false);
        setScannerStatus('idle');
        setScannerError(null);
    };

    const startScanner = async (preferredCamId?: string) => {
        setIsScanning(true);
        setScannerStatus('loading');
        setScannerError(null);
        setScannerFeedback(null);

        // Allow container to mount and compute layout box
        await new Promise(r => setTimeout(r, 380));

        const containerId = 'qrscan-reader';
        const container = document.getElementById(containerId);
        if (!container) {
            setScannerStatus('error');
            setScannerError(lang === 'bs' ? 'Kamera nije spremna. Pokušajte ponovo.' : 'Scanner container not ready. Please try again.');
            return;
        }

        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (_) {}
            scannerRef.current = null;
        }

        try {
            const scanner = new Html5Qrcode(containerId, { verbose: false });
            scannerRef.current = scanner;

            const qrConfig = {
                fps: 15,
                qrbox: { width: Math.min(window.innerWidth * 0.7, 240), height: Math.min(window.innerWidth * 0.7, 240) },
                disableFlip: false
            };

            let cameras: Array<{ id: string; label: string }> = [];
            try {
                cameras = await Html5Qrcode.getCameras();
                setAvailableCameras(cameras);
            } catch (_) {}

            if (preferredCamId) {
                await scanner.start(preferredCamId, qrConfig, processDecodedQr, () => {});
                setActiveCameraId(preferredCamId);
                setScannerStatus('active');
                return;
            }

            try {
                await scanner.start({ facingMode: 'environment' }, qrConfig, processDecodedQr, () => {});
                setScannerStatus('active');
            } catch (envErr) {
                console.warn('[QRScan] Environment camera failed, trying fallback...', envErr);
                if (cameras.length > 0) {
                    const backCam = cameras.find(c => /back|rear|environment/i.test(c.label)) || cameras[cameras.length - 1];
                    await scanner.start(backCam.id, qrConfig, processDecodedQr, () => {});
                    setActiveCameraId(backCam.id);
                    setScannerStatus('active');
                } else {
                    throw envErr;
                }
            }
        } catch (err: any) {
            console.error('[QRScan] Scanner error:', err);
            setScannerStatus('error');
            setScannerError(
                lang === 'bs'
                    ? 'Kamera nije dostupna ili nema dozvole. Provjerite dozvole za kameru i pokušajte ponovo.'
                    : 'Camera unavailable or permission denied. Check camera permissions and try again.'
            );
        }
    };

    const switchCamera = async () => {
        if (availableCameras.length < 2) return;
        const currentIndex = availableCameras.findIndex(c => c.id === activeCameraId);
        const nextIndex = (currentIndex + 1) % availableCameras.length;
        const nextCam = availableCameras[nextIndex];
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (_) {}
        }
        startScanner(nextCam.id);
    };

    const handleClearLedger = async () => {
        setLedger([]);
        await Preferences.remove({ key: 'tuzla_scan_ledger' });
        setShowClearConfirm(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-32 overflow-x-hidden">
            <div className="max-w-6xl mx-auto p-4 sm:p-8">
                {/* Offline Warning */}
                {!isOnline && (
                    <div className="mb-8 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl animate-pulse">
                        <span className="text-amber-500">📡</span>
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                            {t.blockchainOffline}
                        </p>
                    </div>
                )}

                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3">
                        <img src="/assets/icons/TuzlaTourGuideIcon96x96.webp" alt="Tuzla Tour Guide" className="w-10 h-10 object-contain rounded-2xl shadow-md" />
                        <h1 className="text-3xl sm:text-4xl font-black text-blue-950 uppercase tracking-tight">
                            QR Scan
                        </h1>
                    </div>
                    <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mt-2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ── Left Column: Scanner + Converter ── */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* QR Scanner Card */}
                        <div className="p-5 sm:p-6 bg-white border border-blue-500 rounded-[2rem] shadow-[0_0_25px_rgba(59,130,246,0.35)] relative overflow-hidden flex flex-col gap-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner shrink-0">
                                    <QrCode size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t.explorationTitle}</p>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t.qrLocationScannerTitle}</h3>
                                </div>
                            </div>

                            {/* Scanner viewport */}
                            <AnimatePresence>
                                {isScanning && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="relative w-full rounded-2xl overflow-hidden bg-black border-2 border-sky-400/40 shadow-[0_0_50px_rgba(56,189,248,0.25),0_0_80px_rgba(245,158,11,0.15)] min-h-[280px] flex items-center justify-center">
                                            {/* Camera loading state */}
                                            {scannerStatus === 'loading' && (
                                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center gap-3">
                                                    <div className="relative w-12 h-12">
                                                        <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 border-t-amber-400 animate-spin" />
                                                        <Camera className="w-5 h-5 text-sky-400 absolute inset-0 m-auto" />
                                                    </div>
                                                    <p className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                                                        {lang === 'bs' ? 'Pokretanje kamere...' : lang === 'de' ? 'Kamera wird gestartet...' : 'Starting camera...'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 max-w-[220px]">
                                                        {lang === 'bs' ? 'Molimo omogućite pristup kameri ako se to zatraži.' : 'Please allow camera permission if prompted.'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Camera error state */}
                                            {scannerStatus === 'error' && (
                                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                                                        <AlertCircle size={22} />
                                                    </div>
                                                    <p className="text-xs font-black text-red-400 uppercase tracking-tight">
                                                        {lang === 'bs' ? 'Problem s kamerom' : 'Camera Issue'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed max-w-[260px]">
                                                        {scannerError || (lang === 'bs' ? 'Kamera nije dostupna. Provjerite dozvole za kameru i pokušajte ponovo.' : 'Camera unavailable. Check camera permissions and try again.')}
                                                    </p>
                                                    <button
                                                        onClick={() => startScanner()}
                                                        className="w-full mt-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                                                    >
                                                        <RefreshCw size={13} />
                                                        {lang === 'bs' ? 'Pokušaj ponovo' : 'Retry Camera'}
                                                    </button>
                                                </div>
                                            )}

                                            <div id="qrscan-reader" className="w-full min-h-[280px] rounded-2xl overflow-hidden" />

                                            {/* Top Control Bar over live camera */}
                                            {scannerStatus === 'active' && availableCameras.length > 1 && (
                                                <div className="absolute top-2.5 left-2.5 z-20 pointer-events-auto">
                                                    <button
                                                        onClick={switchCamera}
                                                        className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-sky-400/40 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-md active:scale-95 transition-all"
                                                    >
                                                        <RefreshCw size={11} />
                                                        {lang === 'bs' ? 'Okreni kameru' : 'Switch Cam'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Golden & Glowing Blue Cyber Corner Brackets */}
                                            <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl shadow-[0_0_15px_rgba(251,191,36,0.85)] pointer-events-none z-10" />
                                            <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-xl shadow-[0_0_15px_rgba(56,189,248,0.9)] pointer-events-none z-10" />
                                            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-xl shadow-[0_0_15px_rgba(56,189,248,0.9)] pointer-events-none z-10" />
                                            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl shadow-[0_0_15px_rgba(251,191,36,0.85)] pointer-events-none z-10" />

                                            {/* Center Reticle */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30">
                                                <div className="w-12 h-12 border border-sky-400/50 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" />
                                                </div>
                                            </div>

                                            {/* Modern & Powerful Laser: Golden Core with Glowing Blue Aura */}
                                            {scannerStatus === 'active' && (
                                                <motion.div
                                                    animate={{ top: ['4%', '96%', '4%'] }}
                                                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                                                    className="absolute left-0 w-full pointer-events-none z-20 flex flex-col items-center"
                                                >
                                                    {/* Top sweep trail */}
                                                    <div className="w-full h-8 bg-gradient-to-t from-amber-400/35 via-sky-400/20 to-transparent blur-xs -mb-1" />

                                                    {/* Core Laser Bar */}
                                                    <div className="relative w-full h-[3px] bg-gradient-to-r from-transparent via-sky-400 via-amber-300 via-amber-200 via-sky-400 to-transparent shadow-[0_0_16px_#fbbf24,0_0_32px_#38bdf8,0_0_50px_#0284c7]">
                                                        <div className="absolute inset-0 h-[1.5px] bg-white blur-[0.5px]" />
                                                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#38bdf8,0_0_5px_#fbbf24]" />
                                                        <div className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-sky-300 shadow-[0_0_10px_#fbbf24,0_0_5px_#38bdf8]" />
                                                    </div>

                                                    {/* Bottom sweep trail */}
                                                    <div className="w-full h-8 bg-gradient-to-b from-amber-400/35 via-sky-400/20 to-transparent blur-xs -mt-1" />
                                                </motion.div>
                                            )}
                                        </div>

                                        <button onClick={stopScanner} className="mt-3 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                                            {t.cancel}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {scannerFeedback && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold ${scannerFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    <AlertCircle size={14} className="shrink-0" />
                                    {scannerFeedback.text}
                                </motion.div>
                            )}

                            <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center">
                                <p className="text-xs text-slate-500 leading-relaxed">{t.qrScannerDesc}</p>
                            </div>

                            {!isScanning && (
                                <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                                    <button
                                        onClick={() => startScanner()}
                                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Camera size={16} />
                                        {t.startScanner}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Currency Converter */}
                        <div className="p-5 sm:p-6 bg-white border border-emerald-100 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col gap-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner shrink-0">
                                        <ArrowLeftRight size={24} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Exchange</p>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t.currencyConverterTitle}</h3>
                                    </div>
                                </div>
                                <button onClick={() => { setConversionMode(m => m === 'BAM_TO_EUR' ? 'EUR_TO_BAM' : 'BAM_TO_EUR'); setBamValue(''); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all active:scale-95 shrink-0">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{conversionMode === 'BAM_TO_EUR' ? 'BAM → EUR' : 'EUR → BAM'}</span>
                                    <ArrowLeftRight size={10} className="text-slate-400 ml-1" />
                                </button>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">
                                        {conversionMode === 'BAM_TO_EUR' ? t.enterBamLabel : t.enterEurLabel}
                                    </label>
                                    <input type="number" value={bamValue} onChange={(e) => setBamValue(e.target.value)} placeholder="0.00" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">
                                            {conversionMode === 'BAM_TO_EUR' ? t.estimatedEurLabel : t.estimatedBamLabel}
                                        </p>
                                        <p className="text-[9px] text-slate-400">{t.conversionRateText}</p>
                                    </div>
                                    <p className="text-xl font-black text-emerald-700 leading-none">
                                        {conversionMode === 'BAM_TO_EUR' ? `€ ${convertedValue}` : `KM ${convertedValue}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Quest Progress + Ledger + Partners ── */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Quest Progress Panel */}
                        <div className="p-4 sm:p-6 bg-white border border-emerald-200 text-slate-800 rounded-[2rem] shadow-xl space-y-5">
                            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight">{t.questPanelTitle}</h3>
                                    <p className="text-[11px] text-slate-500">{t.questPanelSubtitle}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {questPhases.map((phase) => {
                                    const complete = phase.ids.every(id => isPoiRewardUnlocked(id, unlockedRewards));
                                    const count = phase.ids.filter(id => isPoiRewardUnlocked(id, unlockedRewards)).length;
                                    return (
                                        <div key={phase.number} className={`rounded-2xl border p-3.5 ${complete ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-slate-50'}`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.questPhaseLabel} {phase.number}</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">{count}/{phase.ids.length} {t.questLocationsScanned}</p>
                                                </div>
                                                {complete
                                                    ? <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700"><CircleCheck className="w-4 h-4" />{t.questSuccess}</span>
                                                    : <span className="text-[10px] font-bold text-slate-400">{t.questInProgress}</span>
                                                }
                                            </div>
                                            <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(count / phase.ids.length) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {currentTarget ? (() => {
                                const coords = QUEST_TARGET_COORDS[currentTarget.id];
                                const name = currentTarget.name[lang] || currentTarget.name.en;
                                return coords ? (
                                    <button onClick={() => onNavigateToTarget({ name, ...coords })} className="w-full flex items-center justify-between gap-3 rounded-2xl bg-blue-700 hover:bg-blue-800 px-4 py-3.5 text-left text-white transition-colors active:scale-[0.98]">
                                        <span>
                                            <span className="block text-[10px] font-black uppercase tracking-widest text-blue-200">{t.questNextTarget}</span>
                                            <span className="block text-sm font-black mt-0.5">{name}</span>
                                        </span>
                                        <Navigation className="w-5 h-5 shrink-0" />
                                    </button>
                                ) : null;
                            })() : (
                                <div className="rounded-2xl bg-emerald-600 px-4 py-4 text-white">
                                    <p className="text-sm font-black">{t.questComplete}</p>
                                    <p className="text-[11px] text-emerald-100 mt-1">{t.questAllPhasesUnlocked}</p>
                                </div>
                            )}
                        </div>

                        {/* Supabase Todos */}
                        <section className="p-4 sm:p-6 bg-white border border-blue-100 rounded-[2rem] shadow-xl space-y-4" aria-labelledby="supabase-todos-title">
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    <h3 id="supabase-todos-title" className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                        {TODO_LABELS[lang].title}
                                    </h3>
                                </div>
                                {!todosLoading && !todosError && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                        {todos.length}
                                    </span>
                                )}
                            </div>
                            {todosLoading ? (
                                <p className="text-xs text-slate-500" aria-live="polite">{TODO_LABELS[lang].loading}</p>
                            ) : todosError ? (
                                <p className="text-xs text-red-700" role="alert">
                                    {TODO_LABELS[lang].error} {todosError}
                                </p>
                            ) : todos.length === 0 ? (
                                <p className="text-xs text-slate-500">{TODO_LABELS[lang].empty}</p>
                            ) : (
                                <ul className="space-y-2">
                                    {todos.map((todo) => (
                                        <li key={todo.id} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700">
                                            {todo.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {/* Scan History Ledger */}
                        <div className="p-4 sm:p-6 bg-white border border-amber-400 rounded-[2rem] shadow-[0_0_25px_rgba(251,191,36,0.35)] space-y-4 flex flex-col relative min-h-[280px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t.scanHistoryLedgerTitle}</h3>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    {ledger.length} / {QUEST_TARGETS.length}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 space-y-3">
                                {ledger.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-700 uppercase">{t.ledgerEmptyTitle}</p>
                                            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">{t.ledgerEmptyDesc}</p>
                                        </div>
                                    </div>
                                ) : (
                                    ledger.map((entry) => {
                                        const target = QUEST_TARGETS.find(q => q.id === entry.id);
                                        if (!target) return null;
                                        const targetName = target.name[lang] || target.name.en || target.name.bs;
                                        return (
                                            <div key={entry.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl flex items-center gap-3 transition-colors group">
                                                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                                    <img src={(target as any).Image} alt={targetName} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{targetName}</h4>
                                                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{entry.timestamp}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {(target as any).rewardHtml && (
                                                        <button
                                                            onClick={() => {
                                                                const rewardTitle = target.name[lang as keyof typeof target.name] || target.name.en || target.name.bs;
                                                                setActiveRewardHtml({ url: (target as any).rewardHtml!, title: rewardTitle });
                                                            }}
                                                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all active:scale-90"
                                                            title={lang === 'bs' ? 'Pogledaj nagradu' : 'View reward'}
                                                        >
                                                            <BookOpen size={14} className="text-amber-600" />
                                                        </button>
                                                    )}
                                                    {(target as any).video && (
                                                        <button onClick={() => { setPlayingVideoError(null); setPlayingVideo((target as any).video); }} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all active:scale-90" title={t.watchCinematic}>
                                                            <Play size={14} className="fill-emerald-600" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {ledger.length > 0 && (
                                <div className="pt-3 border-t border-slate-100 shrink-0">
                                    {showClearConfirm ? (
                                        <div className="flex items-center gap-2 bg-red-50 p-2 border border-red-100 rounded-2xl">
                                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                                            <span className="text-[10px] font-bold text-red-700 uppercase flex-grow">{t.clearHistoryConfirm}</span>
                                            <button onClick={handleClearLedger} className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">{t.yesDelete}</button>
                                            <button onClick={() => setShowClearConfirm(false)} className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-wider">{t.cancel}</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setShowClearConfirm(true)} className="w-full py-2.5 bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                                            <Trash2 size={12} />
                                            {t.clearScanHistory}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Partner Links */}
                        <div className="p-4 sm:p-8 bg-white border border-blue-700 rounded-[2rem] shadow-[0_0_25px_rgba(29,78,216,0.35)] space-y-6 overflow-hidden">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Globe size={20} className="text-blue-700" />
                                {t.partnerAgenciesTitle}
                            </h2>
                            <div className="space-y-4">
                                <button onClick={() => window.open('https://gradskiparkingtuzla.vercel.app', '_blank')} className="w-full h-16 bg-yellow-400 border-2 border-blue-600 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase hover:bg-yellow-300" style={{ color: '#1a3a8f', boxShadow: '0 0 18px 4px rgba(37,99,235,0.45), 0 4px 14px rgba(0,0,0,0.12)' }}>
                                    <Car size={20} />
                                    {t.gradskiParkingTuzla}
                                </button>
                                <button onClick={() => window.open('https://zmajevi.vercel.app', '_blank')} className="w-full h-16 bg-white text-purple-600 border-2 border-purple-500 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase hover:bg-purple-50">
                                    NFT Zmajevi
                                </button>
                                <button onClick={() => window.open('https://aiso-tuzla.lovable.app/', '_blank')} className="w-full h-16 bg-blue-600 text-yellow-300 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase hover:bg-blue-700">
                                    <img src="/assets/icons/aisologo.webp" alt="AISO Logo" className="w-6 h-6 object-contain" />
                                    AISO TUZLA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FAQ & Contact Us Section ── */}
                <div className="mt-12">
                    <AppFaqAndContact lang={lang} />
                </div>
            </div>

            {/* Video lightbox */}
            <AnimatePresence>
                {playingVideo && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setPlayingVideo(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl bg-black" onClick={e => e.stopPropagation()}>
                            {playingVideoError ? (
                                <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
                                    <AlertCircle size={40} className="text-red-400" />
                                    <p className="text-white text-sm">{playingVideoError}</p>
                                    <button onClick={() => setPlayingVideo(null)} className="px-6 py-2 bg-slate-700 text-white rounded-xl font-bold text-xs uppercase">{t.closeVideo}</button>
                                </div>
                            ) : (
                                <video src={playingVideo} autoPlay controls className="w-full max-h-[70vh]" onError={() => setPlayingVideoError('Video nije pronađen.')} />
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Reward HTML Showcase Modal */}
                {activeRewardHtml && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[7000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6"
                    >
                        <div className="w-full h-full max-w-3xl max-h-[90vh] bg-black border border-amber-500/30 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-950/80 to-slate-950/80 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                                            {lang === 'bs' ? '🏆 Nagrada' : '🏆 Reward'}
                                        </span>
                                        <h3 className="text-base font-black text-white uppercase tracking-tight">
                                            {activeRewardHtml.title}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveRewardHtml(null)}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Iframe Content */}
                            <div className="flex-1 relative bg-[#1b1511]">
                                <iframe
                                    src={activeRewardHtml.url}
                                    title={activeRewardHtml.title}
                                    className="w-full h-full border-0"
                                    style={{ minHeight: '400px' }}
                                    allow="accelerometer; autoplay; gyroscope"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-amber-500/20 bg-gradient-to-r from-amber-950/80 to-slate-950/80 flex items-center justify-between shrink-0">
                                <span className="text-xs font-bold text-amber-400/70">
                                    {lang === 'bs' ? 'Tuzla Quest — Interaktivna Nagrada' : 'Tuzla Quest — Interactive Reward'}
                                </span>
                                <button
                                    onClick={() => setActiveRewardHtml(null)}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                                >
                                    {lang === 'bs' ? 'Zatvori' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QRScan;

