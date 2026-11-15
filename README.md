# Tuzla Tour Guide — Official Documentation & Architecture 🇧🇦

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://tuzlatour.vercel.app)
[![Netlify Deployment](https://img.shields.io/badge/Netlify-Live_PWA-00C7B7?style=for-the-badge&logo=netlify)](https://tuzlatourguide.netlify.app)
[![Solana Integration](https://img.shields.io/badge/Solana-Web3_Rewards-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Capacitor Native](https://img.shields.io/badge/Capacitor-Android_8.4-119EFF?style=for-the-badge&logo=capacitor)](https://capacitorjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Tuzla Tour Guide** is an all-in-one smart travel platform, multilingual interactive 3D map, tour guide, and AR exploration companion for Tuzla, Bosnia and Herzegovina. The platform unites **real-time 3D GPS navigation**, **camera-based Augmented Reality (AR) guidance**, a **gamified city AR Quest with physical in-store QR code verification**, **guaranteed tourist footprint driving customers into local shops & restaurants**, **neural text-to-speech audio guides** in 4 languages, **comprehensive hospitality and dining directories**, a **personal travel itinerary with an offline expense ledger**, and **real-time Web3 rewards on the Solana blockchain**.

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

**Tuzla Tour Guide** predstavlja vrhunsku progresivnu web aplikaciju (PWA) i hibridnu Android aplikaciju (Capacitor) skrojenu za posjetioce, turiste i građane grada Tuzle. Umjesto pasivnih brošura i statičnih web stranica, aplikacija nudi interaktivno istraživanje grada u stvarnom vremenu kroz spoj modernih senzora pametnih telefona, 3D kartografije, proširene stvarnosti (AR) i gejmifikacije s direktnim popustima i stvarnim nagradama.

Aplikacija rješava ključni problem lokalnog turizma: **kako turiste sa aerodroma i stanica usmjeriti direktno u lokalne radnje, restorane, hotele i zanatske radionice**. Kroz patentirani mehanizam geofencinga i verifikacije fizičkog prisustva, Tuzla Tour Guide garantuje stvarni posjetiteljski "footprint" lokalnim privrednicima.

---

### 🏛️ Ključne Funkcionalnosti Aplikacije

#### 🧭 3D GPS Mape i Navigacija (`MapView.tsx` & `MapQuestView.tsx`)

- **MapLibre GL 3D Engine:** Prikaz terena s 3D nagibom (*pitch* do 60°) i rotacijom kompasa (*bearing*).
- **Višeslojni Prikaz:**
  - *Geoapify 3D / OSM Liberty:* Online vektorski sloj sa 3D volumenima zgrada i pješačkih zona.
  - *CARTO Voyager / OSM Raster:* Brzi alternativni sloj visoke čitljivosti.
  - *Lokalni PMTiles (Offline sloj):* Potpuna funkcionalnost mapa bez interneta pomoću `@makina-corpus/maplibre-offline-pmtiles`.
- **GPS Praćenje i Rutiranje:**
  - Dinamičko računanje pješačkih ruta i udaljenosti do tačaka interesa (POI).
  - Adaptivni low-pass filter (`AdaptiveLowPassFilter`) za uklanjanje GPS podrhtavanja.
  - Izvlačeći donji panel (`MapSheetDrawer.tsx`) s detaljima lokacije, cijenama ulaznica i radnim vremenom.

#### 📱 Proširena Stvarnost — AR Vodič (`ARGuide.tsx` & `arProjection.ts`)

- **WebAR bez instalacije:** Koristi kameru telefona u kombinaciji sa žiroskopom, akcelerometrom i kompasom (`DeviceOrientation`).
- **Kombinovani 40/60 Prikaz:**
  - *Gornjih 40% ekrana:* 3D mapa s aktivnom rutom, azimutom i orijentacijom.
  - *Donjih 60% ekrana:* Živi video s kamere s 3D oznakama koje lebde iznad stvarnih lokacija u gradu.
- **Interaktivni HUD:**
  - Prikaz udaljenosti u realnom vremenu (metri/kilometri).
  - Bočne strelice (chevrons) koje usmjeravaju korisnika lijevo ili desno (`45° LEFT`, `90° RIGHT`).
  - "Target Locked" nišan kada se znamenitost ili ulaz u radnju centrira.
  - Prikaz putanje po tlu putem `ARPolylineCanvas.tsx`.

#### 🎮 Gejmifikovana Potraga — Tuzla Quest (`constants/questData.ts` & `QUEST_GAME_MANUAL.md`)

Potraga vodi korisnika kroz 4 faze otkrivanja grada. Validacija lokacije vrši se **skeniranjem fizičkih QR kodova u objektima** ili **GPS približavanjem**:

- **Faza 1 (Temelji Tuzle):** Trg Slobode - Stara Česma, Kapija, Spomenik Meši Selimoviću i Ismetu Mujezinoviću. Otključava Fazu 2 i video zapise.
- **Faza 2 (Kulturna Baština & Solni Identitet):** Park Kralja Tvrtka I, Palačinkara Bagi (lokalni ugostiteljski partner), Soni Trg. Otključava fazu 3, popust coupon:'PANCAKE_BAGI_20%', 3D Povelja Kulina Bana.
- **Faza 3 (Jezera, Slapovi i Umjetnost):** Panonska jezera, Panonski slapovi, Slana Banja, Atelje Ismet Mujezinović. Otključava trofej "Srce Tuzle" sa nagradnim kuponom (`canvas-confetti`).
- **Grand Finale (Zlatni Partner):** Bingo City Centar (BCC). Otključava ekskluzivni kupon sa 20% popusta: `BCC-GOLDEN-TUZLA-2026`.
- **Pametna filtracija:** Posjećene lokacije prelaze u diskretni crno-bijeli prikaz, držeći fokus na preostalim metama.

---

#### 🎧 Pametni Audio Vodič & Neuronski TTS (`AudioGuideContext.tsx`, `tts.ts`)

- **Globalni lebdeći audio plejer:** Traka na dnu ekrana (`AudioControlBar.tsx`) omogućava neprekidno slušanje dok korisnik pregleda mape, traži restorane ili planira troškove.
- **Prirodni AI glasovi za EdgeTTS:**
  - 🇧🇦 **Bosanski:** 
  - 🇬🇧 **Engleski:** 
  - 🇩🇪 **Njemački:** 
  - 🇹🇷 **Turski:** 
- **Bogata naracija:** Priče o 6.000 godina staroj eksploataciji soli, neolitskom sojeničkom naselju, povelji Kulina bana i modernom gradu.


#### 📅 Planer Boravka, Itinerer i Evidencija Troškova (`TaskManager.tsx`)

- **Preporučeni 3-dnevni plan:** Strukturirani plan obilaska od slijetanja na aerodrom do checkout-a.
- **Interaktivni personalni itinerer:** Jednim dodirom dodajte bilo koji hotel, restoran ili znamenitost u lični plan posjete uz check-box potvrdu posjete.
- **Evidencija troškova:** Unos stavki i iznosa u KM sa automatskim proračunom ukupnog troška, broja unosa i prosjeka po stavci (100% offline).
- **Kalendar gradskih događaja (`EventCalendarView.tsx`):** Pregled i filtriranje koncerata, festivala, sajmova i kulturnih dešavanja za 2026. i 2027. godinu.

#### 🍽️ Ugostiteljstvo, Smještaj i Tranzit (`Food.tsx`, `Accommodation.tsx`, `Transportation.tsx', PracticalTravelInfo.tsx`)

- **Provjereni smještaj:** Hoteli (Hotel Mellain, Hotel Salis, Golden Star) i apartmani s direktnim kontaktima, cijenama i navigacijom.
- **Tuzlanska gastronomija:** Tradicionalni tuzlanski ćevapi u polivenoj lepini, pite ispod sača, Palačinkara Bagi, uz Tuzlansko pivo.
- **Vodič za aerodrom (TZL):** Red vožnje autobuskih linija, licencirani gradski taksi 1525, rent-a-car i avio linije.
**Infrastrukturni hosting provajderi:** Vercel Inc. i Netlify Inc. (isporuka statičkih PWA web aplikacija).
- Aplikacija postuje zaštiti vaše privatnosti i osiguravanju sigurnog rukovanja vašim podacima u skladu sa najvišim standardima privatnosti po dizajnu (*Privacy by Design*). Rađena je u skladu sa Zakonom o zaštiti ličnih podataka F. Bosne i Hercegovine i opštom uredbom o zaštiti podataka Evropske unije (GDPR).
-Kontrolor podataka: AISO Tuzla (Razvojni tim Tuzla Tour Guide)  
 Sjedište: Tuzla, Bosna i Hercegovina  
Kontakt e-mail: aisotuzla@proton.me  

--Podaci koje obrađujemo i kako ih koristimo

Naša osnovna filozofija je **lokalna obrada na uređaju korisnika (Client-Side Edge Processing)**. Vaši senzorski podaci ne putuju na naše servere.

### A. Podaci o lokaciji i geofencing obavijesti (Perimetar od 25 metara)

- **Svrha:**
  - Izračunavanje pješačke rute i udaljenosti do tačaka interesa (POI), restorana, hotela i partnera.
  - Slanje **lokalnih push notifikacija na uređaju kada se približite na 25 metara od znamenitosti ili partnerske radnje** ("Blizu ste! Otvorite AR vodič").
  - Geografska validacija napretka u Tuzla Quest potrazi (verifikacija prisustva).
- **Obrada:**
  - Podaci o GPS koordinatama se obrađuju **isključivo lokalno na čipu vašeg telefona**.
  - Aplikacija **NE prati** vašu lokaciju u pozadini kada je aplikacija zatvorena.
  - Koordinate se **NE pohranjuju** na eksterne servere i **NE dijele** sa marketinškim mrežama.
  - Notifikacije na 25 metara generiše operativni sistem telefona (Local Notifications API).
- **Pravni osnov:** Vaš izričiti pristanak (član 6(1)(a) GDPR).

### 💻 Tehnološki Stack

| Segment | Tehnologije |
| --- | --- |
| **Korisnički interfejs** | React 18, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Kartografija i GIS** | MapLibre GL 5, `@makina-corpus/maplibre-offline-pmtiles`, Geoapify, CARTO |
| **Proširena stvarnost (AR)** | HTML5 Camera API, DeviceOrientation Sensor Fusion, ENU Geodetic Engine (`arProjection.ts`), Hardware-Accelerated Canvas 2D |
| **QR Prepoznavanje** | `html5-qrcode` (kamera u realnom vremenu i galerija slika) |
| **Govor i Audio (TTS)** | Edge Neural TTS API, Web Speech API |
| **Mobilna platforma** | Capacitor 8 (Android Geolocation, Camera, Preferences, Local Notifications) + Firebase Push Notifications |
| **PWA & Build** | Vite 6, `vite-plugin-pwa`, Workbox Service Worker |

---

### 🔋 Simulacija Potrošnje Baterije

| Hardverski Podsistem | ⚡ Max Performance (60 FPS, 1080p) | ⚖️ Balanced Režim (30 FPS, 720p) | 🍃 Battery Saver / Eco (15 FPS, 480p) | 🧭 Kompas / 360 (Kamera Isključena) | 🎧 Audio / Standby (Ekran Isključen) |

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

## 🇬🇧 ENGLISH VERSION

### 📌 Project Overview

**Tuzla Tour Guide** (`com.tuzlatourguide`) is a state-of-the-art Progressive Web App (PWA) and hybrid mobile application (Capacitor / Android) engineered for visitors and citizens of Tuzla, Bosnia and Herzegovina. The platform blends high-precision **3D GPS navigation**, **camera-based Augmented Reality (AR)**, a **gamified city AR Quest with verified physical in-store QR scanning**, **neural text-to-speech audio tours**, **hospitality and dining directories**, and a **personal travel itinerary with an offline expense ledger**.

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
 
