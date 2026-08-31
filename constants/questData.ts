// Quest related constants extracted for reuse

import { Language } from "../types";

export interface QuestTarget {
  id: string;
  name: { en: string; bs: string; de?: string; tr?: string };
  Html5Qrcode: string;
  Image: string;
  video?: string;
  website?: string;
}

export interface RoutePoiPreset {
  name: { bs: string; en: string };
  lat: number;
  lon: number;
  category: string;
  entryFee?: string;
}

export const QUEST_TARGETS: QuestTarget[] = [
  { id: 'trg_slobode', name: { en: 'Freedom Square', bs: 'Trg slobode' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRTrgSlobode.png', Image: '/assets/Gallery/QuestQRLocations/trgslobode.webp' },
  { id: 'salt_square', name: { en: 'Salt Square', bs: 'Solni trg' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRsonitrg.png', Image: '/assets/Gallery/QuestQRLocations/sonitrg.webp' },
  { id: 'palancinkara', name: { en: 'Pancake Bagi', bs: 'Palančikara Bagi' }, Html5Qrcode: '/assets/Gallery/Food/QuestQRLocations/QRpalacinkara.webp', Image: '/assets/Gallery/Food/bagi.webp' },
  { id: 'slana_banja', name: { en: 'Slana Banja', bs: 'Slana Banja' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRBanja.png', Image: '/assets/Gallery/Photos/tuzla24.webp' },
  { id: 'kapija', name: { en: 'Kapija', bs: 'Kapija' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRkapija.png', Image: '/assets/Gallery/QuestQRLocations/kapija.webp' },
  { id: 'slapovi', name: { en: 'Waterfalls', bs: 'Slapovi' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRslapovi.png', Image: '/assets/Gallery/QuestQRLocations/tzslapovi.webp' },
  { id: 'atelje_ismet', name: { en: 'Atelje Ismet Mujezinovic', bs: 'Atelje Ismet Mujezinović' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRAtelje.png', Image: '/assets/Gallery/QuestQRLocations/atelje.webp' },
  { id: 'bingo_city_centar', name: { en: 'Bingo City Center', bs: 'Bingo City Centar' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRBingoCityCenter.png', Image: '/assets/Bingo-supermarket.webp', website: 'https://tuzla.bingocitycenter.ba/' },
  { id: 'mesa_selimovic', name: { en: 'Mesa Selimovic', bs: 'Meša Selimović' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRMesaStatue.png', Image: '/assets/Gallery/QuestQRLocations/TuzlaMesaS.webp', video: '/assets/Gallery/QuestQRLocations/MesaSelimovic.mp4' },
  { id: 'tvrtko_park', name: { en: 'King Tvrtko Park', bs: 'Park Kralja Tvrtka I' }, Html5Qrcode: '/assets/Gallery/QuestQRLocations/QRtvrtko.png', Image: '/assets/Gallery/Photos/tuzla12.webp' },
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
};

export const PHASE_1_POIS = ['trg_slobode', 'kapija', 'mesa_selimovic'];
export const PHASE_2_POIS = ['tvrtko_park', 'palancikara', 'salt_square'];
export const PHASE_3_POIS = ['panonika', 'slapovi', 'slana_banja', 'atelje_ismet'];
export const GRAND_FINALE_POIS = ['bingo_city_centar'];

export const NFT_REWARD_IDS: string[] = ["panonika"];

