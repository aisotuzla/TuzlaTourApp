import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

const root = process.cwd();

// Targets for flatDir removal
const targets = [
  path.join(root, "android", "app", "build.gradle"),
  path.join(root, "android", "capacitor-cordova-android-plugins", "build.gradle"),
];

function removeFlatDirRepos(content) {
  return content.replace(
    /repositories\s*\{\s*google\(\)\s*mavenCentral\(\)\s*flatDir\s*\{\s*dirs\s+['"][^'"]+['"]\s*,\s*['"][^'"]+['"]\s*\}\s*\}/gms,
    "repositories {\n    google()\n    mavenCentral()\n}"
  );
}

function fixGradleVersionCheck(content) {
  // First, repair any broken state from previous runs
  let fixed = content.replace(
    /\/\/ buildscript block removed by fix-capacitor-gradle\.mjs to avoid Gradle version mismatch\n\s+\}/g,
    "buildscript {"
  );

  // Then apply the safe comment-out fix
  return fixed.replace(
    /(?<!\/\/ )(classpath ['"]com\.android\.tools\.build:gradle:.*['"])/g,
    "// $1 // Commented by fix-capacitor-gradle.mjs"
  );
}

let changed = 0;

// Fix standard targets
for (const filePath of targets) {
  if (!fs.existsSync(filePath)) continue;

  const original = fs.readFileSync(filePath, "utf8");
  const updated = removeFlatDirRepos(original);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    changed += 1;
    console.log(`Updated: ${path.relative(root, filePath)}`);
  }
}

// Fix plugin targets in node_modules
const pluginBuildFiles = globSync("node_modules/@capacitor/**/android/build.gradle");
for (const filePath of pluginBuildFiles) {
  const original = fs.readFileSync(filePath, "utf8");
  
  // We want to remove the buildscript block in plugins because it causes AGP to perform
  // independent version checks that can fail if the environment isn't perfectly aligned
  // even if the root project is correct.
  let updated = fixGradleVersionCheck(original);
  updated = removeFlatDirRepos(updated);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    changed += 1;
    console.log(`Patched Plugin Build: ${path.relative(root, filePath)}`);
  }
}

if (changed === 0) {
  console.log("No Gradle fix targets found.");
} else {
  console.log(`Successfully applied ${changed} Gradle fixes.`);
}

