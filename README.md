# Tuzla Tour Guide

**Tuzla Tour Guide** is a modern, fast, and multilingual travel companion and city-discovery application for **Tuzla, Bosnia and Herzegovina**. It features an interactive 3D tactical map, offline PMTiles vector rendering, real-time tactical compass navigation, the interactive **Tuzla Quest** exploration game with authoritative Supabase cloud verification, an illustrated artistic map, audio guides, local gastronomy, transport guides, itinerary planning tools, and a personal notebook with sticky notes.

The application is built with React 18, TypeScript, and Vite, operating as a high-performance Progressive Web App (PWA) with a native Android wrapper powered by Capacitor.

---

## 🌟 Key Features

### 🗺️ Interactive 3D Tactical Map & Offline Engine
- **3D Vector Map**: Built on MapLibre GL with Geoapify 3D buildings and custom styling.
- **Offline Capability**: Local PMTiles vector map database (`offline-vector-style.json`) pre-cached for full offline navigation without mobile data.
- **Dynamic Layer Switcher**: Seamlessly toggle between Geoapify 3D (Primary), OpenStreetMap Raster (Fallback), and Local PMTiles (Offline).
- **Centered Interactive Popups**: POI popups with automatic viewport centering, instant audio playback, pedestrian GPS route generation, and direct QR scanner launch.
- **Bottom Sheet Drawer**: Expandable inspection panel with search, route details, distance, and travel time estimates.
- **Search & Filter**: Search POIs by name and category with real-time results.

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
  - Phase completion celebrations with confetti and reward modals.
- **QR Code Scanner**: Camera-based QR scanning with zoom controls, secure server-side verification, and scan history ledger.

### 🎧 Audio Guides & Media
- Multilingual location narrations with a persistent floating global audio player bar.
- Embedded documentary and historical video footage.
- Per-POI audio files in Bosnian, English, German, and Turkish.

### 🌆 City Guide, Gastronomy & Travel Utilities
- **History & Heritage**: Historical timeline of Tuzla from Neolithic salt extraction to the modern era.
- **Food & Dining**: Curated traditional Bosnian cevabdzinicas, bakeries, cafes, and local food delivery integration.
- **Transport & Logistics**: Airport transfers (Wizz Air / Tuzla Airport TZL), bus schedules (lines 34 & 11), parking zones, travel agencies, Rent-A-Car and taxi directories.
- **Accommodation**: Comprehensive hotel listings with direct GPS navigation and booking links and apartment directories.
- **Task Planner & Notes**: 3-day trip planner, personal trip notebook, sticky notes board (text/drawing/checklist modes), local event calendar, and BAM/EUR converter.
- **Practical Travel Info**: Flights, border entry & customs, health & insurance, SIM/Wi-Fi/money, tour agencies, emergency contacts.

### 🔋 Battery Saver & Power Optimization
- **Adaptive Quality Modes**: Saver (15 FPS, 360p), Balanced (30 FPS, 720p), Cinematic (60 FPS, 1080p, 3D).
- **Throttled Compass & GPS**: Device orientation throttled to ~15 FPS with deadband; adaptive GPS intervals based on battery level.
- **On-Demand Camera**: Camera activates only when scanning QR codes and stops immediately after.
- **Offline Map Caching**: Reduces cellular radio usage in poor network areas.

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
| **QR Engine** | html5-qrcode (Camera stream resolution & zoom) |
| **Offline & PWA** | vite-plugin-pwa, Workbox Service Worker |
| **Telemetry & Privacy** | Vercel Analytics, Speed Insights (Strict opt-in consent) |
| **Containerization** | Docker (multi-stage build with Node 22 Alpine) |

---

## 📁 Project Structure

```
TuzlaTourApp/
├── App.tsx                 # Root app with routing, providers, quest completion logic
├── constants.tsx           # Static location data, TUZLA_CENTER, dining data
├── constants/questData.ts  # Quest targets, phases, POI metadata, QR codes
├── types.ts                # TypeScript interfaces (Language, Location, QuestTarget, etc.)
├── index.tsx               # Entry point
├── index.html              # HTML shell
├── vite.config.ts          # Vite build config (PWA, polyfills, SSL, aliases)
├── capacitor.config.ts     # Capacitor Android configuration
├── Dockerfile              # Multi-stage Docker build
├── vercel.json             # Vercel deployment config
├── package.json            # Dependencies and scripts
├── components/             # React components (pages, modals, UI widgets)
├── contexts/               # React context providers (AudioGuide, GlobalApp)
├── hooks/                  # Custom React hooks (geolocation, compass, battery, network, etc.)
├── lib/                    # Supabase client, player session, database types
├── utils/                  # Utility modules (geo, quest runtime policy, QR matching, PMTiles, etc.)
├── assets/                 # Images, audio, maps, icons
├── android/                # Capacitor Android project (release APKs, keystore)
├── docs/                   # Documentation (user manual, pitch, events API security)
├── public/                 # Public assets (cookie policy, etc.)
└── scripts/                # Build and sync scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 24.6.0+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp

# Install dependencies
npm install
```

### Development

```bash
# Start the Vite dev server
npm run dev

# Preview the production build
npm run preview
```

### Building

```bash
# Build for production
npm run build

# Clean build artifacts
npm run clean
```

### Android (Capacitor)

```bash
# Build and sync to Android
npm run sync:android

# Open in Android Studio
npx cap open android
```

### Docker

```bash
# Build the Docker image
docker build -t tuzla-tour-guide .

# Run the container
docker run -p 3000:3000 tuzla-tour-guide
```

---

## 🔒 Security & Privacy by Design
- **No Background Tracking**: GPS coordinates are requested strictly on-demand for orientation and proximity checks. Continuous location trails are never recorded or stored.
- **Anonymous Player Sessions**: No email, password, or personal identity is required to play the quest or earn badges.
- **Strict Anti-Spoofing**: Supabase database RPC verifies geodesic distance using PostGIS geography mathematics. QR codes cannot be claimed from outside the physical perimeter.
- **No Third-Party Advertising**: Completely ad-free, with no tracking pixels or invasive cookies.
- **Cookie Consent**: GDPR-compliant cookie consent banner with versioned consent storage.
- **Events API Security**: Public `GET /api/events` is readable without auth; `POST`/`DELETE` require an admin bearer token (`EVENTS_ADMIN_TOKEN`).

---

## 📄 Documentation Links
- [Tuzla Quest Game Manual](QUEST_GAME_MANUAL.md) — Comprehensive game rules, POI coordinates, and verification mechanics.
- [User Manual & Quest Guide](docs/USER_MANUAL_AND_QUEST_GUIDE.md) — App usage instructions in Bosnian and English.
- [Privacy Policy](PRIVACY_POLICY.md) / [Politika Privatnosti](Politika%20Privatnosti%20za%20Tuzla%20Tour%20App.md) — Privacy principles and data protection details.
- [Cookie Policy](COOKIE_POLICY.md) — Storage and analytics consent explanation.
- [Events API Security](docs/EVENTS_API_SECURITY.md) — Admin token configuration for protected event routes.
- [Pitch Presentation](docs/PITCH_PISMO_TUZLA_TURIZAM.md) — Project pitch for tourism partners.
- [Battery Saver Feature](BATTERY_SAVER_FEATURE.md) — Power optimization architecture and verification.

This app complies with the General Data Protection Regulation (GDPR) and the applicable personal data protection laws of Bosnia and Herzegovina 2025.

---

## 👥 Organization & Contact
Developed and maintained by **AISO Tuzla**.  
Email: [aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Location: Tuzla, Bosnia and Herzegovina
