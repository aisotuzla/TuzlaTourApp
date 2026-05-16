import { LOCATIONS } from '../constants';
import { tuzlaHotelData } from '../tuzlaHotelData';

export interface OfflineProgress {
  total: number;
  downloaded: number;
  status: 'idle' | 'downloading' | 'success' | 'error';
  message?: string;
}

// Fixed core assets needed for the offline map and app shell
const CORE_ASSETS = [
  '/assets/tuzla-map.geojson',
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

  // Add all Location images
  LOCATIONS.forEach(loc => {
    if (loc.image && loc.image.startsWith('/')) urls.add(loc.image);
    // Add menu items for food locations
    if (loc.menuItems) {
      loc.menuItems.forEach(item => {
        if (item.image && item.image.startsWith('/')) urls.add(item.image);
      });
    }
  });

  // Add Hotel images
  tuzlaHotelData.forEach(hotel => {
    if (hotel.images) {
      hotel.images.forEach(img => {
        if (img.startsWith('/')) urls.add(img);
      });
    }
  });

  // We are excluding external URLs (like unsplash) and large videos to save space
  return Array.from(urls);
};

/**
 * Batch downloads assets and saves them to the Workbox CacheStorage
 */
export const downloadOfflinePack = async (
  onProgress: (progress: OfflineProgress) => void
): Promise<void> => {
  const urls = getOfflineAssetUrls();
  let downloadedCount = 0;

  onProgress({ total: urls.length, downloaded: 0, status: 'downloading', message: 'Starting download...' });

  try {
    const mapCache = await caches.open('map-tiles-cache');
    const imgCache = await caches.open('images-cache');

    // Download in chunks of 5 to avoid overwhelming the network
    const CHUNK_SIZE = 5;
    for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
      const chunk = urls.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (url) => {
          try {
            // Determine which cache to use
            const targetCache = url.endsWith('.geojson') ? mapCache : imgCache;
            
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
  try {
    await caches.delete('map-tiles-cache');
    await caches.delete('images-cache');
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
