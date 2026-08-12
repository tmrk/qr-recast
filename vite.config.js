import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const manifest = JSON.parse(
  readFileSync(new URL('./public/manifest.webmanifest', import.meta.url), 'utf8'),
);

export default defineConfig({
  base: '/qr-recast/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeManifestIcons: false,
      manifest,
      workbox: {
        globPatterns: ['**/*.{css,html,js,png,svg,woff2}'],
      },
    }),
  ],
});
