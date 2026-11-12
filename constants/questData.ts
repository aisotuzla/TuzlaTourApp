// Quest related constants extracted for reuse

import { Language } from "../types";

export interface QuestTarget {
  id: string;
  name: { en: string; bs: string; de?: string; tr?: string };
  description: { en: string; bs: string; de?: string; tr?: string };
  category?: 'culture' | 'history' | 'nature' | 'food' | 'shopping' | 'art';
  Html5Qrcode: string;
  Image: string;
  audio?: string;
  video?: string;
  website?: string;
  panorama?: string;
  panoramaHaov?: number;
  rewardHtml?: string;
}

export interface RoutePoiPreset {
  name: { bs: string; en: string };
  lat: number;
  lon: number;
  category: string;
  entryFee?: string;
  panorama?: string;
  panoramaHaov?: number;
}

export const QUEST_TARGETS: QuestTarget[] = [
  {
    id: 'trg_slobode',
    name: { en: 'Freedom Square', bs: 'Trg slobode' },
    description: {
      en: 'The largest city square in Bosnia and Herzegovina, home to the central fountain, historical architecture, and vibrant community life.',
      bs: 'Najveći gradski trg u Bosni i Hercegovini, sa prepoznatljivom centralnom fontanom, historijskom arhitekturom i bogatim društvenim životom.',
      de: 'Der größte Stadtplatz in Bosnien und Herzegowina mit Brunnen, historischer Architektur und pulsierendem Stadtleben.',
      tr: 'Bosna Hersek\'in en büyük meydanı; fıskiyesi, tarihi mimarisi ve canlı şehir yaşamıyla Tuzla\'nın kalbidir.'
    },
    category: 'culture',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRTrgSlobode.png',
    Image: '/assets/Gallery/QuestQRLocations/trgslobode.webp',
    audio: '/audio/FreedomSquare.mp3',
    rewardHtml: '/assets/PoveljaKulinaBana.html'
  },
  {
    id: 'salt_square',
    name: { en: 'Salt Square', bs: 'Solni trg' },
    description: {
      en: 'A historical square commemorating Tuzla\'s 2,500-year salt mining heritage, featuring a replica of an ancient Neolithic salt well.',
      bs: 'Historijski trg posvećen tuzlanskoj 2.500 godina dugoj tradiciji eksploatacije soli, sa replikom neolitskog bunara za so.',
      de: 'Historischer Platz zur Feier von Tuzlas 2.500-jähriger Salzgewinnungstradition mit einer Replik eines neolithischen Salzbrunnens.',
      tr: 'Tuzla\'nın 2.500 yıllık tuz madenciliği mirasını neolitik tuz kuyusu kopyasıyla sergileyen tarihi meydan.'
    },
    category: 'history',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRsonitrg.png',
    Image: '/assets/Gallery/QuestQRLocations/sonitrg.webp'
  },
  {
    id: 'palancinkara',
    name: { en: 'Bagi Crêperie', bs: 'Palačinkara kod Bagija', de: 'Crêperie Bagi', tr: 'Bagi Krep' },
    description: {
      en: 'Tuzla\'s favorite dessert destination, famous for artisanal sweet and savory crêpes, pancake sushi, and delicious treats.',
      bs: 'Omiljena tuzlanska slatka destinacija, poznata po vrhunskim slatkim i slanim palačinkama, sushi palačinkama i poslasticama.',
      de: 'Tuzlas beliebtestes Dessert-Lokal, berühmt für süße und herzhafte Crêpes, Pancake-Sushi und köstliche Desserts.',
      tr: 'Tuzla\'nın en sevilen tatlı mekanı; lezzetli tatlı ve tuzlu krepleri, krep suşisi ve enfes tatlılarıyla ünlüdür.'
    },
    category: 'food',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRpalacinkara.webp',
    Image: '/assets/Gallery/Food/bagi.webp'
  },
  {
    id: 'slana_banja',
    name: { en: 'Slana Banja Park', bs: 'Slana Banja' },
    description: {
      en: 'A peaceful hilltop memorial park and recreational forest with lush walking avenues, viewpoints, and historical monuments.',
      bs: 'Prelijepi memorijalni park i šetalište sa uređenim stazama, vidikovcima i historijskim spomenicima Tuzle.',
      de: 'Ruhiger Gedenkpark und Erholungsgebiet mit Spazierwegen, Panoramablicken und historischen Monumenten.',
      tr: 'Yürüyüş parkurları, manzara noktaları ve tarihi anıtlarıyla huzur dolu anıt parkı ve dinlenme alanı.'
    },
    category: 'nature',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRBanja.png',
    Image: '/assets/Gallery/QuestQRLocations/banjaO.webp',
    audio: '/audio/SaltPark.mp3'
  },
  {
    id: 'kapija',
    name: { en: 'Kapija Memorial', bs: 'Kapija' },
    description: {
      en: 'Historic old town landmark and memorial square dedicated to the innocent young victims of the tragic May 25, 1995 shelling.',
      bs: 'Historijski spomenik u starom gradskom jezgru, posvećen nevino stradaloj tuzlanskoj omladini 25. maja 1995. godine.',
      de: 'Historisches Denkmal und Mahnmal im alten Stadtkern, gewidmet den unschuldigen jugendlichen Opfern vom 25. Mai 1995.',
      tr: '25 Mayıs 1995 trajik saldırısında hayatını kaybeden masum gençlere adanmış tarihi anıt ve anma meydanı.'
    },
    category: 'culture',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRkapija.png',
    Image: '/assets/Gallery/QuestQRLocations/kapija.webp',
    audio: '/audio/Kapija.mp3'
  },
  {
    id: 'slapovi',
    name: { en: 'Saline Waterfalls', bs: 'Slani slapovi Panonika' },
    description: {
      en: 'Cascading saline waterfalls inside the Pannonian Lakes complex, providing natural inhalation therapy and refreshing relaxation.',
      bs: 'Kaskadni slani slapovi u sklopu kompleksa Panonskih jezera, koji pružaju prirodnu aerosolnu inhalaciju i osvježenje.',
      de: 'Kaskadierende Salzwasserfälle im Pannonischen Seenkomplex für natürliche Aerosol-Inhalation und Entspannung.',
      tr: 'Pannonian Gölleri kompleksinde yer alan, doğal aerosol inhalasyonu ve serinlik sunan tuz şelaleleri.'
    },
    category: 'nature',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRslapovi.png',
    Image: '/assets/Gallery/QuestQRLocations/tzslapovi.webp',
    audio: '/audio/slapovi.mp3'
  },
  {
    id: 'atelje_ismet',
    name: { en: 'Atelier Ismet Mujezinović', bs: 'Atelje Ismet Mujezinović' },
    description: {
      en: 'The memorial studio and art gallery honoring Ismet Mujezinović, one of Bosnia and Herzegovina\'s greatest fine artists.',
      bs: 'Memorijalni atelje i umjetnička galerija posvećena Ismetu Mujezinoviću, jednom od najistaknutijih bosanskohercegovačkih slikara.',
      de: 'Gedenkatelier und Galerie zu Ehren von Ismet Mujezinović, einem der bedeutendsten bosnischen Maler.',
      tr: 'Bosna Hersek\'in en önemli ressamlarından Ismet Mujezinović\'in anısına adanmış atölye ve sanat galerisi.'
    },
    category: 'art',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRAtelje.png',
    Image: '/assets/Gallery/QuestQRLocations/atelje.webp',
    audio: '/audio/Atelier.mp3'
  },
  {
    id: 'bingo_city_centar',
    name: { en: 'Bingo City Center', bs: 'Bingo City Centar' },
    description: {
      en: 'The premier modern shopping, dining, and entertainment destination in the region with world brands and cinemas.',
      bs: 'Vodeći moderni centar za kupovinu, gastronomiju i zabavu u regiji Tuzle, sa svjetskim brendovima i multipleks kinom.',
      de: 'Das führende moderne Einkaufs-, Gastronomie- und Unterhaltungszentrum der Region mit Weltmarken und Kino.',
      tr: 'Tuzla bölgesinin önde gelen modern alışveriş, yeme-içme ve eğlence merkezi.'
    },
    category: 'shopping',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRBingoCityCenter.png',
    Image: '/assets/icons/Bingo-supermarket.webp',
    audio: '/audio/bingocitycentar.mp3',
    website: 'https://tuzla.bingocitycenter.ba/'
  },
  {
    id: 'mesa_selimovic',
    name: { en: 'Meša Selimović Monument', bs: 'Meša Selimović' },
    description: {
      en: 'Bronze statue commemorating Meša Selimović, Tuzla-born literary giant and author of \'Death and the Dervish\'.',
      bs: 'Bronzani spomenik posvećen Meši Selimoviću, rođenom Tuzlaku i velikanu književnosti, autoru remek-djela \'Derviš i smrt\'.',
      de: 'Bronzestatue für Meša Selimović, den in Tuzla geborenen literarischen Meister und Autor von \'Der Derwisch und der Tod\'.',
      tr: 'Tuzla doğumlu edebiyat ustası, \'Derviş ve Ölüm\' yazarı Meşa Selimoviç\'in bronz anıt heykeli.'
    },
    category: 'culture',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRMesaStatue.png',
    Image: '/assets/Gallery/QuestQRLocations/TuzlaMesaS.webp',
    video: 'https://cki4usi56q35b3t6.public.blob.vercel-storage.com/MesaSelimovic.mp4'
  },
  {
    id: 'tvrtko_park',
    name: { en: 'King Tvrtko Park', bs: 'Park Kralja Tvrtka I' },
    description: {
      en: 'Central city park crowned by the grand bronze statue of King Tvrtko I Kotromanić, the first King of Bosnia.',
      bs: 'Centralni gradski park kojim dominira grandiozni spomenik Kralju Tvrtku I Kotromaniću, prvom bosanskom kralju.',
      de: 'Zentraler Stadtpark mit der imposanten Bronzestatue von König Tvrtko I. Kotromanić, dem ersten König von Bosnien.',
      tr: 'Bosna\'nın ilk kralı Tvrtko I Kotromanić\'in görkemli bronz anıtının yer aldığı merkezi şehir parkı.'
    },
    category: 'history',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRtvrtko.png',
    Image: '/assets/Gallery/QuestQRLocations/ParkKraljaTvrtka.webp',
    audio: '/audio/tvrtkoPark.mp3',
    video: '/assets/Gallery/QuestQRLocations/Ismetvid.mp4'
  },
  {
    id: 'panonika',
    name: { en: 'Pannonian Salt Lakes', bs: 'Panonska jezera' },
    description: {
      en: 'Europe\'s only salt lakes located right in a city center, offering therapeutic mineral water, pebble beaches, and summer fun.',
      bs: 'Jedina slana jezera u Evropi smještena u samom centru grada, sa ljekovitom mineralnom slanom vodom i šljunčanim plažama.',
      de: 'Europas einzige Salzseen im Stadtzentrum mit heilendem Mineralwasser, Kiesstränden und Sommerbadespaß.',
      tr: 'Avrupa\'nın şehir merkezinde yer alan tek tuz gölleri; şifalı mineral suyu, çakıl plajları ve rekreasyon alanları.'
    },
    category: 'nature',
    Html5Qrcode: '/assets/Gallery/QuestQRLocations/QuestQR/QRpanonika.png',
    Image: '/assets/Gallery/QuestQRLocations/panonsko jezero.png',
    audio: '/audio/Panonica.mp3'
  },
];

