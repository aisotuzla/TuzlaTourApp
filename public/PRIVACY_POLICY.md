# Privacy Policy — Tuzla Tour Guide

**Last reviewed:** 15 November 2026  
**Applies to:** Tuzla Tour Guide website, Progressive Web App (PWA) and supported Capacitor mobile builds.

This policy explains the information that may be processed when you use Tuzla Tour Guide. It is written to describe the implementation currently visible in the project. Some account and quest-backend features are being prepared but are not yet connected to the player app; planned processing is identified separately below.

> **Important:** This is a project documentation draft, not a legal opinion or a certification of compliance. Before public release, the project operator should confirm its legal identity, contact/address details, service-provider contracts, international-transfer arrangements and actual production data flows with a qualified data-protection adviser.

## 1. Who operates the service?

The repository currently identifies the project as **AISO Tuzla / Tuzla Tour Guide**.

- **Project contact:** [aisotuzla@proton.me](mailto:aisotuzla@proton.me)
- **Location currently stated by the project:** Tuzla, Bosnia and Herzegovina
- **Data controller:** The natural or legal person that formally determines why and how personal data is processed. The project must confirm the full registered name and postal address of that controller before publication. “AISO Tuzla” is the project name currently used in the repository and should not be assumed to be a registered legal entity.

For privacy questions or requests, email the project contact above and use the subject **Privacy request — Tuzla Tour Guide**.

## 2. What the app does

Tuzla Tour Guide provides city information, maps, location-assisted navigation, camera-based AR and QR scanning, audio content, trip-planning tools and a location-discovery game.

The app can be used in a browser/PWA and in a supported Capacitor mobile build. Feature availability depends on the device, browser, permissions and network connection.

## 3. Information processed

The categories below describe information the app or its service providers may process. The exact data depends on which features you choose to use.

### 3.1 Location and device sensors

If you grant location permission, the app can use your device's location to show your position, calculate distance to points of interest and support navigation. Device orientation and compass information may also be used for directional or AR overlays.

- Location access is optional and controlled by your browser or operating system.
- The current QR-only quest test flow does not submit GPS coordinates to Supabase as proof of completion.
- Navigation calculations are generally performed in the app on your device.
- The app should not be treated as a background location-tracking service. Review device permission indicators and settings to control access.

**Planned backend feature:** The production quest-verification flow is intended to send a one-time location sample, its reported accuracy and timestamp, the quest/QR identifier and the signed-in player's account identifier to the server. The server is intended to check whether the sample is within the POI's configured 20-metre radius. This verification is not yet active in the player app. The project should update this policy and its consent/permission screens before enabling that data flow.

### 3.2 Camera and QR scanning

If you grant camera permission, the app can display a live camera view for AR guidance and read QR codes.

- Camera access is started when you use a camera feature.
- The QR scanner analyses the camera stream to recognise a code.
- The app's current test flow uses live camera scanning; selecting an image from the photo gallery is not an accepted quest-unlock route in the updated scanner branch.
- The app is not designed to identify people or perform facial recognition.
- Do not point the camera at people or private material without their permission.

The app's QR scanner needs to read the QR content to identify the relevant quest point. Static QR codes can be photographed or replayed; a QR scan alone is not reliable proof that a person physically visited a place.

### 3.3 Quest progress and preferences

The current testing build stores unlocked quest rewards locally on the device using Capacitor Preferences. The web app also uses browser storage for selected settings and consent preferences.

Local data can include language/quality settings, cookie-consent choices and locally stored quest progress. Clearing site data, resetting app storage or uninstalling the app may remove local progress.

**Backend status:** A Supabase project and database schema have been prepared, but player registration, login and cloud quest-progress synchronisation are not yet integrated into the player experience. The project should publish an updated policy before enabling accounts or server-side player records.

### 3.4 Events and public content

The app includes an events feed. The current server-side event storage code can read event records from Vercel Blob and/or a Vercel-connected PostgreSQL database. Public event responses may include event names, dates, times, venue/location, prices and source/verification information.

The event feed is not the same as a player account or quest-completion database. Administrative event imports and deletions are intended to be restricted to a trusted server-side process.

### 3.5 Technical and diagnostic information

When the app or its content is requested over the internet, hosting, CDN, map, font, analytics or other infrastructure providers may receive standard connection information such as IP address, request time, requested resource, browser/device headers and error/performance information. The exact fields and retention periods depend on the provider and configuration.

### 3.6 Audio and external content

Audio files, map styles/tiles, fonts, images, video and other content may be served from the app host or third-party content providers. A request to an external provider can disclose technical connection information to that provider. The app does not need your microphone to play an audio guide.

## 4. Cookies, local storage and similar technologies

