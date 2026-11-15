# Tuzla Tour Guide

Tuzla Tour Guide is a multilingual travel companion for exploring **Tuzla, Bosnia and Herzegovina**. It combines an interactive map, GPS-assisted navigation, camera-based AR guidance, a city discovery game, local information, audio guides and trip-planning tools.

The project is built as a React web application and Progressive Web App (PWA), with a Capacitor Android wrapper. The web and mobile experiences share the same application code.

> **Project status:** The app is under active development. Quest QR unlocking currently operates as a local testing flow. Supabase infrastructure has been prepared, but player authentication, cloud-synchronised progress and server-side QR + GPS verification are not yet integrated into the player experience. Do not treat a local unlock as proof of a verified visit.

## Features

- **Explore Tuzla:** browse points of interest and local information on an interactive MapLibre map.
- **GPS navigation:** use device location to show the user's position, direction and distance to selected places. Location permission is optional and is needed for location-based features.
- **AR guidance:** use the device camera and orientation sensors for visual navigation cues. AR overlays are navigation aids, not survey-grade positioning or proof of presence.
- **Tuzla Quest:** explore 12 POIs in four phases and scan QR codes using the live camera during the current test stage.
- **Audio guides:** listen to location-based audio content where available.
- **Trip tools:** use itinerary, travel information and expense-tracking features.
- **PWA and Android:** install the web app where supported or run the Android app through Capacitor.
- **Offline support:** some app assets and previously cached content may remain available offline. Live maps, remote content and network-backed features still require connectivity.

Feature availability can vary by browser, device, permissions, network and deployment configuration.

## Quest at a glance

| Phase | Theme | POIs |
| --- | --- | ---: |
| 1 | Foundations of Tuzla | 4 |
| 2 | Culture, dining and salt heritage | 3 |
| 3 | Lakes, waterfalls and art | 4 |
| 4 | Grand finale | 1 |
| **Total** | | **12** |

See [QUEST_GAME_MANUAL.md](QUEST_GAME_MANUAL.md) for the current player rules, POI list, testing limitations and planned verification model.

## Technology

| Area | Main technologies |
| --- | --- |
| UI | React 18, TypeScript |
| Build tooling | Vite 6 |
| Styling | Tailwind CSS 4 |
| Maps | MapLibre GL, PMTiles |
| PWA | vite-plugin-pwa, Workbox |
| Mobile wrapper | Capacitor 8 (Android project) |
| Camera / QR | HTML Media APIs, html5-qrcode |
| Location | Browser Geolocation and Capacitor Geolocation |
| Local preferences | Capacitor Preferences and browser storage |
| Data client | Supabase JS client (integration in progress) |
| Events API | Vercel serverless API with Vercel Blob / PostgreSQL storage |

The repository may contain dependencies or experimental code for capabilities that are not yet enabled in production. A dependency being installed does not mean that the corresponding feature is live.

## Requirements

- Node.js **24.6.x** (see the `engines` field in `package.json`)
- npm
- Git
- VS Code or another TypeScript-capable editor

## Local development

### 1. Clone the repository

```powershell
git clone https://github.com/aisotuzla/TuzlaTourApp.git
cd TuzlaTourApp
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values required for the features you are developing.

The Supabase client scaffold uses:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

A Supabase publishable key is intended for use in a browser when Row Level Security (RLS) is correctly configured. **Never put a Supabase secret/service-role key, database password, Vercel token or other server credential in a `VITE_*` variable or commit it to Git.**

Some optional integrations may require additional environment variables. Check the relevant feature code and deployment environment before enabling them.

### 4. Start the development server

```powershell
npm run dev
```

Vite prints the local URL in the terminal.

### 5. Run a production build

```powershell
npm run build
```

### 6. Preview the production build

```powershell
npm run preview
```

## Android development

The repository includes a Capacitor Android project.

```powershell
npm run sync:android
npx cap open android
```

The Android build requires the Android Studio / Android SDK toolchain. Camera, location and notification behaviour should be tested on a physical device as well as in a browser.

The current repository configuration should not be interpreted as a completed iOS release. An iOS target, signing, permissions and device testing must be prepared separately before an iOS distribution.

## Supabase integration status

The connected Supabase project has been prepared with:

- PostGIS enabled;
- `profiles`, `quests` and `quest_completions` tables;
- row-level security policies;
- 12 seeded quest POIs with a 20-metre radius;
- an Auth trigger that creates a profile when a user registers;
- generated TypeScript database types and a typed client scaffold in this feature branch.

The player app does **not yet** use Supabase Auth or submit quest completions to the backend. The `qr_code_id` values must be populated only after the actual QR payloads have been checked. The production completion endpoint/function must validate the authenticated player, QR identifier, location and accuracy on the server, and award progress transactionally.

See the [Supabase documentation](https://supabase.com/docs) and the repository's migration history when continuing this work.

## Privacy and user permissions

The app may request access to:

- **Location**, for map positioning, distance and navigation features;
- **Camera**, for live QR scanning and AR views;
- **Device orientation/motion**, for compass and AR direction cues;
- **Notifications**, if a supported notification feature is enabled.

These permissions should be requested in context and can be denied in browser or operating-system settings. The app should remain usable for features that do not require a denied permission.

Read the [Privacy Policy](PRIVACY_POLICY.md) and [Cookie Policy](COOKIE_POLICY.md). These documents describe the current implementation and distinguish it from planned backend functionality.

## Project documents

- [Privacy Policy](PRIVACY_POLICY.md)
- [Cookie Policy](COOKIE_POLICY.md)
- [Tuzla Quest Player Manual](QUEST_GAME_MANUAL.md)
- [Events API security setup](docs/EVENTS_API_SECURITY.md)

## Deployment notes

The repository has been configured for Vercel and has also been used for a Netlify-hosted PWA. Deployment status can change; check the provider dashboard and the latest commit checks rather than relying on a badge or an old deployment URL.

For Vercel deployments, configure environment variables in the Vercel project settings. Never commit production secrets. The events API mutation routes require a server-side `EVENTS_ADMIN_TOKEN` on the feature branch; any trusted importer must send the bearer token from a server environment, never from the browser or mobile bundle.

## Contributing

1. Create a feature branch.
2. Keep changes focused and update the relevant documentation.
3. Run `npm run build` before opening a pull request.
4. Test camera, location, offline behaviour and mobile permissions on real devices when those areas are affected.
5. Never commit credentials, private keys, user data or production exports.

## License and project contact

The repository includes a [LICENSE](LICENSE) file. Check that file for the exact license terms.

Project contact currently listed in the repository: **aisotuzla@proton.me**.

Tuzla Tour Guide is an independent software project. References to local places, businesses, public services or cultural institutions do not imply endorsement or a formal partnership unless that relationship is separately confirmed.
