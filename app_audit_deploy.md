# TuzlaTourApp — Pre-Deploy Audit & Vercel Deployment Guide

## ✅ Audit Results

### Build Configuration
| Item | Status | Notes |
|---|---|---|
| `vite.config.ts` | ✅ Good | Correct Vite + React + PWA + TailwindCSS setup |
| `vercel.json` | ✅ Good | SPA rewrites configured, `outputDirectory: dist`, `framework: vite` |
| `tsconfig.json` | ✅ Good | `moduleResolution: bundler`, JSX, proper includes |
| `package.json` scripts | ✅ Good | `build: vite build`, `preview: vite preview` |
| `.nvmrc` | ✅ Good | Node `25.8.0` pinned |
| `index.html` | ✅ Good | SEO meta, OG tags, schema.org JSON-LD, splash screen |
| `index.tsx` | ✅ Good | PWA SW registered, React 19 entry point |
| `src/service-worker.ts` | ✅ Good | Workbox precache, offline routes, range requests for video |

### PWA
| Item | Status | Notes |
|---|---|---|
| `vite-plugin-pwa` strategy | ✅ Good | `injectManifest` with custom SW |
| Manifest icons | ⚠️ Warning | All 3 icon sizes point to the same PNG file — consider adding a proper 192×192 and 512×512 |
| Workbox max file size | ✅ Good | 30MB limit to handle large video assets |
| SW caching strategies | ✅ Good | Fonts, tiles, images, video all covered |

### Environment Variables
| Variable | Prefixed with VITE_? | Vercel-safe? |
|---|---|---|
| `VITE_GEMINI_API_KEY` | ✅ | Must be added to Vercel dashboard |
| `VITE_GEOCODING_API_KEY` | ✅ | Must be added to Vercel dashboard |
| `VITE_MAPILLARY_CLIENT_TOKEN` | ✅ | Must be added to Vercel dashboard |
| `VITE_GEOAPIFY_ROUTING_API` | ✅ | Must be added to Vercel dashboard |
| `VITE_GEOAPIFY_GEOCODING_API` | ✅ | Must be added to Vercel dashboard |
| `VITE_GEOAPIFY_STATIC_API` | ✅ | Must be added to Vercel dashboard |
| `VITE_GEOAPIFY_MAP_TILES_API` | ✅ | Must be added to Vercel dashboard |
| `MAPQUESTVIEW_JAWG_API_KEY` | ❌ No VITE_ prefix | Exposed only server-side; verify usage |
| `JAWG_MAP_STREET` | ❌ No VITE_ prefix | Same — check if used in frontend |
| `SUPABASE_*` keys | ❌ No VITE_ prefix | Will NOT be available client-side on Vercel — add `VITE_` prefix if used in browser |

> [!CAUTION]
> Your `.env` file contains real API keys. It is currently listed in `.gitignore` which is correct — **never commit `.env` to git**. All secrets must be added manually in the Vercel dashboard.

### Issues Fixed
| Issue | Fix Applied |
|---|---|
| `.vercelignore` had Windows absolute paths (`C:\Users\amir_\...`) | ✅ Cleaned — replaced with proper relative ignore rules |

### Remaining Recommendations (Non-blocking)
1. **`vercel` package in `dependencies`** — `vercel` (v50) is a dev/CLI tool; it should be in `devDependencies` or removed entirely (Vercel CI does not need it installed).
2. **`README.md` in `.gitignore`** — This means your README won't appear on GitHub. This is unusual — remove it from `.gitignore` unless intentional.
3. **`@wasmer/sdk` and `jbr`** — Large/unusual packages in `dependencies`; confirm they're needed for the web build.

---

## 🚀 Vercel Deployment Commands

### Option A — Deploy via Vercel CLI (Recommended)

```powershell
# Step 1: Install Vercel CLI globally (once)
npm install -g vercel

# Step 2: Log in to your Vercel account
vercel login

# Step 3: Link project to Vercel (first time only — run from project root)
# Answer: Set up and deploy? → Y
# Which scope? → select your account
# Link to existing project? → N (first time) or Y if already created
vercel link

# Step 4: Add all environment variables to Vercel
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_GEOCODING_API_KEY
vercel env add VITE_MAPILLARY_CLIENT_TOKEN
vercel env add VITE_GEOAPIFY_ROUTING_API
vercel env add VITE_GEOAPIFY_GEOCODING_API
vercel env add VITE_GEOAPIFY_STATIC_API
vercel env add VITE_GEOAPIFY_MAP_TILES_API
vercel env add MAPQUESTVIEW_JAWG_API_KEY
vercel env add JAWG_MAP_STREET
# Add each one and paste the value when prompted
# Select "Production, Preview, Development" for each

# Step 5: Deploy to Production
vercel --prod
```

### Option B — Deploy via GitHub (Auto-Deploy on Push)

```powershell
# Step 1: Make sure all changes are committed and pushed
git add -A
git commit -m "chore: pre-deploy cleanup"
git push origin main
```

Then go to **https://vercel.com/new** → Import from GitHub → select `icptuzla/TuzlaTourApp`.

Vercel will auto-detect Vite and use settings from your `vercel.json`.

> [!IMPORTANT]
> After importing, go to **Project Settings → Environment Variables** and add ALL the keys from your `.env` file before the first deploy completes.

### Option C — Preview Deploy (Test before Production)

```powershell
# Deploy to a preview URL (not production)
vercel
```

---

## Vercel Dashboard Checklist

After importing the project in Vercel:

- [ ] **Framework Preset**: Vite (auto-detected)
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Node.js Version**: Set to **22.x** (Vercel doesn't support Node 25 yet — override `.nvmrc` in dashboard)
- [ ] **Environment Variables**: All `VITE_*` keys added
- [ ] **Rewrites**: Already in `vercel.json`

> [!WARNING]
> Vercel currently supports up to **Node.js 22.x**. Your `.nvmrc` says `25.8.0` which Vercel will fall back from. Set Node version explicitly in **Project Settings → General → Node.js Version → 22.x** in the Vercel dashboard.