The web app stores settings and the consent choice in browser local storage and, in supported Capacitor builds, in Capacitor Preferences. Google Tag Manager and Google Analytics are not used. Vercel Analytics and Speed Insights load only when optional analytics is accepted through the Bosnian-language consent banner. See the [Cookie Policy](COOKIE_POLICY.md).

## 5. Purposes and legal grounds

Depending on the feature and applicable law, processing may be based on:

- **Providing a feature you request:** for example, using location to show your position or camera access to scan a QR code.
- **Consent:** where a permission or non-essential analytics technology requires it. You can withdraw consent by changing the relevant setting or device permission.
- **Legitimate interests:** operating, securing and troubleshooting the service, subject to applicable legal requirements and your rights.
- **Legal obligations:** where the project is required to retain or disclose information by law.

The project must confirm the final legal basis for each production data flow before enabling account-based progress, GPS verification or analytics.

## 6. Who may receive information?

Depending on deployment and the features you use, information may be processed by:

- **Hosting and deployment providers:** Vercel and/or Netlify.
- **Google services:** Google Fonts and other external content where loaded.
- **Map and content providers:** providers supplying map styles, map tiles, fonts, media or other external resources used by the app.
- **Vercel storage/database services:** for the public events feed and related server-side event records.
- **Supabase:** the project database has been prepared, but the player app's account and quest-progress integration is not yet active. When enabled, Supabase will process the data described in the updated policy.
- **Authorities or advisers:** where disclosure is required by law or necessary to establish, exercise or defend legal claims.

The project does not state that it sells personal data. It should not be assumed that data is anonymous merely because a provider is described as an analytics or hosting service.

## 7. International processing

Some service providers may process technical or other data outside Bosnia and Herzegovina, including in countries where their infrastructure or subprocessors operate. The exact locations and safeguards depend on the services and project configuration in use at the time.

Before production release, the controller should document applicable data-processing agreements, transfer mechanisms and provider locations. This policy does not claim that every provider or transfer has already been legally assessed.

## 8. Retention

The project aims to keep information only for as long as needed for the relevant purpose. Exact retention periods for provider logs and hosted content are determined by the relevant service configuration and provider terms.

| Information | Current or intended retention |
| --- | --- |
| Live location used for navigation | Used while the relevant feature is active; the current QR-only flow does not submit it as quest proof |
| Camera stream | Used while the camera feature is active; the app is not designed to save camera recordings |
| Local preferences and test progress | Until cleared by the user, app reset or uninstall, subject to platform behaviour |
| Cookie-consent record | Until cleared or replaced by a newer consent version |
| Public event records | While the records remain published or are deleted under the event-management process |
| Hosting/security logs | According to provider settings, contracts and retention policies |
| Future account and quest records | Not active in the player app yet; retention must be specified before launch |

## 9. Your choices and rights

You can:

- deny or revoke location, camera, orientation or notification permissions in your browser or device settings;
- stop using a feature that requires a permission;
- clear browser site data or reset/uninstall the mobile app to remove locally stored preferences and test progress;
- manage the cookie categories presented by the consent interface, subject to the implementation limitation described in the Cookie Policy;
- contact the project to ask what personal data is held about you or to request access, correction, deletion, restriction, portability or objection where those rights apply.

To make a request, email [aisotuzla@proton.me](mailto:aisotuzla@proton.me). The project may need reasonable information to verify that a request concerns your data. Do not send passwords, private keys, seed phrases or unnecessary identity documents.

Your rights depend on the law that applies to you and may be subject to exceptions. If you are in Bosnia and Herzegovina, you may also contact the **Personal Data Protection Agency of Bosnia and Herzegovina**: [azlp.ba](https://www.azlp.ba/). If GDPR applies to you, you may contact your competent data-protection supervisory authority.

## 10. Children

The app is a general travel and city-guide service and is not specifically designed to collect information from children. Parents or guardians who believe a child has provided personal data should contact the project. The operator should confirm and publish an age policy appropriate to the jurisdictions and features in which the app is offered.

## 11. Security

The project uses HTTPS for deployed web access and applies access controls to backend resources. Security also depends on the hosting, database, device and account configuration. No internet service or storage method can be guaranteed completely secure.

Never place server secrets in frontend environment variables or share account credentials with the project.

## 12. Changes to this policy

This policy may be updated when app features, service providers, data flows or legal requirements change. The latest version will be published in the repository and linked from the app. Material changes should be communicated where required by law.

## 13. Contact

**Project contact:** AISO Tuzla / Tuzla Tour Guide  
**Email:** [aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
**Location stated by the project:** Tuzla, Bosnia and Herzegovina

The formal controller name and postal address must be confirmed and added before this document is treated as the final legal notice.

## Related documents

- [Cookie Policy](COOKIE_POLICY.md)
- [README and technical setup](README.md)
- [Tuzla Quest Player Manual](QUEST_GAME_MANUAL.md)
