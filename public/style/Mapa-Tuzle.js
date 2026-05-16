https://maps.geoapify.com/v1/styles/osm-liberty/style.json
https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png

const map = new maplibregl.Map({
    container: 'my-map',
    style: 'https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=65090a03070e4e1898694f7a18ba415b',
});


map.on('load', () => {
    map.setPaintProperty('background', 'background-color', '#f2ebc9');
    map.setPaintProperty('park', 'fill-color', '#d1e8b9');
    map.setPaintProperty('park_outline', 'line-color', '#b4f275');
    map.setPaintProperty('landuse_residential', 'fill-color', 'rgba(215,190,154,0.49)');
    map.setPaintProperty('landcover_wood', 'fill-color', 'rgba(148,203,117,0.7)');
    map.setPaintProperty('landcover_grass', 'fill-color', '#a0d381');
    map.setPaintProperty('landuse_cemetery', 'fill-color', '#f0f4e4');
    map.setPaintProperty('landuse_hospital', 'fill-color', '#ffd7eb');
    map.setPaintProperty('landuse_school', 'fill-color', '#f1f4b7');
    map.setLayoutProperty('waterway_tunnel', 'visibility', 'none');
    map.setPaintProperty('water', 'fill-color', '#8caff8');
    map.setPaintProperty('aeroway_runway', 'line-color', '#d9d6d3');
    map.setPaintProperty('road_area_pattern', 'fill-color', '#f2f5f6');
    map.setPaintProperty('road_motorway_link_casing', 'line-color', '#ff9437');
    map.setPaintProperty('road_minor_casing', 'line-color', '#3e3b38');
    map.setPaintProperty('road_secondary_tertiary_casing', 'line-color', '#d58a48');
    map.setPaintProperty('road_secondary_tertiary_casing', 'line-width', {"base":1.2,"stops":[[8,1.5882352941176472],[20,18]]});
    map.setPaintProperty('road_trunk_primary_casing', 'line-color', '#f0a461');
    map.setPaintProperty('road_motorway_casing', 'line-color', '#f49e53');
    map.setPaintProperty('road_path_pedestrian', 'line-color', '#a06346');
    map.setPaintProperty('road_path_pedestrian', 'line-width', {"base":1.2,"stops":[[14,0.30000000000000004],[20,3]]});
    map.setPaintProperty('road_motorway_link', 'line-color', '#e5972f');
    map.setPaintProperty('road_service_track', 'line-color', '#ecdcdc');
    map.setPaintProperty('road_minor', 'line-width', {"base":1.2,"stops":[[13.5,0],[14,2.638888888888889],[20,19]]});
    map.setPaintProperty('road_secondary_tertiary', 'line-color', '#fce174');
    map.setPaintProperty('road_secondary_tertiary', 'line-width', {"base":1.2,"stops":[[6.5,0],[8,0.5769230769230769],[20,15]]});
    map.setPaintProperty('road_trunk_primary', 'line-color', '#ffb16e');
    map.setPaintProperty('road_motorway', 'line-color', '#db9b45');
    map.setPaintProperty('road_one_way_arrow', 'text-color', '#b3acac');
    map.setLayoutProperty('road_one_way_arrow', 'text-size', 1);
    map.setPaintProperty('road_one_way_arrow_opposite', 'text-color', '#b0abab');
    map.setLayoutProperty('road_one_way_arrow_opposite', 'text-size', 1);
    map.setPaintProperty('building-3d', 'fill-extrusion-color', '#c9c2c2');
    map.setLayoutProperty('water_name_line', 'visibility', 'none');
    map.setLayoutProperty('water_name_point', 'visibility', 'none');
    map.setLayoutProperty('poi_transit', 'text-size', 13);
    map.setPaintProperty('road_label', 'text-color', '#5d5858');
    map.setLayoutProperty('road_label', 'text-size', {"base":1,"stops":[[13,9.23076923076923],[14,10]]});
    map.setPaintProperty('road_shield', 'text-color', '#2e2a2a');
});
