# Cleanup & Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the codebase by removing unused files, and enhance the offline map and security UI for a more premium experience.

**Architecture:** 
1. Direct file deletion for cleanup.
2. Conditional source/layer injection in MapView for offline 3D buildings.
3. CSS and Framer Motion animation updates in SecurityGuard.

**Tech Stack:** React, MapLibre GL, Tailwind CSS, Framer Motion

---

## Proposed Changes

### Task 1: Cleanup Unused Files

**Files:**
- [DELETE] `public/MAP/tuzla.osm.pbf`
- [DELETE] `Doc/09.04.26.code-workspace`

- [ ] **Step 1: Remove the OSM PBF file**
Run: `rm public/MAP/tuzla.osm.pbf`

- [ ] **Step 2: Remove the Doc workspace folder**
Run: `rm -rf Doc/`

---

### Task 2: MapView 3D Offline Support

**Files:**
- [MODIFY] `components/MapView.tsx`

- [ ] **Step 1: Update the map style initialization to include Overture sources in offline mode**
Modify `components/MapView.tsx` around line 132. When `!isOnline`, add the building sources to the `sources` object and add `fill-extrusion` layers.

```tsx
// Inside MapView.tsx, within the map initialization useEffect:
const style: any = !isOnline ? {
  version: 8,
  sources: {
    'tuzla': { type: 'geojson', data: '/assets/tuzla-map.geojson' },
    'buildings-1': { type: 'geojson', data: '/MAP/overture-2026-03-18.0-building-18.669,44.534,18.692,44.546.geojson' },
    'buildings-2': { type: 'geojson', data: '/MAP/overture-2026-03-18.0-building-18.672,44.530,18.695,44.542.geojson' }
  },
  layers: [
    // ... existing layers ...
    {
      id: '3d-buildings-offline-1',
      source: 'buildings-1',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#cbd5e1',
        'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
        'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
        'fill-extrusion-opacity': 0.9
      }
    },
    {
      id: '3d-buildings-offline-2',
      source: 'buildings-2',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#cbd5e1',
        'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
        'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
        'fill-extrusion-opacity': 0.9
      }
    }
  ]
} : 'https://api.jawg.io/styles/jawg-streets.json?access-token=...';
```

---

### Task 3: SecurityGuard Visual Polish

**Files:**
- [MODIFY] `components/SecurityGuard.tsx`

- [ ] **Step 1: Update Glassmorphism styles**
Update the modal container in `components/SecurityGuard.tsx` to use `backdrop-blur-2xl` and `bg-slate-950/80`.

- [ ] **Step 2: Add Shake Animation for PIN error**
Modify the PIN input section to use a Framer Motion animation triggered by an error state.

```tsx
const [isShaking, setIsShaking] = useState(false);
// ... inside the PIN check logic ...
if (!isCorrect) {
  setIsShaking(true);
  setTimeout(() => setIsShaking(false), 500);
}

// ... in the JSX ...
<motion.div
  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
  transition={{ duration: 0.4 }}
>
  {/* PIN Input dots */}
</motion.div>
```

---

## Verification Plan

### Automated Tests
- N/A (UI and Asset cleanup focus)

### Manual Verification
- **Cleanup:** Verify that the app still builds and runs correctly after deletions.
- **3D Offline:** Toggle airplane mode/offline status and verify that the map switches to 3D buildings (using the Overture data).
- **Security Guard:** Test the PIN entry flow; verify the new blur effects and animations work as expected.
