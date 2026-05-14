import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Wallet as WalletIcon, Lock, Camera, CheckCircle2, Trophy, Home, Stethoscope, Globe, X } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load WorldCup to keep Wallet bundle small
const WorldCup2026 = lazy(() => import('./WorldCup2026'));

// TON Connect Imports
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

// Sui Connect is removed

interface WalletProps {
    lang: Language;
}

const Wallet: React.FC<WalletProps> = ({ lang }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [showWorldCup, setShowWorldCup] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [bamValue, setBamValue] = useState<string>('');
    const [isForeground, setIsForeground] = useState(true);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = "wallet-reader";

    // Network state — blockchain features require an internet connection
    const isOnline = useNetwork();

    // TON Address
    const tonAddress = useTonAddress();

    // Sui Account is removed

    const t = TRANSLATIONS[lang];
    const eurValue = bamValue ? (parseFloat(bamValue) / 1.95583).toFixed(2) : '0.00';

    useEffect(() => {
        let cancelled = false;
        if (isScanning) startScanner();
        else stopScanner();
        return () => {
            cancelled = true;
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(() => { }).then(() => html5QrCodeRef.current?.clear()).catch(() => { });
            }
        };
    }, [isScanning]);

    useEffect(() => {
        const handleVisibility = () => {
            const visible = document.visibilityState === 'visible';
            setIsForeground(visible);
            if (!visible) {
                setIsScanning(false);
                void stopScanner();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    useEffect(() => {
        if (!isForeground && isScanning) {
            setIsScanning(false);
        }
    }, [isForeground, isScanning]);

    const startScanner = async () => {
        try {
            setError(null);
            const html5QrCode = new Html5Qrcode(scannerContainerId);
            html5QrCodeRef.current = html5QrCode;
            const config = { fps: 10, qrbox: (vw: number, vh: number) => { const s = Math.min(vw, vh) * 0.7; return { width: s, height: s }; } };
            await html5QrCode.start({ facingMode: "environment" }, config, handleScanSuccess, () => { });
        } catch (err) {
            setError("Camera access denied or error starting scanner.");
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current?.isScanning) {
            try { await html5QrCodeRef.current.stop(); html5QrCodeRef.current.clear(); } catch (err) { }
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        setSuccessMessage(`Scanned: ${decodedText}. Processing payment...`);
        setTimeout(() => {
            setSuccessMessage("Payment logic placeholder - OAuth required for real transactions.");
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Subtle Background Animation */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-10 right-[-5%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px] animate-bounce" style={{ animationDuration: '8s' }}></div>
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-blue-300 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 pb-32">
                {!isScanning && !showWorldCup ? (
                    <>
                        <div className="flex flex-col items-center text-center space-y-8 mb-16">
                            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl glow-blue-strong">
                                <WalletIcon className="w-12 h-12" />
                            </div>

                            <h1 className="text-5xl font-black text-blue-950 uppercase tracking-tighter">
                                {t.wallet}
                            </h1>

                            <p className="text-blue-600 font-medium text-lg max-w-xl leading-relaxed">
                                Your digital gateway to seamless payments and rewards in Tuzla.
                                Securely manage your funds and pay via QR codes on TON.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left Side: Scan & Pay & Calculator */}
                            <div className="space-y-8">
                                <div className="w-full p-8 glassy rounded-[3rem] border border-blue-100 shadow-xl space-y-6">
                                    <div className="space-y-4">
                                        {/* Offline warning — blockchain requires internet */}
                                        {!isOnline && (
                                            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                                                <span className="text-amber-500 text-lg">📡</span>
                                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                                                    {lang === 'bs' ? 'Blockchain zahtijeva internet vezu' : 'Blockchain requires an internet connection'}
                                                </p>
                                            </div>
                                        )}

                                        {/* TON Wallet */}
                                        <div className={`bg-white/50 p-5 rounded-2xl border border-white shadow-inner flex flex-col gap-4 transition-opacity ${!isOnline ? 'opacity-40 pointer-events-none' : ''}`}>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">TON Wallet Address</p>
                                                <p className="text-sm font-mono break-all text-blue-950">
                                                    {tonAddress ? tonAddress : "Not Connected"}
                                                </p>
                                                {tonAddress && (
                                                    <p className="mt-1 text-[10px] font-black text-green-500 uppercase">Connected</p>
                                                )}
                                            </div>
                                            <div className="w-full ton-connect-custom-wrapper">
                                                <TonConnectButton className="ton-custom-button" />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsScanning(true)}
                                    className="w-full h-[72px] flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all glow-blue"
                                >
                                    <Camera className="w-5 h-5" />
                                    SCAN & PAY
                                </button>

                                {/* BAM to EURO Calculator */}
                                <div className="mt-8 pt-8 border-t border-blue-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                        <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest">{t.bamToEur}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-blue-400 uppercase mb-2 block">{t.enterBam}</label>
                                            <input
                                                type="number"
                                                value={bamValue}
                                                onChange={(e) => setBamValue(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-blue-950 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="bg-blue-900/5 p-4 rounded-xl border border-blue-100/50">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase mb-1 block">{t.calculatedEur}</label>
                                            <div className="text-2xl font-black text-blue-600 font-mono">
                                                € {eurValue}
                                            </div>
                                            <p className="text-[9px] text-blue-300 mt-2 font-medium italic">{t.conversionRate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        {/* Right Side: User Manual */}
                        <div className="w-full p-8 glassy rounded-[3rem] border border-blue-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-blue-950 uppercase tracking-tight">{t.walletManual}</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                        {t.howToConnect}
                                    </h4>
                                    <p className="text-sm text-blue-900/70 font-medium leading-relaxed whitespace-pre-line bg-blue-50/30 p-4 rounded-2xl border border-blue-50/50">
                                        {t.connectSteps}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                        {t.safeUsage}
                                    </h4>
                                    <p className="text-sm text-blue-900/70 font-medium leading-relaxed whitespace-pre-line bg-blue-50/30 p-4 rounded-2xl border border-blue-50/50">
                                        {t.safeTips}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                        {t.txHistory}
                                    </h4>
                                    <p className="text-sm text-blue-900/70 font-medium leading-relaxed bg-blue-50/30 p-4 rounded-2xl border border-blue-50/50 italic">
                                        {t.historyLocation}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3 text-green-500 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                                    Transactions are secured by The Open Network (TON)
                                </p>
                            </div>
                        </div>
                    </div>

                <div className="mt-12 grid grid-cols-1 gap-4">
                    {/* House of Salt Button (Golden-Yellow-White) */}
                    <button
                        onClick={() => window.open('https://houseofsalt.base44.app', '_blank')}
                        className="w-full h-[64px] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-900 font-black py-3 rounded-2xl shadow-lg border-[3px] border-white/50 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                        <Home className="w-5 h-5 text-amber-900" />
                        <span className="text-xs sm:text-sm tracking-widest uppercase">House of Salt</span>
                    </button>
                </div>


                <div className="mt-8 grid grid-cols-1 gap-4">
                    {/* Dental Tourism Button */}
                    <button
                        onClick={() => window.open('https://dentist-tuzla.onhercules.app/dentist-tourism/', '_blank')}
                        className="w-full h-[64px] flex items-center justify-center gap-2 bg-white text-blue-600 font-black py-3 rounded-2xl shadow-lg border-[3px] border-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-blue-50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg] opacity-30" />
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] sm:text-xs tracking-widest uppercase">{t.dentalTourism}</span>
                    </button>

                    {/* AISO Tuzla Button */}
                    <button
                        onClick={() => window.open('https://aisotuzlazip--aisotuzla.replit.app/', '_blank')}
                        className="w-full h-[64px] flex items-center justify-center gap-2 bg-blue-600 text-yellow-400 font-black py-3 rounded-2xl shadow-lg border-[3px] border-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-blue-400 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg] opacity-30" />
                        <span className="text-[10px] sm:text-xs tracking-widest uppercase">AISO Tuzla</span>
                    </button>

                    {/* Travel Agencies Button */}
                    <button
                        onClick={() => { }}
                        className="w-full h-[64px] flex items-center justify-center gap-2 bg-white text-emerald-600 font-black py-3 rounded-2xl shadow-lg border-[3px] border-emerald-50 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-emerald-50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg] opacity-30" />
                        <Globe className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10px] sm:text-xs tracking-widest uppercase">
                            {lang === 'bs' ? 'Putničke agencije' : 'Travel Agencies'}
                        </span>
                    </button>

                    {/* World Cup 2026 Button */}
                    <button
                        onClick={() => setShowWorldCup(true)}
                        className="w-full h-[64px] flex items-center justify-center gap-2 bg-blue-50 text-blue-900 font-black py-3 rounded-2xl shadow-lg border-[3px] border-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-blue-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg] opacity-30" />
                        <Trophy className="w-5 h-5 text-blue-900" />
                        <span className="text-[10px] sm:text-xs tracking-widest uppercase">
                            {lang === 'bs' ? 'Svjetsko Prvenstvo 2026' : 'World Cup 2026'}
                        </span>
                    </button>
                </div>

                <div className="mt-20 text-center text-blue-400/60 font-black text-[10px] uppercase tracking-[0.3em]">
                    SECURE BLOCKCHAIN INFRASTRUCTURE: TON
                </div>
            </>
            ) : isScanning ? (
            <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center qr-scanner-overlay animate-in fade-in duration-500">
                {/* Header */}
                <div className="absolute top-0 w-full p-8 flex items-center justify-between z-[610]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 text-left">Secure Payment</span>
                            <span className="text-xl font-black text-white uppercase tracking-tight font-quicksand text-left">SCAN & PAY</span>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsScanning(false); }}
                        className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
                    >
                        <span className="text-2xl font-light">×</span>
                    </button>
                </div>

                {/* Scanner Frame */}
                <div className="relative w-[85%] max-w-[400px] aspect-square qr-scanner-frame z-[605] transition-all">
                    <div id={scannerContainerId} className="absolute inset-0 z-0 overflow-hidden rounded-[2rem]"></div>
                    <div className="qr-laser" />
                    <div className="qr-corner qr-corner-tl" />
                    <div className="qr-corner qr-corner-tr" />
                    <div className="qr-corner qr-corner-bl" />
                    <div className="qr-corner qr-corner-br" />
                    <div className="absolute inset-0 border-[30px] border-black/30 pointer-events-none" />
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-16 w-full text-center px-10 z-[610]">
                    <div className="inline-block p-6 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <p className="text-white/80 font-black uppercase text-[10px] tracking-[0.3em] font-quicksand mb-2">Align QR Code within frame</p>
                        <div className="flex items-center justify-center gap-3 text-white/40">
                            <div className="h-px w-8 bg-white/20"></div>
                            <span className="text-[10px] uppercase font-bold italic">Tuzla Secure Pay v1.0</span>
                            <div className="h-px w-8 bg-white/20"></div>
                        </div>
                    </div>
                </div>

                {/* Background Glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
                </div>
            </div>
            ) : (
            <div className="animate-in fade-in zoom-in duration-500">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-blue-900 font-black uppercase text-xs tracking-widest">Loading World Cup...</p>
                    </div>
                }>
                    <WorldCup2026 lang={lang} onBack={() => setShowWorldCup(false)} />
                </Suspense>
            </div>
                )}
        </div>

            {/* Popups */ }
    {
        successMessage && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-[500] animate-bounce">
                {successMessage}
            </div>
        )
    }
    {
        error && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-[500]">
                {error}
            </div>
        )
    }

    <style>{`
                .ton-connect-custom-wrapper {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }
                .ton-connect-custom-wrapper button {
                    width: 100% !important;
                    height: 72px !important;
                    border-radius: 1.5rem !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3) !important;
                }
                .glassy {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                }
                .glow-blue {
                    box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
                }
                .glow-blue-strong {
                    box-shadow: 0 0 30px rgba(37, 99, 235, 0.6);
                }
            `}</style>
        </div >
    );
};

export default Wallet;
