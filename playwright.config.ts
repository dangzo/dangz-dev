import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  globalSetup: './src/tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60 * 1000,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
    colorScheme: 'light',
    screenshot: 'only-on-failure',
  },
  expect: {
    timeout: 10 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/umami-pageviews.spec.ts', '**/post-discovery.spec.ts'],
    },
  ],
  webServer: {
    command: 'yarn dev -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      E2E_FIXTURES: 'true',
      E2E_UMAMI_PAGEVIEWS: 'false',
      E2E_FIXTURES_URL: 'http://127.0.0.1:3100/api/e2e/sanity',
      SANITY_API_READ_ONLY_TOKEN: process.env.E2E_PREVIEW_DRAFTS === 'true' ? 'fixture-preview' : '',
      SANITY_TOPIC_MODEL: 'primary',
    },
  },
});
