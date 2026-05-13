import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check, X } from 'lucide-react';
import styles from './WorldCup2026.module.css';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  ovr: number;
  stats: {
    pac: number;
    sho: number;
    pas: number;
    dri: number;
    def: number;
    psy: number;
  };
  birthPlace?: string;
  caps?: number;
  goals?: number;
  height?: string;
  club?: string;
  image: string;
  altImage?: string;
  rarity?: 'Legendary' | 'Common';
  folder?: string;
}

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  const [imgSrc, setImgSrc] = useState(player.image);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleError = () => {
    if (player.altImage && imgSrc !== player.altImage) {
      setImgSrc(player.altImage);
    } else {
      setImgSrc('https://via.placeholder.com/200x280?text=Player');
    }
  };

  return (
    <div
      className={`${styles.cardContainer} ${isFlipped ? styles.isFlipped : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={styles.cardInner}>
        {/* Front */}
        <div className={styles.cardFront}>
          <div className={styles.crystalOverlay} />
          <div className={styles.holographicFoil} />
          <div className="absolute top-2 left-2 z-10 flex flex-col items-center">
            <span className="text-2xl font-black text-white leading-none">{player.ovr}</span>
            <span className="text-[10px] font-bold text-white/80 uppercase">{player.position}</span>
          </div>
          <div className={styles.playerImage}>
            <img
              src={imgSrc}
              alt={player.name}
              className={styles.actualImage}
              onError={handleError}
            />
          </div>
          <div className={styles.playerNameArea}>
            <div className={styles.playerNumber}>#{player.number}</div>
            <div className={styles.playerName}>{player.name}</div>
          </div>
        </div>

        {/* Back - Stats */}
        <div className={styles.cardBack}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 w-full">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">PAC</span>
              <span className="text-sm font-black text-white">{player.stats.pac}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">DRI</span>
              <span className="text-sm font-black text-white">{player.stats.dri}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">SHO</span>
              <span className="text-sm font-black text-white">{player.stats.sho}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">DEF</span>
              <span className="text-sm font-black text-white">{player.stats.def}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">PAS</span>
              <span className="text-sm font-black text-white">{player.stats.pas}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">PSY</span>
              <span className="text-sm font-black text-white">{player.stats.psy}</span>
            </div>
          </div>
          <div className="mt-auto pb-4 text-center">
            <div className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Official Roster</div>
            <div className="text-[10px] font-bold text-white/30 uppercase">{player.club || 'National Team'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendaryPopOutCard: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const frontImg = `/assets/WorldCup2026/${player.folder}/${player.folder === 'Dzeko' ? 'Dzeko11.webp' : player.folder === 'Tabakovic' ? 'Tabakovic1.webp' : player.folder + '1.webp'}`;
  const backImg = `/assets/WorldCup2026/${player.folder}/${player.folder === 'Dzeko' ? 'Dzeko2.webp' : player.folder === 'Tabakovic' ? 'Tabakovic2.webp' : player.folder + '2.webp'}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={styles.legendaryOverlay}
      onClick={onClose}
    >
      <div
        className={`${styles.legendaryCardContainer} ${isFlipped ? styles.isFlipped : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
      >
        <div className={styles.legendaryCardInner}>
          <div className={styles.legendaryCardFront}>
            <div className={styles.holoSweep} />
            <img src={frontImg} alt={player.name} className={styles.legendaryActualImage} />
          </div>
          <div className={styles.legendaryCardBack}>
            <div className={styles.holoSweep} />
            <img src={backImg} alt={player.name + " stats"} className={styles.legendaryActualImage} />
          </div>
        </div>
        <button className={styles.legendaryCloseX} onClick={onClose}><X size={24} /></button>
      </div>
    </motion.div>
  );
};

interface Match {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  time: string;
}

const players: Player[] = [
  // Goalkeepers
  { id: '1', name: 'Nikola Vasilj', number: 1, position: 'GK', ovr: 77, stats: { pac: 76, sho: 74, pas: 72, dri: 78, def: 45, psy: 77 }, image: '/assets/players/Vasilj.webp', club: 'FC St. Pauli' },
  { id: '12', name: 'Osman Hadžikić', number: 12, position: 'GK', ovr: 72, stats: { pac: 71, sho: 68, pas: 65, dri: 72, def: 40, psy: 73 }, image: '/assets/players/Hadzikic.webp', club: 'Velež Mostar' },
  { id: '22', name: 'Martin Zlomislić', number: 22, position: 'GK', ovr: 71, stats: { pac: 70, sho: 67, pas: 64, dri: 70, def: 38, psy: 72 }, image: '/assets/players/Zlomislic.webp', club: 'HNK Rijeka' },

  // Defenders
  { id: '5', name: 'Sead Kolašinac', number: 5, position: 'LB', ovr: 80, stats: { pac: 76, sho: 62, pas: 74, dri: 75, def: 81, psy: 85 }, image: '/assets/players/Kolasinac.webp', club: 'Atalanta' },
  { id: '7', name: 'Amar Dedić', number: 7, position: 'RB', ovr: 81, stats: { pac: 88, sho: 65, pas: 76, dri: 82, def: 78, psy: 77 }, image: '/assets/players/Dedic.webp', club: 'Benfica' },
  { id: '18', name: 'Nikola Katić', number: 18, position: 'CB', ovr: 76, stats: { pac: 68, sho: 45, pas: 60, dri: 62, def: 77, psy: 82 }, image: '/assets/players/Katic.webp', club: 'FC Zürich' },
  { id: '4', name: 'Tarik Muharemović', number: 4, position: 'CB', ovr: 75, stats: { pac: 72, sho: 40, pas: 63, dri: 64, def: 76, psy: 75 }, image: '/assets/players/Muharemovic.webp', club: 'Sassuolo' },
  { id: '3', name: 'Nidal Čelik', number: 3, position: 'CB', ovr: 72, stats: { pac: 74, sho: 35, pas: 58, dri: 60, def: 73, psy: 70 }, image: '/assets/players/Celik.webp', club: 'FK Sarajevo' },
  { id: '21', name: 'Stjepan Radeljić', number: 21, position: 'CB', ovr: 73, stats: { pac: 65, sho: 38, pas: 55, dri: 58, def: 74, psy: 80 }, image: '/assets/players/Radeljic.webp', club: 'HNK Rijeka' },
  { id: '2', name: 'Nihad Mujakić', number: 2, position: 'CB', ovr: 74, stats: { pac: 75, sho: 42, pas: 60, dri: 62, def: 75, psy: 78 }, image: '/assets/players/Mujakic.webp', club: 'Partizan' },
  { id: '15-def', name: 'Dennis Hadžikadunić', number: 15, position: 'CB', ovr: 75, stats: { pac: 64, sho: 35, pas: 55, dri: 58, def: 75, psy: 82 }, image: '/assets/players/Hadzikadunic.webp', club: 'Hamburg' },

  // Midfielders
  { id: '14', name: 'Ivan Šunjić', number: 14, position: 'CDM', ovr: 75, stats: { pac: 68, sho: 55, pas: 68, dri: 65, def: 75, psy: 85 }, image: '/assets/players/Sunjic.webp', club: 'Pafos FC' },
  { id: '16', name: 'Amir Hadžiahmetović', number: 16, position: 'CM', ovr: 76, stats: { pac: 72, sho: 64, pas: 75, dri: 75, def: 70, psy: 72 }, image: '/assets/players/Amir Hadziahmetovic.webp', club: 'Besiktas' },
  { id: '17', name: 'Dženis Burnić', number: 17, position: 'CM', ovr: 72, stats: { pac: 74, sho: 62, pas: 70, dri: 72, def: 65, psy: 70 }, image: '/assets/players/Burnic.webp', club: 'Karlsruher SC' },
  { id: '6', name: 'Benjamin Tahirović', number: 6, position: 'CM', ovr: 74, stats: { pac: 72, sho: 60, pas: 75, dri: 75, def: 68, psy: 74 }, image: '/assets/players/Tahirovic.webp', club: 'Ajax' },
  { id: '8', name: 'Armin Gigović', number: 8, position: 'CM', ovr: 73, stats: { pac: 74, sho: 62, pas: 70, dri: 72, def: 66, psy: 75 }, image: '/assets/players/Gigovic.webp', club: 'Holstein Kiel' },
  { id: '13', name: 'Ivan Bašić', number: 13, position: 'CAM', ovr: 71, stats: { pac: 72, sho: 68, pas: 73, dri: 74, def: 45, psy: 60 }, image: '/assets/players/Besic.webp', club: 'Orenburg' },
  { id: '15-mid', name: 'Amar Memić', number: 15, position: 'RM', ovr: 70, stats: { pac: 82, sho: 64, pas: 65, dri: 72, def: 40, psy: 65 }, image: '/assets/players/Memic.webp', club: 'Bravo' },
  { id: '20', name: 'Esmir Bajraktarević', number: 20, position: 'RW', ovr: 75, stats: { pac: 85, sho: 72, pas: 76, dri: 80, def: 35, psy: 62 }, image: '/assets/players/Bajraktarevic.webp', altImage: '/assets/players/BajraktarDelux.webp', club: 'New England' },
  { id: '19', name: 'Kerim Alajbegović', number: 19, position: 'LW', ovr: 72, stats: { pac: 82, sho: 74, pas: 68, dri: 76, def: 30, psy: 55 }, image: '/assets/players/Kerim Alajbegovic.webp', club: 'Bayer Leverkusen' },

  // Forwards
  { id: '10', name: 'Ermedin Demirović', number: 10, position: 'ST', ovr: 80, stats: { pac: 78, sho: 81, pas: 72, dri: 78, def: 45, psy: 82 }, image: '/assets/players/Demirovic.webp', club: 'Stuttgart' },
  { id: '23', name: 'Haris Tabaković', number: 23, position: 'ST', ovr: 74, stats: { pac: 68, sho: 76, pas: 62, dri: 68, def: 38, psy: 84 }, image: '/assets/players/Haris Tabakovic.webp', club: 'Hoffenheim' },
  { id: '9', name: 'Samed Baždar', number: 9, position: 'ST', ovr: 72, stats: { pac: 76, sho: 72, pas: 64, dri: 74, def: 35, psy: 68 }, image: '/assets/players/Bazdar.webp', club: 'Zaragoza' },
  { id: '11', name: 'Edin Džeko', number: 11, position: 'ST', ovr: 82, stats: { pac: 65, sho: 85, pas: 74, dri: 76, def: 40, psy: 77 }, image: '/assets/players/EdinDzeko.webp', club: 'Fenerbahce' },
];

const legendaryPlayers: Player[] = [
  {
    id: 'l1', name: 'Sead Kolašinac', number: 5, position: 'LB', club: 'Atalanta', rarity: 'Legendary', image: '', folder: 'Kolasinac',
    ovr: 80, stats: { pac: 76, sho: 62, pas: 74, dri: 75, def: 81, psy: 85 }
  },
  {
    id: 'l2', name: 'Amar Dedić', number: 2, position: 'RB', club: 'Benfica', rarity: 'Legendary', image: '', folder: 'Dedic',
    ovr: 81, stats: { pac: 88, sho: 65, pas: 76, dri: 82, def: 78, psy: 77 }
  },
  {
    id: 'l4', name: 'Esmir Bajraktarević', number: 24, position: 'RW', club: 'New England', rarity: 'Legendary', image: '', folder: 'Bajraktarevic',
    ovr: 75, stats: { pac: 85, sho: 72, pas: 76, dri: 80, def: 35, psy: 62 }
  },
  {
    id: 'l5', name: 'Ermedin Demirović', number: 9, position: 'ST', club: 'Stuttgart', rarity: 'Legendary', image: '', folder: 'Demirovic',
    ovr: 80, stats: { pac: 78, sho: 81, pas: 72, dri: 78, def: 45, psy: 82 }
  },
  {
    id: 'l6', name: 'Edin Džeko', number: 11, position: 'ST', club: 'Fenerbahce', rarity: 'Legendary', image: '', folder: 'Dzeko',
    ovr: 82, stats: { pac: 65, sho: 85, pas: 74, dri: 76, def: 40, psy: 77 }
  },
];

const matches: Match[] = [
  { id: 'm1', opponent: 'Canada', date: 'June 12, 2026', venue: 'BMO Field, Toronto', time: '21:00' },
  { id: 'm2', opponent: 'Switzerland', date: 'June 18, 2026', venue: 'SoFi Stadium, Inglewood', time: '21:00' },
  { id: 'm3', opponent: 'Qatar', date: 'June 24, 2026', venue: 'Lumen Field, Seattle', time: '21:00' },
];

const WorldCup2026: React.FC<{ lang: string; onBack?: () => void }> = ({ lang, onBack }) => {
  const [predictions, setPredictions] = useState<Record<string, '1' | 'X' | '2'>>({});
  const [selectedLegendary, setSelectedLegendary] = useState<Player | null>(null);
  const [showRoster, setShowRoster] = useState(false);

  const handlePredict = (matchId: string, result: '1' | 'X' | '2') => {
    setPredictions(prev => ({ ...prev, [matchId]: result }));
  };

  const renderSection = (title: string, group: 'GK' | 'DF' | 'MF' | 'FW') => {
    const positionGroups = {
      GK: ['GK'],
      DF: ['LB', 'RB', 'CB'],
      MF: ['CDM', 'CM', 'CAM', 'RM', 'RW', 'LW'],
      FW: ['ST', 'CF']
    };

    const filteredPlayers = players.filter(p => positionGroups[group].includes(p.position));

    if (filteredPlayers.length === 0) return null;

    return (
      <div className="relative z-10 mb-12" key={group}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div className={styles.album}>
          {filteredPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
        </div>
      </div>
    );
  };

  if (showRoster) {
    return (
      <div className={styles.container}>
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setShowRoster(false)}
            className="p-2 bg-blue-100 rounded-full text-blue-900 hover:bg-blue-200"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-black uppercase text-blue-900">PRVI TIM</h2>
        </div>
        
        {renderSection('Goalkeepers', 'GK')}
        {renderSection('Defenders', 'DF')}
        {renderSection('Midfielders', 'MF')}
        {renderSection('Forwards', 'FW')}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="absolute top-4 left-4 z-20">
           <button 
             onClick={onBack}
             className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20 shadow-xl"
           >
             <X size={24} />
           </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >

          <div className={styles.titleWrapper}>
            <div
              className={styles.titleBgOverlay}
              style={{ backgroundImage: "url('/assets/WorldCup2026/bih-italija-zmajevi-timska.webp')" }}
            />
            <motion.div
              className={styles.flagSide}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.img
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                src="/assets/players/500px-Flag_of_Bosnia_and_Herzegovina.svg.webp"
                alt="BiH Flag"
                className={styles.premiumFlag}
              />
              <span className={styles.dragonText}>Zmajevi</span>
            </motion.div>

            <div className={styles.mainTitleArea}>
              <div className={styles.headlineRow}>
                <h1 className={styles.headline}>World Cup 2026 Path</h1>
              </div>
              <p className={styles.story}>
                Led by legend <strong>Sergej Barbarez</strong> and captain <strong>Edin Džeko</strong>,
                Bosnia and Herzegovina secured their historic second qualification.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              className={styles.learnMoreBtn}
              onClick={() => setShowRoster(true)}
            >
              {lang === 'bs' ? 'PRVI TIM' : 'ROSTER'}
            </button>
          </div>
        </motion.div>
      </header>

      <div className={`${styles.scheduleSection} relative z-10`}>
        <h2 className="text-2xl font-black uppercase text-blue-900 mb-8 border-b-2 border-blue-500 pb-2 inline-block">
          Group B Schedule
        </h2>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchInfo}>
                <div>
                  <div className="text-sm font-bold text-blue-600 mb-1 uppercase tracking-tighter">Bosnia vs</div>
                  <div className={styles.teamName}>{match.opponent}</div>
                </div>
                <div className={styles.matchMeta}>
                  <div className="font-bold">{match.date}</div>
                  <div>{match.venue}</div>
                  <div className="text-blue-500 font-black">{match.time}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Prediction Market</div>
                <div className={styles.predictionArea}>
                  {(['1', 'X', '2'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => handlePredict(match.id, res)}
                      className={`${styles.predictBtn} ${predictions[match.id] === res ? styles.predictBtnActive : ''}`}
                    >
                      {res === '1' ? 'BIH Win' : res === 'X' ? 'Draw' : `${match.opponent} Win`}
                      {predictions[match.id] === res && <Check className="inline-block ml-2 w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-12 mb-8 text-center px-6 relative z-10">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
          Disclaimer: This feature is a non-commercial cultural tribute and fan guide. 
          "Zmajevi" and player details are for informational purposes only. 
          Not affiliated with FIFA or NSFBiH.
        </p>
      </footer>
    </div>
  );
};


export const NFTCollection: React.FC = () => {
  const [selectedLegendary, setSelectedLegendary] = useState<Player | null>(null);

  return (
    <>
      <AnimatePresence>
        {selectedLegendary && (
          <LegendaryPopOutCard 
            player={selectedLegendary} 
            onClose={() => setSelectedLegendary(null)} 
          />
        )}
      </AnimatePresence>

      <div className={styles.legendarySection} style={{ marginTop: '2rem', padding: '2rem 1rem' }}>
        <h2 
          className={styles.legendaryNameBtn} 
          style={{ fontSize: '1.5rem', opacity: 1, color: 'rgba(218, 165, 32, 1)', marginBottom: '1.5rem', display: 'block', textAlign: 'center', pointerEvents: 'none' }}
        >
          NFT COLLECTION
        </h2>
        <div className={styles.legendaryNamesGrid}>
          {legendaryPlayers.map((p) => (
            <button
              key={p.id}
              className={styles.legendaryNameBtn}
              onClick={() => setSelectedLegendary(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default WorldCup2026;
