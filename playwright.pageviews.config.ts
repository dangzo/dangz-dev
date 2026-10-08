import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  globalSetup: undefined,
  testMatch: ['**/umami-pageviews.spec.ts', '**/post-discovery.spec.ts'],
  testIgnore: [],
  workers: 1,
  use: {
    ...base.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3101',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
      command: 'yarn dev -p 3101',
      url: 'http://127.0.0.1:3101',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        E2E_FIXTURES: 'true',
        E2E_UMAMI_PAGEVIEWS: 'true',
        E2E_FIXTURES_URL: 'http://127.0.0.1:3101/api/e2e/sanity',
        SANITY_API_READ_ONLY_TOKEN: '',
        SANITY_TOPIC_MODEL: 'primary',
      },
    },
});
