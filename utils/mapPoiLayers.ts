import type { Map as MapLibreMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { POI_GEOJSON_DATA } from './offlineMapStyle';

export const POI_GEOJSON_URL = '/maps/poi.geojson';

/**
 * Loads each POI marker image URL specified by the feature's `marker-image` property
 * and registers it via map.addImage() under that feature's `icon-image` property value.
 */
export async function loadPoiMarkerImages(map: MapLibreMap, features?: any[]): Promise<void> {
  if (!map) return;

  let featureList = features;

  if (!featureList || featureList.length === 0) {
    try {
      const response = await fetch(POI_GEOJSON_URL);
      if (response.ok) {
        const geojson = await response.json();
        featureList = geojson?.features;
      }
    } catch (_) {
      // Offline fallback
    }
  }

  if (!featureList || featureList.length === 0) {
    featureList = (POI_GEOJSON_DATA as any).features || [];
  }

  const loadedIds = new Set<string>();

  for (const feature of featureList) {
    const props = feature.properties || {};
    const iconId = props['icon-image'];
    const markerImageUrl = props['marker-image'];

    if (!iconId || !markerImageUrl || loadedIds.has(iconId)) {
      continue;
    }

    loadedIds.add(iconId);

    if (map.hasImage(iconId)) {
      continue;
    }

    try {
      const res = await map.loadImage(markerImageUrl);
      if (res?.data && !map.hasImage(iconId)) {
        map.addImage(iconId, res.data);
      }
    } catch (err) {
      console.warn(`[mapPoiLayers] Failed to load POI marker image: ${markerImageUrl}`, err);
    }
  }
}

/**
 * Removes or disables existing circle-marker layers so blue dots do not show underneath.
 */
export function removePoiCircleLayers(map: MapLibreMap): void {
  if (!map) return;
  const potentialCircleLayers = ['app-pois-marker', 'app-pois-circle', 'poi-circle', 'app-pois-dots'];
  for (const layerId of potentialCircleLayers) {
    try {
      const layer = map.getLayer(layerId);
      if (layer && layer.type === 'circle') {
        map.removeLayer(layerId);
      }
    } catch (_) {}
  }
}

/**
 * Integrates POI symbol markers into MapLibre GL JS:
 * 1. Loads images from `marker-image` and registers them under `icon-image`
 * 2. Removes any existing circle marker layer
 * 3. Ensures the GeoJSON source 'app-pois' exists
 * 4. Adds or updates symbol layer 'app-pois-marker' with:
 *    - 'icon-image': ['get', 'icon-image']
 *    - 'icon-size': 1.0 (native 32x32 size)
 *    - 'icon-allow-overlap': true
 *    - 'icon-ignore-placement': true
 *    - filter: ['!=', ['get', 'visibility'], false] (hiding visibility: false features)
 */
export async function setupPoiMarkerLayers(map: MapLibreMap): Promise<void> {
  if (!map) return;

  // 1. Fetch GeoJSON or fallback
  let geojsonData: any = null;
  try {
    const res = await fetch(POI_GEOJSON_URL);
    if (res.ok) {
      geojsonData = await res.json();
    }
  } catch (_) {}

  if (!geojsonData || !geojsonData.features) {
    geojsonData = POI_GEOJSON_DATA;
  }

  // 2. Load all feature images
  await loadPoiMarkerImages(map, geojsonData.features);

  // 3. Remove any existing circle layers for POIs so blue dots don't show underneath
  removePoiCircleLayers(map);

  // 4. Ensure source 'app-pois' exists
  const existingSource = map.getSource('app-pois') as maplibregl.GeoJSONSource | undefined;
  if (!existingSource) {
    try {
      map.addSource('app-pois', {
        type: 'geojson',
        data: geojsonData || POI_GEOJSON_URL,
      });
    } catch (e) {
      console.warn('[mapPoiLayers] addSource notice:', e);
    }
  } else if (geojsonData && typeof existingSource.setData === 'function') {
    try {
      existingSource.setData(geojsonData);
    } catch (_) {}
  }

  // 5. If layer exists as circle, remove it
  const existingLayer = map.getLayer('app-pois-marker');
  if (existingLayer && existingLayer.type !== 'symbol') {
    try {
      map.removeLayer('app-pois-marker');
    } catch (_) {}
  }

  // 6. Add or update the symbol layer
  if (!map.getLayer('app-pois-marker')) {
    try {
      map.addLayer({
        id: 'app-pois-marker',
        type: 'symbol',
        source: 'app-pois',
        minzoom: 10,
        maxzoom: 24,
        filter: ['!=', ['get', 'visibility'], false],
        layout: {
          'icon-image': ['get', 'icon-image'],
          'icon-size': 1.0,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-anchor': 'center',
        },
      });
    } catch (e) {
      console.warn('[mapPoiLayers] addLayer notice:', e);
    }
  } else {
    try {
      map.setFilter('app-pois-marker', ['!=', ['get', 'visibility'], false]);
      map.setLayoutProperty('app-pois-marker', 'icon-image', ['get', 'icon-image']);
      map.setLayoutProperty('app-pois-marker', 'icon-size', 1.0);
      map.setLayoutProperty('app-pois-marker', 'icon-allow-overlap', true);
      map.setLayoutProperty('app-pois-marker', 'icon-ignore-placement', true);
      map.setLayoutProperty('app-pois-marker', 'icon-anchor', 'center');
    } catch (_) {}
  }

  // Update legacy poi-icons layer if present
  if (map.getLayer('poi-icons')) {
    try {
      map.setFilter('poi-icons', ['!=', ['get', 'visibility'], false]);
      map.setLayoutProperty('poi-icons', 'icon-image', ['get', 'icon-image']);
      map.setLayoutProperty('poi-icons', 'icon-size', 1.0);
      map.setLayoutProperty('poi-icons', 'icon-allow-overlap', true);
      map.setLayoutProperty('poi-icons', 'icon-ignore-placement', true);
      map.setLayoutProperty('poi-icons', 'icon-anchor', 'center');
    } catch (_) {}
  }

  // 7. Cursor handlers (markers are non-interactive display icons)
  if (!(map as any)._poiInteractionHooked) {
    (map as any)._poiInteractionHooked = true;

    map.on('mouseenter', 'app-pois-marker', () => {
      map.getCanvas().style.cursor = 'default';
    });
    map.on('mouseleave', 'app-pois-marker', () => {
      map.getCanvas().style.cursor = '';
    });
  }
}