export const ROUTE_POI_PRESETS: RoutePoiPreset[] = [
  { name: { bs: "Panonska Jezera", en: "Pannonian Lakes" }, lat: 44.53888255374366, lon: 18.680032450849325, category: "nature", entryFee: "Paid 7.5 KM - 9 KM for entire day" },
  { name: { bs: "Slana Banja Park", en: "Slana Banja Park" }, lat: 44.53846734540082, lon: 18.685620782683003, category: "nature" },
  { name: { bs: "Trg Slobode", en: "Freedom Square" }, lat: 44.53954253369571, lon: 18.67508475352372, category: "culture" },
  { name: { bs: "Spomenik Kralju Tvrtku (I)", en: "King Tvrtko Monument" }, lat: 44.53812247668793, lon: 18.678359094003866, category: "history" },
  { name: { bs: "Spomenik Meši Selimoviću", en: "Mesa Selimovic Monument" }, lat: 44.53710706292608, lon: 18.67822758905615, category: "culture" },
  { name: { bs: "Džamija Šarena (Atik)", en: "Atik Mosque" }, lat: 44.54001556181191, lon: 18.673365480509432, category: "religion" },
  { name: { bs: "Saborna Crkva", en: "Orthodox Cathedral" }, lat: 44.53800051276164, lon: 18.679763716121386, category: "religion" },
  { name: { bs: "Tržni centar Bingo (BCC)", en: "Bingo Shopping Center" }, lat: 44.53188635183338, lon: 18.652020274686947, category: "shopping" },
  { name: { bs: "TC Robot", en: "Robot Shopping Center" }, lat: 44.53454365316736, lon: 18.682516897004632, category: "shopping" },
  { name: { bs: "TC Mercator", en: "Mercator Shopping Center" }, lat: 44.5327311385098, lon: 18.68292815613492, category: "shopping" },
  { name: { bs: "TC Tuzlanka", en: "Tuzlanka Shopping Center" }, lat: 44.538634727509304, lon: 18.664878503738578, category: "shopping" }
];

