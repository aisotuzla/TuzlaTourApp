# Offline Pack Manager Design

## Context
TuzlaTourApp is a React/Vite PWA mapped with MapLibre, deployed to both Web and Android (via Capacitor). While the app has Workbox Service Worker caching, map tiles and quest images currently rely on passive caching—meaning a tourist must view them online first to access them offline. This design outlines a "Proactive Download" mechanism so users can pre-download the essential Tuzla map and quests while on WiFi. 

## Goals
- Allow users to download a complete offline pack (Maps + Quests) with a single button click.
- Prevent downloading heavy/unnecessary assets (Hero Videos, Wallet features) to keep the offline pack fast and small (~15MB).
- Seamlessly integrate with the existing Workbox Service Worker architecture.

## Architecture

### 1. Offline Manager UI
**Component:** `components/OfflineManager.tsx` (to be placed in Sidebar or Settings)
- **Features:** 
  - "Download Offline Pack" button.
  - Progress bar displaying real-time download status (e.g., "Downloading Tiles: 45/300").
  - "Clear Offline Data" button to delete specific caches and free up space.

### 2. Map Tile Generator
**Utility:** `utils/geoUtils.ts` (or an addition to existing map utilities)
- **Functionality:** 
  - Define a geographic bounding box for Tuzla's core tourist areas.
  - Implement a mathematical function to calculate Slippy Map tile coordinates (`X/Y/Z`) for zoom levels 13 through 16.
  - Generate the absolute URLs matching the map style source currently used in `MapView`/`ParkingView`.

### 3. Caching Engine
**Mechanism:** Direct CacheStorage API integration.
- When downloading begins, the utility will:
  1. Open the specific Workbox caches: `caches.open('map-tiles-cache')` and `caches.open('images-cache')`.
  2. Iterate through the generated map tile URLs and the hardcoded POI/Quest image URLs.
  3. `fetch()` each URL and store it via `cache.put()`.
  4. Perform requests in chunks (e.g., 10 concurrent requests) to prevent browser crashing and rate-limiting.
- By injecting directly into Workbox's named caches, the PWA will instantly serve these files offline.

### 4. Graceful Degradation (Video & Wallet)
To ensure performance and reduce storage weight:
- **Hero Video (`LandingPage.tsx`):** We will utilize the existing `useNetwork()` hook. If `!isOnline`, the `<video>` element will be completely unmounted and replaced by a static cached poster image.
- **Wallet (`Wallet.tsx`):** Dynamic components will remain disabled offline, and the existing "Blockchain requires internet" banner will remain the primary feedback mechanism.

## Error Handling & Edge Cases
- **Network Drops During Download:** If the connection drops during the proactive download, the UI will halt, display an error, and allow the user to "Resume". Existing cached tiles will remain.
- **Cache Quota Exceeded:** Browsers have storage limits (though 15-50MB is well within standard limits). We will catch `QuotaExceededError` if it occurs and alert the user.

## Data Flow
1. User clicks "Download Offline Pack".
2. `geoUtils` calculates ~300 tile URLs + ~20 image URLs.
3. Caching engine opens `map-tiles-cache`.
4. Engine fetches and `cache.put`s chunks of 10.
5. Progress state updates UI.
6. User goes offline -> MapLibre requests tile -> Service Worker intercepts -> Returns from cache.
