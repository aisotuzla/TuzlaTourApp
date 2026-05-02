# Design Spec: MapLibre Optimization for Mobile

**Date**: 2026-03-28  
**Topic**: High-performance mapping and bundle optimization for the Tuzla Tour App.

## 1. Goal
Reduce the initial bundle size, eliminate "large chunk" warnings, and optimize runtime performance for mobile devices while preserving essential features like 3D buildings.

## 2. Architecture & Components

### 2.1 Dynamic Loading (Approach 1)
- **Lazy Loading**: `MapView` and `MapQuestView` will be converted to `React.lazy` imports.
- **Suspense**: A `<Suspense>` boundary in `App.tsx` will display a themed loading state while the mapping engine (~1MB) is downloaded.
- **Impact**: Dramatically faster initial load of the landing page and non-map tabs.

### 2.2 Core Cleanup (Approach 2)
- **Library Removal**: Full removal of `leaflet`, `react-leaflet`, and `@types/leaflet` from the project.
- **Data Cleanup**: Removal of the 7MB `public/assets/tiles` directory (legacy raster tiles) which are redundant due to Jawg Vector Tiles.
- **Quest Migration**: Final code adjustments to ensure any remaining `Quest.tsx` logic is fully integrated into the MapLibre engine.

### 2.3 Mobile-First Styling & 3D (Approach 3)
- **3D Logic**: Implement zoom-based visibility for 3D buildings (only visible at zoom > 15.5) to protect mobile GPU/memory.
- **Init Optimization**: Set `antialias: false` and `maxPitch: 60` in all MapLibre instances.
- **Terrain**: Ensure `terrain` and `fog` are explicitly disabled to save CPU cycles.

## 3. Data Flow
- Initial request -> Landing Page (Small Bundle).
- User clicks Map -> MapLibre Bundle Downloaded -> Map Loaded.
- Memory monitoring -> Clear map cache on Tab switch if memory is low (future-proofing).

## 4. Error Handling
- **Loading Failure**: Display a retry button if the dynamic chunk fails to download (e.g., poor connection).
- **GPU Failure**: Clear fallback message if the device doesn't support WebGL/MapLibre.

## 5. Verification Plan
- **Bundle Audit**: Run `npm run build` and verify `index.js` is < 200kB and map chunks are isolated.
- **Performance**: Test map interaction on a mobile device (60fps target at high zoom).
- **Space**: Verify `public/assets/tiles` is removed and total package size is reduced by ~8MB+.
