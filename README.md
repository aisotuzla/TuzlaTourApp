# Tuzla Tour Guide — Official Documentation & README 🇧🇦

---

## 🇧🇦 BOSANSKI JEZIK

### 📌 Pregled Projekta
**Tuzla Tour Guide** (`com.icptuzla.tuzlavirtualtour`) je visokotehnološka, progresivna web aplikacija (PWA) i hibridna mobilna aplikacija (Capacitor / Android) namijenjena posjetiocima, turistima i građanima grada Tuzle. Aplikacija objedinjuje 3D prostorne mape s offline radom, proširenu stvarnost (AR), gejmificiranu potragu (Quest), pametnog audio vodiča s neuronskim TTS-om, planer boravka i digitalni novčanik sa Web3 integracijom na Solana blockchainu.

---

### 🏛️ Arhitektura i Moduli Aplikacije

#### 1. 🧭 Interaktivne Mape i Navigacija (`MapView.tsx` & `MapQuestView.tsx`)
- **Tehnologija prikaza:** Izgrađeno na **MapLibre GL** sa 3D nagibom (*pitch* do 60°) i rotacijom (*bearing*).
- **Višeslojne Mape (Map Layers):**
  - **Geoapify 3D / OSM Liberty:** Primarni online 3D prikaz zgrada i ulica visoke rezolucije.
  - **CARTO Voyager / OSM Raster:** Rezervni sloj u slučaju slabije konekcije.
  - **Lokalni PMTiles 3D (Offline sloj):** Potpuni rad bez interneta zahvaljujući protokolu `@makina-corpus/maplibre-offline-pmtiles` i `pmtiles`.
- **Rute i Praćenje Lokacije:**
  - Real-time praćenje lokacije putem Geolocation API-ja uz adaptivno filtriranje (`AdaptiveLowPassFilter`).
  - Dinamički proračun rute i udaljenosti do tačaka interesa (POI) i hotela.
  - Donji izvlačeći panel (`MapSheetDrawer.tsx`) za pregled detalja lokacije, cijena ulaznica i radnog vremena.

#### 2. 📱 Proširena Stvarnost — AR Vodič (`ARGuide.tsx` & `arProjection.ts`)
- **Pravi WebAR bez vanjskih aplikacija:** Koristi kameru uređaja u kombinaciji sa žiroskopom i kompasom (`DeviceOrientation`, `computeTiltCompensatedHeading`).
- **Kombinovani 60/40 Prikaz:** Gornjih 40% ekrana prikazuje 3D mapu s rutom, dok donjih 60% prikazuje živi video s kamere.
- **Interaktivni 3D Markeri i Retikl:**
  - AR značke lebde iznad stvarnih lokacija u gradu sa prikazom tačne udaljenosti u metrima/kilometrima.
  - Bočni indikatori (strelice/chevrons) za usmjeravanje korisnika prema meti.
  - "Target Locked" režim pri centriranju znamenitosti.
  - Vizuelno iscrtavanje putanje pomoću `ARPolylineCanvas.tsx`.

#### 3. 🎮 Gejmifikovana Potraga — Tuzla Quest (`constants/questData.ts` & `QUEST_GAME_MANUAL.md`)
Potraga vodi korisnika kroz 4 faze istraživanja grada. Otključavanje se vrši skeniranjem fizičkih QR kodova na lokacijama ili dolaskom unutar radijusa od 5 metara putem GPS-a:
- **Faza 1 (Temelji Tuzle):** Trg Slobode, Kapija, Spomenik Meši Selimoviću. Otključava Fazu 2 i animaciju pobjede.
- **Faza 2 (Kulturna Baština & Solana NFT):** Park Kralja Tvrtka I, Palačinkara Bagi, Solni Trg. Otključava digitalnu reprezentativnu fudbalsku karticu i certifikat.
- **Faza 3 (Jezera, Priroda i Umjetnost):** Panonska jezera, Panonski slapovi, Slana Banja, Atelje Ismet Mujezinović. Otključava trofej "Srce Tuzle" sa vatrometom (`canvas-confetti`).
- **Grand Finale (Zlatni Partner):** Bingo City Centar. Otključava ekskluzivni 20% popust kod: `BCC-GOLDEN-TUZLA-2026`.
- **Pametno filtriranje meta:** Otključane lokacije prelaze u diskretni sivi prikaz (`grayscale blur`), dok aktivne mete pulsiraju u punom koloru.

