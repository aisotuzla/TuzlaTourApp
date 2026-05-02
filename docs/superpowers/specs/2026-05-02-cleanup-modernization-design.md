# Spec: Cleanup & Modernization Design (2026-05-02)

## 1. Goal
Clean up the repository by removing unused source data and metadata, and improve the offline experience and security UI visuals.

## 2. Proposed Changes

### 2.1 File Cleanup
- **Delete** `public/MAP/tuzla.osm.pbf`: This 1.1MB file is a source binary used for processing but is not required by the web application at runtime.
- **Delete** `Doc/` folder: Contains only a `.code-workspace` file which is not part of the production application or standard development environment.

### 2.2 MapView: 3D Offline Enhancement
- **Source Update:** Add the following two GeoJSON files as sources when `isOnline` is false:
    - `MAP/overture-2026-03-18.0-building-18.669,44.534,18.692,44.546.geojson`
    - `MAP/overture-2026-03-18.0-building-18.672,44.530,18.695,44.542.geojson`
- **Layer Update:** Re-enable the `3d-buildings` (fill-extrusion) layer in offline mode by mapping these sources. This ensures users have a consistent 3D experience even without an active internet connection.

### 2.3 SecurityGuard: Visual Polish
- **Glassmorphism:** Upgrade the `SecurityGuard` modal to use `backdrop-blur-2xl` with a semi-transparent dark slate background (`bg-slate-950/80`).
- **Animations:**
    - Use Framer Motion `AnimatePresence` for smoother entry/exit.
    - Implement a "shake" animation on PIN error.
    - Add a subtle pulse effect to the "Unlocked" checkmark.

## 3. Verification Plan
### Manual Verification
- **Cleanup:** Verify that the app still builds and runs correctly after deletions.
- **3D Offline:** Toggle airplane mode/offline status and verify that the map switches to 3D buildings (using the Overture data).
- **Security Guard:** Test the PIN entry flow; verify the new blur effects and animations work as expected.
