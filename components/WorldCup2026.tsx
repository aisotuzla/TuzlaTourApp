import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check, X } from 'lucide-react';
import styles from './WorldCup2026.module.css';

interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW' | 'Midfielder' | 'Forward' | 'Defender';
  birthPlace: string;
  caps: number;
  goals: number;
  height: string;
  club: string;
  image: string;
  altImage?: string;
  rarity?: 'Legendary' | 'Common';
  rating?: number;
  stats?: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
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

        {/* Back */}
        <div className={styles.cardBack}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Place of Birth</div>
            <div className={styles.statValue}>{player.birthPlace}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Caps / Goals</div>
            <div className={styles.statValue}>{player.caps} / {player.goals}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Height</div>
            <div className={styles.statValue}>{player.height}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Current Club</div>
            <div className={styles.statValue}>{player.club}</div>
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

  // Agent-readable metadata
  const agentMetadata = JSON.stringify({
    name: player.name,
    rarity: player.rarity,
    rating: player.rating,
    stats: player.stats,
    position: player.position,
    club: player.club
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={styles.legendaryOverlay}
      onClick={onClose}
    >
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": `${player.name} NFT Card`,
          "description": `${player.rarity} World Cup 2026 card for ${player.name}`,
          "image": frontImg,
          "brand": {
            "@type": "Brand",
            "name": "Zmajevi WC2026"
          },
          "offers": {
            "@type": "Offer",
            "price": player.rating,
            "priceCurrency": "PTS"
          }
        })}
      </script>

      <div
        className={`${styles.legendaryCardContainer} ${isFlipped ? styles.isFlipped : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
        data-player-metadata={agentMetadata}
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

const WC_INFO: Record<string, any> = {
  en: {
    title: "Zmajevi",
    subtitle: "Bosnia and Herzegovina National Football Team",
    learnMore: "Explore Team History",
    teamOverview: {
      title: "Team Overview",
      content: `Nickname: "Zmajevi" (The Dragons) or "Zlatni Ljiljani" (Golden Lilies)
FIFA Ranking: 71st (as of January 2026)
Captain: Edin Džeko (their all-time leading scorer with 72 goals in 146 caps)
Head Coach: Sergej Barbarez
Home Stadium: Bilino Polje Stadium in Zenica`
    },
    wcHistory: {
      title: "World Cup History",
      content: `Bosnia and Herzegovina has qualified for two FIFA World Cups in their history:
• 2014 Brazil: Their debut World Cup appearance, where they finished third in Group F with one win (3-1 vs Iran) and two losses (to Argentina and Nigeria)
• 2026 (Canada/USA/Mexico): Their second-ever World Cup qualification`
    },
    qualPath: {
      title: "2026 Qualification Path",
      summary: "UEFA Group H - Qualifying Stage: Finished 2nd with 17 points.",
      standings: `1. Austria - 19 pts (Qualified directly)
2. Bosnia and Herzegovina - 17 pts (Advanced to playoffs)
3. Romania - 13 pts
4. Cyprus - 8 pts
5. San Marino - 0 pts`,
      playoffs: `UEFA Playoff Path - The Dramatic Qualification:
• Semifinal (March 26): Wales 0-1 Bosnia (Gigović '14). Ended the playoff curse!
• Final (March 31): Bosnia 1-1 Italy (4-1 pens). Tabaković equalizer in '79. BiH won 4-1 on penalties, ending Italy's 12-year World Cup qualification drought.`
    },
    wcGroup2026: {
      title: "2026 World Cup Group Stage",
      content: `Group B: Canada, Switzerland, Qatar
Schedule:
• June 12: Bosnia vs Canada (BMO Field, Toronto)
• June 18: Bosnia vs Switzerland (SoFi Stadium, Inglewood)
• June 24: Bosnia vs Qatar (Lumen Field, Seattle)`
    },
    keyPlayers: {
      title: "Key Players and Records",
      content: `• Edin Džeko (age 40): Legendary striker and captain (72 goals)
• Sead Kolašinac: Defender for Atalanta (Serie A)
• Haris Tabaković: Forward for Borussia Mönchengladbach (crucial playoff goals)
Historical Highlights: Best rank 13th (2013), biggest win 8-1 vs Liechtenstein.`
    },
    significance: {
      title: "Significance of Qualification",
      content: `This qualification is historic because:
1. It's only their second World Cup appearance
2. They broke their playoff jinx (won after 7 failed attempts)
3. They defeated a major European power (Italy)
4. They achieved this under former legend Sergej Barbarez`
    }
  },
  bs: {
    title: "Zmajevi",
    subtitle: "Nogometna reprezentacija Bosne i Hercegovine",
    learnMore: "Istražite Historiju tima",
    teamOverview: {
      title: "Pregled tima",
      content: `Nadimak: "Zmajevi" ili "Zlatni Ljiljani"
FIFA Rang: 71. (januar 2026.)
Kapiten: Edin Džeko (72 gola u 146 nastupa)
Selektor: Sergej Barbarez
Domaći stadion: Bilino Polje, Zenica`
    },
    wcHistory: {
      title: "Historija Svjetskih prvenstava",
      content: `BiH se kvalifikovala za dva FIFA Svjetska prvenstva:
• Brazil 2014: Debitantski nastup, pobjeda nad Iranom (3-1)
• 2026 (Kanada/SAD/Meksiko): Drugo učešće u istoriji`
    },
    qualPath: {
      title: "Put do SP 2026.",
      summary: "UEFA Grupa H: Završili 2. sa 17 bodova.",
      standings: `1. Austrija - 19 bodova
2. BiH - 17 bodova (Baraž)
3. Rumunija - 13 bodova`,
      playoffs: `Dramatične kvalifikacije u baražu:
• Polufinale: Vels 0-1 BiH (Gigović '14). Kraj prokletstva baraža!
• Finale: BiH 1-1 Italija (4-1 penali). Tabaković izjednačio u '79. Istorijska pobjeda nad četverostrukim prvakom.`
    },
    wcGroup2026: {
      title: "SP 2026 - Grupna faza",
      content: `Grupa B: Kanada, Švicarska, Katar
Raspored:
• 12. juni: BiH vs Kanada (Toronto)
• 18. juni: BiH vs Švicarska (Inglewood)
• 24. juni: BiH vs Katar (Seattle)`
    },
    keyPlayers: {
      title: "Ključni igrači",
      content: `• Edin Džeko (40 god): Legendarni kapiten (72 gola)
• Sead Kolašinac: Atalanta (Serie A)
• Haris Tabaković: Borussia Mönchengladbach`
    },
    significance: {
      title: "Značaj kvalifikacija",
      content: `Ovaj uspjeh je istorijski jer:
1. Tek drugi put idemo na Mundijal
2. Srušeno prokletstvo baraža (nakon 7 neuspjeha)
3. Savladana velesila Italija
4. Uspjeh pod vodstvom legende Sergeja Barbareza`
    }
  },
  de: {
    title: "Zmajevi",
    subtitle: "Bosnisch-herzegowinische Fußballnationalmannschaft",
    learnMore: "Teamhistorie erkunden",
    teamOverview: {
      title: "Team-Übersicht",
      nickname: "Spitzname: 'Zmajevi' (Die Drachen) oder 'Zlatni Ljiljani' (Goldene Lilien)",
      ranking: "FIFA-Rangliste: 71. (Stand Januar 2026)",
      captain: "Kapitän: Edin Džeko (72 Tore in 146 Spielen)",
      coach: "Trainer: Sergej Barbarez",
      stadium: "Heimstadion: Bilino Polje Stadion in Zenica"
    },
    wcHistory: {
      title: "WM-Geschichte",
      v2014: "2014 Brasilien: Debüt, Platz 3 in Gruppe F (3:1 Sieg gegen Iran)",
      v2026: "2026 (Kanada/USA/Mexiko): Zweite WM-Qualifikation überhaupt"
    },
    qualPath: {
      title: "Qualifikationsweg 2026",
      summary: "Platz 2 in Gruppe H mit 17 Punkten, Aufstieg in die Playoffs.",
      results: "5 Siege, 2 Remis, 1 Niederlage. 17 Tore erzielt, 7 kassiert.",
      playoffs: "Dramatischer Playoff-Sieg: Siege gegen Wales (1:0) und Italien (1:1, 4:1 n.E.)."
    },
    significance: {
      title: "Bedeutung",
      text: "Der Sieg gegen den 4-fachen Weltmeister Italien war eine Sensation. Erster WM-Einzug über Playoffs nach 7 Fehlversuchen."
    }
  },
  tr: {
    title: "Zmajevi",
    subtitle: "Bosna-Hersek Millî Futbol Takımı",
    learnMore: "Takım Tarihini Keşfedin",
    teamOverview: {
      title: "Takıma Genel Bakış",
      nickname: "Takma Adı: 'Zmajevi' (Ejderhalar) veya 'Zlatni Ljiljani' (Altın Zambaklar)",
      ranking: "FIFA Sıralaması: 71. (Ocak 2026 itibarıyla)",
      captain: "Kaptan: Edin Džeko (146 maçta 72 gol)",
      coach: "Teknik Direktör: Sergej Barbarez",
      stadium: "Ana Stadyum: Zenica'daki Bilino Polje Stadyumu"
    },
    wcHistory: {
      title: "Dünya Kupası Tarihi",
      v2014: "2014 Brezilya: İlk kez katılım, F Grubu 3.lüğü (İran'a karşı 3-1 galibiyet)",
      v2026: "2026 (Kanada/ABD/Meksika): Tarihteki ikinci Dünya Kupası katılımı"
    },
    qualPath: {
      title: "2026 Eleme Yolu",
      summary: "H Grubu'nu 17 puanla 2. sırada tamamlayarak play-off'lara kaldı.",
      results: "5 Galibiyet, 2 Beraberlik, 1 Mağlubiyet. 17 gol attı, 7 gol yedi.",
      playoffs: "Dramatik Play-off Galibiyeti: Galler (1-0) and İtalya'yı (1-1, 4-1 pen) yenerek 'play-off lanetini' kırdı."
    },
    significance: {
      title: "Önem",
      text: "4 kez Dünya Şampiyonu olan İtalya'yı yenmek büyük bir sürprizdi. 7 başarısız denemenin ardından Bosna'nın play-off üzerinden ilk Dünya Kupası katılımı."
    }
  }
};