#### 4. 🎧 Pametni Audio Vodič & Neuronski TTS (`AudioGuideContext.tsx`, `tts.ts`, `MediaAudioGuideTab.tsx`)
- **Globalni audio plejer:** Traka na dnu ekrana (`AudioControlBar.tsx`) omogućava reprodukciju, pauziranje i praćenje naracije dok korisnik slobodno koristi bilo koji dio aplikacije.
- **Dva mehanizma izgovora:**
  1. **Lokalni Web Speech API:** Automatski odabir najprirodnijeg glasa (prioritet na *Microsoft Goran Online / Natural Bosnian* ili srodne južnoslavenske jezike).
  2. **Vite / Node Neuronski TTS Plugin (`MsEdgeTTS`):** Podrška za visokokvalitetne AI neuronske glasove (`bs-BA-GoranNeural`, `en-US-AndrewNeural`, `de-DE-ConradNeural`, `tr-TR-AhmetNeural`).
- **Multimedijalni vodič:** Pregled historije, Panonike i gradskih znamenitosti sa tekstualnim i zvučnim zapisima.

#### 5. 💼 Digitalni Novčanik & Sigurnost (`Wallet.tsx` & `SecurityGuard.tsx`)
- **PIN Zaštita (`SecurityGuard.tsx`):** Četvorocifreni PIN kod pohranjen putem `@capacitor/preferences` štiti pristup novčaniku.
- **Web3 & Solana Integracija:**
  - Povezivanje na Solflare i Solana novčanike putem `@solana/wallet-adapter-react`.
  - Mogućnost prebacivanja između **Devnet** i **Mainnet-beta** mreže.
  - Prikaz javne adrese i trenutnog SOL stanja.
- **Istorija Skeniranja (Ledger):** Lokalno bilježenje svih skeniranih QR lokacija s datumom, vremenom i mogućnošću pokretanja video zapisa i 360° panorama (`pannellum`).
- **Konvertor Valuta:** Brza dvosmjerna konverzija BAM (KM) ⟷ EUR po zvaničnom kursu.
- **Direktne Partnerske Integracije:** Brzi pristup servisima *Gradski Parking Tuzla*, *Dentalni Turizam* i *AISO Tuzla*.
- **Privacy by Design:** Nema praćenja korisnika, niti skladištenja privatnih ključeva na vanjskim serverima.

#### 6. 📅 Planer Boravka, Kalendar i Zadaci (`TaskManager.tsx`, `EventCalendarView.tsx`)
- **Trodnevni Plan ("3-Day Plan"):** Strukturirani korak-po-korak vodič kroz Tuzlu (aerodrom, taksi, hoteli, hrana, potraga).
- **Interaktivni Planer (Itinerary):** Dodavanje hotela, restorana i atrakcija u lični raspored direktno iz vodiča ili menija hrane i smještaja.
- **Evidencija Troškova i Zadataka:** Praćenje budžeta putovanja i liste stvari za kupovinu i obaviti.
- **Kalendar Događaja (`EventCalendarView.tsx`):** Pregled i filtriranje verifikovanih gradskih dešavanja (Muzika, Kultura, Teatar, Sport, Panonika) za 2026. i 2027. godinu, sa opcijom uvoza JSON rasporeda.

#### 7. 🍽️ Gastronomija i Smještaj (`Food.tsx` & `Accommodation.tsx`)
- **Restorani i kafići:** Pregled provjerenih tuzlanskih ugostiteljskih objekata, ocjene, adrese, navigacija i dugme za dodavanje u plan boravka.
- **Hoteli i apartmani:** Lista hotela s cjenovnim rangom, kontaktima, direktnim telefonskim pozivima i opcijama rezervacije.

#### 8. 🌐 Višejezičnost (`LanguageSelector.tsx`)
Aplikacija nudi dinamičko prebacivanje jezika u realnom vremenu:
- 🇧🇦 **Bosanski** (`bs`)
- 🇬🇧 **Engleski** (`en`)
- 🇩🇪 **Njemački** (`de`)
- 🇹🇷 **Turski** (`tr`)

---

### 💻 Tehnološki Stack

| Segment | Tehnologije |
|---|---|
| **Frontend & UI** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Build & PWA** | Vite 6, `vite-plugin-pwa` (Workbox offline service worker, manifest) |
| **Kartografija** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Senzori & AR** | HTML5 Camera API, DeviceOrientation / Gyroscope / Compass, Three.js / Canvas |
| **QR Prepoznavanje** | `html5-qrcode` (kamera i fajl skener) |
| **Blockchain** | `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets` |
| **Mobilna platforma**| Capacitor 8 (Android Geolocation, Camera, Preferences, Local Notifications) |
| **Audio & TTS** | Web Speech API, `msedge-tts` (Neural TTS streaming endpoint) |

