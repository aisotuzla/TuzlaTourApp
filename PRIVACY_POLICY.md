# Privacy Policy for Tuzla Tour App

**Last Updated:** November 2026  
**Effective Date:** November 2026  
**Version:** 3.0

---

## 1. Introduction

Welcome to the **Tuzla Tour App** ("we", "our", "us", or "the App"). We are committed to protecting your privacy and ensuring your personal data is handled securely and in accordance with applicable data protection laws.

This Privacy Policy explains:

- What data we collect
- How we use your data
- How we protect your data
- Your rights regarding your data
- How to contact us

This Privacy Policy is designed to comply with:

- **Law on Personal Data Protection of Bosnia and Herzegovina** (Zakon o zastiti licnih podataka BiH)
- **General Data Protection Regulation (GDPR)** (EU Regulation 2016/679)
- **ePrivacy Directive** (2002/58/EC as amended)
- **California Consumer Privacy Act (CCPA)**

---

## 2. Who is the Data Controller?

**Data Controller:** AISO tuzla (Tuzla Tour App Team)

**Hosting Providers:**

- Vercel Inc. (Primary hosting)
- Netlify Inc. (Secondary hosting)

**Important:** Your location data, camera access, and Web3 wallet data are **processed locally on your device** and are **NOT stored on our servers** or any third-party servers, except as explicitly described in this Policy.

---

## 3. Data We Collect and How We Use It

We follow the principles of **data minimization** and **privacy by design**. Our App is built to process as much information locally on your device as possible, without sending personal data to external servers.

### 3.1 Categories of Data

#### A. Location Data & Proximity Geofencing (25-Meter Alert Perimeter)

**Purpose:**

- Calculate real-time walking distance and pedestrian routing to Points of Interest (POIs)
- Trigger on-device local push notifications when approaching within a 25-meter radius of a Quest POI or local partner business ("You are close! Open AR Guide")
- Enable GPS geofencing verification for quest progression and landmark discovery
- Compute local device bearing and distance for the 3D map and AR compass

**Processing:**

- Location data is processed **strictly locally on your device** (client-side sensor fusion and geodetic math)
- We **do NOT** track or broadcast your location in the background to any remote server or ad network
- Location coordinates are **NOT** stored on our servers or shared with commercial entities
- Proximity alerts are evaluated client-side via local device notifications; no location pings leave your phone

**Legal Basis:**

- Your explicit consent (granted when you allow location permissions on your browser or device)
- GDPR Article 6(1)(a) - Consent
- Law on Personal Data Protection of Bosnia and Herzegovina

**Retention:**

- Ephemeral: Processed in active device memory only while the App is open and in use
- Discarded when the App session ends or permissions are revoked

#### B. Camera Access, High-Precision AR & QR Recognition (5-Meter Micro-Radius)

**Purpose:**

- Display Augmented Reality (AR) markers, directional chevrons, and ground polyline navigation
- Activate high-accuracy camera guidance when within a 5-meter micro-radius of a destination (e.g. entrance of a local shop or historic monument) to assist precise target localization
- Scan physical QR codes placed inside participating local establishments (e.g., dining, cafes, shops) to redeem instant order discounts (e.g., 20% off) and unlock quest stages

**Processing:**

- Camera feed is processed **strictly locally in volatile RAM** on your device using HTML5 Canvas and WebAssembly (`html5-qrcode`)
- We **do NOT** capture photographs, record video streams, or perform biometric facial analysis
- Camera frames are analyzed in real time for optical QR patterns and immediately purged from memory
- No visual or optical data is ever uploaded, stored, or transferred to our servers or third parties

**Legal Basis:**

- Your explicit consent (granted when you allow camera permissions)
- GDPR Article 6(1)(a) - Consent

**Retention:**

- Volatile in-memory processing only while the camera viewport is actively active
- Zero storage; completely cleared as soon as camera mode is closed

#### C. Local Business In-Store Verification ("Proof-of-Footprint") & Zero-Profiling

**Purpose:**

- Verify physical presence of the visitor inside participating local businesses (restaurants, cafes, hotels, boutiques) to unlock promotional partner discounts (such as 20% off food or retail bills)
- Prevent fraudulent or remote coupon exploitation without compromising user privacy

**Processing:**

- Footprint verification relies on a physical, in-venue QR code scanned by the user's device
- The validation is verified **client-side** against quest logic: no tourist profile, phone number, real name, or payment credentials are shared with or stored by the merchant
- Participating businesses receive only aggregate, non-personal proof of discount redemption (e.g. voucher code validated at cashier)

**Legal Basis:**

- GDPR Article 6(1)(b) - Contractual performance (delivering promotion/quest reward)
- GDPR Article 6(1)(f) - Legitimate interest in anti-fraud coupon verification

#### C. Web3 Wallet Data (Solana)

