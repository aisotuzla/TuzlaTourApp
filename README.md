# Tuzla Tour App - Comprehensive Digital Guide 🇧🇦

Welcome to the **Tuzla Tour App**, a premium Progressive Web Application (PWA) designed to provide an immersive, gamified, and highly interactive experience for tourists and locals in Tuzla, Bosnia and Herzegovina.

---

## 🚀 Technology Stack

This application is built using a state-of-the-art modern web stack, optimized for performance, animations, and cross-platform compatibility.

- **Core**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (latest v4 features)
- **Mapping**: [MapLibre GL](https://maplibre.org/) (High-performance 3D mapping)
- **Virtual Tours**: [Pannellum](https://pannellum.org/) (360° Equirectangular imagery)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Premium UI transitions)
- **Scanning**: [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) (Camera-based QR recognition)
- **Mobile Foundation**: [Capacitor 8](https://capacitorjs.com/) (Seamless Android/iOS deployment)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight and fast)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ✨ Key Features

### 1. Interactive 3D Mapping
The app features a custom-styled map with:
- **3D Buildings**: Realistic city depth and lighting.
- **Metallic Lighting Effects**: Advanced MapLibre lighting for a premium feel.
- **Custom Markers**: Themed markers for different categories (Culture, Nature, Food, Shopping).
- **GPS Navigation**: Real-time routing from the user's location to any Point of Interest (POI).

### 2. Immersive 360° Virtual Tours
Explore Tuzla's landmarks from anywhere:
- **High-Definition Panoramas**: Stitched equirectangular images (e.g., King Tvrtko Park).
- **Embedded Hotspots**: Interactive points within the virtual tour (via JSON configuration).
- **StreetView Experience**: Accessible directly from map markers or unlocked rewards.

### 3. The Quest System (Gamification)
The heart of the app is the "Tuzla Quest":
- **How it Works**: Users find hidden "Quest Targets" on the map.
- **Unlocking**: To unlock a reward, the user must physically visit the location and scan a specific QR code.
- **Rewards**: Scanning unlocks exclusive content, such as:
  - 360° Virtual Discovery tours.
  - Cinematic Video stories.
  - Audio guides.
  - Special discounts for local shops and restaurants.

### 4. World Cup 2026 Module
A special dedicated tab for football fans:
- **National Team Roster**: Full squad list of Bosnia and Herzegovina.
- **Player Stats**: Detailed ratings (OVR, PAC, SHO, PAS, DRI, DEF, PSY).
- **Match Predictions**: Interactive module for predicting tournament outcomes.

### 5. Multi-Language Support
Full localization for:
- 🇬🇧 English
- 🇧🇦 Bosnian
- 🇩🇪 German
- 🇹🇷 Turkish

---

## 🛠️ How to Extend & Customize

### Adding New Points of Interest (POI)
To add a new location to the map:
1. Open `constants.tsx`.
2. Find the `LOCATIONS_RAW` array.
3. Add a new object with `id`, `name`, `coordinates`, and `category`.

### Adding a New Quest Reward
To add a new QR-locked reward:
1. Define the target in `MapQuestView.tsx` under `QUEST_TARGETS`.
2. Assign an `id` that matches the value encoded in the physical QR code.
3. Attach an `image`, `video`, or `panorama` (360° tour).

### Adding Shops & Businesses
Businesses can be added to the `LOCATIONS_RAW` in `constants.tsx` using the `shopping` or `food` categories. These will appear with unique icons and can be linked to the Quest system for "Unlockable Discounts."

---

## 📱 Deployment

### Web & PWA (Vercel)
The app is optimized for Vercel. 
- Run `npm run build` to generate the production bundle.
- The **Service Worker** (via `vite-plugin-pwa`) handles offline caching of large assets (videos/panoramas).

### Mobile (Android/iOS)
Using Capacitor, the app can be converted to a native binary:
```bash
npm run build
npx cap sync android
# Open in Android Studio
npx cap open android
```

---
---

# Tuzla Tour App - Sveobuhvatni Digitalni Vodič 🇧🇦

Dobrodošli u **Tuzla Tour App**, vrhunsku Progresivnu Web Aplikaciju (PWA) dizajniranu da pruži imerzivno, gejmifikovano i visoko interaktivno iskustvo za turiste i stanovnike Tuzle.

## 🚀 Tehnološki Stack

Aplikacija je izgrađena koristeći najmodernije tehnologije, optimizovane za performanse i rad na svim platformama.

- **Osnova**: React 19 + Vite 6 + TypeScript
- **Dizajn**: Tailwind CSS 4
- **Mape**: MapLibre GL (3D mape visokih performansi)
- **Virtualne Ture**: Pannellum (360° panoramski prikazi)
- **Animacije**: Framer Motion
- **Skeniranje**: HTML5-QRCode
- **Mobilna Platforma**: Capacitor 8 (Android i iOS podrška)

---

## ✨ Ključne Karakteristike

### 1. Interaktivne 3D Mape
Mapa sadrži:
- **3D Zgrade**: Realističan prikaz dubine grada.
- **Napredno Osvjetljenje**: Metalni efekti na mapi za premium izgled.
- **Prilagođeni Markeri**: Tematske ikonice za Kulturu, Prirodu, Hranu i Shopping.
- **GPS Navigacija**: Rutiranje u stvarnom vremenu od korisnikove lokacije do bilo koje tačke interesa.

### 2. 360° Virtualne Ture
Istražite znamenitosti Tuzle:
- **HD Panorame**: Visokokvalitetni snimci (npr. Park Kralja Tvrtka I).
- **Hotspots**: Interaktivne tačke unutar ture.
- **StreetView Iskustvo**: Pristupite direktno sa mape ili putem otključanih nagrada.

### 3. Quest Sistem (Potraga)
Srce aplikacije je "Tuzla Quest":
- **Kako funkcioniše**: Korisnici pronalaze skrivene "Quest Mete" na mapi.
- **Otključavanje**: Da bi otključali nagradu, korisnici moraju fizički posjetiti lokaciju i skenirati QR kod.
- **Nagrade**: Skeniranje otključava ekskluzivni sadržaj:
  - Virtualne 360° ture.
  - NFT - Digitalne Kartice BIH igrača - kolekcionarske
  - Specijalne popuste u lokalnim radnjama i restoranima.

### 4. Svjetsko Prvenstvo 2026 Modul
Poseban dio za ljubitelje fudbala:
- **Sastav Reprezentacije**: Kompletan spisak igrača Bosne i Hercegovine.
- **Statistike**: Detaljne ocjene igrača.
- **Predikcije**: Interaktivni modul za predviđanje rezultata prvenstva.

### 5. Višejezična Podrška
Kompletna lokalizacija na:
- 🇬🇧 Engleski
- 🇧🇦 Bosanski
- 🇩🇪 Njemački
- 🇹🇷 Turski

### 6. Parking SMS
  Mapa sa parkiring zonama i lokalnim parkinzima
  Zona 0 - Zona 1 - Zona 2 na 1h i 24h
  Jednostavna u uplata unosom tablica vozila odabir zone i uplata
---
### 7. Ponuda Restorana, hotela, apartmana i stan na dan.

### 8. Gradski Vodić, 
       Historija, 
       Galerija,
       Rokovnik
       AISO Tuzla, AI Agentic optimization
       House of Salt,
       Dentalni turizam
## 🛠️ Proširivanje Aplikacije

### Dodavanje Novih Lokacija (POI)
1. Otvorite `constants.tsx`.
2. Pronađite niz `LOCATIONS_RAW`.
3. Dodajte novi objekat sa koordinatama i kategorijom.

### Dodavanje Quest Nagrada
1. Definišite metu u `MapQuestView.tsx` unutar `QUEST_TARGETS`.
2. ID mora odgovarati onome što je upisano u fizički QR kod.
3. Povežite sliku, video ili 360° panoramu.

---

## 📱 Deployment

### Web (Vercel)
Aplikacija je optimizovana za Vercel. Service Worker automatski kešira velike fajlove za offline rad.

### Mobilne Aplikacije (Android)
```bash
npm run build
npx cap sync android
```
Aplikacija se potom može otvoriti i kompajlirati u Android Studiju.
