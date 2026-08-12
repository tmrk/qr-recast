import { defineConfig } from '@playwright/test';

const appUrl = 'http://127.0.0.1:4173/qr-recast/';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.js',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: appUrl,
    locale: 'en-GB',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'npm run build -- --outDir .playwright-dist && npm run preview -- --outDir .playwright-dist --host 127.0.0.1 --port 4173 --strictPort',
    env: {
      ...process.env,
      VITE_ADS_ENABLED: 'false',
      VITE_GA_MEASUREMENT_ID: 'G-QRRECASTTEST',
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: appUrl,
  },
});
