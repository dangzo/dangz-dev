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
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: {
      stylePath: './src/tests/e2e/visual.css',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/visual.spec.ts',
    },
    {
      name: 'visual-desktop',
      testMatch: '**/visual.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 960 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'visual-mobile',
      testMatch: '**/visual.spec.ts',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: 'yarn dev -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      E2E_FIXTURES: 'true',
      E2E_FIXTURES_URL: 'http://127.0.0.1:3100/api/e2e/sanity',
    },
  },
});