const players: Player[] = [
  // Goalkeepers
  { id: '1', name: 'Nikola Vasilj', number: 1, position: 'GK', birthPlace: 'Zadar (CRO)', caps: 25, goals: 0, height: '1.93m', club: 'FC St. Pauli', image: '/assets/players/Vasilj.webp' },
  { id: '22', name: 'Martin Zlomislić', number: 22, position: 'GK', birthPlace: 'Posušje', caps: 2, goals: 0, height: '1.92m', club: 'HNK Rijeka', image: '/assets/players/Zlomislic.webp' },
  { id: '12', name: 'Osman Hadžikić', number: 12, position: 'GK', birthPlace: 'Klosterneuburg (AUT)', caps: 0, goals: 0, height: '1.88m', club: 'NK Slaven Belupo', image: '/assets/players/Hadzikic.webp' },

  // Defenders
  { id: '4', name: 'Tarik Muharemović', number: 4, position: 'DF', birthPlace: 'Ljubljana (SLO)', caps: 12, goals: 1, height: '1.87m', club: 'Sassuolo', image: '/assets/players/Muharemovic.webp' },
  { id: '5', name: 'Sead Kolašinac', number: 5, position: 'DF', birthPlace: 'Karlsruhe (GER)', caps: 64, goals: 0, height: '1.83m', club: 'Atalanta', image: '/assets/players/Kolasinac.webp' },
  { id: '18', name: 'Nikola Katić', number: 18, position: 'DF', birthPlace: 'Ljubuški', caps: 15, goals: 1, height: '1.94m', club: 'FC Schalke 04', image: '/assets/players/Katic.webp' },
  { id: '2', name: 'Nihad Mujakić', number: 2, position: 'DF', birthPlace: 'Sarajevo', caps: 10, goals: 1, height: '1.89m', club: 'Gaziantep FK', image: '/assets/players/Mujakic.webp' },
  { id: '21', name: 'Stjepan Radeljić', number: 21, position: 'DF', birthPlace: 'Nova Bila', caps: 4, goals: 0, height: '2.01m', club: 'HNK Rijeka', image: '/assets/players/Radeljic.webp' },
  { id: '3', name: 'Nidal Čelik', number: 3, position: 'DF', birthPlace: 'Sarajevo', caps: 0, goals: 0, height: '1.89m', club: 'RC Lens', image: '/assets/players/Celik.webp' },
  { id: 'hd', name: 'Dennis Hadžikadunić', number: 0, position: 'DF', birthPlace: 'Malmö (SWE)', caps: 28, goals: 0, height: '1.91m', club: 'Sampdoria', image: '/assets/players/Hadzikadunic.webp' },
  { id: '7', name: 'Amar Dedić', number: 7, position: 'DF', birthPlace: 'Zell am See (AUT)', caps: 26, goals: 1, height: '1.80m', club: 'SL Benfica', image: '/assets/players/Dedic.webp' },

  // Midfielders
  { id: '14', name: 'Ivan Šunjić', number: 14, position: 'MF', birthPlace: 'Zenica', caps: 11, goals: 0, height: '1.84m', club: 'Pafos FC', image: '/assets/players/Sunjic.webp' },
  { id: '16', name: 'Amir Hadžiahmetović', number: 16, position: 'MF', birthPlace: 'Nexø (DEN)', caps: 34, goals: 0, height: '1.79m', club: 'Hull City', image: '/assets/players/Amir Hadziahmetovic.webp' },
  { id: '17', name: 'Dženis Burnić', number: 17, position: 'MF', birthPlace: 'Hamm (GER)', caps: 18, goals: 0, height: '1.81m', club: 'Karlsruher SC', image: '/assets/players/Burnic.webp' },
  { id: '6', name: 'Benjamin Tahirović', number: 6, position: 'MF', birthPlace: 'Spånga (SWE)', caps: 26, goals: 2, height: '1.91m', club: 'Brøndby IF', image: '/assets/players/Tahirovic.webp' },
  { id: '8', name: 'Armin Gigović', number: 8, position: 'MF', birthPlace: 'Lund (SWE)', caps: 18, goals: 1, height: '1.87m', club: 'BSC Young Boys', image: '/assets/players/Gigovic.webp' },
  { id: '13', name: 'Ivan Bašić', number: 13, position: 'MF', birthPlace: 'Imotski (CRO)', caps: 15, goals: 0, height: '1.81m', club: 'FC Astana', image: '/assets/players/Besic.webp' },
  { id: '15', name: 'Amar Memić', number: 15, position: 'MF', birthPlace: 'Tuzla', caps: 11, goals: 1, height: '1.78m', club: 'Viktoria Plzeň', image: '/assets/players/Memic.webp' },
  { id: '20', name: 'Esmir Bajraktarević', number: 20, position: 'MF', birthPlace: 'Appleton (USA)', caps: 14, goals: 1, height: '1.75m', club: 'PSV Eindhoven', image: '/assets/players/Bajraktarevic.webp', altImage: '/assets/players/BajraktarDelux.webp' },
  { id: '19', name: 'Kerim Alajbegović', number: 19, position: 'MF', birthPlace: 'Leverkusen (GER)', caps: 8, goals: 1, height: '1.76m', club: 'Red Bull Salzburg', image: '/assets/players/Kerim Alajbegovic.webp' },

  // Forwards
  { id: '10', name: 'Ermedin Demirović', number: 10, position: 'FW', birthPlace: 'Hamburg (GER)', caps: 38, goals: 4, height: '1.85m', club: 'VfB Stuttgart', image: '/assets/players/Demirovic.webp' },
  { id: '23', name: 'Haris Tabaković', number: 23, position: 'FW', birthPlace: 'Grenchen (SUI)', caps: 10, goals: 4, height: '1.94m', club: 'Mönchengladbach', image: '/assets/players/Haris Tabakovic.webp' },
  { id: '9', name: 'Samed Baždar', number: 9, position: 'FW', birthPlace: 'Novi Pazar (SRB)', caps: 11, goals: 1, height: '1.86m', club: 'Jagiellonia', image: '/assets/players/Bazdar.webp' },
  { id: '11', name: 'Edin Džeko', number: 11, position: 'FW', birthPlace: 'Sarajevo', caps: 148, goals: 73, height: '1.93m', club: 'FC Schalke 04', image: '/assets/players/EdinDzeko.webp' },
];

