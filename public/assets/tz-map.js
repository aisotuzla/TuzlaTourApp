const map = new maplibregl.Map({
    container: 'tz-map',
    style: 'https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=65090a03070e4e1898694f7a18ba415b',
});
map.on('load', () => {
    map.setPaintProperty('background', 'background-color', '#fff0df');
    map.setPaintProperty('landcover-glacier', 'fill-color', '#fffcfc');
    map.setPaintProperty('landuse-residential', 'fill-color', 'rgba(176,176,176,0.2)');
    map.setPaintProperty('landuse-commercial', 'fill-color', 'rgba(232,188,188,0.23)');
    map.setPaintProperty('landuse-industrial', 'fill-color', 'rgba(229,222,193,0.34)');
    map.setPaintProperty('park', 'fill-color', '#d9ffb3');
    map.setPaintProperty('park-outline', 'line-width', 5);
    map.setLayoutProperty('park-outline', 'visibility', 'none');
    map.setPaintProperty('landcover-grass', 'fill-color', '#d1f8a9');
    map.setPaintProperty('landcover-grass-park', 'fill-color', '#c2dba9');
    map.setPaintProperty('water', 'fill-color', '#94c5f5');
    map.setPaintProperty('building', 'fill-color', '#67686a');
    map.setPaintProperty('building-top', 'fill-color', '#c9ccd8');
    map.setPaintProperty('aeroway-area', 'fill-color', '#eeeeee');
    map.setPaintProperty('aeroway-runway', 'line-color', '#d4cece');
    map.setPaintProperty('highway-minor', 'line-color', '#ffffff');
    map.setPaintProperty('highway-minor', 'line-width', { "base": 1.2, "stops": [[13.5, 0], [14, 2.826086956521739], [20, 13]] });
    map.setPaintProperty('highway-secondary-tertiary', 'line-color', '#fff4a2');
    map.setPaintProperty('highway-secondary-tertiary', 'line-width', { "base": 1.2, "stops": [[6.5, 0], [8, 0.5769230769230769], [20, 15]] });
    map.setPaintProperty('highway-primary', 'line-color', '#f7dc70');
    map.setPaintProperty('highway-primary', 'line-width', { "base": 1.2, "stops": [[8.5, 0], [9, 0.5555555555555556], [20, 20]] });
    map.setPaintProperty('highway-trunk', 'line-color', '#e8d588');
    map.setPaintProperty('highway-trunk', 'line-width', { "base": 1.2, "stops": [[6.5, 0], [7, 0.5555555555555556], [20, 20]] });
    map.setPaintProperty('highway-motorway', 'line-color', '#fdb34f');
    map.setPaintProperty('highway-motorway', 'line-width', { "base": 1.2, "stops": [[6.5, 0], [7, 0.6111111111111112], [20, 22]] });
    map.setPaintProperty('poi-level-3', 'text-color', '#424040');
    map.setPaintProperty('poi-level-2', 'text-color', '#645b5b');
    map.setPaintProperty('poi-level-1', 'text-color', '#6a6f83');
    map.setLayoutProperty('road_oneway', 'text-size', 1);
    map.setLayoutProperty('place-other', 'text-size', { "base": 1.2, "stops": [[12, 10.714285714285714], [15, 15]] });
    map.setLayoutProperty('place-city', 'text-size', { "base": 1.2, "stops": [[7, 14.583333333333334], [11, 25]] });
});
