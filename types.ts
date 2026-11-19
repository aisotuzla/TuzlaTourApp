
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

export interface WifiSpot {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  latitude: number;
  longitude: number;
  ssid: string;
}


export interface RouteStep {
  id: string;
  text: string;
  type: string;
  distance: number;
  lat: number;
  lng: number;
  stepIndex: number;
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
  website?: string;
  address?: string;
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
  bamToEur: string;
  enterBam: string;
  calculatedEur: string;
  conversionRate: string;
  pannonicaAlt: string;
  pannonicaTitle: string;
  pannonicaImage: string;
  trademarksDisclaimer: string;
  privacyNoticeTitle: string;
  privacyNoticeBody: string;
  learnMore: string;
  busStation: string;
  batteryWarning: string;
  locationNotAvailable: string;
  zonesLabel: string;
  galleryCharmText: string;
  explorationTitle: string;
  qrLocationScannerTitle: string;
  startScanner: string;
  qrScannerDesc: string;
  scanHistoryLedgerTitle: string;
  ledgerEmptyTitle: string;
  ledgerEmptyDesc: string;
  clearScanHistory: string;
  clearHistoryConfirm: string;
  yesDelete: string;
  cancel: string;
  partnerAgenciesTitle: string;
  gradskiParkingTuzla: string;
  scanLocationToUnlock: string;
  positionCodeInFrame: string;
  success: string;
  error: string;
  alreadyInLedger: string;
  unlockedLocation: string;
  unknownQrCode: string;
  couldNotStartCamera: string;
  privacyKeyPointsTitle: string;
  privacyByDesignTitle: string;
  privacyByDesignText: string;
  noDataStorageTitle: string;
  noDataStorageText: string;
  onDeviceProcessingTitle: string;
  onDeviceProcessingText: string;
  offlineMessage: string;
  watchCinematic: string;
  closeVideo: string;
  trailStepTitle: string;
  trailStepPhase: string;
  trailStepComplete: string;
  trailStepGrandFinale: string;
  trailStepLocked: string;
  questPanelTitle: string;
  questPanelSubtitle: string;
  questPhaseLabel: string;
  questLocationsScanned: string;
  questInProgress: string;
  questSuccess: string;
  questNextTarget: string;
  questComplete: string;
  questCardTag: string;
  questCardLine: string;
  questCardCta: string;
  questAllPhasesUnlocked: string;
}

export enum AppTab {
  LANDING = 'landing',
  CITY_GUIDE = 'cityGuide',
  HISTORY = 'history',
  FOOD = 'food',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',  
  MAP = 'map',
  QUEST = 'quest',
  QR_SCAN = 'qr-scan',
  TASK_MANAGER = 'taskManager',
  AR = 'ar',
  TRAVEL_AGENCIES = 'travelAgencies',
}