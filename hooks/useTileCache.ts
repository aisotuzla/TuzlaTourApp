
import { useState, useCallback } from 'react';

const CACHE_NAME = 'tuzla-map-tiles-v1';

export const useTileCache = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const downloadTuzlaCenter = useCallback(async () => {
        setIsDownloading(true);
        setProgress(0);

        const center = { lat: 44.5375, lon: 18.6735 };
        const zoomLevels = [11, 12, 13];
        const radius = 0.02; // Increased radius for better coverage

        const tilesToFetch: string[] = [];

        zoomLevels.forEach(z => {
            const n = Math.pow(2, z);
            const xCenter = (center.lon + 180) / 360 * n;
            const latRad = center.lat * Math.PI / 180;
            const yCenter = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;

            // Fetch a 5x5 grid for better coverage at lower zoom levels
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    const x = Math.floor(xCenter + dx);
                    const y = Math.floor(yCenter + dy);
                    // Use the same subdomains as Leaflet's default {s}
                    ['a', 'b', 'c'].forEach(s => {
                        tilesToFetch.push(`https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
                    });
                }
            }
        });


        const cache = await caches.open(CACHE_NAME);
        let completed = 0;

        const downloadPromises = tilesToFetch.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (err) {
                console.warn(`Failed to cache tile: ${url}`);
            } finally {
                completed++;
                setProgress(Math.round((completed / tilesToFetch.length) * 100));
            }
        });

        await Promise.all(downloadPromises);
        setIsDownloading(false);
        alert('Tuzla Center map data downloaded for offline use!');
    }, []);

    const clearCache = useCallback(async () => {
        await caches.delete(CACHE_NAME);
        alert('Map cache cleared.');
    }, []);

    return { downloadTuzlaCenter, clearCache, isDownloading, progress };
};