export const POI_COLORS: Record<string, string> = {
  'mesa_selimovic': '#4d068fff',
  'trg_slobode': '#10b981',
  'galerija': '#afcbf8ff',
  'panonika': '#040e8fff',
  'slapovi': '#0ea5e9',
  'kapija': '#ef4444',
  'tvrtko_park': '#18a506ff',
  'slana_banja': '#cf0404ff',
  'atelje_ismet': '#8b5cf6',
  'bingo_city_centar': '#145a03ff',
  'salt_square': '#f59e0b',
  'palancinkara': '#ec4899',
  'palancikara': '#ec4899',
};

export const QUEST_TARGET_COORDS: Record<string, { lat: number; lon: number }> = {
  trg_slobode: { lat: 44.5395175, lon: 18.6749037 },
  salt_square: { lat: 44.5382182, lon: 18.6759398 },
  palancinkara: { lat: 44.5383762, lon: 18.6775339 },
  palancikara: { lat: 44.5383762, lon: 18.6775339 },
  slana_banja: { lat: 44.5378167, lon: 18.6875664 },
  panonika: { lat: 44.5385, lon: 18.6767 },
  slapovi: { lat: 44.5404243, lon: 18.6819408 },
  kapija: { lat: 44.53863, lon: 18.676805 },
  atelje_ismet: { lat: 44.5371465, lon: 18.6810454 },
  bingo_city_centar: { lat: 44.532177, lon: 18.651743 },
  mesa_selimovic: { lat: 44.5370993, lon: 18.6781216 },
  tvrtko_park: { lat: 44.5380826, lon: 18.6783327 },
};

