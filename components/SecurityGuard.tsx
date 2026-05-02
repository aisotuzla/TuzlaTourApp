import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Delete, X, ShieldCheck } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SecurityGuardProps {
    children: React.ReactNode;
    lang: Language;
    isUnlocked: boolean;
    onUnlock: () => void;
}

const PIN_LENGTH = 4;
const PIN_KEY = 'tuzla_wallet_pin';

const SecurityGuard: React.FC<SecurityGuardProps> = ({ children, lang, isUnlocked, onUnlock }) => {
    const [pin, setPin] = useState<string>('');
    const [storedPin, setStoredPin] = useState<string | null>(null);
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [confirmPin, setConfirmPin] = useState<string>('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const t = TRANSLATIONS[lang];

    useEffect(() => {
        const checkStoredPin = async () => {
            const { value } = await Preferences.get({ key: PIN_KEY });
            if (value) {
                setStoredPin(value);
                setIsSettingPin(false);
            } else {
                setIsSettingPin(true);
            }
            setLoading(false);
        };
        checkStoredPin();
    }, []);

    const handleNumberClick = (num: string) => {
        if (error) setError(false);
        
        if (isSettingPin) {
            if (pin.length < PIN_LENGTH) {
                setPin(prev => prev + num);
            } else if (confirmPin.length < PIN_LENGTH) {
                setConfirmPin(prev => prev + num);
            }
        } else {
            if (pin.length < PIN_LENGTH) {
                setPin(prev => prev + num);
            }
        }
    };

    const handleDelete = () => {
        if (isSettingPin) {
            if (confirmPin.length > 0) setConfirmPin(prev => prev.slice(0, -1));
            else setPin(prev => prev.slice(0, -1));
        } else {
            setPin(prev => prev.slice(0, -1));
        }
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const handleOK = async () => {
        if (!isSettingPin && pin.length === PIN_LENGTH) {
            if (pin === storedPin) {
                setShowSuccess(true);
                setTimeout(() => onUnlock(), 800);
            } else {
                setError(true);
                setTimeout(() => setPin(''), 500);
            }
        } else if (isSettingPin && pin.length === PIN_LENGTH && confirmPin.length === PIN_LENGTH) {
            if (pin === confirmPin) {
                await Preferences.set({ key: PIN_KEY, value: pin });
                setStoredPin(pin);
                setIsSettingPin(false);
                setShowSuccess(true);
                setTimeout(() => onUnlock(), 800);
            } else {
                setError(true);
                setTimeout(() => {
                    setPin('');
                    setConfirmPin('');
                }, 500);
            }
        }
    };

    if (loading) return null;

    if (isUnlocked) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-blue-950/90 backdrop-blur-2xl">
            {/* Background Glows & Noise */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Noise Texture */}
                <svg className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <div className="relative z-10 w-full max-w-md px-8 text-center space-y-12">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md">
                        {isSettingPin ? <ShieldCheck className="w-10 h-10 text-blue-400" /> : <Lock className="w-10 h-10 text-blue-400" />}
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                            {isSettingPin 
                                ? (pin.length < PIN_LENGTH ? t.setWalletPin : t.confirmPin)
                                : t.walletLocked}
                        </h2>
                        <p className="text-blue-300 font-medium tracking-wide">
                            {isSettingPin 
                                ? "Create a 4-digit security code"
                                : t.enterPin}
                        </p>
                    </div>
                </motion.div>

                {/* PIN Display Dots */}
                <div className="flex justify-center gap-6">
                    {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                                (isSettingPin ? (pin.length === PIN_LENGTH ? confirmPin.length > i : pin.length > i) : pin.length > i)
                                    ? 'bg-blue-400 border-blue-400 scale-125 shadow-[0_0_15px_rgba(96,165,250,0.8)]'
                                    : 'bg-transparent border-white/30'
                            }`}
                        />
                    ))}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-6">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-2xl font-black text-white transition-all backdrop-blur-md flex items-center justify-center glassy-number shadow-xl"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleOK}
                        className={`w-16 h-16 rounded-2xl border transition-all backdrop-blur-md flex items-center justify-center uppercase tracking-widest text-[10px] font-black ${
                            pin.length === PIN_LENGTH 
                                ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105 active:scale-95' 
                                : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                        OK
                    </button>
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-2xl font-black text-white transition-all backdrop-blur-md flex items-center justify-center glassy-number shadow-xl"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white transition-all backdrop-blur-md flex items-center justify-center shadow-xl"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                <div className="pt-8">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
                        Secure Encryption Layer Active
                    </p>
                </div>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-blue-600/20 backdrop-blur-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                        >
                            <Unlock className="w-16 h-16 text-blue-600" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .glassy-number {
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default SecurityGuard;
