# Tuzla Tour Guide — Official Documentation & Architecture 🇧🇦

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://tuzlatour.vercel.app)
[![Netlify Deployment](https://img.shields.io/badge/Netlify-Live_PWA-00C7B7?style=for-the-badge&logo=netlify)](https://tuzlatourguide.netlify.app)
[![Solana Integration](https://img.shields.io/badge/Solana-Web3_Rewards-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Capacitor Native](https://img.shields.io/badge/Capacitor-Android_8.4-119EFF?style=for-the-badge&logo=capacitor)](https://capacitorjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Tuzla Tour Guide** (`com.icptuzla.tuzlavirtualtour`) is an all-in-one smart travel platform, interactive 3D virtual tour guide, and Web3 exploration companion for Tuzla, Bosnia and Herzegovina. The platform unites **real-time 3D GPS navigation**, **camera-based Augmented Reality (AR) guidance**, a **gamified city AR Quest with physical QR code scanning**, **neural text-to-speech audio guides** in 4 languages, **comprehensive hospitality and dining directories**, a **personal travel itinerary with an offline expense ledger**, and **real-time Web3 rewards on the Solana blockchain**.

---

## 📑 Sadržaj / Table of Contents

1. [🇧🇦 Bosanski Jezik](#-bosanski-jezik)
   - [Pregled Projekta](#-pregled-projekta)
   - [Ključne Funkcionalnosti Aplikacije](#-ključne-funkcionalnosti-aplikacije)
   - [Tehnološki Stack](#-tehnološki-stack)
   - [Pokretanje i Razvoj](#-pokretanje-i-razvoj)
2. [🇬🇧 English Version](#-english-version)
   - [Project Overview](#-project-overview)
   - [Key Platform Features](#-key-platform-features)
   - [Technical Architecture](#-technical-architecture)
   - [Setup & Deployment](#-setup--deployment)
3. [📄 License & Attribution](#-license--attribution)

---

## 🇧🇦 BOSANSKI JEZIK

### 📌 Pregled Projekta

**Tuzla Tour Guide** predstavlja vrhunsku progresivnu web aplikaciju (PWA) i hibridnu Android aplikaciju (Capacitor) skrojenu za posjetioce, turiste i građane grada Tuzle. Umjesto klasičnih vodiča, aplikacija nudi interaktivno istraživanje grada u stvarnom vremenu kroz spoj modernih senzora pametnih telefona, kartografije, proširene stvarnosti i gejmifikacije sa stvarnim nagradama.

---

### 🏛️ Ključne Funkcionalnosti Aplikacije

#### 1. 🧭 3D GPS Mape i Navigacija (`MapView.tsx` & `MapQuestView.tsx`)

- **MapLibre GL 3D Engine:** Prikaz terena s 3D nagibom (*pitch* do 60°) i rotacijom kompasa (*bearing*).
- **Višeslojni Prikaz:**
  - *Geoapify 3D / OSM Liberty:* Online vektorski sloj sa 3D volumenima zgrada i ulica.
  - *CARTO Voyager / OSM Raster:* Brzi alternativni sloj.
  - *Lokalni PMTiles (Offline sloj):* Potpuna funkcionalnost mapa bez interneta pomoću `@makina-corpus/maplibre-offline-pmtiles`.
- **GPS Praćenje i Rutiranje:**
  - Dinamičko računanje pješačkih ruta i udaljenosti do tačaka interesa (POI).
  - Adaptivni low-pass filter (`AdaptiveLowPassFilter`) za uklanjanje GPS podrhtavanja.
  - Izvlačeći donji panel (`MapSheetDrawer.tsx`) s detaljima lokacije, cijenama ulaznica i radnim vremenom.

#### 2. 📱 Proširena Stvarnost — AR Vodič (`ARGuide.tsx` & `arProjection.ts`)

- **WebAR bez instalacije:** Koristi kameru telefona u kombinaciji sa žiroskopom, akcelerometrom i kompasom (`DeviceOrientation`).
- **Kombinovani 40/60 Prikaz:**
  - Gornjih 40% ekrana: 3D mapa s aktivnom rutom i orijentacijom.
  - Donjih 60% ekrana: Živi video s kamere s 3D oznakama koje lebde iznad stvarnih lokacija u gradu.
- **Interaktivni HUD:**
  - Prikaz udaljenosti u realnom vremenu (metri/kilometri).
  - Bočne strelice (chevrons) koje usmjeravaju korisnika lijevo ili desno (`45° LEFT`, `90° RIGHT`).
  - "Target Locked" nišan kada se znamenitost centrira.
  - Prikaz putanje po tlu putem `ARPolylineCanvas.tsx`.

#### 3. 🎮 Gejmifikovana Potraga — Tuzla Quest (`constants/questData.ts` & `QUEST_GAME_MANUAL.md`)

Potraga vodi korisnika kroz 4 faze otkrivanja grada. Validacija lokacije vrši se **skeniranjem fizičkih QR kodova** na lokacijama ili **GPS približavanjem unutar radijusa od 5–15 metara**:

- **Faza 1 (Temelji Tuzle):** Trg Slobode, Kapija, Spomenik Meši Selimoviću i Ismetu Mujezinoviću. Otključava Fazu 2 i video zapise.
- **Faza 2 (Kulturna Baština & Solni Identitet):** Park Kralja Tvrtka I, Palačinkara Bagi, Soni Trg. Otključava kolekcionarsku digitalnu fudbalsku NFT karticu.
- **Faza 3 (Jezera, Slapovi i Umjetnost):** Panonska jezera, Panonski slapovi, Slana Banja, Atelje Ismet Mujezinović. Otključava trofej "Srce Tuzle" sa nagradnim kuponom (`canvas-confetti`).
- **Grand Finale (Zlatni Partner):** Bingo City Centar (BCC). Otključava ekskluzivni kupon sa 20% popusta: `BCC-GOLDEN-TUZLA-2026`.
- **Pametna filtracija:** Posjećene lokacije prelaze u diskretni crno-bijeli prikaz, držeći fokus na preostalim metama.

#### 4. 🎧 Pametni Audio Vodič & Neuronski TTS (`AudioGuideContext.tsx`, `tts.ts`)

- **Globalni lebdeći audio plejer:** Traka na dnu ekrana (`AudioControlBar.tsx`) omogućava neprekidno slušanje dok korisnik pregleda mape, traži restorane ili planira troškove.
- **Prirodni AI glasovi za EdgeTTS:**
  - 🇧🇦 **Bosanski:** `bs-BA-GoranNeural`
  - 🇬🇧 **Engleski:** `en-US-AndrewNeural`
  - 🇩🇪 **Njemački:** `de-DE-ConradNeural`
  - 🇹🇷 **Turski:** `tr-TR-AhmetNeural`
- **Bogata naracija:** Priče o 6.000 godina staroj eksploataciji soli, neolitskom sojeničkom naselju, povelji Kulina bana i modernom gradu.

#### 5. 💼 Integracija Digitalnog Novčanika & Web3 Solana Nagrade (`Wallet.tsx` & `SecurityGuard.tsx`)

- **PIN Zaštita:** Četvorocifreni lokalni PIN kod pohranjen putem `@capacitor/preferences`.
- **Solana Web3 Povezivanje:**
  - Povezivanje sa Phantom i Solflare novčanicima (`@solana/wallet-adapter-react`).
  - Podrška za **Devnet** i **Mainnet-beta** mreže.
  - Trenutno služi samo za preuzimanje digitalnih certifikata i NFT kartica ostvarenih kroz quest.
- **Historija i Galerija:** Vremenski zapis svih skeniranih QR lokacija s mogućnošću pregleda slika i panorama (`pannellum`).
- **Konvertor valuta:** Fiksni dvosmjerni kurs BAM ⟷ EUR (1 EUR = 1.95583 BAM).

#### 6. 📅 Planer Boravka, Itinerer i Evidencija Troškova (`TaskManager.tsx`)

- **Preporučeni 3-dnevni plan:** Strukturirani plan obilaska od slijetanja na aerodrom do checkout-a.
- **Interaktivni personalni itinerer:** Jednim dodirom dodajte bilo koji hotel, restoran ili znamenitost u lični plan posjete uz check-box potvrdu posjete.
- **Proširena evidencija troškova i to-do lista:**
  - Unos stavki i iznosa u KM sa automatskim proračunom ukupnog troška, broja unosa i prosjeka po stavci.
  - Potpuno offline čuvanje podataka.
- **Kalendar gradskih događaja (`EventCalendarView.tsx`):** Pregled i filtriranje koncerata, festivala, sajmova i kulturnih dešavanja za 2026. i 2027. godinu.

#### 7. 🍽️ Ugostiteljstvo, Smještaj i Tranzit (`Food.tsx`, `Accommodation.tsx`, `PracticalTravelInfo.tsx`)

- **Provjereni smještaj:** Hoteli (Hotel Mellain, Hotel Salis, Golden Star) i apartmani s direktnim kontaktima, cijenama i navigacijom.
- **Tuzlanska gastronomija:** Tradicionalni tuzlanski ćevapi u polivenom somunu, pite ispod sača, Palačinkara Bagi, Tuzlansko pivo.
- **Vodič za aerodrom (TZL):** Tačan red vožnje autobuske linije 34, licencirani taksi servisi i avionske linije za evropske gradove.

### FINAL - JEDINA APPLIKACIJA KOJA ĆE VAM TREBATI ###

Zajedno sa partnerima Grada Tuzle, Turističke zajednice, Wizz-air, AirBnB web stranicama, sa GPRS-Bus linije, 1525 taxi sluzba, korpa.ba...i socijalnim mrežama na jedan klik, te AISO aplikacijama gradskog parkinga, dentalnog turizma i zabave skupljanja digitalnih sličica Zmajevi BiH, sagradili smo platoformu na 4 jezika kao ALL-IN-ONE, jedinu aplikaciju koja će vam trebati prilikom posjete Tuzli. PWA Aplikacija koja ce raditi isto na PC i Telefonu - Online i offline bez potrebe za instalacijom na uredjaju. Građena na principu Privacy By Design i u skladu sa Zakonu o zaštiti ličnih podataka BiH (i usklađenim GDPR standardima)

---

### 💻 Tehnološki Stack

| Segment | Tehnologije |
| --- | --- |
| **Korisnički interfejs** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Kartografija i GIS** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Proširena stvarnost (AR)** | HTML5 Camera API, DeviceOrientation / Compass API, Three.js, Canvas 2D |
| **QR Prepoznavanje** | `html5-qrcode` (kamera i galerija slika) |
| **Web3 & Blockchain** | `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets` |
| **Govor i Audio (TTS)** | Edge Neural TTS API, Web Speech API |
| **Mobilna platforma** | Capacitor 8 (Android Geolocation, Camera, Preferences, Local Notifications) |
| **PWA & Build** | Vite 6, `vite-plugin-pwa`, Workbox Service Worker |

---

### 🚀 Pokretanje i Razvoj

```bash
# 1. Kloniranje repozitorija
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp

# 2. Instalacija zavisnosti
npm install

# 3. Pokretanje lokalnog razvojnog servera
npm run dev

# 4. Produkcijski build
npm run build

# 5. Sinhronizacija sa Android okruženjem (Capacitor)
npm run build
npx cap sync android
npx cap open android
```

---
---

## 🇬🇧 ENGLISH VERSION

### 📌 Project Overview

**Tuzla Tour Guide** (`com.icptuzla.tuzlavirtualtour`) is a state-of-the-art Progressive Web App (PWA) and hybrid mobile application (Capacitor / Android) engineered for visitors and citizens of Tuzla, Bosnia and Herzegovina. The platform blends high-precision **3D GPS navigation**, **camera-based Augmented Reality (AR)**, a **gamified city AR Quest with QR code scanning**, **neural text-to-speech audio tours**, **hospitality and dining directories**, a **personal travel itinerary with an offline expense ledger**, and **real-time Web3 rewards powered by Solana**.

---

### 🏛️ Key Platform Features

#### 1. 🧭 3D GPS Mapping & Navigation (`MapView.tsx` & `MapQuestView.tsx`)

- **MapLibre GL Vector Engine:** Dynamic 3D pitch (up to 60°) and compass bearing rotation.
- **Multi-layer Basemaps:**
  - *Geoapify 3D / OSM Liberty:* Detailed 3D buildings, pedestrian streets, and landmarks.
  - *CARTO Voyager / OSM Raster:* High-speed fallback basemap.
  - *Local PMTiles (Offline Layer):* Seamless navigation without internet connection using `@makina-corpus/maplibre-offline-pmtiles`.
- **GPS Location & Route Calculations:**
  - Real-time location tracking with an adaptive low-pass filter (`AdaptiveLowPassFilter`) to eliminate GPS jitter.
  - Turn-by-turn pedestrian pathfinding with live remaining distance and arrival estimates.
  - Interactive bottom drawer (`MapSheetDrawer.tsx`) displaying tickets, hours, and photos.

#### 2. 📱 Augmented Reality (AR) Camera Guidance (`ARGuide.tsx` & `arProjection.ts`)

- **Zero-Install WebAR:** Operates directly inside mobile browsers leveraging device cameras, gyroscope, and compass (`DeviceOrientation` with tilt-compensated heading).
- **Dual 40/60 Split Viewport:**
  - Top 40%: Live 3D overhead vector map showing walking trajectory and heading.
  - Bottom 60%: Live camera pass-through displaying 3D pins directly over real-world city landmarks.
- **Directional HUD & Guidance:**
  - Real-time distance indicators in meters or kilometers.
  - Turn chevrons indicating required heading changes (`45° LEFT`, `90° RIGHT`).
  - "Target Locked" reticle when a landmark is centered in view.
  - Canvas ground path trajectory drawing via `ARPolylineCanvas.tsx`.

#### 3. 🎮 Gamified City Quest & QR Scavenger Hunt (`constants/questData.ts` & `QUEST_GAME_MANUAL.md`)

Turn sightseeing into an interactive treasure hunt. Complete tasks by **scanning physical QR codes** or **approaching within 5–15 meters via GPS**:

- **Phase 1 (Foundations of Tuzla):** Freedom Square (Trg Slobode), Kapija Memorial, Meša Selimović Monument. Triggers victory animations and unlocks historical videos.
- **Phase 2 (Cultural Heritage & Salt Identity):** King Tvrtko I Monument, Bagi Pancake House, Salt Square. Unlocks a collectible digital football squad NFT card.
- **Phase 3 (Lakes, Waterfalls & Fine Arts):** Pannonian Salt Lakes, Waterfalls, Slana Banja Park, Ismet Mujezinović Art Gallery. Unlocks the "Heart of Tuzla" trophy with fireworks (`canvas-confetti`).
- **Grand Finale (Golden Partner):** Bingo City Center (BCC). Unlocks an official 20% discount coupon code: `BCC-GOLDEN-TUZLA-2026`.
- **Intelligent Marker States:** Unlocked landmarks smoothly transition to blurred monochrome markers, keeping the map clean and focused on undiscovered targets.

#### 4. 🎧 Neural AI Audio Guides & Spoken Tours (`AudioGuideContext.tsx`, `tts.ts`)

- **Floating Global Player:** Floating bar (`AudioControlBar.tsx`) ensures audio continues playing while users switch between maps, restaurants, or itineraries.
- **Studio-Quality Neural Voices:**
  - 🇧🇦 **Bosnian:** `bs-BA-GoranNeural`
  - 🇬🇧 **English:** `en-US-AndrewNeural`
  - 🇩🇪 **German:** `de-DE-ConradNeural`
  - 🇹🇷 **Turkish:** `tr-TR-AhmetNeural`
- **Deep Historical Commentary:** Explores 6,000 years of Neolithic salt extraction, Ottoman monuments, Austro-Hungarian architecture, and modern culture.

#### 5. 💼 Digital Web3 Wallet & Real-Time Rewards (`Wallet.tsx` & `SecurityGuard.tsx`)

- **PIN Security:** 4-digit PIN code security stored via `@capacitor/preferences`.
- **Solana Web3 Integration:**
  - Direct connection to Phantom and Solflare wallets using `@solana/wallet-adapter-react`.
  - Seamless toggle between **Devnet** and **Mainnet-beta**.
  - Live SOL balance viewing and public address copying.
- **Scan History Ledger:** Local chronological log of visited landmarks with access to unlocked 360° panoramas (`pannellum`) and documentary videos.
- **Currency Converter:** Instant two-way conversion between Bosnian Marks (BAM) and Euros (EUR).

#### 6. 📅 Personal Travel Itinerary & Expense Ledger (`TaskManager.tsx`)

- **Recommended 3-Day Plan:** Pre-configured tour from airport arrival to historic fortress excursions.
- **Customizable Itinerary:** One-tap addition of any attraction, hotel, or eatery from the directories, complete with completion checkboxes.
- **Travel Budget & Expense Ledger:**
  - Convenient entry of travel expenses in BAM/KM with automatic totals, entry count, and average cost calculations.
  - 100% offline persistence.
- **City Events Calendar (`EventCalendarView.tsx`):** Filter verified music, cultural, theatre, and sports events across 2026 and 2027.

#### 7. 🍽️ Hospitality, Dining & Transit (`Food.tsx`, `Accommodation.tsx`, `PracticalTravelInfo.tsx`)

- **Verified Accommodations:** Top-rated hotels (Hotel Mellain, Hotel Salis, Golden Star) and private apartments with one-tap calling, direct booking links, and map pins.
- **Local Gastronomy:** Authentic Tuzlanski ćevapi in poliveni somun, traditional baked pies (burek, sirnica), Bagi crepes, and Pivara Tuzla beer.
- **Airport Logistics (TZL):** Direct GIPS Bus Line 34 timetables, licensed taxi rates, and direct flights from across Europe.
***FINAL – THE ONLY APP YOU’LL EVER NEED***
Together with our partners – the City of Tuzla, the Tourist Board, Wizz Air, AirBnB websites, GPRS-Bus lines, 1525 Taxi Service, korpa.ba… and social media – all available at a single click, plus AISO apps for city parking, dental tourism, and the fun of collecting digital “Zmajevi BiH” stickers, we have built a platform in 4 languages as an ALL‑IN‑ONE solution: the only application you’ll need when visiting Tuzla.

This PWA application works the same on both PC and mobile – online and offline – with no installation required on your device. It is built on the principle of Privacy by Design and fully compliant with the Law on Personal Data Protection of Bosnia and Herzegovina (aligned with GDPR standards)
---

### 💻 Technical Specifications

| Component | Library / Framework |
| --- | --- |
| **Core Framework** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **GIS & 3D Mapping** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Augmented Reality (AR)** | HTML5 Camera API, DeviceOrientation / Compass API, Three.js, Canvas 2D |
| **QR Code Scanner** | `html5-qrcode` (camera and file-based scanning) |
| **Blockchain & Web3** | `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets` |
| **Speech & Audio** | Edge Neural TTS API, Web Speech API |
| **Mobile Runtime** | Capacitor 8 (Android Geolocation, Camera, Preferences, Local Notifications) |
| **Build & PWA** | Vite 6, `vite-plugin-pwa`, Workbox Service Worker |

---

### 🚀 Setup & Deployment

#### Prerequisites

- **Node.js**: v20 or higher (v24.x recommended)
- **NPM**: v10 or higher

#### Installation

```bash
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp
npm install
```

#### Development

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

## 📄 License & Attribution

- **Developed by:** **AISO Tuzla** in partnership with local tourism and heritage organizations.
- **License:** Released under the [MIT License](LICENSE).
- **Official URLs:**
  - Production: [https://tuzlatour.vercel.app](https://tuzlatour.vercel.app)
  - PWA Mirror: [https://tuzlatourguide.netlify.app](https://tuzlatourguide.netlify.app)
  - Portal:
