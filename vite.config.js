import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/qr-recast/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'QR Recast',
        short_name: 'QR Recast',
        id: '/qr-recast/',
        scope: '/qr-recast/',
        start_url: '/qr-recast/',
        display: 'standalone',
        theme_color: '#0F766E',
        background_color: '#F7FFFC',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{css,html,js,png,svg,webmanifest}'],
      },
    }),
  ],
});
