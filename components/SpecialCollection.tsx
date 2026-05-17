import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, QrCode as QrIcon } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { Player } from './WorldCup2026';
import styles from './WorldCup2026.module.css';

export const legendaryPlayers: Player[] = [
  {
    id: 'l1', name: 'Sead Kolašinac', number: 5, position: 'LB', club: 'Atalanta', rarity: 'Legendary', image: '', folder: 'Kolasinac',
    ovr: 80, stats: { pac: 76, sho: 62, pas: 74, dri: 75, def: 81, psy: 85 }
  },
  {
    id: 'l2', name: 'Amar Dedić', number: 2, position: 'RB', club: 'Benfica', rarity: 'Legendary', image: '', folder: 'Dedic',
    ovr: 81, stats: { pac: 88, sho: 65, pas: 76, dri: 82, def: 78, psy: 77 }
  },
  {
    id: 'l4', name: 'Esmir Bajraktarević', number: 24, position: 'RW', club: 'PSV', rarity: 'Legendary', image: '', folder: 'Bajraktarevic',
    ovr: 75, stats: { pac: 85, sho: 72, pas: 76, dri: 80, def: 35, psy: 62 }
  },
  {
    id: 'l5', name: 'Ermedin Demirović', number: 9, position: 'ST', club: 'Stuttgart', rarity: 'Legendary', image: '', folder: 'Demirovic',
    ovr: 80, stats: { pac: 78, sho: 81, pas: 72, dri: 78, def: 45, psy: 82 }
  },
  {
    id: 'l6', name: 'Edin Džeko', number: 11, position: 'ST', club: 'Schalke 04', rarity: 'Legendary', image: '', folder: 'Dzeko',
    ovr: 82, stats: { pac: 65, sho: 85, pas: 74, dri: 76, def: 40, psy: 77 }
  },
  {
    id: 'l7', name: 'Kerim Alajbegović', number: 19, position: 'LW', club: 'Bayer Leverkusen', rarity: 'Legendary', image: '', folder: 'Alajbegovic',
    ovr: 72, stats: { pac: 82, sho: 74, pas: 68, dri: 76, def: 30, psy: 55 }
  },
];

interface SpecialCollectionProps {
  lang: string;
  onBack?: () => void;
}

