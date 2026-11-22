# Cookie Policy — Tuzla Tour Guide

**Last reviewed:** 21 November 2026  
**Applies to:** The Tuzla Tour Guide Web Application, Progressive Web App (PWA), and native Capacitor mobile builds.

This Cookie Policy explains how **Tuzla Tour Guide** ("we", "us") uses cookies, local browser storage, and related technologies on our website and mobile application.

---

## 1. What Are Cookies and Local Storage?

- **Cookies**: Small data files placed on your device by a website or browser.
- **Local Storage & Preferences**: Key-value data stored on your device through the browser's `localStorage` or native mobile storage (`@capacitor/preferences`) to remember your application state between sessions.

Tuzla Tour Guide does not use invasive advertising cookies or cross-site tracking pixels. We use local device storage for functional app settings and minimal performance metrics.

---

## 2. Categories of Storage We Use

| Category | Purpose | Necessity |
| :--- | :--- | :--- |
| **Strictly Necessary Storage** | Remembers your chosen language, offline map cache, consent choices, and guest session tokens. | **Always Active** (Cannot be turned off while using the app) |
| **Optional Performance Analytics** | Measures aggregate page response times, crash rates, and technical performance via Vercel Analytics and Speed Insights. | **Opt-in Only** (Requires explicit consent) |

---

## 3. Storage Keys & Details

### Necessary Functional Keys
- **`tuzla_cookie_consent`**: Stores your consent preference (accepted/rejected, timestamp).
- **`tuzla_lang`**: Stores your active UI language (`bs`, `en`, `de`, `tr`).
- **`tuzla_unlocked`**: Stores your unlocked quest rewards for offline verification and quick rendering.
- **`tuzla_scan_ledger`**: Stores your personal, device-only history of scanned landmarks.
- **`supabase.auth.token`**: Encrypted guest player session token used to communicate with the Supabase database.

### Optional Analytics (Vercel Analytics & Speed Insights)
- Loaded **only** if you click "Prihvati" (Accept) on the consent banner.
- Analyzes aggregated metrics like Core Web Vitals (LCP, FID, CLS) and error rates.
- Does **not** track your identity across different websites and does **not** store sensitive personal data.

---

## 4. Third-Party Services & Technical Assets

When loading external map layers and assets, standard network requests transmit technical connection parameters (such as your IP address and browser headers) to content delivery networks:
- **MapLibre GL & Geoapify**: Vector map style and route geometry.
- **PMTiles**: Local vector tile archive (serves offline map data locally from device cache).
- **Supabase**: Real-time cloud database and anonymous player verification.

---

## 5. How to Manage or Reset Your Preferences

- **In the Web Browser**: Clear your browser's cookies and site data for the Tuzla Tour Guide domain to reset all preferences and prompt the consent banner again.
- **In the Mobile App**: Go to device **Settings > Apps > Tuzla Tour Guide > Storage** and select **Clear Data** or **Clear Cache**, or use the in-app "Clear Ledger" button on the player dashboard.

---

## 6. Contact Us

If you have questions regarding our use of cookies or device storage, please contact:

**AISO Tuzla — Tuzla Tour Guide**  
Email: [aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Tuzla, Bosnia and Herzegovina

---

## Related Documents
- [Privacy Policy](PRIVACY_POLICY.md)
- [Tuzla Quest Game Manual](QUEST_GAME_MANUAL.md)
- [README](README.md)