**Purpose:**

- Allow you to unlock digital rewards via blockchain
- Verify NFT ownership and transactions
- Connect to Solana blockchain (Devnet and Mainnet)

**Processing:**

- The App **only reads your public wallet address**
- We **absolutely never** ask for your private keys or seed phrases
- We **do NOT** have access to your private keys or seed phrases
- Transaction history is managed by your **external wallet provider** (e.g., Solflare, Phantom)
- We **do NOT** store your wallet address on our servers

**Legal Basis:**

- Processing is necessary for the performance of the service (delivering rewards)
- GDPR Article 6(1)(b) - Contract performance

**Retention:**

- Only while the wallet is connected
- Not stored after disconnection

#### D. Device Storage (Preferences)

**Purpose:**

- Save your disabled/enabled settings
- Store selected language preference
- Store list of unlocked rewards
- Provide seamless experience when reopening the App

**Processing:**

- Stored **locally on your device** using Capacitor Preferences
- Encrypted on Android (via Android Keystore)
- Secure on iOS (via iOS Keychain)

**Data Stored:**

- Language preference
- Quest progress (unlocked landmarks)
- Wallet PIN (encrypted)
- Battery saver preferences
- App settings

**Legal Basis:**

- Your explicit consent (by using the app and saving preferences)
- GDPR Article 6(1)(a) - Consent

**Retention:**

- Until you uninstall the app or clear app data

#### E. Cookie Data

**Purpose:**

- Improve user experience
- Provide analytics and usage statistics
- Remember user preferences
- Enable essential app functionality

**Types of Cookies:**

1. **Strictly Necessary Cookies**
   - Essential for the app to function
   - No consent required (GDPR exemption)
   - Cannot be disabled
   - Example: Session cookies, security cookies

2. **Performance/Analytical Cookies**
   - Help us understand how users interact with the app
   - Require **explicit consent** (opt-in)
   - Can be disabled
   - Example: Google Analytics cookies

3. **Functional Cookies**
   - Remember user preferences
   - Require **explicit consent** (opt-in)
   - Can be disabled
   - Example: Language preference, game progress

**For detailed information about cookies, please see our [Cookie Policy](COOKIE_POLICY.md).**

**Legal Basis:**

- Strictly Necessary: GDPR Article 6(1)(f) - Legitimate interest
- Performance/Functional: GDPR Article 6(1)(a) - Consent

**Retention:**

- Varies by cookie type (see Cookie Policy for details)

#### F. Analytics Data

**Purpose:**

- Understand how users interact with our App
- Identify popular features and content
- Detect and fix bugs and errors
- Improve user experience and performance

**Third-Party Analytics Providers:**

