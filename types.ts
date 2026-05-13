
export type Language = 'en' | 'bs' | 'de' | 'tr';

export interface LocationData {
  name: string;
  rating: number;
  user_ratings_total: number;
  address: string;
  latitude: number;
  longitude: number;
  website?: string;
  category: string;
  type: 'Dining' | 'Dessert';
  image?: string;
}

export interface ParkingLot {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  plus_code?: string;
  hours?: string;
}

export interface Location {

  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  coordinates: [number, number];
  category: 'nature' | 'culture' | 'shopping' | 'landmark' | 'shop' | 'hotel' | 'park' | 'food';
  image?: string;
  qrCode?: string;
  discount?: string | number;
}

export interface TranslationSet {
  welcome: string;
  history: string;
  map: string;
  quest: string;
  gallery: string;
  scanQr: string;
  rewardClaimed: string;
  discountMessage: string;
  notificationTitle: string;
  notificationBody: string;
  close: string;
  viewOnMap: string;
  foundAt: string;
  liveEvents: string;
  wallet: string;
  loginOAuth: string;
  touristInfo: string;
  emergencyInfo: string;
  bestSupermarket: string;
  workingHours: string;
  monSat: string;
  sunday: string;
  closed: string;
  rating: string;
  reviews: string;
  delivery: string;
  noDelivery: string;
  typicalPrice: string;
  arGuide: string;
  walletManual: string;
  howToConnect: string;
  connectSteps: string;
  safeUsage: string;
  safeTips: string;
  txHistory: string;
  historyLocation: string;
  bamToEur: string;
  enterBam: string;
  calculatedEur: string;
  conversionRate: string;
  parking: string;
  pannonicaAlt: string;
  pannonicaTitle: string;
  pannonicaImage: string;
  parkingTitle: string;
  parkingActive: string;
  parkingAutoDetect: string;
  parkingLicensePlate: string;
  parkingHourly: string;
  parkingDaily: string;
  parkingPaySms: string;
  parkingDetectNoZone: string;
  parkingPromptPlate: string;
  parkingPaymentInactive: string;
  parkingConfirm: string;
  parkingCancel: string;
  parkingDetected: string;
  trademarksDisclaimer: string;
  privacyNoticeTitle: string;
  privacyNoticeBody: string;
  learnMore: string;
  busStation: string;
  batteryWarning: string;
  selectNetwork: string;
  tonWallet: string;
  switchNetwork: string;
  connectedToTon: string;
  walletLocked: string;
  setWalletPin: string;
  confirmPin: string;
  enterPin: string;
  dentalTourism: string;
}

export enum AppTab {
  LANDING = 'landing',
  CITY_GUIDE = 'cityGuide',
  HISTORY = 'history',
  FOOD = 'food',
  ACCOMMODATION = 'accommodation',
  MAP = 'map',
  QUEST = 'quest',
  GALLERY = 'gallery',
  WALLET = 'wallet',
  TASK_MANAGER = 'taskManager',
  AR = 'ar',
  PARKING = 'parking',
  WORLD_CUP_2026 = 'worldCup2026'
}
