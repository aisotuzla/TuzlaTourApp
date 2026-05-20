# Offline Vector Map with PMTiles — Design Spec

**Date:** 2026-05-20  
**Status:** Approved

## Problem Statement

The offline map does not render because of three compounding bugs:

1. **Tile type mismatch**: `tuzla.pmtiles` contains MVT (vector) tiles (tile_type=1), but `offline-style.json` declares the source as `"type": "raster"`. MapLibre silently fails to render.
2. **Service worker gap**: `src/service-worker.ts` has no route for `.pmtiles` files. PMTiles works via HTTP Range requests — when offline, these hit the SW which has no handler. The runtime caching config in `vite.config.ts` is dead code because the app uses `injectManifest` strategy.
3. **Cache strategy bug**: `offlineManager.ts` caches the full `.pmtiles` file with a plain `fetch()`/`cache.put()`, but the SW needs `RangeRequestsPlugin` to serve individual tile byte-ranges from the cached archive.

## PMTiles File Analysis

- **Format**: PMTiles v3, Protomaps Basemap
- **Tile type**: MVT (vector), gzip compressed
- **Tiles**: 434 entries, zoom 0–15
- **Bounds**: 18.55–18.75 lon, 44.45–44.57 lat (covers Tuzla)
- **Size**: 4.2 MB
- **Vector layers**: `earth`, `water`, `landcover`, `landuse`, `roads`, `buildings`, `places`, `pois`, `boundaries`

## Solution: Custom Dark Vector Style + SW Fixes

### 1. Rewrite `public/style/offline-style.json`

Change the source from `raster` to `vector`, pointing at the same PMTiles URL. Write ~20 MapLibre style layers rendering the Protomaps basemap schema with a dark theme.

**Source definition:**
```json
{
  "protomaps": {
    "type": "vector",
    "url": "pmtiles:///maps/tuzla.pmtiles",
    "attribution": "© OpenStreetMap"
  }
}
```

**Layer stack (bottom → top):**

| Order | Layer ID | Type | Source-layer | Purpose |
|-------|----------|------|--------------|---------|
| 1 | `background` | background | — | Dark base `#0f172a` |
| 2 | `earth` | fill | `earth` | Land mass `#1e293b` |
| 3 | `landuse-park` | fill | `landuse` | Parks/green `#1a2e1a` |
| 4 | `landuse-other` | fill | `landuse` | Residential/commercial areas |
| 5 | `water` | fill | `water` | Rivers, lakes `#1e3a5f` |
| 6 | `water-line` | line | `water` | Streams, rivers |
| 7 | `boundaries` | line | `boundaries` | Admin borders, dashed |
| 8 | `roads-minor` | line | `roads` | Residential, service roads |
| 9 | `roads-major` | line | `roads` | Primary, secondary roads |
| 10 | `roads-highway` | line | `roads` | Motorways, trunks |
| 11 | `bridges` | line | `roads` | Bridge roads (filter `is_bridge`) |
| 12 | `buildings` | fill-extrusion | `buildings` | 3D building footprints |
| 13 | `road-labels` | symbol | `roads` | Street names |
| 14 | `places-labels` | symbol | `places` | City/neighborhood names |
| 15 | `poi-labels` | symbol | `pois` | OSM POI names |
| 16 | `app-buildings` | fill-extrusion | `app-buildings` | App buildings.geojson overlay |
| 17 | `tour-route` | line/circle | `tour-data` | TuzlaTourGuide.geojson |
| 18 | `poi-icons` | circle | `app-pois` | poi.geojson — top layer |

**GeoJSON sources (unchanged from current config):**
- `app-buildings`: `/MAP/buildings.geojson`
- `tour-data`: `/maps/TuzlaTourGuide.geojson`
- `app-pois`: `/poi.geojson`

**Color palette:**
- Background: `#0f172a`
- Earth: `#1e293b`
- Water: `#1e3a5f`
- Parks: `#1a2e1a`
- Roads minor: `#334155`, major: `#64748b`, highway: `#94a3b8`
- Buildings: `#334155`, extrusion opacity 0.5
- Labels: `#e2e8f0` with dark halo `#0f172a`

### 2. Fix `src/service-worker.ts`

Add a dedicated route for PMTiles files with Range request support:

```typescript
registerRoute(
  ({ url }) => url.pathname.endsWith('.pmtiles'),
  new CacheFirst({
    cacheName: 'pmtiles-cache',
    plugins: [
      new RangeRequestsPlugin(),
      new CacheableResponsePlugin({ statuses: [200, 206] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);
```

This must be placed **before** the generic image/video routes so it matches first.

### 3. Fix `utils/offlineManager.ts`

Update the cache bucket for `.pmtiles` files to match the SW route's `cacheName`:
- Change from `local-map-tiles` to `pmtiles-cache`
- This ensures the SW's CacheFirst strategy finds the pre-cached file

### 4. Components (minimal changes)

- **MapView.tsx**: Already registers PMTiles protocol at module level. No changes needed.
- **MapQuestView.tsx**: Already registers protocol. No changes needed.
- **Parking.tsx**: Needs PMTiles protocol registration if it uses offline style. Add same pattern as MapView.

### 5. Clean up `vite.config.ts`

The runtime caching rules for `.pmtiles` added to `vite.config.ts` are dead code with `injectManifest` strategy. They can be removed for clarity, but are harmless. Low priority.

## Testing Strategy

1. Run dev server, open map — verify vector tiles render with dark style
2. Use DevTools Application → Cache Storage to verify `.pmtiles` is cached after offline download
3. Toggle DevTools "Offline" mode — verify map still renders
4. Check that all GeoJSON overlay layers (buildings, tour, POIs) appear on top of the vector base
5. Verify the Parking component map also works offline

## Files Changed

| File | Scope |
|------|-------|
| `public/style/offline-style.json` | Full rewrite (~150 lines) |
| `src/service-worker.ts` | Add 1 route (~10 lines) |
| `utils/offlineManager.ts` | Fix cache bucket name (~2 lines) |
| `components/Parking.tsx` | Add PMTiles protocol init (~3 lines) |

## Out of Scope

- Removing old raster tiles from `public/maps/tiles/` (can be done later)
- Font glyphs for label rendering (MapLibre uses built-in fonts)
- Online style changes (Geoapify style continues to work as-is)
