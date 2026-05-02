# Tuzla Virtual Tour Guide - App Review & TON Migration Design

## 1. Overview
This document outlines the recommendations from the comprehensive app review of the Tuzla Virtual Tour Guide and the architecture design for migrating the application's wallet infrastructure from Solana to The Open Network (TON).

## 2. App Review & Recommendations

### 2.1 UI/UX & Visual Design (Crystalline Connectivity)
*   **Current State:** Strong visual identity using Tailwind v4, custom CSS classes (`.glassy`, `.glow-blue`), and `framer-motion` for smooth animations.
*   **Recommendation:** Audit components (e.g., Map popups, dialogs) to ensure consistent application of the `.glassy` backdrop blur. Monitor for any CSS regressions due to the bleeding-edge Tailwind v4 alpha usage.

### 2.2 Performance & Optimization
*   **Current State:** Effective use of `VitePWA` for asset caching and React `lazy`/`Suspense` for code splitting.
*   **Recommendation:** Strictly manage the lifecycle of memory-intensive components like `Html5Qrcode` and `MapLibre` GL instances. Ensure they are explicitly destroyed on unmount to prevent memory leaks during extended application usage within the Capacitor webview.

### 2.3 Feature Completeness
*   **Current State:** Rich feature set including Interactive Maps, AR Guide, Wallet, TaskManager, and Quests.
*   **Recommendation:** Implement robust "Permission Denied" fallback UI states for hardware-dependent features (Camera for AR/QR, Geolocation for Maps). Provide clear user instructions for enabling permissions in system settings.

## 3. Architecture: TON Migration Design

### 3.1 Objective
Migrate the existing Solana wallet integration (`@solana/wallet-adapter-react`, `@solana-mobile/wallet-adapter-mobile`) to the TON ecosystem to serve as a simple wallet connection and transaction interface.

### 3.2 Selected Approach
We will proceed with **Approach 1: `@tonconnect/ui-react`**.
This provides a standardized, robust modal for connecting to TON wallets (Tonkeeper, Telegram Wallet, etc.) and handles deep-linking natively on mobile devices.

### 3.3 Component Changes

#### 1. Package Dependencies
*   **Remove:**
    *   `@solana/wallet-adapter-react`
    *   `@solana/wallet-adapter-react-ui`
    *   `@solana/wallet-adapter-base`
    *   `@solana/wallet-adapter-wallets`
    *   `@solana/web3.js`
    *   `@solana-mobile/wallet-adapter-mobile`
*   **Add:**
    *   `@tonconnect/ui-react`

#### 2. `App.tsx` (Global State)
*   **Remove:** `ConnectionProvider`, `WalletProvider`, and `WalletModalProvider` from Solana.
*   **Add:** Wrap the application in `<TonConnectUIProvider manifestUrl="<APP_URL>/tonconnect-manifest.json">`.
*   **Create:** A `tonconnect-manifest.json` file in the `public` directory (required by TON Connect for app metadata).

#### 3. `Wallet.tsx` (UI Component)
*   **Remove:** Solana hooks (`useWallet`) and the `<WalletMultiButton />`.
*   **Add:** Use `<TonConnectButton />` to replace the Solana connect button.
*   **State Updates:** Replace references to Solana `publicKey` with TON wallet address retrieval using the `useTonAddress()` hook. 
*   **UI Tweaks:** Adjust the `tonconnect-ui-react` theme variables (via `uiPreferences` prop) to align as closely as possible with the app's Crystalline blue/glassy aesthetic.

## 4. Open Questions & Next Steps
*   **Manifest URL:** We will need to ensure the `tonconnect-manifest.json` is accessible via a public HTTPS URL eventually, but we can use a local path or raw GitHub gist during development.
*   **Approval:** Once this design is approved, we will transition into the implementation phase and generate the specific code changes.