const legendaryPlayers: Player[] = [
  {
    id: 'l1', name: 'Sead Kolašinac', number: 5, position: 'Defender', club: 'Atalanta', birthPlace: 'Karlsruhe, Germany',
    caps: 64, goals: 0, height: '1.83m', rarity: 'Legendary', image: '', folder: 'Kolasinac',
    rating: 78, stats: { pace: 74, shooting: 63, passing: 79, dribbling: 73, defending: 85, physical: 94 }
  },
  {
    id: 'l2', name: 'Amar Dedić', number: 2, position: 'Defender', club: 'Benfica', birthPlace: 'Zell am See, Austria',
    caps: 26, goals: 1, height: '1.80m', rarity: 'Legendary', image: '', folder: 'Dedic',
    rating: 83, stats: { pace: 85, shooting: 69, passing: 77, dribbling: 74, defending: 80, physical: 80 }
  },
  {
    id: 'l3', name: 'Kerim Alajbegović', number: 26, position: 'Midfielder', club: 'RB Salzburg', birthPlace: 'Koln, Germany',
    caps: 8, goals: 1, height: '1.78m', rarity: 'Legendary', image: '', folder: 'Alajbegovic',
    rating: 82, stats: { pace: 82, shooting: 82, passing: 80, dribbling: 83, defending: 30, physical: 65 }
  },
  {
    id: 'l4', name: 'Esmir Bajraktarević', number: 24, position: 'Midfielder', club: 'PSV Eindhoven', birthPlace: 'Appleton, USA',
    caps: 14, goals: 1, height: '1.75m', rarity: 'Legendary', image: '', folder: 'Bajraktarevic',
    rating: 82, stats: { pace: 88, shooting: 87, passing: 92, dribbling: 84, defending: 28, physical: 65 }
  },
  {
    id: 'l5', name: 'Ermedin Demirović', number: 9, position: 'Forward', club: 'Stuttgart', birthPlace: 'Hamburg, Germany',
    caps: 38, goals: 4, height: '1.85m', rarity: 'Legendary', image: '', folder: 'Demirovic',
    rating: 79, stats: { pace: 74, shooting: 77, passing: 70, dribbling: 76, defending: 42, physical: 78 }
  },
  {
    id: 'l6', name: 'Edin Džeko', number: 11, position: 'Forward', club: 'Schalke 04', birthPlace: 'Sarajevo, BiH',
    caps: 148, goals: 73, height: '1.93m', rarity: 'Legendary', image: '', folder: 'Dzeko',
    rating: 85, stats: { pace: 68, shooting: 92, passing: 72, dribbling: 74, defending: 38, physical: 74 }
  },
  {
    id: 'l7', name: 'Haris Tabaković', number: 28, position: 'Forward', club: 'Borussia Mönchengladbach', birthPlace: 'Grenchen, Switzerland',
    caps: 10, goals: 4, height: '1.94m', rarity: 'Legendary', image: '', folder: 'Tabakovic',
    rating: 77, stats: { pace: 70, shooting: 79, passing: 68, dribbling: 72, defending: 35, physical: 88 }
  },
  {
    id: 'l8', name: 'Tarik Muharemović', number: 4, position: 'Defender', club: 'Sassuolo', birthPlace: 'Ljubljana (SLO)',
    caps: 12, goals: 1, height: '1.87m', rarity: 'Legendary', image: '', folder: 'Muharemovic',
    rating: 76, stats: { pace: 72, shooting: 55, passing: 68, dribbling: 65, defending: 79, physical: 82 }
  },
];