1. **Google Analytics (GA4)**
   - **Provider:** Google LLC
   - **Data Collected:**
     - Anonymous user IDs
     - Session duration
     - Pages visited
     - Referring URLs
     - Device information (browser, OS, screen resolution)
     - Geographic location (country/city level)
   - **Data Processing:** Google processes data on servers in the United States
   - **Legal Basis:** Consent (opt-in, can be disabled)
   - **Privacy Policy:** [Google Analytics Privacy](https://policies.google.com/technologies/partner-sites)
   - **Opt-Out:** [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout/)

2. **Vercel Analytics**
   - **Provider:** Vercel Inc.
   - **Data Collected:**
     - Page views
     - Performance metrics
     - Error tracking
     - User interactions
   - **Data Processing:** Vercel processes data on servers in the United States
   - **Legal Basis:** Consent (opt-in, can be disabled)
   - **Privacy Policy:** [Vercel Privacy Policy](https://vercel.com/legal/privacy)

**Important:**

- Analytics data is **anonymous and aggregated**
- We **do NOT** collect or store personal identifiers
- Analytics can be **disabled** in the Cookie Consent banner

#### G. Error and Crash Data

**Purpose:**

- Detect and fix bugs
- Improve app stability
- Monitor app performance

**Data Collected:**

- Error messages
- Stack traces
- Device information (model, OS version)
- App version
- Timestamp of error

**Processing:**

- Collected automatically when errors occur
- Used for debugging and improvement
- Not linked to personal identifiers

**Legal Basis:**

- GDPR Article 6(1)(f) - Legitimate interest (app improvement)

---

## 4. Do We Share Your Data?

### 4.1 General Rule

**No.** Because we process your location, camera feed, and app progress **locally on your own device**, we **do NOT sell, rent, or share any of your personal data with third parties** for marketing or profiling purposes.

### 4.2 Exceptions

We may share data in the following limited circumstances:

#### A. Third-Party Service Providers

We share **anonymous, aggregated data** with the following service providers:

| Provider | Purpose | Data Shared | Location |
|----------|---------|-------------|----------|
| Google Analytics | Website analytics | Anonymous usage data | United States |
| Vercel Inc. | Hosting and analytics | Anonymous usage data | United States |

**Important:**

- Only **anonymous and aggregated** data is shared
- **No personal identifiers** are shared
- Data is shared **only with your consent** (for cookies that require consent)

#### B. Legal Requirements

We may disclose data if required by law or in response to valid legal requests, such as:

- Court orders
- Subpoenas
- Government investigations
- Legal compliance requests

**Legal Basis:** GDPR Article 6(1)(c) - Legal obligation

#### C. Business Transfers

In the event of a merger, acquisition, or sale of assets, data may be transferred to the acquiring entity. We will notify you of any such transfer.

**Legal Basis:** GDPR Article 6(1)(f) - Legitimate interest

#### D. With Your Explicit Consent

We may share data with third parties if you provide **explicit, informed consent** for specific purposes.

---

## 5. Data Retention

### 5.1 General Principle

We retain data for **no longer than necessary** to fulfill the purposes for which it was collected.

### 5.2 Retention Periods

| Data Type | Retention Period | Reason |
| ----------- | ------------------ | -------- |
| Location Data | Session only | Not stored after use |
| Camera Data | Session only | Not stored after use |
| Wallet Data | Session only | Not stored after disconnection |
| Device Storage | Until uninstall | User-controlled |
| Analytics Data | 2 years (Google) | Standard analytics retention |
| Error Data | 30 days | Debugging and improvement |

### 5.3 Your Control

You can control data retention by:

- **Uninstalling the app** - Deletes all local data
- **Clearing app cache** - Removes stored preferences
- **Revoke permissions** - Stops data collection
- **Disable cookies** - Prevents cookie-based tracking

---

## 6. Your Rights Under Data Protection Laws

Under the **Law on Personal Data Protection of Bosnia and Herzegovina** and **GDPR**, you have the following rights regarding your personal data:

### 6.1 Right to Information & Access (GDPR Article 15)

You have the right to:

- Know what data is being processed
- Request access to your personal data
- Receive a copy of your personal data

**How to Exercise:** Contact us with a data access request

### 6.2 Right to Rectification (GDPR Article 16)

You have the right to:

- Request correction of inaccurate personal data
- Complete incomplete personal data

**How to Exercise:** Contact us with correction details

### 6.3 Right to Erasure ("Right to be Forgotten") (GDPR Article 17)

You have the right to request deletion of your personal data, subject to certain exceptions (e.g., legal obligations).

**How to Exercise:**

- Uninstall the application
- Clear the App's storage cache in your phone settings
- Contact us with an erasure request

### 6.4 Right to Restrict Processing (GDPR Article 18)

You have the right to request restriction of processing of your personal data in certain circumstances.

**How to Exercise:** Contact us with a restriction request

### 6.5 Right to Data Portability (GDPR Article 20)

You have the right to:

- Receive your personal data in a structured, commonly used, and machine-readable format
- Transfer your data to another service provider

**How to Exercise:** Contact us with a portability request

### 6.6 Right to Object (GDPR Article 21)

You have the right to object to processing of your personal data for:

- Direct marketing purposes
- Profiling
- Other legitimate interests

**How to Exercise:** Contact us with an objection request

### 6.7 Right to Withdraw Consent (GDPR Article 7(3))

You have the right to withdraw your consent at any time for:

- Location permissions
- Camera permissions
- Cookie consent
- Analytics consent

**How to Exercise:**

- Revoke permissions via your device's operating system settings
- Use the Cookie Consent banner to manage cookie preferences
- Contact us to withdraw consent

**Note:** Withdrawing consent will **not** affect the lawfulness of processing based on consent before its withdrawal.

### 6.8 Right to Lodge a Complaint (GDPR Article 77)

You have the right to lodge a complaint with a supervisory authority, particularly in the Member State of your habitual residence, place of work, or place of the alleged infringement.

**For Bosnia and Herzegovina Users:**

- **Supervisory Authority:** Agencija za zastitu licnih podataka BiH (Personal Data Protection Agency of Bosnia and Herzegovina)
- **Website:** [https://www.azlp.ba/](https://www.azlp.ba/)
- **Address:** [Insert Agency Address]

**For EU/EEA Users:**

- Find your local supervisory authority: [https://edpb.europa.eu/about-edpb/board/members_en](https://edpb.europa.eu/about-edpb/board/members_en)

---

## 7. Security Measures

We implement robust security protocols to protect your data:

### 7.1 Technical Measures

- **Encryption:** Data is encrypted in transit (HTTPS/TLS 1.3)
- **Secure Storage:** Local data is encrypted on Android (Android Keystore) and iOS (iOS Keychain)
- **Access Controls:** Limited access to data for authorized personnel only
- **Regular Audits:** Security reviews and penetration testing
- **Data Minimization:** Only collect necessary data

### 7.2 Organizational Measures

- **Privacy by Design:** Privacy considerations in all development processes
- **Data Protection Impact Assessments (DPIAs):** For high-risk processing activities
- **Staff Training:** Regular privacy and security training
- **Incident Response:** Procedures for data breaches

### 7.3 Your Responsibilities

While we implement security measures, you are responsible for:

- Maintaining the security of your device
- Protecting your Web3 wallet accounts and private keys
- Using strong passwords/PINs
- Keeping your device software up to date

---

## 8. International Data Transfers

### 8.1 Cross-Border Data Flows

Our third-party service providers (Google, Vercel) process data on servers located in the **United States**.

### 8.2 Legal Basis for Transfers

For users in the European Economic Area (EEA), United Kingdom, or Switzerland:

- **Google LLC:** Certified under the **EU-U.S. Data Privacy Framework (DPF)**
- **Vercel Inc.:** Uses **Standard Contractual Clauses (SCCs)** for international data transfers

### 8.3 Safeguards

We implement the following safeguards for international data transfers:

- **Data Minimization:** Only collect necessary data
- **Anonymization:** Where possible, data is anonymized
- **Encryption:** Data is encrypted in transit (HTTPS/TLS)
- **Contractual Protections:** Data Processing Agreements with all third parties
- **User Consent:** Explicit consent for data transfers to third countries

---

## 9. Children's Privacy

Our App is **not directed at children under the age of 16**. We do not knowingly collect personal information from children under 16.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to remove such information from our systems.

**Note:** The minimum age may vary by jurisdiction (e.g., 13 in the US, 16 in the EU).

---

## 10. Cookie Consent and Management

### 10.1 Cookie Consent Banner

When you first visit our App, you will see a **Cookie Consent Banner** that:

- Informs you about the use of cookies
- Explains the purpose of each cookie category
- Provides granular consent options
- Allows you to accept, reject, or customize cookie settings

### 10.2 Cookie Categories

| Category | Purpose | Consent Required | Can Be Disabled |
| ---------- | --------- | ------------------ | ----------------- |
| Strictly Necessary | Essential for app functionality | No | No |
| Performance/Analytical | Usage statistics and analytics | Yes | Yes |
| Functional | User preferences | Yes | Yes |
| Marketing | Advertising (not currently used) | Yes | Yes |

### 10.3 Managing Cookie Preferences

You can manage your cookie preferences at any time by:

1. Clicking the **"Cookie Settings"** link in the app
2. Accessing the **Cookie Consent Banner**
3. Clearing your browser cookies and re-visiting the site

### 10.4 Browser Settings

You can also control cookies through your browser settings:

- **Chrome:** Settings > Privacy and Security > Cookies
- **Firefox:** Options > Privacy & Security > Cookies
- **Safari:** Preferences > Privacy
- **Edge:** Settings > Privacy, search, and services > Cookies

**Note:** Disabling cookies may affect app functionality.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time to reflect:

- Changes in our data practices
- Changes in applicable laws or regulations
- Changes in our service providers
- Feedback from users or regulators

**Notification:** We will notify you of any significant changes by:

- Posting a notice on our website
- Updating the "Last Updated" date at the top of this Policy
- For material changes: Sending an email (if we have your contact information)

**Continuing Use:** Your continued use of the App after any changes constitutes your acceptance of the updated Policy.

---

## 12. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:

**Email:** <aisotuzla@proton.me>  
**Address:** Tuzla, Bosnia and Herzegovina  
**Subject:** Privacy Request - [Your Concern]

**Response Time:** Within 30 days (GDPR requirement)

We may request additional information to verify your identity before processing your request.

---

## 13. Related Documents

- [Cookie Policy](COOKIE_POLICY.md) - Detailed information about our use of cookies
- [Terms of Service](TERMS_OF_SERVICE.md) - Terms and conditions for using the App (if available)
- [Quest Game Manual](QUEST_GAME_MANUAL.md) - How to play the Tuzla Tour Quest

---

## 14. Definitions

| Term | Definition |
| ------ | ------------ |
| **Personal Data** | Any information relating to an identified or identifiable natural person |
| **Processing** | Any operation performed on personal data (collection, storage, use, etc.) |
| **Data Controller** | The entity that determines the purposes and means of processing personal data |
| **Data Processor** | The entity that processes personal data on behalf of the controller |
| **GDPR** | General Data Protection Regulation (EU Regulation 2016/679) |
| **Consent** | Freely given, specific, informed, and unambiguous indication of wishes |
| **Anonymization** | Processing data so that it can no longer identify an individual |

---

**Last Updated:** November 2026  
**Effective Date:** November 2026  
**Version:** 3.0

---

*This Privacy Policy is part of the Tuzla Tour App's commitment to transparency, privacy, and user trust.*