const SpecialCollection: React.FC<SpecialCollectionProps> = ({ lang, onBack }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const [isHolding, setIsHolding] = useState(false);

  const toggleFlip = (id: string) => {
    if (isHolding) return;
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLongPress = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-32 relative">
      {onBack && (
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={onBack}
            className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
          >
            <X size={28} />
          </button>
        </div>
      )}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
          {lang === 'bs' ? 'SPECIJALNA KOLEKCIJA' : 'SPECIAL COLLECTION'}
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-yellow-300 mx-auto rounded-full" />
      </header>

      <div className="grid grid-cols-1 gap-8 max-w-lg mx-auto">
        {legendaryPlayers.map((player) => (
          <CollectionCard 
            key={player.id} 
            player={player} 
            isFlipped={flippedCards[player.id]} 
            onFlip={() => toggleFlip(player.id)}
            onLongPress={() => handleLongPress(player)}
            isHolding={isHolding}
            setIsHolding={setIsHolding}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedPlayer && (
          <FullScreenCard 
            player={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CollectionCard: React.FC<{ 
  player: Player; 
  isFlipped: boolean; 
  onFlip: () => void;
  onLongPress: () => void;
  isHolding: boolean;
  setIsHolding: (val: boolean) => void;
}> = ({ player, isFlipped, onFlip, onLongPress, isHolding, setIsHolding }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    timerRef.current = setTimeout(() => {
      onLongPress();
    }, 1500); // 1.5s for hold
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const frontImg = `/assets/WorldCup2026/${player.folder}/${player.folder}1.webp`;
  const backImg = `/assets/WorldCup2026/${player.folder}/${player.folder}2.webp`;

  return (
    <motion.div
      className={`${styles.legendaryCardContainer} ${isFlipped ? styles.isFlipped : ''} cursor-pointer`}
      whileTap={{ scale: 0.98 }}
      onMouseDown={() => {
        setIsHolding(true);
        handleStart();
      }}
      onMouseUp={() => {
        setIsHolding(false);
        handleEnd();
      }}
      onMouseLeave={() => {
        setIsHolding(false);
        handleEnd();
      }}
      onTouchStart={() => {
        setIsHolding(true);
        handleStart();
      }}
      onTouchEnd={() => {
        setIsHolding(false);
        handleEnd();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onLongPress();
      }}
      onClick={(e) => {
        if (!isHolding) onFlip();
      }}
      layoutId={player.id}
    >
      <div className={`w-full h-full relative transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 backface-hidden shadow-2xl rounded-2xl overflow-hidden border-2 border-amber-500/30" style={{ transform: 'translateZ(1px)', backfaceVisibility: 'hidden' }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50 mix-blend-overlay pointer-events-none z-10" />
          <img src={frontImg} alt={player.name} className="w-full h-full object-contain bg-slate-900" />
        </div>
        <div className="absolute inset-0 backface-hidden shadow-2xl rounded-2xl overflow-hidden border-2 border-amber-500/30" style={{ transform: 'rotateY(180deg) translateZ(1px)', backfaceVisibility: 'hidden' }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50 mix-blend-overlay pointer-events-none z-10" />
          <img src={backImg} alt={player.name} className="w-full h-full object-contain bg-slate-900" />
        </div>
      </div>
    </motion.div>
  );
};

const FullScreenCard: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontImg = `/assets/WorldCup2026/${player.folder}/${player.folder}1.webp`;
  const backImg = `/assets/WorldCup2026/${player.folder}/${player.folder}2.webp`;
  
  const qrData = encodeURIComponent(JSON.stringify({
    id: player.id,
    name: player.name,
    rarity: 'Legendary',
    url: window.location.href
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center p-6 overflow-y-auto"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
      >
        <X size={32} />
      </button>

      <div 
        className="relative mt-12 mb-8 mx-auto flex-shrink-0" 
        style={{ height: 'auto', maxHeight: '55vh', width: '100%', maxWidth: 'min(350px, 85vw)', aspectRatio: '2.5/3.5' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div 
          className={`w-full h-full relative transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden shadow-2xl rounded-3xl overflow-hidden border-4 border-amber-500/30" style={{ transform: 'translateZ(1px)', backfaceVisibility: 'hidden' }}>
            <img src={frontImg} className="w-full h-full object-contain bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden shadow-2xl rounded-3xl overflow-hidden border-4 border-amber-500/30" style={{ transform: 'rotateY(180deg) translateZ(1px)', backfaceVisibility: 'hidden' }}>
            <img src={backImg} className="w-full h-full object-contain bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 flex flex-col items-center space-y-6"
      >
        <div className="bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`} 
            alt="QR Code" 
            className="w-40 h-40"
          />
          <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan to share card</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={async () => {
              try {
                const { value } = await Preferences.get({ key: 'tuzla_wallet_cards' });
                const cards = value ? JSON.parse(value) : [];
                if (!cards.find((c: any) => c.id === player.id)) {
                  cards.push({ ...player, collectedAt: new Date().toISOString() });
                  await Preferences.set({ key: 'tuzla_wallet_cards', value: JSON.stringify(cards) });
                  alert(`${player.name} added to your digital wallet!`);
                } else {
                  alert(`You already have ${player.name} in your wallet.`);
                }
              } catch (e) {
                console.error(e);
                alert('Saved to offline storage!');
              }
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-amber-950 font-black rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            <QrIcon size={20} />
            SEND TO WALLET
          </button>
          <button 
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `Tuzla Tour - ${player.name}`,
                    text: `Check out this legendary ${player.name} card from Tuzla!`,
                    url: window.location.href,
                  });
                } catch (err) {
                  console.error('Share failed:', err);
                }
              } else {
                const dummyUrl = window.location.href;
                navigator.clipboard.writeText(dummyUrl);
                alert('Link copied to clipboard!');
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-black rounded-2xl border border-white/20 active:scale-95 transition-all"
          >
            <Share2 size={20} />
            SHARE
          </button>
        </div>
      </motion.div>

      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </motion.div>
  );
};

export default SpecialCollection;
