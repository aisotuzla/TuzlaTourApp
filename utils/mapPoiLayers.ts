import type { Map as MapLibreMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { POI_GEOJSON_DATA } from './offlineMapStyle';

import { QUEST_TARGETS } from '../constants/questData';
import { LOCATIONS } from '../constants';

export const POI_GEOJSON_URL = '/maps/poi.geojson';

/**
 * Loads each POI marker image URL specified by the feature's `marker-image` property
 * and registers it via map.addImage() under that feature's `icon-image` property value.
 */
export async function loadPoiMarkerImages(map: MapLibreMap, features?: any[]): Promise<void> {
  if (!map) return;

  let featureList: any[] = features || [];

  if (featureList.length === 0) {
    try {
      const response = await fetch(POI_GEOJSON_URL);
      if (response.ok) {
        const geojson = await response.json();
        featureList = geojson?.features || [];
      }
    } catch (_) {
      // Offline fallback
    }
  }

  if (featureList.length === 0) {
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
export async function setupPoiMarkerLayers(map: MapLibreMap, lang: string = 'bs'): Promise<void> {
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

  // 7. Interactive click & hover handlers
  if (!(map as any)._poiInteractionHooked) {
    (map as any)._poiInteractionHooked = true;

    map.on('click', 'app-pois-marker', (e) => {
      if (!e.features || !e.features[0]) return;
      const f = e.features[0];
      const props = f.properties || {};
      const geom = f.geometry as any;
      if (geom?.type !== 'Point') return;
      const coords = geom.coordinates.slice() as [number, number];
      const title = (lang === 'en' ? (props.name || props.name_bs) : (props.name_bs || props.name)) || 'POI';
      const markerImg = props['marker-image'] || '';

      // Match target in QUEST_TARGETS and LOCATIONS for rich info (description, audio, image)
      const rawName = (props.name || props.name_bs || '').toLowerCase();
      const rawIcon = (props['icon-image'] || props.image || '').toLowerCase();
      const target = QUEST_TARGETS.find(q => 
        q.id.toLowerCase() === rawName ||
        q.name.bs.toLowerCase() === rawName ||
        q.name.en.toLowerCase() === rawName ||
        rawIcon.includes(q.id.toLowerCase())
      );

      const loc = LOCATIONS.find(l => 
        l.id === target?.id ||
        l.id.toLowerCase() === rawName ||
        l.name.bs.toLowerCase() === rawName ||
        l.name.en.toLowerCase() === rawName
      );

      const poiId = target?.id || loc?.id || rawName;
      const displayTitle = target?.name?.[lang as 'bs' | 'en'] || (loc?.name ? (loc.name[lang as 'bs' | 'en'] || loc.name.bs) : title);
      const displayImage = target?.Image || loc?.image || markerImg || '/assets/Gallery/QuestQRLocations/trgslobode.webp';
      const description = (loc?.description ? (loc.description[lang as 'bs' | 'en'] || loc.description.bs || loc.description.en) : null) || 
        (lang === 'bs' ? 'Kulturna i historijska znamenitost grada Tuzle sa pričom i lokacijom.' : 'Cultural and historical landmark of Tuzla with rich heritage.');
      const audioUrl = target?.audio || (loc as any)?.audio || '';

      const escapedTitle = displayTitle.replace(/'/g, "\\'");
      const arGuideLabel = lang === 'bs' ? 'AR Vodič' : 'AR Guide';
      const navLabel = lang === 'bs' ? 'Navigacija' : 'Navigation';
      const audioLabel = lang === 'bs' ? 'Audio Vodič' : 'Audio Guide';

      new maplibregl.Popup({ offset: 18, maxWidth: '290px', className: 'poi-custom-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: 'Quicksand', -apple-system, sans-serif; padding: 6px; color: #0f172a;">
            ${displayImage ? `
              <div style="width: 100%; height: 110px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); background: #0f172a;">
                <img src="${displayImage}" alt="${displayTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.parentElement.style.display='none'" />
              </div>
            ` : ''}
            <div style="font-weight: 800; font-size: 14px; color: #0f172a; line-height: 1.25; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              ${markerImg ? `<img src="${markerImg}" alt="" style="width: 20px; height: 20px; object-fit: contain; border-radius: 4px;" />` : ''}
              <span>${displayTitle}</span>
            </div>
            <p style="font-size: 11px; line-height: 1.45; color: #475569; margin: 0 0 10px 0; max-height: 62px; overflow-y: auto;">
              ${description}
            </p>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button onclick="window.startArTrailFromPopup ? window.startArTrailFromPopup('${poiId}', '${escapedTitle}', ${coords[1]}, ${coords[0]}) : (window.toggleArGuide && window.toggleArGuide())" style="flex: 1 1 45%; min-width: 90px; background: linear-gradient(135deg, #d97706, #b45309); border: none; border-radius: 8px; color: white; padding: 7px 6px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 6px rgba(217,119,6,0.35);">
                📱 ${arGuideLabel}
              </button>
              ${audioUrl ? `
                <button onclick="window.playPoiAudio && window.playPoiAudio('${poiId}', '${escapedTitle}', '${audioUrl}')" style="flex: 1 1 45%; min-width: 90px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border: none; border-radius: 8px; color: white; padding: 7px 6px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 6px rgba(37,99,235,0.35);">
                  🎧 ${audioLabel}
                </button>
              ` : ''}
              <button onclick="window.startNavigationFromPopup('${escapedTitle}', ${coords[1]}, ${coords[0]})" style="flex: 1 1 100%; background: #0f172a; border: none; border-radius: 8px; color: white; padding: 6px 0; font-weight: 700; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                🧭 ${navLabel}
              </button>
            </div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'app-pois-marker', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'app-pois-marker', () => {
      map.getCanvas().style.cursor = '';
    });
  }
}

