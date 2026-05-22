# Offline Raster Tiles Implementation Design

## 1. Context & Objectives
The goal is to implement offline mapping functionality using a pre-rendered pyramid of raster PNG tiles (zoom levels 14 to 16) instead of PMTiles. We need to implement a mechanism to cache these 143 tile images so the app works reliably without an internet connection. Additionally, UI issues related to the navigation popup positioning and 3D building heights need to be resolved.

## 2. Approach: Raster Tile Manifest
We will use **Option A (Brute-Force Caching)** since the total number of tiles is very small (~143 images). 

**Implementation Steps:**
1. **Tile Manifest:** A `tiles.json` manifest file has been generated in `public/maps/tiles.json` containing the URLs of all 143 PNG tiles.
2. **Download Manager:** Modify `offlineManager.ts` to fetch `tiles.json` during the offline map download process, and append all the tile URLs to the main download queue.
3. **Caching Strategy:** The service worker is already set up to intercept `/maps/tiles/` paths with a `CacheFirst` strategy. The offline manager will populate this cache.

## 3. Zoom Level Locking
The user requested locking the zoom between 14 and 16 when offline.
- Update `MapQuestView.tsx` (and `MapView.tsx` if applicable) to enforce `minZoom: 14` and `maxZoom: 16` whenever the offline style is being used, ensuring the user cannot zoom out to areas where we have no offline tiles.

## 4. UI Refinements
- **Navigation Popup Centering:** The navigation distance/duration HUD in `MapQuestView.tsx` is currently getting cut off on mobile. We will remove the conflicting `left-1/2 -translate-x-1/2` utility classes combined with Framer Motion's `x: '-50%'`, and instead use `inset-x-0 mx-auto` to allow CSS to naturally center the absolute element without transform conflicts.
- **Building Heights:** Update `public/style/offline-style.json` to significantly increase the `fill-extrusion-height` multiplier from `1.8x` to `3.5x` to ensure 3D buildings are visibly towering over the map in offline mode.

## 5. Summary of Affected Files
- `public/maps/tiles.json` (New file)
- `utils/offlineManager.ts`
- `components/MapQuestView.tsx`
- `public/style/offline-style.json`
