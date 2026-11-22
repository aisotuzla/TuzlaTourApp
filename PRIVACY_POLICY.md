# Privacy Policy — Tuzla Tour Guide

**Last updated:** 21 November 2026  
**Applies to:** Tuzla Tour Guide Web Application, Progressive Web App (PWA), and Capacitor Android Application.

This Privacy Policy explains how **Tuzla Tour Guide** ("we", "us", "our") processes your information. We are committed to protecting your privacy and designing our software with privacy by default.

---

## 1. Who We Are & Data Controller

- **Project:** Tuzla Tour Guide / AISO Tuzla
- **Location:** Tuzla, Bosnia and Herzegovina
- **Contact:** [aisotuzla@proton.me](mailto:aisotuzla@proton.me)
- **Subject for Privacy Requests:** `Privacy Request — Tuzla Tour Guide`

---

## 2. Core Privacy Principles

1. **Privacy by Default**: We do not require personal accounts, phone numbers, or email addresses to use the app or complete the Tuzla Quest.
2. **No Background Location Tracking**: Your GPS location is accessed strictly when you actively use location-based features (e.g., viewing your position on the map or scanning a quest marker). Continuous background location trails are never recorded or stored.
3. **No Advertising or Surveillance**: We do not sell user data, display behavioral advertisements, or embed trackers from ad networks (such as Google AdSense, Meta Pixel, or commercial data brokers).
4. **On-Device First**: Travel notes, itineraries, offline map styles, and local scan history are stored locally on your device unless you interact with online services.

---

## 3. Information We Process

### 3.1 Location Data (GPS & Orientation Sensors)
- **How it is used**:
  - To display your current position on the 3D map.
  - To compute real-time directional heading and distance in the Tactical Compass HUD.
  - To verify that you are physically present within the allowed 20–25 meter perimeter of a historic landmark when scanning a quest QR code.
- **Data flow**:
  - Map navigation and compass math are processed locally on your device.
  - When scanning a quest QR marker, a one-time coordinate pair `(latitude, longitude)` is transmitted over encrypted TLS to our Supabase database server. The server uses PostGIS spatial functions solely to verify geodesic proximity to the landmark. These coordinates are not stored as a travel history.
- **Your control**: Location access requires explicit OS or browser permission and can be toggled off at any time.

### 3.2 Camera Permission & QR Scanning
- **How it is used**:
  - Exclusively to detect and decode physical QR code markers installed at points of interest.
- **Data flow**:
  - The live camera feed is processed in real time in device memory using `html5-qrcode`.
  - No photos, videos, or facial images are captured, saved, or uploaded to any server.
- **Your control**: Camera permission is requested only when opening the QR scanner. Denying permission prevents quest scanning but leaves all map, audio, and guide features fully operational.

### 3.3 Player Sessions & Quest Progress
- **Anonymous Guest Authentication**:
  - To award quest XP, record unlocked phases, and prevent duplicate completions, the app provisions an anonymous guest identifier via Supabase Auth (`signInAnonymously()`).
  - This identifier contains no personally identifying information (no email, name, or password).
- **Stored Quest Records**:
  - The database records: Anonymous Player ID, Quest ID, XP awarded, and Completion Timestamp.
  - Unlocked rewards are also cached locally in device storage (`@capacitor/preferences` / `localStorage`) for offline availability.

### 3.4 Audio Guides & Multimedia Content
- Audio narrations and panoramic images are fetched from our CDN or content storage. Technical connection data (IP address and browser User-Agent) is transmitted to the hosting provider as a standard requirement of internet communications.
- The app never accesses your microphone.

### 3.5 Optional Analytics & Telemetry
- **Vercel Analytics & Speed Insights**:
  - We use lightweight, privacy-focused analytics to measure page load performance, crash diagnostics, and aggregated feature usage.
  - These services **do not track users across websites**, do not set persistent advertising identifiers, and **load only if you explicitly accept optional analytics** via the cookie consent banner.

---

## 4. Legal Basis for Processing (GDPR & Local Regulations)

- **Performance of Service**: Providing interactive maps, compass navigation, and quest verification as requested by the user.
- **Explicit Consent**: For device permissions (GPS location and camera) and optional analytics telemetry. You may revoke consent at any time via your device settings or by clearing browser storage.
- **Legitimate Interest**: Maintaining app security, preventing anti-cheat gaming fraud, and ensuring infrastructure stability.

---

## 5. Third-Party Service Providers

| Provider | Purpose | Privacy Policy |
| :--- | :--- | :--- |
| **Supabase** | Cloud database, PostGIS geofencing, anonymous player auth | [Supabase Privacy Policy](https://supabase.com/privacy) |
| **Geoapify** | Pedestrian routing calculations and map style rendering | [Geoapify Privacy Policy](https://www.geoapify.com/privacy-policy) |
| **Vercel** | Web application hosting, optional analytics | [Vercel Privacy Policy](https://vercel.com/legal/privacy) |

---

## 6. Data Retention & Your Rights

- **Local Data**: You can erase all locally stored preferences, itineraries, and cached quest progress at any time by clearing your browser/app storage or using the in-app "Clear Ledger" button.
- **Cloud Records**: Because quest records are linked to an anonymous guest ID, you may contact us with your guest identifier to request deletion of your server-side quest history.
- **Your Rights**: Under applicable data protection laws, you have the right to access, rectify, or request erasure of your data.

---

## 7. Contact Us

If you have questions regarding this Privacy Policy or wish to exercise your rights, please reach out:

**AISO Tuzla — Tuzla Tour Guide**  
Email: [aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Tuzla, Bosnia and Herzegovina