export const PHASE_1_POIS = ['trg_slobode', 'kapija', 'mesa_selimovic'];
export const PHASE_2_POIS = ['tvrtko_park', 'palancinkara', 'salt_square'];
export const PHASE_3_POIS = ['panonika', 'slapovi', 'slana_banja', 'atelje_ismet'];
export const GRAND_FINALE_POIS = ['bingo_city_centar'];

export function isPoiRewardUnlocked(poiId: string, unlockedRewards: string[]): boolean {
  if (unlockedRewards.includes(poiId)) return true;
  if (poiId === 'palancinkara' && unlockedRewards.includes('palancikara')) return true;
  if (poiId === 'palancikara' && unlockedRewards.includes('palancinkara')) return true;
  return false;
}

export function getPoiPhase(poiId: string): number {
  if (PHASE_1_POIS.includes(poiId)) return 1;
  if (PHASE_2_POIS.includes(poiId) || poiId === 'palancikara') return 2;
  if (PHASE_3_POIS.includes(poiId)) return 3;
  if (GRAND_FINALE_POIS.includes(poiId)) return 4;
  return 1;
}

export function getCurrentQuestPhase(unlockedRewards: string[]): number {
  const isP1 = PHASE_1_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards));
  if (!isP1) return 1;
  const isP2 = PHASE_2_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards));
  if (!isP2) return 2;
  const isP3 = PHASE_3_POIS.every(id => isPoiRewardUnlocked(id, unlockedRewards));
  if (!isP3) return 3;
  return 4;
}

