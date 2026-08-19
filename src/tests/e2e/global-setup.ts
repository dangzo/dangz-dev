import { chromium, type FullConfig } from '@playwright/test';

/**
 * Turbopack's dev server compiles routes on demand. When Playwright's parallel
 * workers all request an uncompiled route at once, concurrent compilations can
 * race and hand the client a stale chunk hash, tripping the app's error boundary.
 * Visiting each route once, sequentially, before the parallel run starts ensures
 * they're already compiled and cached.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/`);
  await page.goto(`${baseURL}/about`);
  await page.goto(`${baseURL}/blog`);

  const firstArticleHref = await page
    .locator('section article a:has(h3)')
    .first()
    .getAttribute('href');

  if (firstArticleHref) {
    await page.goto(`${baseURL}${firstArticleHref}`);
  }

  await browser.close();
}

export default globalSetup;
