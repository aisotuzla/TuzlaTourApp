# Tuzla Tour Guide

**Tuzla Tour Guide** is a modern, fast, and multilingual travel companion and city-discovery application for **Tuzla, Bosnia and Herzegovina**. It features an interactive 3D tactical map, offline PMTiles vector rendering, real-time tactical compass navigation, the interactive **Tuzla Quest** exploration game with authoritative Supabase cloud verification, an illustrated artistic map, audio guides, local gastronomy, transport guides, and itinerary planning tools.

The application is built with React 18, TypeScript, and Vite, operating as a high-performance Progressive Web App (PWA) with a native Android wrapper powered by Capacitor.

---

## 🌟 Key Features

### 🗺️ Interactive 3D Tactical Map & Offline Engine
- **3D Vector Map**: Built on MapLibre GL with Geoapify 3D buildings and custom styling.
- **Offline Capability**: Local PMTiles vector map database (`offline-vector-style.json`) pre-cached for full offline navigation without mobile data.
- **Dynamic Layer Switcher**: Seamlessly toggle between Geoapify 3D (Primary), CARTO Voyager (Fallback), and Local PMTiles (Offline).
- **Centered Interactive Popups**: POI popups with automatic viewport centering, instant audio playback, pedestrian GPS route generation, and direct QR scanner launch.

### 🧭 Tuzla Quest — Exploration Game
- **Tactical Compass HUD**: Real-time tilt-compensated compass dial, cardinal rose, target POI carousel, and live geodesic distance meter occupying the bottom 35% of the Quest screen.
- **25m GPS Proximity Detection**: Dynamic visual feedback when players enter the 25-meter perimeter of historic monuments.
- **Authoritative Supabase Verification**:
  - Anonymous guest player authentication (`auth.signInAnonymously()`).
  - Server-side PostGIS geodesic radius check (enforcing a strict 20m physical radius).
  - Cryptographic SHA-256 QR payload verification against `quests.qr_code_id`.
  - Automatic XP awards, level progression, and duplicate-scan prevention.
- **Progression Phases**:
  - **Phase 1: Foundations of Tuzla (Stara čaršija)** — Trg slobode, Stara česma, Kapija, Meša Selimović.
  - **Phase 2: Bosnian Kingdom & Heritage (Bosansko kraljevstvo)** — Tvrtko Park, Palačinkara kod Bagija, Soni trg.
  - **Phase 3: Lakes, Waterfalls & Art (Panonski mornar)** — Panonika, Slani slapovi, Slana Banja, Atelje Ismet Mujezinović.
  - **Phase 4: Grand Finale (Pobjednik Grada soli)** — Bingo City Centar.
- **Illustrated Artistic Map**: Fullscreen interactive map (`QuestMap3.webp`, 2000×3558) featuring 12 hand-drawn medallions aligned with real landmark coordinates.
- **Interactive Discoveries**:
  - Scratch-card modal for King Tvrtko monument reward.
  - Auto-playing 3D Charter of Kulin Ban stone cube at coordinates `(44.538791, 18.678778)`.

### 🎧 Audio Guides & Media
- Multilingual location narrations with a persistent floating global audio player bar.
- 270° and 360° panoramic photographic views.
- Embedded documentary and historical video footage.

### 🌆 City Guide, Gastronomy & Travel Utilities
- **History & Heritage**: Historical timeline of Tuzla from Neolithic salt extraction to the modern era.
- **Food & Dining**: Curated traditional Bosnian cevabdzinicas, bakeries, cafes, and local food delivery integration (Korpa / Glovo styling).
- **Transport & Logistics**: Airport transfers (Wizz Air / Tuzla Airport LQTZ), bus schedules, parking zones, and taxi directories.
- **Accommodation**: Comprehensive hotel listings with direct GPS navigation and booking links.
- **Task Planner & Notes**: 3-day trip planner, personal trip notebook, and local event calendar.

### 🌐 Multilingual Support
Full UI, narration, and quest support across 4 languages:
- 🇧🇦 **Bosanski** (BS)
- 🇬🇧 **English** (EN)
- 🇩🇪 **Deutsch** (DE)
- 🇹🇷 **Türkçe** (TR)

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite 6 |
| **Styling & Animation** | Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Mapping & Geospatial** | MapLibre GL, PMTiles, Geoapify Routing API, PostGIS |
| **Backend & Cloud DB** | Supabase (PostgreSQL, PostGIS, Auth, Database RPCs) |
| **Mobile Runtime** | Capacitor 8 (Android release APK & App Bundle) |
| **QR Engine** | html5-qrcode (Camera stream resolution) |
| **Offline & PWA** | vite-plugin-pwa, Workbox Service Worker |
| **Telemetry & Privacy** | Vercel Analytics, Speed Insights (Strict opt-in consent) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js **20.x** or **24.x**
- npm 10+
- Android Studio (for native Android builds)

### 1. Installation
```powershell
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```dotenv
VITE_SUPABASE_URL=https://czfoblgsqrrccoibboca.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=czfoblgsqrrccoibboca
VITE_GEOAPIFY_KEY=your_geoapify_api_key
```

### 3. Development Server
```powershell
npm run dev
```

### 4. Production Build
```powershell
npm run build
```

### 5. Sync to Android (Capacitor)
```powershell
npx cap sync android
```
To run on a connected Android phone or emulator:
```powershell
npx cap open android
```

---

## 🔒 Security & Privacy by Design
- **No Background Tracking**: GPS coordinates are requested strictly on-demand for orientation and proximity checks. Continuous location trails are never recorded or stored.
- **Anonymous Player Sessions**: No email, password, or personal identity is required to play the quest or earn badges.
- **Strict Anti-Spoofing**: Supabase database RPC verifies geodesic distance using PostGIS geography mathematics. QR codes cannot be claimed from outside the physical perimeter.
- **No Third-Party Advertising**: Completely ad-free, with no tracking pixels or invasive cookies.

---

## 📄 Documentation Links
- [Tuzla Quest Game Manual](QUEST_GAME_MANUAL.md) — Comprehensive game rules, POI coordinates, and verification mechanics.
- [Privacy Policy](PRIVACY_POLICY.md) / [Politika Privatnosti](Politika%20Privatnosti%20za%20Tuzla%20Tour%20App.md) — Privacy principles and data protection details.
- [Cookie Policy](COOKIE_POLICY.md) — Storage and analytics consent explanation.

---

## 👥 Organization & Contact
Developed and maintained by **AISO Tuzla**.  
Email: [aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Location: Tuzla, Bosnia and Herzegovina