---

### 🚀 Pokretanje i Razvoj

#### Preduslovi
- **Node.js**: verzija 20+ (preporučeno 24.x)
- **NPM**: 10+

#### Instalacija
```bash
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp
npm install
```

#### Razvojno okruženje
```bash
npm run dev
```

#### Produkcijski build
```bash
npm run build
```

#### Sinhronizacija sa Android uređajima (Capacitor)
```bash
npm run build
npx cap sync android
npx cap open android
```

---
---

## 🇬🇧 ENGLISH VERSION

### 📌 Project Overview
**Tuzla Tour Guide** (`com.icptuzla.tuzlavirtualtour`) is an advanced Progressive Web Application (PWA) and cross-platform mobile app (Capacitor / Android) built for tourists, visitors, and citizens of Tuzla, Bosnia and Herzegovina. The application combines offline-ready 3D interactive mapping, augmented reality (AR) camera navigation, gamified city quests, neural text-to-speech audio guides, trip itineraries, and a digital wallet integrated with the Solana blockchain.

---

### 🏛️ Architecture & Feature Breakdown

#### 1. 🧭 Interactive 3D Mapping & Navigation (`MapView.tsx` & `MapQuestView.tsx`)
- **Map Engine:** Powered by **MapLibre GL** featuring dynamic pitch (up to 60°) and bearing rotation.
- **Multi-layer Basemaps:**
  - **Geoapify 3D / OSM Liberty:** Primary high-resolution online 3D buildings and streets vector layer.
  - **CARTO Voyager / OSM Raster:** Secondary fallback online layer.
  - **Local PMTiles 3D (Offline Vector Map):** Full offline functionality using `@makina-corpus/maplibre-offline-pmtiles` and `pmtiles`.
- **GPS Routing & Location Tracking:**
  - Real-time location tracking with an adaptive low-pass filter (`AdaptiveLowPassFilter`) for smooth heading and jitter reduction.
  - On-the-fly walking route and distance calculations to Points of Interest (POIs) and hotels.
  - Interactive bottom drawer (`MapSheetDrawer.tsx`) showing POI metadata, entry fees, and opening hours.

#### 2. 📱 Augmented Reality AR Guide (`ARGuide.tsx` & `arProjection.ts`)
- **Native WebAR (No App Store Download Required):** Utilizes device camera pass-through coupled with hardware motion sensors (`DeviceOrientation`, tilt-compensated compass heading).
- **Dual 60 / 40 Split Viewport:**
  - Top 40%: Live interactive 3D map showing current position, POIs, and route polyline.
  - Bottom 60%: Live camera feed with 3D AR badges hovering over physical landmarks.
- **Directional HUD & Guidance:**
  - Dynamic badges displaying real-time distance in meters or kilometers.
  - Directional side chevrons indicating required turn angles (e.g. `45° LEFT`, `90° RIGHT`).
  - "Target Locked" HUD reticle when centering landmarks.
  - Visual ground trajectory drawing with `ARPolylineCanvas.tsx`.

#### 3. 🎮 Gamified City Exploration — Tuzla Quest (`constants/questData.ts` & `QUEST_GAME_MANUAL.md`)
Sightseeing turned into an interactive treasure hunt. Complete tasks by scanning physical QR codes or approaching within 5 meters via GPS:
- **Phase 1 (Foundations of Tuzla):** Freedom Square (Trg Slobode), Kapija Memorial, Meša Selimović Monument. Triggers Phase 1 victory and unlocks Phase 2.
- **Phase 2 (Cultural Heritage & Solana NFT):** King Tvrtko I Park, Bagi Pancake House, Salt Square. Unlocks a collectible digital football squad card.
- **Phase 3 (Lakes, Nature & Fine Arts):** Pannonian Salt Lakes, Waterfalls, Slana Banja Park, Ismet Mujezinović Art Gallery. Unlocks the "Heart of Tuzla" trophy award with fireworks.
- **Grand Finale (Golden Partner):** Bingo City Center. Unlocks an official 20% partner discount coupon code: `BCC-GOLDEN-TUZLA-2026`.
- **Intelligent Marker States:** Unlocked landmarks automatically transition to blurred monochrome markers (`grayscale blur`), keeping the map clean and focused on remaining targets.

