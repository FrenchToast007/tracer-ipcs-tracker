import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Service worker auto-updates whenever a new build ships. Users get
      // the latest deploy on next page load without a hard refresh.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // Enable in dev for local testing of installability flows.
      devOptions: { enabled: false },
      manifest: {
        name: 'Tracer IPCS Tracker',
        short_name: 'IPCS',
        description:
          'Tracer Integrated Production Control System — 8-stage execution control across Site, Design, and Plant.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cap precache assets at 5 MB (default is 2 MB) so the audit-report
        // .docx and other workspace artifacts can be precached if Vite picks
        // them up. Doesn't affect normal app code.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Network-first for HTML navigations so users always get the latest
        // index.html (and thus the latest JS bundle reference) when online.
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Google Fonts CSS — cache for a day, fall back to network.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css', expiration: { maxAgeSeconds: 24 * 60 * 60 } },
          },
          {
            // Google Fonts files — cache for a year (immutable).
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
