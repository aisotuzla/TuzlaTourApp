# Specification: Offline Map Reliability Fix

## Problem Description
Users report that maps are "completely blank" when the app is used offline, both in the Android app (Capacitor) and mobile browsers. 

### Root Causes Identified
1.  **Fragile Offline Detection**: The app relies on `navigator.onLine`, which can return a false positive if connected to a network with no internet access.
2.  **OpenStreetMap Fallback**: The current fallback for style errors tries to load OpenStreetMap tiles, which are also online-only.
3.  **Pathing Issues**: Absolute paths (`/assets/...`) can fail in Capacitor or specific PWA scopes.
4.  **Encoding Conflict**: The `tuzla-map.geojson` file appears to be encoded in `UTF-16LE`, whereas most web tools and MapLibre expect `UTF-8`.

## Proposed Changes

### 1. Map Logic Overhaul
Modify `MapQuestView.tsx` and `MapView.tsx` to handle network failures more gracefully:
- **Active Monitoring**: Listen for `error` events on the map instance.
- **Fail-Safe Switch**: If a style load fails due to connectivity (`Failed to fetch`), immediately trigger a switch to the local `geojson` source.
- **Path Correction**: Use relative paths (`assets/tuzla-map.geojson`) instead of absolute ones.

### 2. Data Sanitization
- Convert `public/assets/tuzla-map.geojson` from `UTF-16LE` to standard `UTF-8`.
- Verify the GeoJSON structure is valid for MapLibre GL JS version 8 styles.

### 3. User Interface Enhancements
- Add a floating badge (indicator) when the map is in "Offline/Saved Mode".
- **Visual Design**: 
    - Color: Blue/Cyan theme.
    - Icon: Pulsing dot (blue).
    - Text: "SAVED OFFLINE MAP DATA".

### 4. PWA Maintenance
- Ensure `vite.config.ts` correctly handles the 14MB file in the precache manifest.
- Increase the `maximumFileSizeToCacheInBytes` if necessary (currently 30MB, which is sufficient).

## Verification Plan

### Automated Verification
- Check the console for 404s or encoding errors when running in the browser.
- Verify the GeoJSON content-type and encoding via shell commands.

### Manual Verification
1.  Open the app in Chrome/Edge, go to DevTools -> Network, and check "Offline".
2.  Reload the map and verify it switches to the "Offline Mode" badge and renders the GeoJSON.
3.  Test on Android emulator/device by disabling WiFi/Data.
