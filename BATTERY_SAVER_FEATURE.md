# 🔋 Tuzla Tour Guide — Power & Battery Optimization

**Status:** ✅ IMPLEMENTED & VERIFIED  
**Version:** 3.0 (Non-AR Streamlined Engine)  

---

## 📋 Overview

Tuzla Tour Guide is engineered to operate for hours of outdoor sightseeing without draining the mobile device battery. Rather than running constant camera WebGL rendering pipelines or high-frequency GPS polls, the app uses hardware-conscious architectural optimizations.

---

## ⚡ Key Optimizations

### 1. Architectural Streamlining (Non-AR)
- Replaced continuous full-screen camera streaming, computer-vision surface estimation, and WebGL 3D projections with a responsive **65% 3D vector map + 35% tactical compass HUD**.
- Eliminates camera sensor heat and high GPU compute loads during navigation.

### 2. Tactical Compass HUD Throttling (`useCompassHeading.ts`)
- Device orientation (`deviceorientation` / `deviceorientationabsolute`) is throttled to **~15 FPS** with a **1.0° deadband threshold**:
  ```typescript
  if (now - lastUpdateTimeRef.current >= 66 && Math.abs(smoothed - lastEmittedRef.current) > 1.0) {
    lastUpdateTimeRef.current = now;
    lastEmittedRef.current = smoothed;
    setHeading(smoothed);
  }
  ```
- Prevents excessive React re-renders and reduces CPU usage during orientation tracking.

### 3. Adaptive GPS Smoothing (`AdaptiveLowPassFilter`)
- Uses adaptive low-pass filtering based on proximity to active target:
  - **Distance > 200m**: Heavy smoothing (0.1 alpha) to ignore minor sensor drift and avoid unnecessary map re-centering.
  - **Distance < 50m**: Moderate smoothing (0.6 alpha).
  - **Distance < 15m**: High responsiveness (0.9 alpha) for exact monument arrival.

### 4. Offline PMTiles Vector Map Caching
- Local vector map tiles (`offline-vector-style.json` & PMTiles protocol) allow full map exploration without continuous cellular data radio activation, saving significant battery in poor network areas.

### 5. On-Demand Camera Activation
- The camera is activated **only** when the user taps "Scan QR Code" and is stopped and cleared immediately upon scan completion or modal dismissal.
