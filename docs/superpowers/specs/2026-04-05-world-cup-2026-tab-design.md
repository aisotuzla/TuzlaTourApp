# World Cup 2026: Zmajevi Tab Design

This document outlines the design for the new "World Cup 2026" tab in the Tuzla Tour App, serving as a tribute to the Bosnia and Herzegovina national football team and their historic qualification for the upcoming tournament.

## Feature Overview

A comprehensive interactive experience dedicated to "Zmajevi" including:
- **Team Introduction**: Narrative about the manager, captain, and the dramatic qualification path (playoff win over Italy).
- **Interactive Player Album**: A collection of 30 cards organized by position (Goalkeepers, Defenders, Midfielders, Forwards).
- **Player Card Interaction**: Each card features a flat vector cartoon of the player and flips on-click to reveal detailed stats.
- **Tournament Schedule**: Bosnia's group stage games with specific dates, times, and locations.
- **Inter-active Prediction Market**: A lightweight match outcome prediction game (Win/Draw/Loss) for each game.

## User Experience

1. **Navigation**: Users access the feature via a new "World Cup 2026" tab in the main sidebar (represented by a Trophy icon).
2. **Introduction**: A high-impact section at the top featuring the "Zmajevi" headline and the team's story.
3. **The Album**:
   - Cards are grouped into four categories.
   - Front: Player's cartoon version (placeholder for now), Name, and Number.
   - Back: Detailed stats: Place of Birth, Caps, Goals, Height, and Current Club.
4. **The Games**:
   - Three group stage matches are listed vertically.
   - Each match includes a "classic" 1X2 selector for predictions.
5. **Future-Proofing**: The architecture will allow for easy integration of ICP, SOL, or ARB blockchain wallets for "claiming" or "minting" player cards later.

## Technical Design

### New Component: `WorldCup2026.tsx`
- **Animation**: Using `framer-motion` for the 3D flip effect and layout transitions.
- **Data Model**: A central `playersData` array containing all 30 players with their respective stats.
- **State Management**: Local state for the active tab; future persistence for prediction market results (initially in `localStorage` or Capacitor `Preferences`).

### Sidebar Integration
- **Icon**: `Trophy` from `lucide-react`.
- **Navigation**: Update `AppTab` enum and `Sidebar.tsx` navigation items.

### Content Strategy
- **Zmajevi Text**: Uses the detailed narrative about Sergej Barbarez, Edin Džeko, and the dramatic win over Italy.
- **Schedule**: June 12 (v Canada), June 18 (v Switzerland), June 24 (v Qatar).

## Verification Plan

### Manual Testing
- Verify tab appears in the sidebar and opens the new component.
- Confirm all 30 player cards are rendered and grouped by position.
- Test the flip animation on each card (mobile and desktop).
- Verify the prediction market buttons toggle correctly.
- Ensure the background and styling remain consistent with the app's premium aesthetic.
