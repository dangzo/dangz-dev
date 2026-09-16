import { chromium, type FullConfig, type Page } from '@playwright/test';

async function visitUntilRendered(url: string, selector: string, page: Page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(url);

    try {
      await page.locator(selector).first().waitFor({ timeout: 10 * 1000 });
      return;
    } catch {
      await page.waitForTimeout(500);
    }
  }

  throw new Error(`Route did not render after warm-up: ${url}`);
}

/**
 * Turbopack's dev server compiles routes on demand. When Playwright's parallel
 * workers all request an uncompiled route at once, concurrent compilations can
 * race and hand the client a stale chunk hash, tripping the app's error boundary.
 * Visiting each route once, sequentially, before the parallel run starts ensures
 * they're already compiled and cached.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:3100';
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
    await visitUntilRendered(`${baseURL}${firstArticleHref}`, 'main article img', page);
  }

  await page.goto(`${baseURL}/blog`);

  const firstTagHref = await page
    .locator('aside a[href^="/blog/tags/"]')
    .first()
    .getAttribute('href');

  if (firstTagHref) {
    await visitUntilRendered(`${baseURL}${firstTagHref}`, 'section article', page);
  }

  await browser.close();
}

export default globalSetup;
