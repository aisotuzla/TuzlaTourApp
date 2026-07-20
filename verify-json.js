import fs from 'fs';
try {
  const content = fs.readFileSync('public/manifest.json', 'utf8');
  JSON.parse(content);
  console.log("JSON is valid!");
} catch (e) {
  console.error("JSON parse error:", e);
}
