# Tuzla Quest — Player Guide

**Project:** Tuzla Tour Guide  
**Location:** Tuzla, Bosnia and Herzegovina  
**Current game content:** 12 points of interest across four phases  
**Current verification mode:** Live camera QR scan for testing  
**Planned production verification:** QR identifier plus a server-side GPS check within 20 metres

This manual describes the game as it is currently implemented and clearly labels planned features. It does not promise that every reward, partner offer or online service is available at all times.

## 1. What is Tuzla Quest?

Tuzla Quest is a city-discovery game inside Tuzla Tour Guide. It encourages players to explore cultural landmarks, public spaces, local attractions and selected businesses.

The app provides a map and optional GPS/AR navigation to help you find each point of interest (POI). At a quest location, the current test flow lets you scan the associated QR code with the live camera to unlock that POI on your device.

**A local QR unlock is a game-testing action, not a verified proof of physical presence.** Static QR codes can be photographed, copied or scanned by someone who is not at the location.

## 2. How to play

1. Open Tuzla Tour Guide and navigate to the Quest section.
2. Review the active phase and its POIs.
3. Select a POI to view its description and location.
4. If you choose, enable location permission and use the map/GPS/AR guidance to navigate there.
5. At the location, find the relevant quest QR code.
6. Open the in-app scanner and scan the code using the live camera.
7. If the code matches a configured quest POI, the current test build records a local unlock.
8. Continue exploring the remaining POIs.

The scanner requires camera permission. If permission is denied, enable it in your browser or device settings and retry.

### Current testing rules

- Use the live in-app camera scanner.
- QR images selected from the photo gallery are not an accepted quest-unlock method in the updated test branch.
- A successful local scan may update progress stored on the device.
- Test progress is not yet synchronised to a player account or treated as a server-verified completion.
- Reinstalling the app, clearing app data or browser storage may remove local progress.

## 3. Quest phases and points of interest

The current quest configuration contains **12 POIs**.

### Phase 1 — Foundations of Tuzla (4 POIs)

1. **Freedom Square (Trg slobode)** — the central city square and its historic urban setting.
2. **Stara Česma (Old Town Fountain)** — the historic fountain at Freedom Square.
3. **Kapija Memorial** — a memorial to the young people killed on 25 May 1995.
4. **Meša Selimović Monument** — a monument commemorating the Tuzla-born writer.

### Phase 2 — Culture, Dining and Salt Heritage (3 POIs)

1. **King Tvrtko Park** — the central park and monument to King Tvrtko I Kotromanić.
2. **Bagi Crêperie (Palačinkara kod Bagija)** — a local dessert and food stop.
3. **Salt Square (Solni trg)** — a place presenting Tuzla's salt-mining heritage.

### Phase 3 — Lakes, Waterfalls and Art (4 POIs)

1. **Pannonian Salt Lakes (Panonska jezera)** — the salt-lake complex in central Tuzla.
2. **Saline Waterfalls (Slani slapovi)** — the saline waterfalls within the Pannonian complex.
3. **Slana Banja Park** — a memorial and recreational park.
4. **Atelier Ismet Mujezinović** — a memorial studio and art gallery.

**QR setup note:** The current quest data has no QR asset configured for Atelier Ismet Mujezinović. Its QR checkpoint should not be considered ready until a real code is prepared, its payload is tested and the mapping is configured.

### Phase 4 — Grand Finale (1 POI)

1. **Bingo City Center (Bingo City Centar)** — the shopping, dining and entertainment centre.

## 4. GPS and AR navigation

Location permission is optional. If you enable it, the app can use device location to show your position and estimate distance to a POI. Camera and device-orientation access may be used for AR navigation overlays.

GPS accuracy varies with the device, buildings, weather, satellite visibility and other conditions. Compass and AR overlays can drift. A marker appearing aligned or a displayed distance reaching zero does not prove that you are at an exact entrance or inside a building.

The current test-stage quest unlock is based on QR matching, not a server-enforced 20-metre GPS check.

## 5. Planned production verification

