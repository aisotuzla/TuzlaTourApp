import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Wallet as WalletIcon, Lock, Camera, CheckCircle2, Trophy, Home, Stethoscope, Globe, X } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components to keep Wallet bundle small
const WorldCup2026 = lazy(() => import('./WorldCup2026'));
const SpecialCollection = lazy(() => import('./SpecialCollection'));

// TON Connect Imports
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

interface WalletProps {
    lang: Language;
}

const Wallet: React.FC<WalletProps> = ({ lang }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState<'PAYMENT' | 'WC'>('PAYMENT');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [bamValue, setBamValue] = useState<string>('');
    const [isForeground, setIsForeground] = useState(true);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = "wallet-reader";

    const isOnline = useNetwork();
    const tonAddress = useTonAddress();
    const t = TRANSLATIONS[lang];
    const eurValue = bamValue ? (parseFloat(bamValue) / 1.95583).toFixed(2) : '0.00';

    useEffect(() => {
        if (isScanning) startScanner();
        else stopScanner();
        return () => {
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

    if (isScanning) {
        return (
            <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
                <div className="relative h-[70vh]">
                    <div id={scannerContainerId} className="w-full h-full" />
                    <button 
                        onClick={() => setIsScanning(false)}
                        className="absolute top-8 right-8 p-4 bg-white/10 rounded-full text-white backdrop-blur-md"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-white font-black uppercase tracking-widest text-xs">Align QR Code within frame</p>
                    <div className="mt-4 h-1 w-24 bg-blue-600 rounded-full animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-32">
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

                <AnimatePresence mode="wait">
                    {activeSubTab === 'PAYMENT' && (
                        <motion.div 
                            key="payment"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tight">
                                    {lang === 'bs' ? 'Digitalni' : 'Digital'} <span className="text-blue-600">{lang === 'bs' ? 'Novčanik' : 'Wallet'}</span>
                                </h1>
                                <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mt-2" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-8 glassy rounded-[3rem] border border-blue-100 shadow-xl space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                <WalletIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Secure Pay</p>
                                                <p className="text-xl font-black text-blue-950">0.00 TON</p>
                                            </div>
                                        </div>
                                        <div className="scale-90 origin-right">
                                            <TonConnectButton />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsScanning(true)}
                                        className="w-full h-20 bg-blue-600 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all"
                                    >
                                        <Camera size={24} />
                                        SCAN & PAY
                                    </button>

                                    <div className="pt-8 border-t border-blue-100">
                                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Currency Converter</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-300 uppercase block mb-1">Enter BAM</label>
                                                <input 
                                                    type="number"
                                                    value={bamValue}
                                                    onChange={(e) => setBamValue(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-blue-950 font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="bg-blue-900/5 p-6 rounded-3xl border border-blue-100/50">
                                                <p className="text-[10px] font-bold text-blue-300 uppercase mb-1">Estimated EUR</p>
                                                <p className="text-3xl font-black text-blue-600">€ {eurValue}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 glassy rounded-[3rem] border border-emerald-100 shadow-xl space-y-6">
                                    <h2 className="text-xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2">
                                        <Globe size={20} className="text-emerald-600" />
                                        Partner Agencies
                                    </h2>
                                    <div className="space-y-4">
                                        <button 
                                            onClick={() => window.open('https://travelagency-icptuzla.wasmer.app/', '_blank')}
                                            className="w-full h-16 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                        >
                                            <Globe size={18} />
                                            TRAVEL AGENCIES
                                        </button>
                                        <button 
                                            onClick={() => window.open('https://dentist-tuzla.onhercules.app/dentist-tourism/', '_blank')}
                                            className="w-full h-16 bg-white text-blue-600 border-2 border-blue-50 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                        >
                                            <Stethoscope size={18} />
                                            DENTAL TOURISM
                                        </button>
                                        <button 
                                            onClick={() => window.open('https://aisotuzlazip--aisotuzla.replit.app/', '_blank')}
                                            className="w-full h-16 bg-blue-600 text-yellow-400 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                        >
                                            AISO TUZLA
                                        </button>
                                        <button 
                                            onClick={() => setActiveSubTab('WC')}
                                            className="w-full h-16 bg-[#001489] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all border border-[#001489]/20 hover:border-yellow-400"
                                        >
                                            <Trophy size={18} className="text-yellow-400" />
                                            WORLD CUP 2026
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSubTab === 'WC' && (
                        <motion.div 
                            key="wc"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Suspense fallback={<div className="p-20 text-center font-black text-blue-900">LOADING WORLD CUP...</div>}>
                                <WorldCup2026 lang={lang} onBack={() => setActiveSubTab('PAYMENT')} />
                            </Suspense>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Popups */}
            {successMessage && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-[1000] animate-bounce">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-[1000]">
                    {error}
                </div>
            )}

            <style>{`
                .glassy {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
};

export default Wallet;
