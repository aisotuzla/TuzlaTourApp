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
} from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { useGlobalApp } from '../contexts/GlobalAppContext';
import { QUEST_TARGETS, PHASE_1_POIS, PHASE_2_POIS, PHASE_3_POIS, isPoiRewardUnlocked } from '../constants/questData';
import { findQuestTargetFromQr } from '../utils/qrMatcher';
import { Preferences } from '@capacitor/preferences';

const QUEST_TARGET_COORDS: Record<string, { lat: number; lon: number }> = {
    trg_slobode: { lat: 44.5395175, lon: 18.6749037 },
    salt_square: { lat: 44.5382182, lon: 18.6759398 },
    palancinkara: { lat: 44.5383762, lon: 18.6775339 },
    slana_banja: { lat: 44.5378167, lon: 18.6875664 },
    panonika: { lat: 44.5385, lon: 18.6767 },
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

const QRScan: React.FC<QRScanProps> = ({ lang, onNavigateToTarget }) => {
    const [bamValue, setBamValue] = useState<string>('');
    const [conversionMode, setConversionMode] = useState<'BAM_TO_EUR' | 'EUR_TO_BAM'>('BAM_TO_EUR');
    const [isScanning, setIsScanning] = useState(false);
    const [scannerFeedback, setScannerFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [playingVideoError, setPlayingVideoError] = useState<string | null>(null);
    const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

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

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const startScanner = async () => {
        setIsScanning(true);
        setScannerFeedback(null);
        setTimeout(async () => {
            const containerId = 'qrscan-reader';
            if (!document.getElementById(containerId)) return;
            try {
                const scanner = new Html5Qrcode(containerId);
                scannerRef.current = scanner;
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 12, qrbox: { width: 220, height: 220 } },
                    async (decodedText) => {
                        const trimmed = decodedText?.trim() ?? '';
                        const target = findQuestTargetFromQr(trimmed);
                        if (!target) {
                            setScannerFeedback({ text: lang === 'bs' ? 'Nepoznat QR kod lokacije.' : 'Unknown location QR code.', type: 'error' });
                            return;
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
                    },
                    () => { }
                );
            } catch (err) {
                console.error('Scanner error', err);
                setIsScanning(false);
                setScannerFeedback({ text: lang === 'bs' ? 'Nije moguće pokrenuti kameru.' : 'Could not start camera.', type: 'error' });
                setTimeout(() => setScannerFeedback(null), 3000);
            }
        }, 150);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
                scannerRef.current = null;
                setIsScanning(false);
            }).catch(() => setIsScanning(false));
        } else {
            setIsScanning(false);
        }
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
                                        <div className="relative w-full rounded-2xl overflow-hidden bg-black border-2 border-sky-400/40 shadow-[0_0_50px_rgba(56,189,248,0.25),0_0_80px_rgba(245,158,11,0.15)]">
                                            <div id="qrscan-reader" className="w-full rounded-2xl overflow-hidden" />

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
                                <button onClick={startScanner} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                    <QrCode size={16} />
                                    {t.startScanner}
                                </button>
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
                                                {(target as any).video && (
                                                    <button onClick={() => { setPlayingVideoError(null); setPlayingVideo((target as any).video); }} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all shrink-0 active:scale-90" title={t.watchCinematic}>
                                                        <Play size={14} className="fill-emerald-600" />
                                                    </button>
                                                )}
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
            </AnimatePresence>
        </div>
    );
};

export default QRScan;

