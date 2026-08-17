import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
    Wallet as WalletIcon, 
    Lock, 
    CheckCircle2, 
    Globe, 
    X, 
    Copy, 
    ExternalLink, 
    Zap, 
    QrCode, 
    Award, 
    ArrowLeftRight, 
    BookOpen, 
    Play, 
    Trash2,
    AlertCircle,
    Stethoscope
} from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

// Solana Imports
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useGlobalApp } from '../contexts/GlobalAppContext';
import { QUEST_TARGETS } from './MapQuestView';
import { Preferences } from '@capacitor/preferences';

import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProps {
    lang: Language;
}

interface LedgerEntry {
    id: string;
    timestamp: string;
}

// Inner Content Component to access hooks inside the Providers
const WalletContent: React.FC<{
    lang: Language;
    network: 'mainnet-beta' | 'devnet';
    setNetwork: (net: 'mainnet-beta' | 'devnet') => void;
}> = ({ lang, network, setNetwork }) => {
    const [bamValue, setBamValue] = useState<string>('');
    const [conversionMode, setConversionMode] = useState<'BAM_TO_EUR' | 'EUR_TO_BAM'>('BAM_TO_EUR');
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const [isScanning, setIsScanning] = useState(false);
    const [scannerFeedback, setScannerFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isOnline = useNetwork();
    const t = TRANSLATIONS[lang];
    
    const { unlockedRewards, setUnlockedRewards } = useGlobalApp();

    const convertedValue = bamValue
        ? conversionMode === 'BAM_TO_EUR'
            ? (parseFloat(bamValue) / 1.95583).toFixed(2)
            : (parseFloat(bamValue) * 1.95583).toFixed(2)
        : '0.00';

    // Solana hooks
    const { publicKey, connected: solConnected } = useWallet();
    const { connection } = useConnection();

    // Load Scan History Ledger on init
    useEffect(() => {
        const loadLedger = async () => {
            const { value } = await Preferences.get({ key: 'tuzla_scan_ledger' });
            if (value) {
                try {
                    setLedger(JSON.parse(value));
                } catch {
                    setLedger([]);
                }
            }
        };
        loadLedger();
    }, []);

    // Fetch SOL balance when connected
    useEffect(() => {
        if (!publicKey || !connection) { setSolBalance(null); return; }
        let cancelled = false;
        const fetchBalance = async () => {
            try {
                const lamports = await connection.getBalance(publicKey);
                if (!cancelled) setSolBalance(lamports / LAMPORTS_PER_SOL);
            } catch {
                if (!cancelled) setSolBalance(null);
            }
        };
        fetchBalance();
        const id = connection.onAccountChange(publicKey, (info) => {
            if (!cancelled) setSolBalance(info.lamports / LAMPORTS_PER_SOL);
        });
        return () => {
            cancelled = true;
            connection.removeAccountChangeListener(id);
        };
    }, [publicKey, connection]);

    const handleCopyAddress = () => {
        if (!publicKey) return;
        navigator.clipboard.writeText(publicKey.toBase58());
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const shortAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    // QR Code matching helpers
    const normalizeQrText = (value: string) => value
        .normalize('NFD')
        .replace(/[ -_]/g, '')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase();

    const findQuestTargetFromQr = (decodedText: string) => {
        if (!decodedText) return undefined;
        const raw = decodedText.trim();
        const normalized = normalizeQrText(raw);

        return QUEST_TARGETS.find(target => {
            const candidates = [
                target.id,
                target.name?.en,
                target.name?.bs,
                (target as any).Html5Qrcode,
                (target as any).Html5Qrcode ? (target as any).Html5Qrcode.split('/').pop()?.split('.')[0] : '',
            ].filter(Boolean).map(c => normalizeQrText(c as string));

            return candidates.some(candidate =>
                candidate === normalized ||
                (candidate.length >= 3 && (candidate.includes(normalized) || normalized.includes(candidate)))
            );
        });
    };

    const startScanner = async () => {
        setIsScanning(true);
        setScannerFeedback(null);
        setTimeout(async () => {
            const containerId = 'wallet-reader';
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
                            setScannerFeedback({
                                text: lang === 'bs'
                                    ? 'Nepoznat QR kod lokacije.'
                                    : 'Unknown location QR code.',
                                type: 'error'
                            });
                            return;
                        }

                        // Add to ledger
                        const now = new Date();
                        const timeStr = now.toLocaleTimeString(lang === 'bs' ? 'bs-BA' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const dateStr = now.toLocaleDateString(lang === 'bs' ? 'bs-BA' : 'en-US', {
                            month: 'short',
                            day: 'numeric'
                        });
                        const timestamp = `${dateStr}, ${timeStr}`;

                        // Check if already in ledger
                        const exists = ledger.some(item => item.id === target.id);
                        let newLedger = [...ledger];
                        
                        if (exists) {
                            setScannerFeedback({
                                text: lang === 'bs'
                                    ? `${target.name.bs} je već u vašoj knjizi skeniranja.`
                                    : `${target.name.en} is already in your ledger.`,
                                type: 'success'
                            });
                            setTimeout(() => setScannerFeedback(null), 3000);
                            stopScanner();
                            return;
                        } else {
                            newLedger = [{ id: target.id, timestamp }, ...ledger];
                            setLedger(newLedger);
                            await Preferences.set({ key: 'tuzla_scan_ledger', value: JSON.stringify(newLedger) });
                        }

                        // Unlock in global app state
                        if (!unlockedRewards.includes(target.id)) {
                            setUnlockedRewards(prev => [...prev, target.id]);
                        }

                        setScannerFeedback({
                            text: lang === 'bs'
                                ? `Otključana lokacija: ${target.name.bs}!`
                                : `Unlocked location: ${target.name.en}!`,
                            type: 'success'
                        });
                        setTimeout(() => setScannerFeedback(null), 3000);
                        stopScanner();
                    },
                    () => { }
                );
            } catch (err) {
                console.error("Scanner error", err);
                setIsScanning(false);
                setScannerFeedback({
                    text: lang === 'bs' ? "Nije moguće pokrenuti kameru." : "Could not start camera.",
                    type: 'error'
                });
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
            }).catch(e => {
                console.error(e);
                setIsScanning(false);
            });
        } else {
            setIsScanning(false);
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        }
    }, []);

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
                            {lang === 'bs' ? 'Blockchain zahtijeva internet vezu' : 'Blockchain requires internet'}
                        </p>
                    </div>
                )}

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tight flex items-center justify-center gap-3">
                        <WalletIcon className="w-10 h-10 text-blue-600" />
                        {lang === 'bs' ? 'Digitalni' : 'Digital'} <span className="text-blue-600">{lang === 'bs' ? 'Novčanik' : 'Wallet'}</span>
                    </h1>
                    <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mt-2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ── Left Column: Solana + Scanner + Converter (7 cols on lg) ── */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Solana Card (Solflare Integration Only) */}
                        <div className="p-4 sm:p-6 bg-white border border-purple-100 rounded-[2rem] shadow-xl space-y-4 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                            
                            {/* Network Switcher & Header */}
                            <div className="flex justify-between items-center flex-wrap gap-3 pb-4 border-b border-purple-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Zap size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Solflare Wallet</p>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Solana Connection</h3>
                                    </div>
                                </div>
                                
                                {/* Network Switcher */}
                                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={() => setNetwork('devnet')}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${network === 'devnet' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}
                                    >
                                        Devnet
                                    </button>
                                    <button
                                        onClick={() => setNetwork('mainnet-beta')}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${network === 'mainnet-beta' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}
                                    >
                                        Mainnet
                                    </button>
                                </div>
                            </div>

                            {/* Wallet Info & Connect Button */}
                            <div className="flex justify-between items-center flex-wrap gap-4 pt-2">
                                <div>
                                    {solConnected && publicKey ? (
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{lang === 'bs' ? 'Adresa Novčanika' : 'Wallet Address'}</p>
                                            <p className="text-base font-black text-purple-950 font-mono mt-0.5">{shortAddress(publicKey.toBase58())}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{lang === 'bs' ? 'Status' : 'Status'}</p>
                                            <p className="text-base font-black text-slate-400 mt-0.5">{lang === 'bs' ? 'Nije spojeno' : 'Not connected'}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="max-w-[170px] overflow-hidden">
                                    <WalletMultiButton
                                        style={{
                                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                            borderRadius: '1rem',
                                            fontSize: '11px',
                                            fontWeight: 900,
                                            height: '38px',
                                            padding: '0 16px',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* SOL Balance + Address actions */}
                            <AnimatePresence>
                                {solConnected && publicKey && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-4 border-t border-purple-100 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">SOL Balance</p>
                                                <p className="text-2xl font-black text-purple-700 mt-0.5">
                                                    {solBalance !== null ? `◎ ${solBalance.toFixed(4)}` : '—'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCopyAddress}
                                                    className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 transition-all active:scale-90"
                                                    title="Copy address"
                                                >
                                                    {copySuccess
                                                        ? <CheckCircle2 size={16} className="text-green-600" />
                                                        : <Copy size={16} className="text-purple-600" />
                                                    }
                                                </button>
                                            </div>
                                        </div>

                                        {/* Solana Explorer Button */}
                                        <button
                                            onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=${network === 'devnet' ? 'devnet' : ''}`, '_blank')}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow hover:shadow-lg active:scale-95 transition-all"
                                        >
                                            <ExternalLink size={14} />
                                            {lang === 'bs' ? 'Pregledaj na Solana Exploreru' : 'View on Solana Explorer'}
                                        </button>
                                        
                                        <p className="text-[9px] text-slate-400 font-mono break-all text-center">
                                            {publicKey.toBase58()}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* QR Scanner Trigger Card */}
                        <div className="p-4 sm:p-6 bg-white border border-blue-100 rounded-[2rem] shadow-xl space-y-4 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <QrCode size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{lang === 'bs' ? 'Istraživanje' : 'Exploration'}</p>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{lang === 'bs' ? 'QR Skeniranje Lokacija' : 'QR Location Scanner'}</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={startScanner}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 transition-all"
                                >
                                    <QrCode size={14} />
                                    {lang === 'bs' ? 'Pokreni' : 'Scan QR'}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {lang === 'bs'
                                    ? 'Pronađite i skenirajte QR kodove na istorijskim znamenitostima širom Tuzle kako biste otključali nagrade u svom vodiču i upisali ih u knjigu.'
                                    : 'Find and scan QR codes at historical locations around Tuzla to unlock guide rewards and record them in your scan ledger.'}
                            </p>
                        </div>

                        {/* Currency Converter */}
                        <div className="p-4 sm:p-6 bg-white border border-blue-100 rounded-[2rem] shadow-xl space-y-4 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ArrowLeftRight size={16} className="text-blue-600" />
                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">{lang === 'bs' ? 'Konvertor Valuta' : 'Currency Converter'}</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setConversionMode(m => m === 'BAM_TO_EUR' ? 'EUR_TO_BAM' : 'BAM_TO_EUR');
                                        setBamValue('');
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow"
                                >
                                    <ArrowLeftRight size={12} />
                                    {conversionMode === 'BAM_TO_EUR' ? 'BAM → EUR' : 'EUR → BAM'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-300 uppercase block mb-1">
                                        {conversionMode === 'BAM_TO_EUR' ? (lang === 'bs' ? 'Unesite Konvertibilne Marke (KM)' : 'Enter BAM (KM)') : 'Enter EUR (€)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={bamValue}
                                        onChange={(e) => setBamValue(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">
                                        {conversionMode === 'BAM_TO_EUR' ? 'Estimated EUR' : 'Estimated BAM'}
                                    </p>
                                    <p className="text-3xl font-black text-blue-600">
                                        {conversionMode === 'BAM_TO_EUR' ? `€ ${convertedValue}` : `KM ${convertedValue}`}
                                    </p>
                                    <p className="text-[10px] text-blue-300 mt-1">
                                        Rate: 1 EUR = 1.95583 BAM
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Disclaimer */}
                        <div className="px-2 text-[11px] text-slate-500 font-light italic leading-relaxed space-y-3 pb-4">
                            <p>
                                This application functions as a non-custodial, self-sovereign interface. We provide the tools for you to interact with information and blockchain services, but you maintain absolute ownership and control of your digital assets and identity.
                            </p>
                            <p className="font-medium text-slate-600 not-italic">Key Privacy &amp; Data Security Points</p>
                            <ul className="list-disc pl-4 space-y-2">
                                <li><span className="font-medium not-italic text-slate-600">Zero Custody of Assets:</span> We do not hold your private keys, seed phrases, or digital assets. You have sole, exclusive control over your wallet. We cannot access, recover, or move your funds.</li>
                                <li><span className="font-medium not-italic text-slate-600">Privacy-by-Design:</span> In compliance with the new Law on Personal Data Protection of Bosnia and Herzegovina (Official Gazette of BiH, No. 12/25, aligned with GDPR), this app is built to collect zero personal identifying information (PII).</li>
                                <li><span className="font-medium not-italic text-slate-600">No Data Storage:</span> We do not store your personal history, location logs, or behavioral data on our servers. Any interaction—including AI queries or image analysis for landmark identification—is processed anonymously.</li>
                                <li><span className="font-medium not-italic text-slate-600">On-Device Processing:</span> Wherever possible, data processing is handled locally on your own device to ensure your information never leaves your possession.</li>
                            </ul>
                        </div>
                    </div>

                    {/* ── Right Column: Scan History Ledger + Partner Links (5 cols on lg) ── */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Scan History Ledger */}
                        <div className="p-4 sm:p-6 bg-white border border-emerald-100 rounded-[2rem] shadow-xl space-y-4 flex flex-col relative min-h-[380px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                        {lang === 'bs' ? 'Knjiga Skeniranja' : 'Scan History Ledger'}
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    {ledger.length} / {QUEST_TARGETS.length}
                                </span>
                            </div>

                            {/* Ledger Entries List */}
                            <div className="flex-1 overflow-y-auto max-h-[400px] pr-1 space-y-3 custom-scrollbar">
                                {ledger.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-700 uppercase">
                                                {lang === 'bs' ? 'Knjiga je prazna' : 'Ledger is empty'}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                                                {lang === 'bs' 
                                                    ? 'Skenirajte lokacije širom grada za popunjavanje istorije.' 
                                                    : 'Scan location QR codes around the city to build your history.'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    ledger.map((entry) => {
                                        const target = QUEST_TARGETS.find(q => q.id === entry.id);
                                        if (!target) return null;
                                        return (
                                            <div 
                                                key={entry.id} 
                                                className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl flex items-center gap-3 transition-colors group relative"
                                            >
                                                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                                    <img 
                                                        src={target.Image} 
                                                        alt={target.name[lang] || target.name.en} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">
                                                        {lang === 'bs' ? target.name.bs : target.name.en}
                                                    </h4>
                                                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                                        {entry.timestamp}
                                                    </span>
                                                </div>
                                                
                                                {/* Play Reward Video Button */}
                                                {(target as any).video && (
                                                    <button
                                                        onClick={() => setPlayingVideo((target as any).video)}
                                                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all shrink-0 active:scale-90"
                                                        title={lang === 'bs' ? 'Pogledaj cinematic' : 'Watch cinematic'}
                                                    >
                                                        <Play size={14} className="fill-emerald-600" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Clear History Trigger */}
                            {ledger.length > 0 && (
                                <div className="pt-3 border-t border-slate-100 shrink-0">
                                    {showClearConfirm ? (
                                        <div className="flex items-center gap-2 bg-red-50 p-2 border border-red-100 rounded-2xl">
                                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                                            <span className="text-[10px] font-bold text-red-700 uppercase flex-grow">
                                                {lang === 'bs' ? 'Jeste li sigurni?' : 'Are you sure?'}
                                            </span>
                                            <button 
                                                onClick={handleClearLedger}
                                                className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider"
                                            >
                                                {lang === 'bs' ? 'Da, obriši' : 'Yes, delete'}
                                            </button>
                                            <button 
                                                onClick={() => setShowClearConfirm(false)}
                                                className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-wider"
                                            >
                                                {lang === 'bs' ? 'Otkaz' : 'Cancel'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowClearConfirm(true)}
                                            className="w-full py-2.5 bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            <Trash2 size={12} />
                                            {lang === 'bs' ? 'Očisti Knjigu Skeniranja' : 'Clear Scan History'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Partner Agencies */}
                        <div className="p-4 sm:p-8 bg-white border border-emerald-100 rounded-[2rem] shadow-xl space-y-6 overflow-hidden">
                            <h2 className="text-xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2">
                                <Globe size={20} className="text-emerald-600" />
                                Partner Agencies
                            </h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => window.open('https://dentist-tuzla.onhercules.app/dentist-tourism/', '_blank')}
                                    className="w-full h-16 bg-white text-blue-600 border-2 border-blue-500 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase hover:bg-slate-50"
                                >
                                    <Stethoscope size={18} />
                                    DENTAL TOURISM
                                </button>
                                <button
                                    onClick={() => window.open('https://aiso-tuzla-ai.lovable.app/', '_blank')}
                                    className="w-full h-16 bg-blue-600 text-yellow-300 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase hover:bg-blue-700"
                                >
                                    AISO TUZLA
                                </button>
                                <button
                                    onClick={() => window.open('https://bosnia-collection.vercel.app/', '_blank')}
                                    className="w-full h-16 bg-amber-500 text-blue-900 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase hover:bg-amber-600"
                                >
                                    BOSNIA AND HERZEGOVINA DIGITAL ALBUM
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VIDEO PLAYER */}
            <AnimatePresence>
                {playingVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[7000] bg-black flex flex-col p-6"
                    >
                        <div className="flex-grow flex items-center justify-center bg-black">
                            <video
                                src={playingVideo}
                                autoPlay
                                controls
                                playsInline
                                className="w-full max-h-[70vh] rounded-[2.5rem] bg-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10"
                            />
                        </div>

                        <div className="h-48 flex flex-col items-center justify-center gap-6">
                            <h2 className="text-white font-black text-2xl uppercase tracking-tighter text-center">Cinematic Playback</h2>
                            <button
                                onClick={() => setPlayingVideo(null)}
                                className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                                Close Video
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* QR SCANNER CONTAINER MODAL OVERLAY */}
            <AnimatePresence>
                {isScanning && (
                    <div className="fixed inset-0 z-[6000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden p-6 flex flex-col items-center">
                            {/* Header */}
                            <div className="w-full flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">
                                        {lang === 'bs' ? 'Skeniraj QR Kod' : 'Scan QR Code'}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        {lang === 'bs' ? 'Skenirajte kod lokacije za otključavanje' : 'Scan location QR code to unlock'}
                                    </p>
                                </div>
                                <button
                                    onClick={stopScanner}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all active:scale-95"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Camera Viewport */}
                            <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden border-2 border-purple-500/30">
                                <div id="wallet-reader" className="w-full h-full"></div>
                                
                                {/* Overlay Scanning Guide */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-dashed border-purple-500/40 rounded-2xl relative">
                                        {/* Corners */}
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-purple-400 -translate-x-1 -translate-y-1 rounded-tl-md"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-purple-400 translate-x-1 -translate-y-1 rounded-tr-md"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-purple-400 -translate-x-1 translate-y-1 rounded-bl-md"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-purple-400 translate-x-1 translate-y-1 rounded-br-md"></div>
                                        
                                        {/* Laser line animation */}
                                        <div className="absolute left-0 right-0 h-1 bg-purple-400/80 animate-scanner-laser top-[10%]"></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hint */}
                            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-6 animate-pulse">
                                {lang === 'bs' ? 'Pozicionirajte kod unutar okvira' : 'Position code within the frame'}
                            </p>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* SCANNER FEEDBACK TOAST */}
            <AnimatePresence>
                {scannerFeedback && (
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 370, damping: 24 }}
                        className={`fixed bottom-24 left-6 right-6 z-[6500] p-5 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.35)] flex items-center gap-4 ${scannerFeedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/20">
                            {scannerFeedback.type === 'success' ? <Award className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                                {scannerFeedback.type === 'success'
                                    ? (lang === 'bs' ? 'Uspješno' : 'Success')
                                    : (lang === 'bs' ? 'Greška' : 'Error')}
                            </span>
                            <span className="text-sm font-black uppercase leading-none tracking-tight">{scannerFeedback.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes laser-move {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                .animate-scanner-laser {
                    animation: laser-move 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

// Main Export Component wrapping contents in Solana Providers
const Wallet: React.FC<WalletProps> = ({ lang }) => {
    const [network, setNetwork] = useState<'mainnet-beta' | 'devnet'>('devnet');
    
    const endpoint = useMemo(() => {
        if (network === 'mainnet-beta') {
            return 'https://api.mainnet-beta.solana.com';
        }
        return clusterApiUrl('devnet');
    }, [network]);

    const wallets = useMemo(() => [
        new SolflareWalletAdapter()
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletContent lang={lang} network={network} setNetwork={setNetwork} />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default Wallet;
