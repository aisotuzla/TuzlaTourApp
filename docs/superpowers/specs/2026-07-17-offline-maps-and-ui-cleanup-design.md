# Offline Maps and UI Cleanup Design

## Overview
This design outlines the plan to improve the offline mapping capabilities, streamline the application's performance by removing 3D elements, and clean up the UI and quest mechanics.

## 1. Offline Maps Download Mechanism
**Goal:** Allow users to optionally download high-resolution map tiles (zoom levels 16 and 17) for offline use, without bloating the initial PWA precache.

- **UI Button:** Implement a custom MapLibre control button inside `MapQuestView.tsx` added to the `maplibregl-ctrl` group. The button will display the text: "to download offline map, click here".
- **Download Logic:** Clicking the button triggers a fetch of `OfflineMaps.geojson`. The app will parse the file for tile URLs (specifically z16 and z17), fetch them sequentially or in small batches, and cache them using the browser's Cache API into a named cache (e.g., `manual-offline-tiles-cache`).
- **Workbox Configuration:** In `vite.config.ts`, Workbox runtime caching will be configured to intercept map tile requests with a `CacheFirst` strategy. It will automatically serve tiles from the manual cache when offline, ensuring these heavy assets are strictly downloaded only with user permission.

## 2. Performance: 3D & A-Frame Removal
**Goal:** Ensure the app feels "snapping fast" by removing heavy 3D rendering overhead.

- **A-Frame Removal:** Strip all A-Frame CDN scripts from `index.html` and `vite.config.ts`.
- **Asset Cleanup:** Remove logic that loads `.glb` files and tear out any 3D rendering logic across the application.

## 3. Quest Unlocking & Rewards UI
**Goal:** Simplify the quest mechanics to rely entirely on QR codes and organize unlocked content cleanly.

- **Unlocking Logic:** Remove GPS/location-based unlocking constraints for all quests, except for the "frida" quest target which retains its specific behavior. All other quests will unlock *only* via QR code scan.
- **Pulse Removal:** Remove the purple pulsing animation from map markers within `MapQuestView.tsx`.
- **Rewards Tab:** Introduce a new "Rewards" floating tab navigation element. Unlocked quests will be removed from standard map clutter and listed under this new tab alongside other collected items.

## 4. Scanner and Accessibility Adjustments
**Goal:** Improve usability for QR scanning and app navigation.

- **QR Scanner:** Enlarge the scanner UI layout in `MapQuestView.tsx` to make scanning easier and more forgiving for users.
- **Menu Button:** Update `App.tsx` to add the text "menu" directly below the hamburger icon. This improves both visual clarity and satisfies accessibility tree requirements.