The intended production completion flow is:

1. The player signs in.
2. The player scans the QR code for a specific POI.
3. The app obtains a location sample and its reported accuracy.
4. The server checks the QR identifier against that POI.
5. The server checks whether the location sample is within the POI's configured **20-metre radius**, taking the reported accuracy into account.
6. The server checks that the player has not already completed that POI.
7. The server records the completion and awards the configured XP in one protected operation.

The database has been prepared with 12 POIs and a 20-metre radius. The QR identifier field is intentionally not populated until the actual printed QR payloads have been verified.

This production flow is planned and is **not yet active in the player app**. The project must complete and test the server-side function, authentication, RLS, rate limiting and duplicate-completion handling before describing a quest as backend-verified.

### Anti-cheat limitations

A QR code printed at a location can still be photographed and shared. GPS readings can be inaccurate or spoofed on some devices. Combining QR, GPS, account authentication, accuracy checks, rate limits and one-completion rules can deter casual abuse, but it cannot guarantee that every player is physically present or eliminate all fraud.

## 6. Rewards and partner offers

The app may display in-game progress, media, badges or other milestone content as the quest develops. Some reward assets and Web3/Solana-related code are experimental; availability should be judged by what the app actually presents at the time of play.

A discount, voucher or business benefit is valid only if:

- it is explicitly displayed as an active offer in the app;
- the participating business has confirmed the offer and its terms; and
- the player presents it in the way specified by the business.

Do not assume a fixed discount percentage, a guaranteed redemption, a cash value or an NFT transfer simply because an older screenshot, code comment or draft document mentions it. Offers may have exclusions, expiry dates, limited quantities or partner-specific conditions.

The app does not ask players to share a wallet seed phrase or private key. Never disclose those secrets to anyone.

## 7. Safety and respectful use

- Follow pedestrian rules and traffic signals. Do not scan while driving or crossing a road.
- Stop in a safe place before using the camera or reading the screen.
- Respect private property, opening hours, staff instructions and restricted areas.
- Do not enter a business or venue solely because it appears as a map marker; ask staff where public access is permitted.
- Do not photograph people, staff or private interiors without permission.
- Be respectful at memorials, religious sites and cultural institutions.
- Keep your device secure and be aware of your surroundings.

## 8. Permissions and troubleshooting

| Feature | Permission / requirement | If it does not work |
| --- | --- | --- |
| Map positioning | Location permission and device location services | Enable location and retry; check device accuracy |
| AR guidance | Camera and, where supported, orientation sensors | Allow camera/orientation access; move to a safe, well-lit place |
| QR scan | Camera permission | Enable camera access and retry; use the live scanner |
| Audio guide | Device audio output | Check volume, silent mode and network availability for remote content |
| Online map/content | Internet connection unless content is cached | Reconnect or retry later |

If a QR code does not scan, check that the lens is clean, the code is well lit and fully visible. Make sure the code belongs to the selected POI. Report a damaged, missing or mismatched code to the project contact rather than repeatedly scanning unrelated codes.

## 9. Progress, accounts and privacy

During the current test stage, quest unlocks are stored locally on the device. Player sign-in and cross-device quest synchronisation are not yet integrated into the app.

The production version is intended to use Supabase for player accounts and server-side quest records. When that is enabled, the privacy notice will be updated to explain the account information and one-time location verification data processed by the service.

Read the [Privacy Policy](PRIVACY_POLICY.md) and [Cookie Policy](COOKIE_POLICY.md) for more information.

## 10. Support and feedback

For a missing QR code, incorrect POI information, accessibility issue or technical problem, contact:

**AISO Tuzla / Tuzla Tour Guide**  
[aisotuzla@proton.me](mailto:aisotuzla@proton.me)

When reporting a problem, include the POI name, device/browser and a short description. Do not send passwords, authentication tokens, wallet seed phrases or private keys.

---

*This guide describes the current test branch. Screens, rewards and verification behaviour may change as the app moves from local QR testing to the production Supabase-backed quest system.*
