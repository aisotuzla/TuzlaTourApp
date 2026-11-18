# Cookie Policy — Tuzla Tour Guide

**Last reviewed:** 18 November 2026  
**Applies to:** The Tuzla Tour Guide website and PWA.

This policy explains the cookies and similar browser technologies used by Tuzla Tour Guide. A native Capacitor app may use platform storage rather than browser cookies for some preferences.

> **Implementation details (Basic Consent Mode):**  
> All page-load Google tags, GTM bootstrap scripts, and GTM noscript iframes have been removed from `index.html`. The application implements **Basic Consent Mode**: the cookie consent component acts as the single GTM loader. Google Tag Manager and Google Analytics 4 are loaded dynamically **only after** the visitor grants Performance (Analytics) or Marketing consent, or when previously saved consent is restored on startup. If optional consent is absent or denied, zero network requests are made to Google endpoints. If consent is subsequently withdrawn, `window['ga-disable-G-988LD92552'] = true` is immediately applied, Consent Mode is updated to `denied`, and analytics cookies are cleared.

## 1. What are cookies and similar technologies?

Cookies are small pieces of data stored by a browser. Similar technologies include local storage, session storage, SDK preferences and other mechanisms that remember settings or support a website.

Tuzla Tour Guide uses browser storage for its consent record and application settings. External services loaded by the website may also use cookies or similar technologies under their own policies.

## 2. Consent categories shown in the app

The consent interface presents these categories:

| Category | Intended purpose | Choice |
| --- | --- | --- |
| Necessary | Store the consent choice and support essential operation | Always enabled |
| Performance | Google Analytics / usage measurement | Optional |
| Functional | Remember selected preferences (language, game progress) | Optional |
| Marketing | Advertising and marketing measurement (via GTM) | Optional |

The app does not load non-essential analytics or marketing tags before the visitor has made a valid choice granting consent.

## 3. Consent preference storage

The consent component stores a JSON record under:

- **Browser key:** `tuzla_cookie_consent`
- **Consent version:** `v1_202611`
- **Web storage:** browser `localStorage`
- **Capacitor storage:** Capacitor Preferences in supported mobile builds

The record contains the consent version, the selected category flags and a timestamp. It is a preference record; it is not itself a tracking cookie.

The banner provides **Accept All**, **Reject All** and **Customize** choices. Necessary storage remains enabled. **Accept All** consistently enables all consent categories (Necessary, Performance, Functional, Marketing). **Reject All** disables all optional categories. Saved choices are verified and re-applied on startup on every visit.

## 4. Third-party tags and services

### Google Tag Manager

The application dynamically loads Google Tag Manager via the consent component:

- Container ID: `GTM-WNB4KPDD`
- Provider: Google LLC
- Purpose: load and manage website tags configured in the container
- Control: Loaded **only** when Performance or Marketing consent is granted.

### Google Analytics 4

The consent component manages GA4 measurement:

- Measurement ID: `G-988LD92552`
- Provider: Google LLC
- Purpose: website usage and performance analytics
- Control: Performance consent in the cookie interface. When consent is absent or withdrawn, collection is completely halted via `window['ga-disable-G-988LD92552'] = true`, Google Consent Mode updates to `denied`, and existing analytics cookies are deleted.

Google's processing is described in [Google's partner-site privacy information](https://policies.google.com/technologies/partner-sites).

### Hosting, maps, fonts and external content

The app may request content from its hosting/CDN provider, map-style and map-tile services, Google Fonts and other external content providers. These requests expose technical connection data such as IP address and request headers necessary to transmit assets.

- [Vercel Privacy Policy](https://vercel.com/legal/privacy)
- [Netlify Privacy Policy](https://www.netlify.com/privacy/)
- [Google Privacy Policy](https://policies.google.com/privacy)

## 5. Remaining GTM-Container Audit Requirements

While client-side script gating (Basic Consent Mode) prevents GTM and GA4 from loading before consent in the application codebase, the following **mandatory audit steps must be maintained inside the live Google Tag Manager container (`GTM-WNB4KPDD`)**:

1. **Tag-Level Consent Settings Audit**:
   - Every tag configured inside the GTM container must be checked under *Advanced Settings > Consent Settings*.
   - Tags measuring analytics (e.g., GA4 event tags) must require `analytics_storage`.
   - Tags measuring conversions, remarketing, or ad events must require `ad_storage`, `ad_user_data`, and `ad_personalization`.
2. **Trigger Evaluation Audit**:
   - Tags must not fire on unrestricted "All Pages" or standard "Initialization" triggers if they collect optional personal data.
   - Triggers should either be gated by GTM's built-in consent checks or listen to the application's `consent_update` / `gtm.js` events with verified consent state.
3. **Live Container Verification**:
   - The operator must audit the live container in GTM Preview mode and Chrome DevTools Network tab:
     - On first visit (before consent): confirm 0 network requests to `googletagmanager.com` and `google-analytics.com`.
     - On "Reject All": confirm 0 network requests to `googletagmanager.com` and `google-analytics.com`.
     - On "Accept All": confirm GTM loads, Consent Mode initializes with granted states, and GA4 initializes.
     - On withdrawal/customization: confirm `consent_update` fires with `denied`, `ga-disable` is set to `true`, and subsequent GA4 event beacons cease.

## 6. How to manage your choices

Use the cookie banner's **Reject All** or **Customize** options to decline optional categories. If the app exposes a Cookie Settings control, use it to revisit your preferences.

You can also clear site data in your browser settings. Clearing storage will reset consent and local app preferences.

For mobile builds, app preferences are stored by Capacitor and can be cleared by resetting app data or uninstalling the app.

## 7. How to withdraw consent

You can change your selection through the cookie settings interface at any time, or clear the stored consent record in browser/app settings.

Withdrawing consent stops future non-essential processing, engages the GA4 collection disable flag (`ga-disable`), updates Consent Mode v2 to `denied`, and purges analytics cookies. Withdrawal does not make processing that occurred prior to withdrawal unlawful.

## 8. Do Not Track and browser controls

Some browsers offer tracking-protection or Global Privacy Control (GPC) signals. Where supported, the app respects user privacy signals.

## 9. Contact

Questions about this policy or a request to change your preferences can be sent to:

**AISO Tuzla / Tuzla Tour Guide**  
[aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Tuzla, Bosnia and Herzegovina

## Related documents

- [Privacy Policy](PRIVACY_POLICY.md)
- [README](README.md)
