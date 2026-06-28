import React, { useState, useEffect, useRef } from 'react';

import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Wallet as WalletIcon, Lock, CheckCircle2, Home, Stethoscope, Globe, X, Copy, ExternalLink, Zap } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';



// TON Connect Removed
// Solana Imports
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface WalletProps {
    lang: Language;
}

const Wallet: React.FC<WalletProps> = ({ lang }) => {
    const [activeSubTab, setActiveSubTab] = useState<'PAYMENT'>('PAYMENT');
    const [bamValue, setBamValue] = useState<string>('');
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const isOnline = useNetwork();
    const t = TRANSLATIONS[lang];
    const eurValue = bamValue ? (parseFloat(bamValue) / 1.95583).toFixed(2) : '0.00';

    // Solana wallet state
    const { publicKey, disconnect: solDisconnect, connected: solConnected, wallet: solWallet } = useWallet();
    const { connection } = useConnection();

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
                                {/* ── Left Column: Solana + Scanner ── */}
                                <div className="space-y-6">



                                    {/* Solana Card */}
                                    <div className="p-6 glassy rounded-[2rem] border border-purple-100 shadow-xl space-y-4">
                                        <div className="flex justify-between items-center flex-wrap gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                    <Zap size={18} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Solana (Devnet)</p>
                                                    {solConnected && publicKey ? (
                                                        <p className="text-base font-black text-purple-950">{shortAddress(publicKey.toBase58())}</p>
                                                    ) : (
                                                        <p className="text-base font-black text-slate-400">{lang === 'bs' ? 'Nije spojeno' : 'Not connected'}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <WalletMultiButton
                                                style={{
                                                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                                    borderRadius: '1rem',
                                                    fontSize: '11px',
                                                    fontWeight: 900,
                                                    height: '40px',
                                                    padding: '0 16px',
                                                }}
                                            />
                                        </div>

                                        {/* SOL Balance + Address actions */}
                                        <AnimatePresence>
                                            {solConnected && publicKey && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pt-4 border-t border-purple-100 space-y-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-purple-300 uppercase">SOL Balance</p>
                                                            <p className="text-2xl font-black text-purple-700">
                                                                {solBalance !== null ? `◎ ${solBalance.toFixed(4)}` : '—'}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleCopyAddress}
                                                                className="p-2 bg-purple-100 rounded-xl hover:bg-purple-200 transition-all active:scale-90"
                                                                title="Copy address"
                                                            >
                                                                {copySuccess
                                                                    ? <CheckCircle2 size={16} className="text-green-600" />
                                                                    : <Copy size={16} className="text-purple-600" />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`, '_blank')}
                                                                className="p-2 bg-purple-100 rounded-xl hover:bg-purple-200 transition-all active:scale-90"
                                                                title="View on explorer"
                                                            >
                                                                <ExternalLink size={16} className="text-purple-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-purple-300 font-mono break-all">
                                                        {publicKey.toBase58()}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    {/* Currency Converter */}
                                    <div className="p-6 glassy rounded-[2rem] border border-blue-100 shadow-xl space-y-4">
                                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">Currency Converter</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-300 uppercase block mb-1">Enter BAM</label>
                                                <input
                                                    type="number"
                                                    value={bamValue}
                                                    onChange={(e) => setBamValue(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-blue-950 font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="bg-blue-900/5 p-5 rounded-2xl border border-blue-100/50">
                                                <p className="text-[10px] font-bold text-blue-300 uppercase mb-1">Estimated EUR</p>
                                                <p className="text-3xl font-black text-blue-600">€ {eurValue}</p>
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
                                            <li><span className="font-medium not-italic text-slate-600">User Responsibility:</span> Because we hold no data or keys, we cannot assist with account recovery. Your security rests entirely on your protection of your private keys and device credentials.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* ── Right Column: Partner Links ── */}
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
                                            onClick={() => window.open('https://aiso-tuzla-ai.lovable.app/', '_blank')}
                                            className="w-full h-16 bg-blue-600 text-yellow-400 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                        >
                                            AISO TUZLA
                                        </button>
                                        <button
                                            onClick={() => window.open('https://bosnia-collection.vercel.app/', '_blank')}
                                            className="w-full h-16 bg-gold-500 text-blue-700 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                        >
                                            BOSNIA AND HERZEGOVINA DIGITAL ALBUM
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}



                </AnimatePresence>
            </div>



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
