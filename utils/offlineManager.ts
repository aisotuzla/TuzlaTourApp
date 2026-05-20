import { LOCATIONS, BINGO_STORE, RESTAURANTS } from '../constants';
import { tuzlaHotelData } from '../tuzlaHotelData';

export interface OfflineProgress {
  total: number;
  downloaded: number;
  status: 'idle' | 'downloading' | 'success' | 'error';
  message?: string;
}

// Fixed core assets needed for the offline map and app shell
const CORE_ASSETS = [
  '/maps/TuzlaTourGuide.geojson',
  '/maps/tuzla.pmtiles',
  '/style/offline-style.json',
  '/poi.geojson',
  '/MAP/buildings.geojson',
  '/assets/Gallery/QuestQRLocations/hotel.svg',
  '/assets/BCC.webp',
  '/assets/AISO Tuzla.webp',
  '/assets/AISO Tuzla_B.webp',
  '/assets/panonikasplash.webp',
];

/**
 * Gathers all URLs that need to be cached for offline mode
 */
export const getOfflineAssetUrls = (): string[] => {
  const urls = new Set<string>();

  // Add core assets
  CORE_ASSETS.forEach(url => urls.add(url));

  // Add Gallery images (Accommodation)
  for (const hotel of tuzlaHotelData) {
    if (hotel.image) urls.add(hotel.image);
    if (hotel.extraImage) urls.add(hotel.extraImage);
  }

  // Add Restaurant images
  RESTAURANTS.forEach(res => {
    if (res.image) urls.add(res.image);
  });

  // Add Bingo store items
  BINGO_STORE.items.forEach(item => {
    if (item.image) urls.add(item.image);
  });

  // Add Core Menu & Brand Assets
  urls.add('/assets/Gallery/QuestQRLocations/TuzlaMenuLogo.png');
  urls.add('/assets/Gallery/QuestQRLocations/Taxi1525.webp');
  urls.add('/assets/Tuzlalogo.webp');
  urls.add('/assets/logotuzlaICP.webp');
  urls.add('/assets/panonikalogo.webp');
  urls.add('/assets/Gallery/QuestQRLocations/IconTZ.webp');

  return Array.from(urls);
};

/**
 * Batch downloads assets and saves them to the Workbox CacheStorage
 */
export const downloadOfflinePack = async (
  onProgress: (progress: OfflineProgress) => void
): Promise<void> => {
  if (typeof window === 'undefined' || !window.caches) {
    onProgress({
      total: 0,
      downloaded: 0,
      status: 'error',
      message: 'Offline mode requires a secure context (HTTPS or localhost). If testing on a mobile device, please access via localhost or ensure HTTPS is active.'
    });
    return;
  }

  let urls = getOfflineAssetUrls();

  onProgress({ total: urls.length, downloaded: 0, status: 'downloading', message: 'Gathering assets...' });

  let downloadedCount = 0;

  onProgress({ total: urls.length, downloaded: 0, status: 'downloading', message: 'Starting download...' });

  try {
    const mapCache = await caches.open('local-map-tiles');
    const pmtilesCache = await caches.open('pmtiles-cache');
    const dataCache = await caches.open('local-data');
    const imgCache = await caches.open('images');

    // Download in chunks of 5 to avoid overwhelming the network
    const CHUNK_SIZE = 5;
    for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
      const chunk = urls.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (url) => {
          try {
            // Determine which cache to use
            let targetCache = imgCache;
            if (url.includes('.pmtiles')) {
              targetCache = pmtilesCache;
            } else if (url.includes('/style/')) {
              targetCache = mapCache;
            } else if (url.endsWith('.geojson') || url.endsWith('.json')) {
              targetCache = dataCache;
            }

            // Check if already cached
            const exists = await targetCache.match(url);
            if (!exists) {
              const response = await fetch(url);
              if (response.ok) {
                await targetCache.put(url, response);
              }
            }
          } catch (err) {
            console.warn(`Failed to cache ${url}`, err);
          } finally {
            downloadedCount++;
          }
        })
      );

      onProgress({
        total: urls.length,
        downloaded: downloadedCount,
        status: 'downloading',
        message: `Caching assets... (${downloadedCount}/${urls.length})`
      });
    }

    onProgress({ total: urls.length, downloaded: downloadedCount, status: 'success', message: 'Offline pack downloaded successfully!' });
  } catch (error) {
    console.error('Offline pack download error:', error);
    onProgress({ total: urls.length, downloaded: downloadedCount, status: 'error', message: 'Failed to download offline pack.' });
  }
};

/**
 * Clears the downloaded offline pack from caches
 */
export const clearOfflinePack = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.caches) return;
  try {
    await caches.delete('local-map-tiles');
    await caches.delete('pmtiles-cache');
    await caches.delete('local-data');
    await caches.delete('images');
  } catch (error) {
    console.error('Failed to clear offline caches', error);
  }
};

/**
 * Estimates how much storage the offline pack is using (in MB)
 */
export const getOfflineStorageSizeMB = async (): Promise<string> => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    if (estimate.usage) {
      return (estimate.usage / (1024 * 1024)).toFixed(2);
    }
  }
  return 'Unknown';
};
