# Implementation Plan: Offline Pack Manager

## 1. Map Utilities & Tile Math (`src/utils/geoUtils.ts`)
- [ ] Create `src/utils/geoUtils.ts` (or update if exists) to include the math for generating map tile coordinates.
- [ ] Implement `lon2tile` and `lat2tile` formulas.
- [ ] Implement `generateTuzlaTileUrls()` function.
  - Set a hardcoded bounding box for Tuzla (approx. `lat: 44.52 - 44.55`, `lng: 18.64 - 18.71`).
  - Loop through Zoom Levels 13, 14, 15, and 16.
  - Calculate `X` and `Y` range for each zoom level.
  - Return an array of formatted tile URLs matching the Jawg/OSM style currently in use.

## 2. Caching Engine (`src/utils/offlineManager.ts`)
- [ ] Create a utility class or functions for interacting directly with the Cache API.
- [ ] Implement `downloadAssetsInChunks(urls, cacheName, onProgress)`:
  - Takes a list of URLs.
  - Opens the target cache (e.g., `'map-tiles-cache'` or `'images-cache'`).
  - Downloads URLs in chunks of 5-10 concurrent `fetch()` requests.
  - Updates progress after each chunk.
- [ ] Implement `clearOfflineCaches(cacheNames)` to delete the stored data and free up space.

## 3. UI Component (`src/components/OfflineManagerUI.tsx`)
- [ ] Create a new React component `OfflineManagerUI`.
- [ ] Use `useState` for download state: `idle`, `downloading`, `success`, `error`.
- [ ] Add progress bar UI showing the current percentage and downloaded files count.
- [ ] Provide "Download Offline Pack" and "Clear Offline Data" buttons.
- [ ] Integrate this component into the main `Sidebar.tsx` or `LandingPage.tsx` settings area.

## 4. Graceful Degradation (Video & UI Overrides)
- [ ] Modify `src/components/LandingPage.tsx`:
  - Import the `useNetwork` hook.
  - If `!isOnline`, unmount the `<video>` element and replace it with an `<img>` tag pointing to a cached poster image (e.g., `assets/hero-poster.webp`).
- [ ] Verify `Wallet.tsx` accurately displays its offline fallback banner.

## 5. Testing & Validation
- [ ] Start the development server.
- [ ] Click "Download Offline Pack" and observe the network tab to verify concurrent chunked downloads.
- [ ] Use Chrome DevTools > Application > Cache Storage to verify `map-tiles-cache` and `images-cache` are populated.
- [ ] Go Offline in DevTools (Network -> Offline).
- [ ] Refresh the page and ensure the map loads using the cached tiles and the Hero video is correctly replaced by the image.
