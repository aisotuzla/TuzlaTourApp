import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/maps/OfflineMaps.geojson', 'utf8'));

console.log('Sources:', Object.keys(data.sources));

const buildingLayers = data.layers.filter(l => 
  l.id.toLowerCase().includes('building') || 
  (l.source && l.source.toLowerCase().includes('building')) ||
  (l['source-layer'] && l['source-layer'].toLowerCase().includes('building'))
);

console.log('Found building layers count:', buildingLayers.length);
if (buildingLayers.length > 0) {
  console.log('Building Layers:', buildingLayers.map(l => ({ id: l.id, type: l.type, source: l.source, 'source-layer': l['source-layer'] })));
} else {
  console.log('No building layers found.');
}
