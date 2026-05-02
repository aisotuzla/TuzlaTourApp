import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const rootDir = process.cwd();

async function walkCode(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    const normalizedPath = filePath.split(path.sep).join('/');
    if (['node_modules', '.git', 'android', 'ios', '.expo', 'public/assets'].some(ex => normalizedPath.includes(ex))) continue;
    
    if (file.isDirectory()) {
      results = results.concat(await walkCode(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
      results.push(filePath);
    }
  }
  return results;
}

async function verify() {
  const files = await walkCode(rootDir);
  const assetRegex = /['"\`](\/assets\/[^'"\`]+)['"\`]/g;
  let missingAssets = [];
  let totalChecked = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    let match;
    while ((match = assetRegex.exec(content)) !== null) {
      const assetPath = match[1];
      // Map to full path (assuming it maps to d:/TuzlaTourApp/public/assets or d:/TuzlaTourApp/assets)
      // Standard for Expo/Vite is usually public/assets or assets. Let's try both.
      const p1 = path.join(rootDir, 'public', assetPath);
      const p2 = path.join(rootDir, assetPath); // if assetPath already has /assets
      
      let exists = false;
      if (existsSync(p1)) exists = true;
      else if (existsSync(p2)) exists = true;
      
      totalChecked++;
      if (!exists) {
        // Special case: ignore map tile templates like {z}/{x}/{y}
        if (!assetPath.includes('{z}')) {
          missingAssets.push({ file, assetPath });
        }
      }
    }
  }

  console.log(`Checked ${totalChecked} local asset references.`);
  if (missingAssets.length > 0) {
    console.error(`Found ${missingAssets.length} MISSING assets:`);
    missingAssets.forEach(m => console.error(`  - ${m.assetPath} (in ${m.file})`));
  } else {
    console.log('All local asset references exist! ✅');
  }

  // Find http links
  let links = [];
  const linkRegex = /https?:\/\/[^'"\`\s]+/g;
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[0]);
    }
  }
  
  // Deduplicate and ignore tile server URLs
  const uniqueLinks = [...new Set(links)].filter(l => !l.includes('{s}.tile'));
  console.log(`\nFound ${uniqueLinks.length} external links. Ensure these are intended and working:`);
  uniqueLinks.slice(0, 5).forEach(l => console.log(`  ${l}`));
  if (uniqueLinks.length > 5) console.log(`  ...and ${uniqueLinks.length - 5} more.`);
}

verify().catch(console.error);
