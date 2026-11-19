# Cookie Policy — Tuzla Tour Guide

**Last reviewed:** 18 November 2026  
**Applies to:** The Tuzla Tour Guide website and PWA.

This policy explains the cookies and similar browser technologies used by Tuzla Tour Guide. A native Capacitor app may use platform storage rather than browser cookies for some preferences.

> **Current implementation:** A compact Bosnian-language consent banner is shown when no valid choice is saved and Bosnian is selected in the app. Google Tag Manager and Google Analytics are not used. Vercel Analytics and Speed Insights load only when optional analytics is accepted.

## 1. What are cookies and similar technologies?

Cookies are small pieces of data stored by a browser. Similar technologies include local storage, session storage, SDK preferences and other mechanisms that remember settings or support a website.

Tuzla Tour Guide uses browser storage for its consent record and application settings. External services loaded by the website may also use cookies or similar technologies under their own policies.

## 2. Consent choices

| Category | Intended purpose | Choice |
| --- | --- | --- |
| Necessary | Store the consent choice and support essential operation | Always enabled |
| Optional analytics | Vercel Analytics and Speed Insights | Optional |

Necessary app storage is always enabled. Optional analytics are disabled unless accepted.

## 3. Consent preference storage

The app stores a JSON consent record under:

- **Browser key:** `tuzla_cookie_consent`
- **Consent version:** `v2_202611`
- **Web storage:** browser `localStorage`
- **Capacitor storage:** Capacitor Preferences in supported mobile builds

The record contains a consent version, the analytics choice and a timestamp. It is a preference record; it is not itself a tracking cookie.

The banner is shown only when the app language is Bosnian. Users can allow optional analytics or choose necessary storage only. Clearing browser/app storage resets this choice.

## 4. Third-party services

### Vercel Analytics and Speed Insights

These services are loaded only after optional analytics is accepted. See the [Vercel Privacy Policy](https://vercel.com/legal/privacy).

### Hosting, maps, fonts and external content

The app may request content from its hosting/CDN provider, map-style and map-tile services, Google Fonts and other external content providers. These requests expose technical connection data such as IP address and request headers necessary to transmit assets.

- [Vercel Privacy Policy](https://vercel.com/legal/privacy)

## 5. Managing preferences

To change your choice, clear site data in your browser settings. This also clears local app preferences. On mobile, reset app data or uninstall the app.

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