#### 4. 🎧 Audio Guide & Neural Text-To-Speech (`AudioGuideContext.tsx`, `tts.ts`, `MediaAudioGuideTab.tsx`)
- **Global Background Audio Player:** Floating bottom audio bar (`AudioControlBar.tsx`) allows seamless listening while navigating between screens.
- **Dual TTS Engine:**
  1. **Client-side Web Speech API:** Automatically prioritizes native Bosnian natural voices (e.g., *Microsoft Goran Online / Natural*).
  2. **Vite / Node Streaming Neural TTS (`msedge-tts`):** Provides lifelike studio-quality speech in Bosnian (`bs-BA-GoranNeural`), English (`en-US-AndrewNeural`), German (`de-DE-ConradNeural`), and Turkish (`tr-TR-AhmetNeural`).
- **Media & Cultural Guides:** Curated narratives covering the historical center, Neolithic stilt houses, salt springs, and Pannonica lakes.

#### 5. 💼 Digital Web3 Wallet & Vault (`Wallet.tsx` & `SecurityGuard.tsx`)
- **Local PIN Protection (`SecurityGuard.tsx`):** 4-digit PIN security backed by `@capacitor/preferences`.
- **Solana Web3 Integration:**
  - Direct wallet connection (Solflare / Phantom) using `@solana/wallet-adapter-react`.
  - Toggle between **Devnet** and **Mainnet-beta**.
  - Live SOL balance retrieval and public key address copying.
- **Scan History Ledger:** On-device chronological log of visited landmarks, with playback of unlocked documentary videos and 360° virtual panoramas (`pannellum`).
- **BAM ⟷ EUR Currency Converter:** Real-time pegged currency converter.
- **Local Utility Partnerships:** One-tap access to *Gradski Parking Tuzla*, *Dental Tourism Tuzla*, and *AISO Tuzla*.
- **Privacy by Design:** Zero custody, no private keys stored on remote servers, 100% on-device data processing.

#### 6. 📅 Itinerary Planner & Event Calendar (`TaskManager.tsx`, `EventCalendarView.tsx`)
- **3-Day Recommended Tour Plan:** Ready-made step-by-step itinerary from Tuzla International Airport to old town attractions.
- **Personalized Itinerary:** One-click addition of restaurants, hotels, and attractions from any tab.
- **Travel Budget & Checklist:** Expense tracking (BAM) and interactive travel to-do lists.
- **City Event Calendar (`EventCalendarView.tsx`):** Filter verified upcoming cultural, musical, sports, and festival events across 2026 & 2027, with custom JSON import support.

#### 7. 🍽️ Dining & Accommodation Directories (`Food.tsx` & `Accommodation.tsx`)
- **Food & Drink:** Categorized listings of local restaurants, traditional cevabdzinicas, and cafes with ratings, addresses, and navigation shortcuts.
- **Where to Stay:** Curated hotel and apartment listings with direct phone dialing, website links, and location pins.

#### 8. 🌐 Multi-Language Localization
Instant language switching supported across all app views:
- 🇧🇦 **Bosnian** (`bs`)
- 🇬🇧 **English** (`en`)
- 🇩🇪 **German** (`de`)
- 🇹🇷 **Turkish** (`tr`)

---

### 💻 Technical Specifications

| Component | Library / Framework |
|---|---|
| **Core Framework** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Build & Tooling** | Vite 6, `vite-plugin-pwa` (offline Service Worker, App Manifest) |
| **GIS & Maps** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Sensors & AR** | Web Camera API, DeviceOrientation, Gyroscope & Compass algorithms |
| **Barcode / QR** | `html5-qrcode` |
| **Web3 & Blockchain** | `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets` |
| **Mobile Runtime** | Capacitor 8 (Android Geolocation, Camera, Preferences, Native App Wrapper) |
| **Audio Processing** | Web Speech API, `msedge-tts` (streaming backend proxy) |

---

### 🚀 Getting Started

#### Prerequisites
- **Node.js**: v20 or higher (v24.x recommended)
- **NPM**: v10 or higher

#### Installation
```bash
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp
npm install
```

#### Development Server
```bash
npm run dev
```

#### Production Build
```bash
npm run build
```

#### Android Deployment (Capacitor)
```bash
npm run build
npx cap sync android
npx cap open android
```

---

### 📄 License & Credits
Developed by **AISO Tuzla** for the **City of Tuzla** and its global visitors.  
Licensed under the [MIT License](LICENSE).