const matches: Match[] = [
  { id: 'm1', opponent: 'Canada', date: 'June 12, 2026', venue: 'BMO Field, Toronto', time: '21:00' },
  { id: 'm2', opponent: 'Switzerland', date: 'June 18, 2026', venue: 'SoFi Stadium, Inglewood', time: '21:00' },
  { id: 'm3', opponent: 'Qatar', date: 'June 24, 2026', venue: 'Lumen Field, Seattle', time: '21:00' },
];

const WorldCup2026: React.FC<{ lang: string }> = ({ lang }) => {
  const [predictions, setPredictions] = useState<Record<string, '1' | 'X' | '2'>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLegendary, setSelectedLegendary] = useState<Player | null>(null);
  const [showRoster, setShowRoster] = useState(false);

  const activeLang = WC_INFO[lang] || WC_INFO['en'];

  const handlePredict = (matchId: string, result: '1' | 'X' | '2') => {
    setPredictions(prev => ({ ...prev, [matchId]: result }));
  };

  const renderSection = (title: string, pos: string) => {
    return (
      <div className="relative z-10" key={pos}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div className={styles.album}>
          {players.filter(p => p.position === pos).map(p => <PlayerCard key={p.id} player={p} />)}
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
              onClick={() => setIsModalOpen(true)}
            >
              {activeLang.learnMore}
            </button>
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
