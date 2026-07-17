import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

import { VitePWA } from 'vite-plugin-pwa';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import type { UserConfig, ConfigEnv } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
      watch: {
        ignored: ['**/rollup/**', '**/rollup/test/**'],
      },
      fs: {
        deny: ['rollup'],
      },
    },
    plugins: [
      basicSsl(),
      react(),
      tailwindcss(),
      nodePolyfills({
        include: ['buffer', 'process', 'crypto', 'stream', 'util', 'events', 'vm'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
        includeAssets: [
          // Critical landing page images precached for offline
          'assets/Gallery/QuestQRLocations/tuzla440.webp',
          'assets/Gallery/Ilovetuzla.webp',
          'assets/Gallery/QuestQRLocations/TuzlaMenuLogo.png',
          'assets/MapaBosnia.webp',
          'assets/Pannonica.webp',
          'assets/PannonicaBA.webp',
          'assets/panonikalogo.webp',
          'assets/aisologo.webp',
          'assets/x.svg',
          'assets/bluesky.svg',
          'assets/Gallery/City Guide/GradTuzla-1.webp',
          'assets/Gallery/Food/foodprime.webp',
          'assets/Gallery/Accommodation/mellain.webp',
          'assets/Gallery/QuestQRLocations/tztzlogo.webp',
          'assets/Gallery/QuestQRLocations/Zastava_tuzle.webp',
          'assets/Gallery/QuestQRLocations/wizzurl.webp',
          'assets/Gallery/QuestQRLocations/ilincicaba.webp',
          'assets/Gallery/QuestQRLocations/tuzhero.webp',
          'assets/Gallery/gipslogo.png',
          'resources/TuzlaTourAppLogo96x96.png',
        ],
        manifest: {
          name: 'Tuzla Virtual Tour Guide',
          short_name: 'Tuzla Guide',
          description: 'Explore Tuzla with interactive maps, quests, and local history.',
          theme_color: '#1e40af',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'assets/Gallery/QuestQRLocations/TuzlaMenuLogo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'assets/Gallery/QuestQRLocations/TuzlaMenuLogo.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'assets/Gallery/QuestQRLocations/TuzlaMenuLogo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // Precache the app shell: all built JS/CSS/HTML + icons
          globPatterns: mode === 'development' ? [] : ['**/*.{js,css,html,ico,svg}'],
          globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', 'maps/tiles/**/*'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB limit for precached shell files
          cleanupOutdatedCaches: true,
          // SPA navigation fallback — serves index.html for all navigation requests when offline
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/manifest\.json$/],
          // Skip waiting so new SW activates immediately
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            // 1. Google Fonts stylesheets (lightweight, changes rarely)
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // 2. Google Fonts webfont files (large, immutable per URL)
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // 3. Landing page & gallery images — CacheFirst for speed
            {
              urlPattern: /\/assets\/.*\.(?:png|jpg|jpeg|webp|gif|svg)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'landing-images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // 4. All other images (e.g. from CDN or external)
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // 5. Video files — NetworkFirst (large, don't bloat cache)
            {
              urlPattern: /\.(?:mp4|webm|ogg)$/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'video-cache',
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                networkTimeoutSeconds: 10,
              },
            },
            // 6. Map tiles — CacheFirst for fast map loads
            {
              urlPattern: /^https:\/\/.*\.(?:tile|tiles)\..*\/\d+\/\d+\/\d+/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-tiles-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // 7. GeoJSON / static data files
            {
              urlPattern: /\.(?:json|geojson)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'data-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // 8. CDN scripts (Google Analytics)
            {
              urlPattern: /^https:\/\/(www\.googletagmanager\.com)\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'cdn-scripts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (
            warning.code === 'INVALID_ANNOTATION' &&
            warning.message.includes('Rollup cannot interpret due to the position of the comment')
          ) {
            return;
          }
          defaultHandler(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('maplibre-gl')) {
                return 'vendor-map';
              }
              if (id.includes('html5-qrcode')) {
                return 'vendor-qr';
              }
            }
          }
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion',
        'lucide-react',
        'maplibre-gl',
        'html5-qrcode',
        '@tanstack/react-query',
      ],
      exclude: ['rollup'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