export const NFT_REWARD_IDS: string[] = ["panonika"];

export const SOLANA_DEVNET_NFT_REWARD = {
  id: 'dzeko-bih-01',
  name: 'Edin Džeko — Dijamant Kapiten #11',
  title: 'Bosnia Football Squad Devnet NFT',
  description: {
    en: 'Digital collectible card of Bosnian football legend Edin Džeko. Awarded to quests and explorers completing Phase 1 on Solana Devnet.',
    bs: 'Digitalna kolekcionarska NFT kartica bosanske fudbalske legende Edina Džeke. Nagrada za istraživače Faze 1 na Solana Devnet mreži.',
    de: 'Digitale Sammelkarte der bosnischen Fußballlegende Edin Džeko. Belohnung für Entdecker der Phase 1 im Solana Devnet.',
    tr: 'Bosna futbol efsanesi Edin Džeko için dijital koleksiyon kartı. Solana Devnet Faz 1 ödülü.',
  } as Record<Language, string>,
  ipfsCid: 'bafybeie3i7qu6d4kudm5kmujicx2agisayhvbqhvw2zhf4st3bwz34bdcm',
  image: '/assets/Gallery/QuestQRLocations/edin-dzeko-reward.webp',
  ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafybeie3i7qu6d4kudm5kmujicx2agisayhvbqhvw2zhf4st3bwz34bdcm',
  fallbackIpfsUrl: '/assets/Gallery/QuestQRLocations/edin-dzeko-reward.webp',
  player: 'Edin Džeko',
  number: '11',
  position: 'Kapiten / Napadač (Striker)',
  rarity: 'Legendary Genesis',
  network: 'devnet' as const,
};

export const QUEST_GAME_RULES: Record<Language, { title: string; text: string }> = {
  bs: {
    title: 'Pravila igre potrage',
    text: 'Pronađite označene lokacije na mapi grada. Pratite GPS navigaciju ili AR vodič. Kada stignete na lokaciju, pronađite QR kod i skenirajte ga kako biste otključali sljedeće nivoe igre i osvojili nagrade.',
  },
  en: {
    title: 'Quest Game Rules',
    text: 'Find the marked locations on the city map. Follow the GPS navigation or the AR guide. Once at the location, find the QR code and scan it to unlock the next game levels and win rewards.',
  },
  de: {
    title: 'Regeln für das Suchspiel',
    text: 'Finden Sie die markierten Orte auf der Stadtkarte. Folgen Sie der GPS-Navigation oder dem AR-Guide. Finden Sie vor Ort den QR-Code und scannen Sie ihn, um die nächsten Spiel-Level und Belohnungen freizuschalten.',
  },
  tr: {
    title: 'Keşif Oyunu Kuralları',
    text: 'Şehir haritasında işaretlenmiş konumları bulun. GPS navigasyonunu veya AR rehberini takip edin. Konuma ulaştığınızda QR kodunu bulun ve bir sonraki oyun seviyelerinin ve ödüllerin kilidini açmak için kodu tarayın.',
  },
};


