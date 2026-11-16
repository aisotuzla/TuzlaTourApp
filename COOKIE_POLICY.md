# Cookie Policy — Tuzla Tour Guide

**Last reviewed:** 15 November 2026  
**Applies to:** The Tuzla Tour Guide website and PWA.

This policy explains the cookies and similar browser technologies used by Tuzla Tour Guide. A native Capacitor app may use platform storage rather than browser cookies for some preferences.

> **Implementation status (16 November 2026):** The app code now removes the page-load GTM snippet and injects the single GTM container only after a saved or newly selected optional category (Performance or Marketing) permits it. Saved choices are re-applied when the consent component starts. This is a Basic Consent Mode approach: no GTM/Google tag request should occur before optional consent. The live GTM container still needs to be audited and configured so each tag has the correct consent checks; this repository change alone cannot guarantee that every custom or third-party tag behaves correctly. Verify the production container in a clean browser session before making a compliance claim.

## 1. What are cookies and similar technologies?

Cookies are small pieces of data stored by a browser. Similar technologies include local storage, session storage, SDK preferences and other mechanisms that remember settings or support a website.

Tuzla Tour Guide uses browser storage for its consent record and application settings. External services loaded by the website may also use cookies or similar technologies under their own policies.

## 2. Consent categories shown in the app

The consent interface currently presents these categories:

| Category | Intended purpose | Choice |
| --- | --- | --- |
| Necessary | Store the consent choice and support essential operation | Always enabled |
| Performance | Google Analytics / usage measurement | Optional |
| Functional | Remember selected preferences | Optional in the consent interface |
| Marketing | Advertising and marketing measurement | Currently shown as a category; the project does not declare an active advertising-cookie purpose |

The app should not load non-essential analytics or marketing tags before the visitor has made a valid choice where consent is required. See the implementation note above.

## 3. Consent preference storage

The current consent component stores a JSON record under:

- **Browser key:** `tuzla_cookie_consent`
- **Consent version:** `v1_202611`
- **Web storage:** browser `localStorage`
- **Capacitor storage:** Capacitor Preferences in supported mobile builds

The record contains the consent version, the selected category flags and a timestamp. It is a preference record; it is not itself a tracking cookie.

The banner provides **Accept All**, **Reject All** and **Customize** choices. Necessary storage remains enabled. The current component saves the selection locally. The implementation should be tested to ensure that changing a choice also disables already loaded tags and that saved choices are correctly applied on later visits.

## 4. Third-party tags and services

### Google Tag Manager

The app loads the Google Tag Manager container only after optional Performance or Marketing consent has been granted:

- Container ID: `GTM-TSZC4L5L`
- Provider: Google
- Purpose: load and manage website tags configured in the container

The exact tags, cookies, storage keys and data transfers depend on the live container configuration. The repository alone cannot establish the complete inventory. The container must be audited in Google Tag Manager and in a clean browser session.

### Google Analytics 4

The consent component uses the GA4 measurement ID as the analytics consent-control target for tags configured through GTM:

- Measurement ID: `G-988LD92552`
- Provider: Google
- Intended purpose: website usage and performance analytics
- Intended control: performance consent in the cookie interface

Google's processing is described in [Google's partner-site privacy information](https://policies.google.com/technologies/partner-sites).

### Hosting, maps, fonts and external content

The app may request content from its hosting/CDN provider, map-style and map-tile services, Google Fonts and other external content providers. These requests may expose technical connection data such as IP address, request headers and requested resource. Whether a provider sets cookies depends on the particular service and configuration.

- [Vercel Privacy Policy](https://vercel.com/legal/privacy)
- [Netlify Privacy Policy](https://www.netlify.com/privacy/)
- [Google Privacy Policy](https://policies.google.com/privacy)

## 5. Cookie inventory and lifetimes

The project does not currently maintain a verified, complete inventory of every cookie that may be set by the live Google Tag Manager container or third-party resources. For that reason, this policy does **not** invent cookie names or expiry periods.

Before public release, the operator should test the production site in a clean browser profile and record, for each cookie/storage item:

1. name and provider/domain;
2. purpose and category;
3. first-party or third-party status;
4. expiry or duration;
5. whether it is set before or only after consent;
6. how it is removed or disabled after consent withdrawal.

The resulting inventory should be added here and kept current when tags change.

## 6. How to manage your choices

Use the cookie banner's **Reject All** or **Customize** options to decline optional categories. If the app exposes a Cookie Settings control, use it to revisit your preferences.

You can also clear site data in your browser settings. Clearing storage may reset consent and local app preferences. Browser controls vary by browser and device.

For mobile builds, app preferences may be stored by Capacitor and may be cleared by resetting or uninstalling the app.

## 7. How to withdraw consent

You can change your selection through the cookie settings interface where available, or clear the stored consent record in browser/app settings.

Withdrawing consent updates Google Consent Mode to denied for the withdrawn categories and disables future GA4 collection in the current page session. A GTM script that has already loaded cannot be unloaded from the page; therefore every tag in the container must have appropriate consent checks. Test custom HTML tags and third-party tags individually to ensure they stop firing after withdrawal.

Withdrawal does not make processing that occurred before withdrawal unlawful.

## 8. Do Not Track and browser controls

Some browsers offer tracking-protection or Do Not Track settings. External providers may interpret these signals differently. The app does not promise that every third-party tag honours every browser signal.

## 9. Updates

This policy will be updated when the consent interface, tag configuration, hosting, analytics or other third-party services change. The cookie inventory should be reviewed after every material change to the tag manager container.

## 10. Contact

Questions about this policy or a request to change your preferences can be sent to:

**AISO Tuzla / Tuzla Tour Guide**  
[aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Tuzla, Bosnia and Herzegovina

The project operator should confirm its formal legal identity and postal address before final publication.

## Related documents

- [Privacy Policy](PRIVACY_POLICY.md)
- [README](README.md)
