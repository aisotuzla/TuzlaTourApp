# Tuzla Tour Quest Game - Official Player Manual
# Tuzla Tour Potraga - Zvanicni Vodic i Uputstvo

**Version:** 2.0  
**Last Updated:** November 2026  
**Game Designer:** Tuzla Tour App Team  
**Difficulty:** Easy to Medium  
**Estimated Completion Time:** 2-3 hours (self-paced)

---

## 
##  TABLE OF CONTENTS

1. [Game Overview](#1-game-overview)
2. [Getting Started](#2-getting-started)
3. [Game Interface](#3-game-interface)
4. [Quest Phases](#4-quest-phases)
5. [How to Unlock Landmarks](#5-how-to-unlock-landmarks)
6. [Rewards System](#6-rewards-system)
7. [Visual Guide](#7-visual-guide)
8. [Tips & Strategies](#8-tips--strategies)
9. [Troubleshooting](#9-troubleshooting)
10. [Frequently Asked Questions](#10-frequently-asked-questions)

---

# 
#  1. GAME OVERVIEW

## 
##  What is Tuzla Tour Quest?

**Tuzla Tour Quest** is an **interactive, gamified Augmented Reality (AR) and 3D map exploration game** designed to guide tourists and visitors through the rich history, cultural monuments, and top attractions of **Tuzla, Bosnia and Herzegovina**.

### 
###  Key Features

| Feature | Description |
|---------|-------------|
| **Augmented Reality** | Live camera view with 3D markers overlaying real-world landmarks |
| **3D GPS Navigation** | Interactive 3D map with turn-by-turn directions |
| **QR Code Scanning** | Scan physical QR codes at landmarks to unlock rewards |
| **GPS Geofencing** | Automatic unlock when within 5 meters of a landmark |
| **Blockchain Rewards** | Earn NFT collectibles on Solana Devnet |
| **Multi-Language** | English, Bosnian, German, Turkish support |
| **Offline Mode** | Works without internet connection |

### 
###  Game Objective

Complete all **4 Quest Phases** by:
1. Visiting **11 landmarks** across Tuzla
2. Scanning **official QR codes** OR approaching within **5 meters** via GPS
3. Unlocking **exclusive rewards** at each phase
4. Collecting **trophies, NFTs, and discount vouchers**

### 
###  Target Audience

-  Tourists visiting Tuzla
- Local residents exploring their city
- History and culture enthusiasts
- Gamers who enjoy real-world exploration
- Families and groups
- Solo travelers

### 
###  Difficulty Levels

| Phase | Difficulty | Estimated Time | Reward |
|-------|------------|----------------|--------|
| Phase 1 |  Easy | 20-30 minutes | Phase 1 Victory |
| Phase 2 | Easy | 20-30 minutes | NFT Collectible |
| Phase 3 | Medium | 30-45 minutes | "Heart of Tuzla" Trophy |
| Grand Finale | Easy | 10-15 minutes | 20% Discount Voucher |

---

# 
#  2. GETTING STARTED

## 
##  Prerequisites

### 
###  Required

-  **Smartphone** (Android or iOS)
- **Internet Connection** (for initial load and map tiles)
- **GPS/Location Services** enabled
- **Camera Access** enabled
- **Motion Sensors** (for AR mode)

### 
###  Recommended

- **Headphones** (for audio guides)
- **Portable Charger** (for extended play)
- **Comfortable Shoes** (you'll be walking!)
- **Water Bottle** (stay hydrated)
- **Notebook** (to track your progress)

## 
##  Installation

### 
###  Web Version (PWA)

1. Open your mobile browser
2. Visit: **https://tuzlatour.vercel.app/**
3. Tap **"Add to Home Screen"** (iOS) or **"Install"** (Android)
4. Open the installed app

### 
###  Android App (Capacitor)

1. Download from Google Play Store (coming soon)
2. Install the APK file
3. Grant required permissions
4. Open the app

### 
###  iOS App (Future)

1. Download from App Store (planned)
2. Install the app
3. Grant required permissions
4. Open the app

## 
##  First Launch

1. **Select Language** - Choose your preferred language
2. **Grant Permissions** - Allow location, camera, and motion access
3. **Complete Tutorial** - Optional onboarding (if available)
4. **Start Quest** - Begin your Tuzla adventure!

---

# 
#  3. GAME INTERFACE

## 
##  Main Screen Layout

```
┌─────────────────────────────────────────┐
│                    HEADER                │
│  [Menu]        Tuzla Tour Guide        [Lang]│
├─────────────────────────────────────────┤
│                                              │
│                    MAIN CONTENT           │
│                                              │
│  ┌─────────────────────────────────────┐  │
│  │              MAP VIEW               │  │
│  │  ┌───────────────────────────────┐│  │
│  │  │           3D MAP (40%)         ││  │
│  │  │   - Your GPS Position          ││  │
│  │  │   - Route Polyline             ││  │
│  │  │   - POI Markers                ││  │
│  │  └───────────────────────────────┘│  │
│  │  ┌───────────────────────────────┐│  │
│  │  │         AR VIEW (60%)          ││  │
│  │  │   - Live Camera Feed           ││  │
│  │  │   - 3D AR Markers              ││  │
│  │  │   - Target Reticle             ││  │
│  │  │   - Direction Chevrons         ││  │
│  │  └───────────────────────────────┘│  │
│  └─────────────────────────────────────┘  │
│                                              │
├─────────────────────────────────────────┤
│                   FOOTER                 │
│  [Home] [Map] [Quest] [Wallet] [More]   │
└─────────────────────────────────────────┘
```

## 
##  AR Guide Screen (60/40 Split View)

### 
###  Top 40% - Interactive 3D Map

**Features:**
-  Live 3D map of Tuzla
- Your current GPS position (blue dot/pulse)
- Route path polyline (shows your walking path)
- Points of Interest (POI) markers with colors
- 3D building models (where available)

**Controls:**
| Action | Mobile | Desktop |
|--------|--------|---------|
| **Zoom In/Out** | Pinch with two fingers | Scroll wheel |
| **Rotate Map** | Rotate with two fingers | Right-click + drag |
| **Tilt Map** | Slide up/down with two fingers | Right-click + drag up/down |
| **Pan Map** | Drag with one finger | Left-click + drag |
| **Reset View** | Double-tap | Double-click |

### 
###  Bottom 60% - AR Viewport & Guide Dashboard

**Features:**
-  Live camera pass-through feed
- Dynamic 3D AR markers floating over real-world landmarks
- Target locking reticle (crosshair)
- Side direction chevrons (LEFT/RIGHT indicators)
- Turn-by-turn GPS instructions
- Interactive landmark dashboard

**AR Markers:**
- **Color-Coded:** Each landmark has a unique color
- **Pulsing Animation:** Active targets pulse to draw attention
- **Distance Indicator:** Shows meters/kilometers to target
- **Name Label:** Displays landmark name
- **Phase Badge:** Shows which phase the landmark belongs to

## 
##  HUD Elements

### 
###  Top Bar

```
┌─────────────────────────────────────────┐
│ [☰]    Tuzla Tour Guide    [🌐 EN]   │
│         (Language Selector)              │
└─────────────────────────────────────────┘
```

### 
###  Bottom Bar (Navigation)

```
┌─────────────────────────────────────────┐
│ [🏠] [🗺️] [🎮] [💰] [⋮]           │
│ Home   Map   Quest  Wallet  More         │
└─────────────────────────────────────────┘
```

### 
###  Floating Elements

- **Audio Control Bar** - Appears when audio guide is playing
- **QR Scanner Button** - Opens QR code scanner
- **Compass** - Shows current heading
- **Battery Saver Toggle** - Enable/disable battery optimization
- **Navigation Arrow** - Points to next target

---

# 
#  4. QUEST PHASES

## 
##  Phase System Overview

The game is divided into **4 phases**, each with specific objectives and rewards:

| Phase | Title | Targets | Reward | Color Theme |
|-------|-------|---------|--------|-------------|
| 1 | Foundations of Tuzla | 3 landmarks | Phase 1 Victory + Unlock Phase 2 | Emerald Green |
| 2 | Cultural Heritage & Solana NFT | 3 landmarks | Bosnia Football Squad NFT | Forest Green, Sky Blue, Amber |
| 3 | Lakes, Nature & Fine Arts | 4 landmarks | "Heart of Tuzla" Trophy | Ocean Blue, Cyan, Crimson, Violet |
| 4 | Grand Finale | 1 landmark | 20% Discount Voucher | Dark Emerald |

**Total:** 11 landmarks, 4 phases, 4 major rewards

---

## 
##  Phase 1: Foundations of Tuzla

### 
###  Overview

**Theme:** Discover the historical heart of Tuzla
**Difficulty:** Easy
**Estimated Time:** 20-30 minutes
**Reward:** Phase 1 Victory Celebration + Unlock Phase 2

### 
###  Targets

| # | Landmark | Color | Coordinates | QR Code | GPS Radius |
|---|----------|-------|-------------|---------|------------|
| 1 | **Trg Slobode** (Freedom Square) | `#10b981` (Emerald Green) | 44.5395, 18.6751 | ✅ Yes | 5m |
| 2 | **Kapija** (Kapija Memorial) | `#ef4444` (Vibrant Red) | 44.5380, 18.6760 | ✅ Yes | 5m |
| 3 | **Meša Selimović** (Monument) | `#4d068f` (Deep Purple) | 44.5371, 18.6782 | ✅ Yes | 5m |

### 
###  Landmark Details

####  1. Trg Slobode (Freedom Square)

- **Type:** Historic City Square
- **Significance:** Largest town square in Bosnia and Herzegovina
- **Features:** Baroque fountain, pedestrian zone, central meeting point
- **QR Code Location:** On the information plaque near the fountain
- **Best Time to Visit:** Morning or evening (less crowded)
- **Audio Guide:** Available in 4 languages

####  2. Kapija (Kapija Memorial)

- **Type:** Historical Monument
- **Significance:** Sacred monument to peace and youth
- **Features:** Memorial to victims of 1995 shelling, symbolic gate
- **QR Code Location:** On the memorial plaque
- **Note:** Respectful behavior recommended
- **Audio Guide:** Available in 4 languages

####  3. Meša Selimović Monument

- **Type:** Literary Monument
- **Significance:** Dedicated to renowned Bosnian novelist and Nobel laureate
- **Features:** Evocative sculpture, cultural landmark
- **QR Code Location:** On the base of the monument
- **Fun Fact:** Meša Selimović is one of the most important literary figures of former Yugoslavia
- **Audio Guide:** Available in 4 languages

### 
###  Phase 1 Completion

**When you unlock all 3 landmarks:**
1.  Victory celebration animation plays
2. Fireworks effect appears
3. Phase 2 is automatically unlocked
4. Historical videos become available
5. Progress is saved to your device

---

## 
##  Phase 2: Cultural Heritage & Solana Devnet NFT

### 
###  Overview

**Theme:** Explore Tuzla's cultural identity and salt heritage
**Difficulty:** Easy
**Estimated Time:** 20-30 minutes
**Reward:** **Bosnia Football Squad Collectible NFT Card** (sent to Solflare Wallet on Solana Devnet)

### 
###  Targets

| # | Landmark | Color | Coordinates | QR Code | GPS Radius |
|---|----------|-------|-------------|---------|------------|
| 1 | **Park Kralja Tvrtka I** (King Tvrtko Park) | `#18a506` (Forest Green) | 44.5381, 18.6784 | ✅ Yes | 5m |
| 2 | **Palančikara Bagi** (Bagi Pancake House) | `#0ea5e9` (Sky Blue) | 44.5375, 18.6775 | ✅ Yes | 5m |
| 3 | **Solni Trg** (Salt Square) | `#f59e0b` (Amber Yellow) | 44.5385, 18.6765 | ✅ Yes | 5m |

### 
###  Landmark Details

####  1. Park Kralja Tvrtka I (King Tvrtko Park)

- **Type:** Urban Park
- **Significance:** Named after medieval Bosnia's first king
- **Features:** Majestic bronze statue, stone replica of Charter of Kulin, elegant fountain, green areas
- **QR Code Location:** Near the main entrance
- **Best Feature:** Stone replica of the landmark Charter of Kulin (1189)
- **Audio Guide:** Learn about King Tvrtko I's reign

####  2. Palančikara Bagi (Bagi Pancake House)

- **Type:** Traditional Restaurant
- **Significance:** Famous for traditional Bosnian pancakes
- **Features:** Authentic Bosnian cuisine, historic building
- **QR Code Location:** On the restaurant's exterior wall
- **Recommendation:** Try the traditional Bosnian pancakes!
- **Audio Guide:** Learn about Tuzla's culinary heritage

####  3. Solni Trg (Salt Square)

- **Type:** Historic Square
- **Significance:** 2,500-year salt well archaeological display
- **Features:** Historic salt extraction site, archaeological display
- **QR Code Location:** Near the information board
- **Fun Fact:** Tuzla's name comes from "tuz" (salt in Turkish)
- **Audio Guide:** Learn about 6,000 years of salt exploitation

### 
###  Phase 2 Reward: Bosnia Football Squad NFT

**What You Get:**
-  **Collectible NFT Card** featuring the Bosnia Football Squad
- **Blockchain:** Solana Devnet
- **Wallet:** Sent directly to your connected Solflare Wallet
- **Rarity:** Limited edition for Tuzla Tour Quest completers
- **Value:** Digital collectible (not a financial investment)

**How to Claim:**
1. Connect your **Solflare Wallet** in the Wallet tab
2. Ensure you're on **Solana Devnet** network
3. Complete all 3 Phase 2 landmarks
4. The NFT will be automatically sent to your wallet
5. View in your Solflare wallet or the app's Wallet tab

---

## 
##  Phase 3: Lakes, Nature & Fine Arts

### 
###  Overview

**Theme:** Discover Tuzla's natural beauty and artistic heritage
**Difficulty:** Medium (more walking, larger area)
**Estimated Time:** 30-45 minutes
**Reward:** **"Heart of Tuzla" (Srce Tuzle) Trophy** with celebratory fireworks

### 
###  Targets

| # | Landmark | Color | Coordinates | QR Code | GPS Radius |
|---|----------|-------|-------------|---------|------------|
| 1 | **Panonika** (Pannonian Salt Lakes) | `#040e8f` (Ocean Blue) | 44.5389, 18.6800 | ✅ Yes | 5m |
| 2 | **Slapovi** (Pannonian Waterfalls) | `#0ea5e9` (Cyan) | 44.5390, 18.6810 | ✅ Yes | 5m |
| 3 | **Slana Banja** (Slana Banja Park & Complex) | `#cf0404` (Crimson Red) | 44.5385, 18.6856 | ✅ Yes | 5m |
| 4 | **Atelje Ismet Mujezinović** (Art Gallery) | `#8b5cf6` (Royal Violet) | 44.5395, 18.6770 | ✅ Yes | 5m |

### 
###  Landmark Details

####  1. Panonika (Pannonian Salt Lakes)

- **Type:** Saltwater Lake Complex
- **Significance:** **Europe's ONLY urban saltwater lakes**
- **Features:** Three artificial saltwater lakes, cascading waterfalls, reconstructed Neolithic stilt village
- **QR Code Location:** At the main entrance
- **Entry Fee:** 7.5-9 KM for full day access
- **Must-See:** Salt waterfalls, Neolithic village
- **Audio Guide:** Learn about the unique ecosystem
- **Health Benefits:** Therapeutic mineral water (30-35 g/L salinity)

####  2. Slapovi (Pannonian Waterfalls)

- **Type:** Artificial Waterfalls
- **Significance:** Beautiful cascading saltwater waterfalls
- **Features:** Multiple levels of waterfalls, scenic views
- **QR Code Location:** Near the viewing platform
- **Best Time:** Daytime for best photos
- **Audio Guide:** Learn about the waterfall system
- **Tip:** Walk behind the waterfalls for a unique perspective

####  3. Slana Banja (Slana Banja Park & Complex)

- **Type:** Memorial Park & Pine Forest
- **Significance:** Sprawling peaceful park on a hill overlooking Pannonian lakes
- **Features:** Walking paths, fountains, monuments, pine forest
- **QR Code Location:** At the park entrance
- **Entry Fee:** Free
- **Audio Guide:** Learn about the park's history
- **View:** Panoramic views of the Pannonian lakes

####  4. Atelje Ismet Mujezinović (Ismet Mujezinović Art Gallery)

- **Type:** Art Gallery
- **Significance:** Dedicated to renowned Bosnian artist Ismet Mujezinović
- **Features:** Contemporary art exhibitions, artist's works
- **QR Code Location:** At the gallery entrance
- **Entry Fee:** Varies by exhibition
- **Audio Guide:** Learn about Ismet Mujezinović's life and work
- **Tip:** Check for current exhibitions

### 
###  Phase 3 Reward: "Heart of Tuzla" Trophy

**What You Get:**
-  **Digital Trophy:** "Srce Tuzle" (Heart of Tuzla)
- **Celebration:** Fireworks animation (`canvas-confetti`)
- **Achievement:** Permanent record in your scan history
- **Bragging Rights:** You've explored Tuzla's natural beauty!

**How It Works:**
1. Complete all 4 Phase 3 landmarks
2. Trophy is automatically unlocked
3. Celebratory fireworks animation plays
4. Trophy appears in your Wallet > Scan History
5. Share your achievement with friends!

---

## 
##  Grand Finale: Golden Partner Discount Voucher

### 
###  Overview

**Theme:** Visit Tuzla's premier shopping destination
**Difficulty:** Easy
**Estimated Time:** 10-15 minutes
**Reward:** **Official 20% Discount Voucher** for Bingo City Center

### 
###  Target

| # | Landmark | Color | Coordinates | QR Code | GPS Radius |
|---|----------|-------|-------------|---------|------------|
| 1 | **Bingo City Centar (BCC)** | `#145a03` (Dark Emerald) | 44.5319, 18.6520 | ✅ Yes | 5m |

### 
###  Landmark Details

####  Bingo City Centar (BCC)

- **Type:** Shopping Mall
- **Significance:** Largest modern shopping mall in the region
- **Features:** Hypermarket, international fashion brands, multiplex cinema, bowling alley, extensive dining
- **QR Code Location:** At the main entrance or customer service
- **Size:** Large complex with multiple floors
- **Audio Guide:** Learn about Tuzla's modern development
- **Shopping Tip:** Visit during weekdays for fewer crowds

### 
###  Grand Finale Reward: 20% Discount Voucher

**What You Get:**
- **Discount Code:** `BCC-GOLDEN-TUZLA-2026`
- **Discount:** 20% off at participating stores
- **Validity:** Check with BCC for expiration date
- **Usage:** Present at checkout (digital or printed)
- **Limitations:** May not apply to all stores or items

**How to Claim:**
1. Complete the BCC landmark (Phase 4)
2. Voucher code is automatically unlocked: **`BCC-GOLDEN-TUZLA-2026`**
3. Show this code at Bingo City Center checkout
4. Enjoy your 20% discount!

---

# 
#  5. HOW TO UNLOCK LANDMARKS

## 
##  Two Methods to Unlock

### 
###  Method A: QR Code Scanning (Recommended)

**Steps:**
1. Navigate to the landmark location
2. Find the **official Tuzla Tour QR plaque** (usually on a signpost or wall)
3. Open the Tuzla Tour App
4. Tap the **QR Code button** (📷 icon) in the HUD or AR panel
5. Point your camera at the QR code
6. Wait for the scan to complete (usually < 1 second)
7. **Success!** Landmark is unlocked

**Pros:**
- ✅ More accurate (confirms you're at the exact location)
- ✅ Works even with poor GPS signal
- ✅ Faster unlock
- ✅ More satisfying (physical interaction)

**Cons:**
- ❌ Requires finding the QR code plaque
- ❌ Needs good lighting for camera

### 
###  Method B: GPS Geofencing (Alternative)

**Steps:**
1. Ensure **GPS/Location Services** are enabled on your device
2. Ensure **high accuracy mode** is enabled (for better precision)
3. Walk to within **5 meters** of the landmark's coordinates
4. Keep the app open with AR Guide or Map View active
5. Wait for automatic detection (usually 2-5 seconds)
6. **Success!** Landmark is automatically unlocked

**Pros:**
- ✅ No need to find QR code
- ✅ Works hands-free
- ✅ Good for landmarks without QR codes

**Cons:**
- ❌ Requires good GPS signal
- ❌ May be less accurate in urban canyons
- ❌ Slower than QR scanning

## 
##  Which Method Should You Use?

| Scenario | Recommended Method |
|----------|-------------------|
| Good GPS signal, QR code visible | **QR Code Scanning** |
| Poor GPS signal | **QR Code Scanning** |
| Can't find QR code | **GPS Geofencing** |
| Urban area with tall buildings | **QR Code Scanning** |
| Rural area with open sky | **GPS Geofencing** |
| Fastest unlock | **QR Code Scanning** |
| Hands-free | **GPS Geofencing** |

---

# 
#  6. REWARDS SYSTEM

## 
##  Reward Types

### 
###  1. Phase Completion Rewards

| Phase | Reward | Type | Value |
|-------|--------|------|-------|
| Phase 1 | Victory Celebration | Animation | Priceless |
| Phase 2 | Bosnia Football Squad NFT | Digital Collectible | Limited Edition |
| Phase 3 | "Heart of Tuzla" Trophy | Digital Trophy | Achievement |
| Phase 4 | 20% Discount Voucher | Physical Discount | `BCC-GOLDEN-TUZLA-2026` |

### 
###  2. Collectible Items

####  NFT Cards
- **Name:** Bosnia Football Squad Collectible
- **Blockchain:** Solana Devnet
- **Wallet:** Solflare
- **Type:** Non-Fungible Token (NFT)
- **Rarity:** Limited to Quest completers
- **Use:** Digital collectible, not a financial investment

####  Trophies
- **Name:** "Heart of Tuzla" (Srce Tuzle)
- **Type:** Digital achievement
- **Storage:** Local device + Scan History
- **Display:** Wallet tab > Scan History
- **Share:** Can be shared on social media

####  Discount Vouchers
- **Name:** BCC Golden Partner Voucher
- **Code:** `BCC-GOLDEN-TUZLA-2026`
- **Discount:** 20% off
- **Validity:** Check with BCC
- **Usage:** Present at checkout

## 
##  How to View Your Rewards

### 
###  In the App

1. **Open the App**
2. **Go to Wallet tab** (💰 icon)
3. **Unlock with PIN** (if you set one)
4. **View your rewards:**
   - **NFT Cards:** Displayed in the NFT section
   - **Trophies:** Displayed in the Achievements section
   - **Scan History:** Complete list of all scanned landmarks
   - **Vouchers:** Displayed in the Vouchers section

### 
###  In Your Wallet

1. **Open Solflare Wallet** (mobile app or extension)
2. **Connect to Solana Devnet**
3. **View your NFTs** in the Collectibles tab
4. **Your Bosnia Football Squad NFT** should appear

---

# 
#  7. VISUAL GUIDE

## 
##  Color Coding System

Each phase has a unique color scheme to help you track progress:

| Phase | Primary Color | Secondary Colors | Hex Codes |
|-------|---------------|------------------|-----------|
| Phase 1 | Emerald Green | - | `#10b981` |
| Phase 2 | Forest Green | Sky Blue, Amber | `#18a506`, `#0ea5e9`, `#f59e0b` |
| Phase 3 | Ocean Blue | Cyan, Crimson, Violet | `#040e8f`, `#0ea5e9`, `#cf0404`, `#8b5cf6` |
| Phase 4 | Dark Emerald | - | `#145a03` |

## 
##  Marker States

### 
###  Active Targets (Not Yet Unlocked)

- **Appearance:** Bright, pulsing 3D color pins
- **Color:** Phase-specific color
- **Animation:** Gentle pulsing effect
- **Opacity:** 100% (fully visible)
- **Size:** Normal size
- **Effect:** Glow effect for emphasis

### 
###  Completed Targets (Already Unlocked)

- **Appearance:** Monochrome (grayscale) markers
- **Color:** Black/white/gray
- **Animation:** No pulsing
- **Opacity:** 40% (semi-transparent)
- **Size:** Normal size
- **Effect:** Blurred (`blur-[1px]`)
- **Purpose:** Keeps map clean, shows progress

### 
###  Current Target (Selected)

- **Appearance:** Highlighted with outline
- **Color:** Original color + white outline
- **Animation:** Stronger pulsing
- **Opacity:** 100%
- **Size:** Slightly larger
- **Effect:** Additional glow, reticle lock

## 
##  AR View Indicators

### 
###  Distance Indicator

Shows distance to the selected target:
- **Format:** "X meters away" or "X km away"
- **Location:** Below the AR marker
- **Update:** Real-time (updates as you move)
- **Color:** White text with blue background

### 
###  Direction Chevrons

Shows which direction to turn:
- **Left Turn:** "45° LEFT" or "90° LEFT"
- **Right Turn:** "45° RIGHT" or "90° RIGHT"
- **Straight:** "ON PATH" or "TARGET LOCKED"
- **Location:** Sides of the screen
- **Color:** Blue for left, Red for right

### 
###  Target Locked Reticle

Appears when you're facing the target:
- **Appearance:** Crosshair/circle
- **Text:** "TARGET LOCKED"
- **Location:** Center of screen
- **Color:** Green
- **Sound:** Optional lock sound (if enabled)

---

# 
#  8. TIPS & STRATEGIES

## 
##  General Tips

### 
###  Before You Start

- [ ] **Charge your phone** - AR mode uses battery quickly
- [ ] **Enable high accuracy GPS** - Better for GPS geofencing
- [ ] **Clear storage space** - Offline maps take up space
- [ ] **Download offline maps** - Works without internet
- [ ] **Bring headphones** - Audio guides enhance experience

### 
###  During the Quest

- [ ] **Use QR codes when available** - Faster and more reliable
- [ ] **Check the map frequently** - Plan your route efficiently
- [ ] **Take breaks** - The quest can be completed over multiple days
- [ ] **Explore the area** - There's more to see than just the landmarks
- [ ] **Take photos** - Capture memories of your journey

### 
###  Battery Saving Tips

- [ ] **Enable Battery Saver mode** - Reduces FPS from 60→30
- [ ] **Close other apps** - Free up resources
- [ ] **Lower screen brightness** - Saves battery
- [ ] **Use GPS only when needed** - Turn off when not navigating
- [ ] **Stay stationary when possible** - Camera FPS drops to 15 when still

## 
##  Route Optimization

### 
###  Recommended Order

**Most Efficient Route (Minimizes Walking):**

1. **Phase 1:**
   - Start at **Trg Slobode** (Freedom Square)
   - Walk to **Kapija** (~200m, 3 min)
   - Walk to **Meša Selimović** (~300m, 4 min)

2. **Phase 2:**
   - Walk to **Park Kralja Tvrtka I** (~400m, 5 min)
   - Walk to **Solni Trg** (~300m, 4 min)
   - Walk to **Palančikara Bagi** (~200m, 3 min)

3. **Phase 3:**
   - Walk to **Atelje Ismet Mujezinović** (~500m, 6 min)
   - Take bus/taxi to **Panonika** (~2km, 25 min walk or 5 min drive)
   - Walk to **Slapovi** (~100m, 1 min)
   - Walk to **Slana Banja** (~200m, 3 min)

4. **Grand Finale:**
   - Take bus/taxi to **Bingo City Center** (~3km, 40 min walk or 10 min drive)

**Total Walking:** ~5km (without BCC)
**Total Time:** ~2 hours (walking only)

### 
###  Alternative Routes

**For Tourists with Limited Time:**
- Focus on **Phase 1 + Phase 4** (most iconic landmarks)
- Skip Phase 2 and 3 if short on time
- Still get the discount voucher!

**For History Buffs:**
- Complete all phases in order
- Read all audio guides
- Take time to explore each location

**For Families with Kids:**
- Start with **Panonika** (fun for kids)
- Visit **Palančikara Bagi** for food
- End with **Bingo City Center** (shopping)

## 
##  Pro Tips

### 
###  Hidden Features

- **Double-tap markers** - Quick zoom to landmark
- **Long-press map** - Add custom waypoint
- **Shake device** - Reset AR view (if stuck)
- **Swipe left/right on markers** - Cycle through nearby landmarks
- **Pinch to zoom on AR view** - Adjust camera zoom

### 
###  Easter Eggs

- Complete all phases in one day → **"Tuzla Master" badge**
- Visit all landmarks in order → **"Perfect Route" achievement**
- Scan all QR codes → **"QR Hunter" title**
- Unlock all rewards → **"Tuzla Explorer" trophy**

---

# 
#  9. TROUBLESHOOTING

## 
##  Common Issues & Solutions

### 
###  GPS Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| GPS not working | Location services disabled | Enable location services in device settings |
| GPS inaccurate | Weak signal | Move to open area, away from tall buildings |
| GPS drifting | Low accuracy mode | Enable "High Accuracy" mode in settings |
| GPS slow to update | Poor reception | Wait 1-2 minutes, move to better location |

### 
###  Camera Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Camera not opening | Permission denied | Grant camera permission in app settings |
| Camera black screen | Another app using camera | Close other apps, restart device |
| QR code not scanning | Poor lighting | Move to better lighting, clean camera lens |
| Camera laggy | Low performance | Close other apps, enable Battery Saver |

### 
###  AR Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| AR markers not appearing | Motion sensors disabled | Enable motion/orientation sensors |
| AR view glitchy | Sensor calibration needed | Move phone in figure-8 pattern |
| AR markers wrong position | Compass not calibrated | Calibrate compass (move in circles) |
| AR performance poor | High FPS | Enable Battery Saver mode |

### 
###  App Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| App crashing | Bug | Restart app, clear cache, reinstall |
| App slow | Too many apps open | Close background apps |
| App not loading | No internet | Check connection, try offline mode |
| Progress lost | App reset | Progress is saved locally, reinstall to restore |

### 
###  Wallet Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Wallet not connecting | Wrong network | Switch to Solana Devnet |
| NFT not appearing | Transaction pending | Wait 1-2 minutes, refresh wallet |
| Wrong wallet connected | Multiple wallets | Disconnect and reconnect correct wallet |
| PIN forgotten | Local storage | Reinstall app to reset PIN |

---

# 
#  10. FREQUENTLY ASKED QUESTIONS

## 
##  General Questions

### 
###  Q: Is the app free to use?
**A:** Yes! The Tuzla Tour App is completely free. There are no in-app purchases or subscriptions.

### 
###  Q: Do I need internet to play?
**A:** Internet is required for:
- Initial app load
- Map tiles (first time)
- Google Analytics (if enabled)
- Solana wallet connection

Offline mode works for:
- Navigation (with offline maps)
- QR code scanning
- Audio guides (preloaded)
- Game progress

### 
###  Q: Can I play the quest over multiple days?
**A:** Yes! Your progress is saved locally on your device. You can complete the quest at your own pace over multiple days, weeks, or even months.

### 
###  Q: Do I need to create an account?
**A:** No account is required! All progress is saved locally on your device. However, to claim blockchain rewards (NFT), you'll need a Solflare wallet.

### 
###  Q: What languages are supported?
**A:** Currently supported languages:
- English
- Bosnian
- German
- Turkish

More languages may be added in the future.

## 
##  Gameplay Questions

### 
###  Q: Can I skip phases?
**A:** No, phases must be completed in order. You need to finish Phase 1 to unlock Phase 2, and so on.

### 
###  Q: Can I revisit completed landmarks?
**A:** Yes! You can revisit any landmark at any time. Completed landmarks will appear as grayscale markers on the map.

### 
###  Q: What if I can't find a QR code?
**A:** You can use the GPS geofencing method instead. Just get within 5 meters of the landmark's coordinates.

### 
###  Q: Can I use both QR and GPS methods for the same landmark?
**A:** Yes, but it will only count once. Once a landmark is unlocked, it stays unlocked.

### 
###  Q: How do I know which phase I'm on?
**A:** The current phase is displayed at the top of the Quest tab. You can also see your progress in the phase completion bar.

## 
##  Technical Questions

### 
###  Q: Why does the app use so much battery?
**A:** AR mode and GPS are battery-intensive. We've implemented Battery Saver mode to reduce usage by 40-50%. Enable it in the settings.

### 
###  Q: How accurate is the GPS?
**A:** GPS accuracy depends on your device and location. In open areas, it's typically accurate to within 5-10 meters. In urban areas with tall buildings, accuracy may be reduced.

### 
###  Q: Why does my location jump around?
**A:** This is called GPS drift and is normal. We use an Adaptive Low-Pass Filter to smooth out the jumps when you're far from targets, and allow precise tracking when you're close.

### 
###  Q: Can I use the app on a tablet?
**A:** Yes! The app works on tablets, though it's optimized for mobile phones. Some features may not be available on all tablets.

### 
###  Q: Can I use the app on a desktop computer?
**A:** Yes! The PWA version works on desktop browsers. However, camera and GPS features may not work on desktop.

## 
##  Rewards Questions

### 
###  Q: How do I claim my NFT reward?
**A:** Complete Phase 2, then connect your Solflare wallet in the Wallet tab. The NFT will be automatically sent to your wallet on Solana Devnet.

### 
###  Q: What can I do with the NFT?
**A:** The NFT is a digital collectible. You can:
- Keep it in your wallet
- View it in your Solflare wallet
- Share it on social media
- Trade it with other collectors (if supported)

**Note:** The NFT is not a financial investment and has no monetary value.

### 
###  Q: How do I use the discount voucher?
**A:** Show the voucher code **`BCC-GOLDEN-TUZLA-2026`** at the checkout of any participating store in Bingo City Center. The code provides a 20% discount on eligible items.

### 
###  Q: Does the voucher expire?
**A:** Check with Bingo City Center for the expiration date. Typically, vouchers are valid for 6-12 months from the date of issue.

### 
###  Q: Can I use the voucher multiple times?
**A:** The voucher code is typically single-use. Check with BCC for their policy.

---

# 
#  CONTACT & SUPPORT

## 
##  Need Help?

If you encounter any issues or have questions not covered in this manual:

### 
###  In-App Support
- Tap the **"Help"** button in the app
- Check the **FAQ** section
- Use the **Contact Form**

### 
###  Email Support
**Email:** [Insert Support Email]  
**Subject:** Tuzla Tour Quest - [Your Issue]  
**Response Time:** Within 24-48 hours

### 
###  Social Media
- **Twitter:** [@TuzlaTourApp](https://twitter.com/) (coming soon)
- **Facebook:** [Tuzla Tour App](https://facebook.com/) (coming soon)
- **Instagram:** [@TuzlaTour](https://instagram.com/) (coming soon)

### 
###  Bug Reports
If you find a bug, please include:
- Device model
- Operating system version
- App version
- Steps to reproduce
- Screenshots (if possible)
- Error messages (if any)

---

# 
#  VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | November 2026 | Complete rewrite, better structure, FAQ section, tips & strategies |
| 1.0 | April 2026 | Initial version |

---

# 
#  LEGAL NOTICES

## 
##  Disclaimer

The Tuzla Tour App and Quest Game are provided "as is" without warranty of any kind. We do not guarantee that the app will be error-free or that your use of the app will be uninterrupted.

## 
##  Liability

We are not liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the app.

## 
##  Blockchain Disclaimer

The NFT rewards are provided for entertainment purposes only and are not financial investments. We do not guarantee any value or liquidity for the NFTs.

## 
##  QR Code Ownership

All QR codes used in the Tuzla Tour Quest are property of Tuzla Tour App and may not be reproduced or used without permission.

---

# 
#  ACKNOWLEDGMENTS

We would like to thank:
- **City of Tuzla** for their support
- **Tuzla Tourist Board** for providing information
- **Local businesses** for participating in the quest
- **Bingo City Center** for the discount voucher
- **All users** for their feedback and support

---

**Thank you for playing Tuzla Tour Quest!**

*Explore Tuzla. Discover History. Earn Rewards.*

---

*Tuzla Tour App  Powered by Advanced Spatial AR & MapLibre GL JS*  
*Version 2.0 | Last Updated: November 2026 | Made with in Tuzla, Bosnia and Herzegovina*
