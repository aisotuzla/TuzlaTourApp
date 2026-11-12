# Tuzla Tour Guide — Official Documentation & Architecture 🇧🇦

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://tuzlatour.vercel.app)
[![Netlify Deployment](https://img.shields.io/badge/Netlify-Live_PWA-00C7B7?style=for-the-badge&logo=netlify)](https://tuzlatourguide.netlify.app)
[![Solana Integration](https://img.shields.io/badge/Solana-Web3_Rewards-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Capacitor Native](https://img.shields.io/badge/Capacitor-Android_8.4-119EFF?style=for-the-badge&logo=capacitor)](https://capacitorjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Tuzla Tour Guide** is an all-in-one smart travel platform, interactive 3D virtual tour guide, and AR exploration companion for Tuzla, Bosnia and Herzegovina. The platform unites **real-time 3D GPS navigation**, **camera-based Augmented Reality (AR) guidance**, a **gamified city AR Quest with physical in-store QR code verification**, **guaranteed tourist footprint driving customers into local shops & restaurants**, **neural text-to-speech audio guides** in 4 languages, **comprehensive hospitality and dining directories**, a **personal travel itinerary with an offline expense ledger**, and **real-time Web3 rewards on the Solana blockchain**.

---

## 📑 Sadržaj / Table of Contents

1. [🇧🇦 Bosanski Jezik](#-bosanski-jezik)
   - [Pregled Projekta](#-pregled-projekta)
   - [Ključne Funkcionalnosti Aplikacije](#-ključne-funkcionalnosti-aplikacije)
   - [Tuzla Quest & Zajamčeni Footprint za Lokalne Biznise](#-tuzla-quest--zajamčeni-footprint-za-lokalne-biznise)
   - [Tehnološki Stack](#-tehnološki-stack)
   - [Simulacija Potrošnje Baterije](#-simulacija-potrošnje-baterije)
   - [Pokretanje i Razvoj](#-pokretanje-i-razvoj)
2. [🇬🇧 English Version](#-english-version)
   - [Project Overview](#-project-overview)
   - [Key Platform Features](#-key-platform-features)
   - [Tuzla Quest & Guaranteed Tourist Footprint for Local Businesses](#-tuzla-quest--guaranteed-tourist-footprint-for-local-businesses)
   - [Technical Architecture](#-technical-architecture)
   - [Setup & Deployment](#-setup--deployment)
3. [📄 License & Attribution](#-license--attribution)

---

## 🇧🇦 BOSANSKI JEZIK

### 📌 Pregled Projekta

**Tuzla Tour Guide** predstavlja vrhunsku progresivnu web aplikaciju (PWA) i hibridnu Android aplikaciju (Capacitor) skrojenu za posjetioce, turiste i građane grada Tuzle. Umjesto pasivnih brošura i statičnih web stranica, aplikacija nudi interaktivno istraživanje grada u stvarnom vremenu kroz spoj modernih senzora pametnih telefona, 3D kartografije, proširene stvarnosti (AR) i gejmifikacije s direktnim popustima i stvarnim nagradama.

Aplikacija rješava ključni problem lokalnog turizma: **kako turiste sa aerodroma i stanica usmjeriti direktno u lokalne radnje, restorane, hotele i zanatske radionice**. Kroz patentirani mehanizam geofencinga i verifikacije fizičkog prisustva, Tuzla Tour Guide garantuje stvarni posjetiteljski "footprint" lokalnim privrednicima.

---

### 🏛️ Ključne Funkcionalnosti Aplikacije

#### 1. 🧭 3D GPS Mape i Navigacija (`MapView.tsx` & `MapQuestView.tsx`)

- **MapLibre GL 3D Engine:** Prikaz terena s 3D nagibom (*pitch* do 60°) i rotacijom kompasa (*bearing*).
- **Višeslojni Prikaz:**
  - *Geoapify 3D / OSM Liberty:* Online vektorski sloj sa 3D volumenima zgrada i pješačkih zona.
  - *CARTO Voyager / OSM Raster:* Brzi alternativni sloj visoke čitljivosti.
  - *Lokalni PMTiles (Offline sloj):* Potpuna funkcionalnost mapa bez interneta pomoću `@makina-corpus/maplibre-offline-pmtiles`.
- **GPS Praćenje i Rutiranje:**
  - Dinamičko računanje pješačkih ruta i udaljenosti do tačaka interesa (POI).
  - Adaptivni low-pass filter (`AdaptiveLowPassFilter`) za uklanjanje GPS podrhtavanja.
  - Izvlačeći donji panel (`MapSheetDrawer.tsx`) s detaljima lokacije, cijenama ulaznica i radnim vremenom.

#### 2. 📱 Proširena Stvarnost — AR Vodič (`ARGuide.tsx` & `arProjection.ts`)

- **WebAR bez instalacije:** Koristi kameru telefona u kombinaciji sa žiroskopom, akcelerometrom i kompasom (`DeviceOrientation`).
- **Kombinovani 40/60 Prikaz:**
  - *Gornjih 40% ekrana:* 3D mapa s aktivnom rutom, azimutom i orijentacijom.
  - *Donjih 60% ekrana:* Živi video s kamere s 3D oznakama koje lebde iznad stvarnih lokacija u gradu.
- **Interaktivni HUD:**
  - Prikaz udaljenosti u realnom vremenu (metri/kilometri).
  - Bočne strelice (chevrons) koje usmjeravaju korisnika lijevo ili desno (`45° LEFT`, `90° RIGHT`).
  - "Target Locked" nišan kada se znamenitost ili ulaz u radnju centrira.
  - Prikaz putanje po tlu putem `ARPolylineCanvas.tsx`.

#### 3. 🎮 Gejmifikovana Potraga — Tuzla Quest (`constants/questData.ts` & `QUEST_GAME_MANUAL.md`)

Potraga vodi korisnika kroz 4 faze otkrivanja grada. Validacija lokacije vrši se **skeniranjem fizičkih QR kodova u objektima** ili **GPS približavanjem**:

- **Faza 1 (Temelji Tuzle):** Trg Slobode, Kapija, Spomenik Meši Selimoviću i Ismetu Mujezinoviću. Otključava Fazu 2 i video zapise.
- **Faza 2 (Kulturna Baština & Solni Identitet):** Park Kralja Tvrtka I, Palačinkara Bagi (lokalni ugostiteljski partner), Soni Trg. Otključava kolekcionarsku digitalnu fudbalsku NFT karticu.
- **Faza 3 (Jezera, Slapovi i Umjetnost):** Panonska jezera, Panonski slapovi, Slana Banja, Atelje Ismet Mujezinović. Otključava trofej "Srce Tuzle" sa nagradnim kuponom (`canvas-confetti`).
- **Grand Finale (Zlatni Partner):** Bingo City Centar (BCC). Otključava ekskluzivni kupon sa 20% popusta: `BCC-GOLDEN-TUZLA-2026`.
- **Pametna filtracija:** Posjećene lokacije prelaze u diskretni crno-bijeli prikaz, držeći fokus na preostalim metama.

---

### 🏪 Tuzla Quest & Zajamčeni Footprint za Lokalne Biznise

Tradicionalno digitalno oglašavanje naplaćuje preglede (*impressions*) ili klikove (*clicks*) bez ikakve garancije da će gost ikada zakoračiti u restoran ili radnju. **Tuzla Tour App jedina garantuje stvarni fizički posjetiteljski footprint**:

```
[Aerodrom TZL / Autobuska stanica] 
       │ (Skeniranje velikog QR koda dobrodošlice - PWA se otvara odmah, bez instalacije)
       ▼
[Jedan klik: Poziv Taxi 1525 ili GIPS Linija 34] 
       │ (Dolazak u centar grada)
       ▼
[Otvaranje taba: Tuzla Quest — 3D Mapa] 
       │ (Prikaz 3 markera Faze 1)
       ▼
[GPS Navigacija vodi turistu ka lokaciji] 
       │ (Na 25m udaljenosti stiže PUSH NOTIFIKACIJA: "Blizu ste! Otvorite AR vodič")
       ▼
[AR Vodič: Pješačka staza i strelice usmjeravanja] 
       │ (Na 5m udaljenosti pali se kamera sa visokom preciznošću usmjeravanja na ulaz radnje)
       ▼
[Ulazak u lokal & Fizičko skeniranje QR koda na pultu/stolu]
       │ (Korisnik ostvaruje TRENUTNIH 20% POPUSTA na račun/narudžbu!)
       ▼
[Zajamčeni Footprint za Partnera + Otključavanje Faze 2 & Solana NFT nagrade]
       │ (Nastavak rute kroz Panonska jezera i kulturne tačke)
       ▼
[Grand Finale: Bingo City Centar — Najveći regionalni partner]
```

#### Prednosti za Lokalne Privrednike

1. **100% Verifikovan Footprint (Anti-Fraud):** Nemoguće je lažirati posjetu od kuće — dvostruka verifikacija (GPS geofence + fizički QR kod na kasi/stolu) traži fizičko prisustvo gosta unutar radnje.
2. **Neposredna Konverzija u Potrošnju:** Popust od 20% motivira turistu da odmah naruči hranu, kupi suvenir ili rezerviše uslugu.
3. **Mjerljivi ROI:** Partner tačno zna koliko je posjetilaca došlo preko Tuzla Tour aplikacije.
4. **Puni Privacy by Design:** Zaštićena privatnost posjetilaca bez praćenja ličnih podataka, brojeva telefona ili izrade marketinških profila.

---

#### 4. 🎧 Pametni Audio Vodič & Neuronski TTS (`AudioGuideContext.tsx`, `tts.ts`)

- **Globalni lebdeći audio plejer:** Traka na dnu ekrana (`AudioControlBar.tsx`) omogućava neprekidno slušanje dok korisnik pregleda mape, traži restorane ili planira troškove.
- **Prirodni AI glasovi za EdgeTTS:**
  - 🇧🇦 **Bosanski:** `bs-BA-GoranNeural`
  - 🇬🇧 **Engleski:** `en-US-AndrewNeural`
  - 🇩🇪 **Njemački:** `de-DE-ConradNeural`
  - 🇹🇷 **Turski:** `tr-TR-AhmetNeural`
- **Bogata naracija:** Priče o 6.000 godina staroj eksploataciji soli, neolitskom sojeničkom naselju, povelji Kulina bana i modernom gradu.

#### 5. 💼 Digitalni Web3 Novčanik & Nagrade (`Wallet.tsx` & `SecurityGuard.tsx`)

- **PIN Zaštita:** 4-cifreni PIN pohranjen lokalno preko `@capacitor/preferences`.
- **Solana Web3 integracija:** Povezivanje sa Phantom i Solflare novčanicima na Solana Devnetu za preuzimanje kolekcionarskih NFT kartica.
- **Historija i Galerija:** Vremenski zapis svih skeniranih QR lokacija s mogućnošću pregleda 360° panorama (`pannellum`).
- **Konvertor valuta:** Fiksni dvosmjerni kurs BAM ⟷ EUR (1 EUR = 1.95583 BAM).

#### 6. 📅 Planer Boravka, Itinerer i Evidencija Troškova (`TaskManager.tsx`)

- **Preporučeni 3-dnevni plan:** Strukturirani plan obilaska od slijetanja na aerodrom do checkout-a.
- **Interaktivni personalni itinerer:** Jednim dodirom dodajte bilo koji hotel, restoran ili znamenitost u lični plan posjete uz check-box potvrdu posjete.
- **Evidencija troškova:** Unos stavki i iznosa u KM sa automatskim proračunom ukupnog troška, broja unosa i prosjeka po stavci (100% offline).
- **Kalendar gradskih događaja (`EventCalendarView.tsx`):** Pregled i filtriranje koncerata, festivala, sajmova i kulturnih dešavanja za 2026. i 2027. godinu.

#### 7. 🍽️ Ugostiteljstvo, Smještaj i Tranzit (`Food.tsx`, `Accommodation.tsx`, `PracticalTravelInfo.tsx`)

- **Provjereni smještaj:** Hoteli (Hotel Mellain, Hotel Salis, Golden Star) i apartmani s direktnim kontaktima, cijenama i navigacijom.
- **Tuzlanska gastronomija:** Tradicionalni tuzlanski ćevapi u polivenoj lepini, pite ispod sača, Palačinkara Bagi, uz Tuzlansko pivo.
- **Vodič za aerodrom (TZL):** Red vožnje linije 34, licencirani taksi 1525, rent-a-car i avio linije.

---

### 💻 Tehnološki Stack

| Segment | Tehnologije |
| --- | --- |
| **Korisnički interfejs** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Kartografija i GIS** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Proširena stvarnost (AR)** | HTML5 Camera API, DeviceOrientation Sensor Fusion, ENU Geodetic Engine (`arProjection.ts`), Hardware-Accelerated Canvas 2D |
| **QR Prepoznavanje** | `html5-qrcode` (kamera u realnom vremenu i galerija slika) |
| **Web3 & Blockchain** | `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets` |
| **Govor i Audio (TTS)** | Edge Neural TTS API, Web Speech API |
| **Mobilna platforma** | Capacitor 8 (Android Geolocation, Camera, Preferences, Local Notifications) |
| **PWA & Build** | Vite 6, `vite-plugin-pwa`, Workbox Service Worker |

---

### 🔋 Simulacija Potrošnje Baterije

| Hardverski Podsistem | ⚡ Max Performance (60 FPS, 1080p) | ⚖️ Balanced Režim (30 FPS, 720p) | 🍃 Battery Saver / Eco (15 FPS, 480p) | 🧭 Kompas / 360 (Kamera Isključena) | 🎧 Audio / Standby (Ekran Isključen) |
| --- | --- | --- | --- | --- | --- |
| **UKUPNA SNAGA (mW)** | **~3,985 mW** | **~2,485 mW** | **~1,485 mW** | **~1,245 mW** | **~220 mW** |
| **Prosječna Struja (mA)** | **~1,035 mA** | **~645 mA** | **~385 mA** | **~323 mA** | **~57 mA** |
| **Potrošnja po Satu (%/h)** | **~23.0% / h** | **~14.3% / h** | **~8.5% / h** | **~7.2% / h** | **~1.3% / h** |
| **Procijenjena Autonomija** | **~4.3 sati rada** | **~7.0 sati rada** | **~11.7 sati rada** | **~13.9 sati rada** | **~75+ sati rada** |

> **Stationary Energy Optimization:** Ako se korisnik ne pomjeri više od 1.5m tokom 5 sekundi, AR kamera automatski spušta FPS na 15, štedeći 40-50% energije kamere.

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
npx cap sync android
npx cap open android
```

---
---

## 🇬🇧 ENGLISH VERSION

### 📌 Project Overview

**Tuzla Tour Guide** (`com.tuzlatourguide`) is a state-of-the-art Progressive Web App (PWA) and hybrid mobile application (Capacitor / Android) engineered for visitors and citizens of Tuzla, Bosnia and Herzegovina. The platform blends high-precision **3D GPS navigation**, **camera-based Augmented Reality (AR)**, a **gamified city AR Quest with verified physical in-store QR scanning**, **neural text-to-speech audio tours**, **hospitality and dining directories**, and a **personal travel itinerary with an offline expense ledger**.

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
  - "Target Locked" reticle when a landmark or storefront entrance is centered in view.
  - Canvas ground path trajectory drawing via `ARPolylineCanvas.tsx`.

---

### 🏪 Tuzla Quest & Guaranteed Tourist Footprint for Local Businesses

Digital ads generally deliver abstract impressions and clicks with zero accountability. **Tuzla Tour Guide is specifically engineered to deliver guaranteed physical footfall into local restaurants, coffee shops, boutiques, and hotels**:

```
[Arrival at Tuzla Airport (TZL) or Main Bus Station]
       │ (Scan airport welcome banner QR code ➔ PWA launches instantly, zero installation)
       ▼
[1-Tap Transit Dispatch: Taxi 1525 or GIPS Bus Line 34]
       │ (Seamless arrival in central Tuzla)
       ▼
[Open Tuzla Quest Tab ➔ Interactive 3D City Map]
       │ (Explore 3 active markers for Stage 1)
       ▼
[GPS Pedestrian Navigation toward target venue / landmark]
       │ (At 25m distance: High-priority Push Notification: "You're close! Open AR Guide")
       ▼
[AR Guide Activated: 3D Ground Pathway & Orientation Chevrons]
       │ (At 5m distance: High-accuracy optical camera activates, locking onto venue entrance)
       ▼
[Step Inside & Scan Physical In-Store QR Code at Register / Table]
       │ (User instantly receives an official 20% DISCOUNT on their bill/order!)
       ▼
[Verified Physical Footprint for Merchant + Stage 2 Unlocked + Solana NFT Reward]
       │ (Quest continues through Pannonian Lakes, Slana Banja, and cultural gems)
       ▼
[Grand Finale: Bingo City Center (BCC) — Premier Regional Sponsor Reward]
```

#### Why Local Businesses Win

- **100% Anti-Fraud Footfall:** By combining GPS geofencing with a physical QR code stationed inside the venue, discounts cannot be claimed remotely. Guests must be physically on premise.
- **Direct Checkout Conversion:** The 20% discount incentivizes immediate consumer spend at the cash register.
- **Quantifiable Return on Investment:** Local business partners receive concrete attribution metrics for every customer guided through their doors.
- **Privacy by Design:** Full GDPR & BiH Privacy Law compliance. No personal identifying information or credit card numbers are collected or shared.

---

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
- **Solana Web3 Integration:** Direct connection to Phantom and Solflare wallets on Solana Devnet to claim exclusive collectible NFT cards.
- **Scan History Ledger:** Local chronological log of visited landmarks with access to unlocked 360° panoramas (`pannellum`) and documentary videos.
- **Currency Converter:** Instant two-way conversion between Bosnian Marks (BAM) and Euros (EUR).

#### 6. 📅 Personal Travel Itinerary & Expense Ledger (`TaskManager.tsx`)

- **Recommended 3-Day Plan:** Pre-configured tour from airport arrival to historic fortress excursions.
- **Customizable Itinerary:** One-tap addition of any attraction, hotel, or eatery from the directories, complete with completion checkboxes.
- **Travel Budget & Expense Ledger:** Convenient entry of travel expenses in BAM/KM with automatic totals, entry count, and average cost calculations (100% offline).
- **City Events Calendar (`EventCalendarView.tsx`):** Filter verified music, cultural, theatre, and sports events across 2026 and 2027.

#### 7. 🍽️ Hospitality, Dining & Transit (`Food.tsx`, `Accommodation.tsx`, `PracticalTravelInfo.tsx`)

- **Verified Accommodations:** Top-rated hotels (Hotel Mellain, Hotel Salis, Golden Star) and private apartments with one-tap calling, direct booking links, and map pins.
- **Local Gastronomy:** Authentic Tuzlanski ćevapi in poliveni somun, traditional baked pies (burek, sirnica), Bagi crepes, and Pivara Tuzla beer.
- **Airport Logistics (TZL):** Direct GIPS Bus Line 34 timetables, licensed taxi rates (1525), and direct flights from across Europe.

---

### 💻 Technical Specifications

| Component | Library / Framework |
| --- | --- |
| **Core Framework** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **GIS & 3D Mapping** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Augmented Reality (AR)** | HTML5 Camera API, DeviceOrientation Sensor Fusion, ENU Geodetic Engine (`arProjection.ts`), Hardware-Accelerated Canvas 2D |
| **QR Code Scanner** | `html5-qrcode` (camera and file-based scanning) |
| **Blockchain & Web3** | `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets` |
| **Speech & Audio** | Edge Neural TTS API, Web Speech API |
| **Mobile Runtime** | Capacitor 8 (Android Geolocation, Camera, Preferences, Local Notifications) |
| **Build & PWA** | Vite 6, `vite-plugin-pwa`, Workbox Service Worker |

---

## 📄 License & Attribution

- **Developed by:** **AISO Tuzla** in partnership with local tourism and heritage organizations.
- **License:** Released under the [MIT License](LICENSE).
- **Official URLs & Resources:**
  - Production App: [https://tuzlatour.vercel.app](https://tuzlatour.vercel.app)
  - PWA Live Mirror: [https://tuzlatourguide.netlify.app](https://tuzlatourguide.netlify.app)
  - Privacy Policy (EN): [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
  - Politika Privatnosti (BS): [Politika Privatnosti za Tuzla Tour App.md](Politika%20Privatnosti%20za%20Tuzla%20Tour%20App.md)
  - Quest Player Manual: [QUEST_GAME_MANUAL.md](QUEST_GAME_MANUAL.md)
  - Battery Saver Guide: [BATTERY_SAVER_FEATURE.md](BATTERY_SAVER_FEATURE.md)
