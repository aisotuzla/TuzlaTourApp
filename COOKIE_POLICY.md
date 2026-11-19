# Cookie Policy — Tuzla Tour Guide

**Last reviewed:** 18 November 2026  
**Applies to:** The Tuzla Tour Guide website and PWA.

This policy explains the cookies and similar browser technologies used by Tuzla Tour Guide. A native Capacitor app may use platform storage rather than browser cookies for some preferences.

> **Current implementation:** The cookie consent banner is not displayed. The app does not load Google Tag Manager or Google Analytics 4. Vercel Analytics and Speed Insights remain enabled as separate integrations; see the provider privacy information below.

## 1. What are cookies and similar technologies?

Cookies are small pieces of data stored by a browser. Similar technologies include local storage, session storage, SDK preferences and other mechanisms that remember settings or support a website.

Tuzla Tour Guide uses browser storage for its consent record and application settings. External services loaded by the website may also use cookies or similar technologies under their own policies.

## 2. Consent categories

The app does not currently present a consent interface. These categories describe the optional data uses that were previously configurable:

| Category | Intended purpose | Choice |
| --- | --- | --- |
| Necessary | Store the consent choice and support essential operation | Always enabled |
| Performance | Google Analytics / usage measurement | Optional |
| Functional | Remember selected preferences (language, game progress) | Optional |
| Marketing | Advertising and marketing measurement (via GTM) | Optional |

The app does not load non-essential analytics or marketing tags before the visitor has made a valid choice granting consent.

## 3. Previously stored consent preferences

An older version of the app may have stored a JSON record under:

- **Browser key:** `tuzla_cookie_consent`
- **Consent version:** `v1_202611`
- **Web storage:** browser `localStorage`
- **Capacitor storage:** Capacitor Preferences in supported mobile builds

The record contains a consent version, category flags and a timestamp. It is a preference record; it is not itself a tracking cookie. The current app does not read or update this record.

## 4. Third-party tags and services


### Hosting, maps, fonts and external content

The app may request content from its hosting/CDN provider, map-style and map-tile services, Google Fonts and other external content providers. These requests expose technical connection data such as IP address and request headers necessary to transmit assets.

- [Vercel Privacy Policy](https://vercel.com/legal/privacy)


## 5. Managing preferences

The current app does not offer a cookie settings interface. You can clear site data in your browser settings; this also clears local app preferences.

## 6. Do Not Track and browser controls

Some browsers offer tracking-protection or Global Privacy Control (GPC) signals. Where supported, the app respects user privacy signals.

## 7. Contact

Questions about this policy or a request to change your preferences can be sent to:

**AISO Tuzla / Tuzla Tour Guide**  
[aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Tuzla, Bosnia and Herzegovina

## Related documents

- [Privacy Policy](PRIVACY_POLICY.md)
- [README](README.md)
