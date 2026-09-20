import { expect, test, type Locator, type Page } from '@playwright/test';

const visualRoutes = [
  { name: 'home.png', path: '/' },
  { name: 'about.png', path: '/about' },
  { name: 'blog-list.png', path: '/blog' },
  { name: 'blog-article.png', path: '/blog/stable-visual-regression-tests' },
  { name: 'tag-list.png', path: '/blog/tags/react' },
] as const;

async function waitForImage(image: Locator) {
  await image.scrollIntoViewIfNeeded();

  await image.evaluate(async (element) => {
    const imageElement = element as HTMLImageElement;

    if (!imageElement.complete) {
      await new Promise<void>((resolve) => {
        imageElement.addEventListener('load', () => resolve(), { once: true });
        imageElement.addEventListener('error', () => resolve(), { once: true });
      });
    }

    await imageElement.decode().catch(() => undefined);
  });
}

async function waitForStablePage(page: Page) {
  await expect(page.locator('main')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const images = page.locator('img');
  const imageCount = await images.count();

  for (let index = 0; index < imageCount; index += 1) {
    await waitForImage(images.nth(index));
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

test.describe('Visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/reactions?*', async (route) => {
      await route.fulfill({
        json: {
          reactions: [
            { _id: 'reaction-useful', name: 'Useful', emoji: '💡', count: 3 },
            { _id: 'reaction-love', name: 'Love', emoji: '❤️', count: 1 },
          ],
        },
      });
    });
  });

  for (const route of visualRoutes) {
    test(`${route.path} matches its visual baseline`, async ({ page }) => {
      await page.goto(route.path);
      await waitForStablePage(page);

      await expect(page).toHaveScreenshot(route.name, {
        animations: 'disabled',
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      });
    });
  }
});
