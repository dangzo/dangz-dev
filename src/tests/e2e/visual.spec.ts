import { expect, test, type Locator, type Page } from '@playwright/test';

const visualRoutes = [
  { name: 'home.png', path: '/' },
  { name: 'about.png', path: '/about' },
  { name: 'blog-list.png', path: '/blog' },
  { name: 'blog-article.png', path: '/blog/stable-visual-regression-tests' },
  { name: 'topic-list.png', path: '/blog/topics/architecture' },
  { name: 'blog-page-2.png', path: '/blog/page/2' },
  { name: 'topic-page-2.png', path: '/blog/topics/architecture/page/2' },
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

  const images = page.locator('img:visible');
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

  for (const route of visualRoutes.filter(route => route.path === '/' || route.path.startsWith('/blog'))) {
    test(`${route.path} dark theme matches its visual baseline`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(route.path);
      await waitForStablePage(page);

      await expect(page.locator('html')).toHaveClass(/dark/);
      await expect(page).toHaveScreenshot(route.name.replace('.png', '-dark.png'), {
        animations: 'disabled',
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      });
    });
  }

  for (const theme of ['light', 'dark'] as const) {
    test(`article image viewer ${theme} matches its visual baseline`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.addInitScript(value => localStorage.setItem('theme', value), theme);
      await page.route('**/_next/image?*', async route => {
        const source = new URL(route.request().url()).searchParams.get('url') ?? '';
        const portrait = source.includes('1200x2400');
        const width = portrait ? 1200 : 2400;
        const height = portrait ? 2400 : 1200;
        await route.fulfill({
          contentType: 'image/svg+xml',
          body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#305e88"/><circle cx="${width / 2}" cy="${height / 2}" r="300" fill="#d8b4fe"/><rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#fde68a" stroke-width="20"/></svg>`,
        });
      });
      await page.goto('/blog/fixture-post-5');
      await waitForStablePage(page);
      const trigger = page.getByRole('button', { name: 'View image: Landscape image with cropped thumbnail', exact: true });
      await trigger.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Image viewer' });
      await expect(dialog).toHaveCSS('opacity', '1');
      await waitForImage(dialog.getByRole('img'));
      await expect(page).toHaveScreenshot(`article-image-viewer-${theme}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.001,
      });
    });
  }

});
