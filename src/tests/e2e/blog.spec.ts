import { expect, test } from '@playwright/test';

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('heading and tagline section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /all posts/i })).toBeVisible();
    await expect(page.getByText(/frontend engineering/i)).toBeVisible();
  });

  test('post list cards render core metadata', async ({ page }) => {
    const firstPostCard = page.locator('section article').first();

    await expect(firstPostCard).toBeVisible();

    const titleLink = firstPostCard.locator('a:has(h3)').first();
    await expect(titleLink).toBeVisible();
    await expect(titleLink).toHaveAttribute('href', /\/blog\/.+/);

    await expect(firstPostCard.locator('a:has(h3)')).toBeVisible();
    await expect(firstPostCard.locator('img')).toBeVisible();

    const publishedTime = firstPostCard.locator('time');
    await expect(publishedTime).toBeVisible();
    await expect(publishedTime).toHaveAttribute('datetime', /.+/);

    await expect(firstPostCard.locator('a[href^="/blog/topics/"]').first()).toBeVisible();
    await expect(firstPostCard.getByRole('link', { name: /read more/i })).toBeVisible();
  });

  test('compact topic navigation renders above the article list', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Topics', exact: true });

    await expect(page.locator('aside')).toHaveCount(0);
    await expect(sidebar.locator('a[href^="/blog/topics/"]').first()).toBeVisible();

    const sidebarTagLinks = sidebar.locator('a[href^="/blog/topics/"]');
    await expect.poll(() => sidebarTagLinks.count()).toBeGreaterThan(0);
  });

  test('cards list contains multiple posts', async ({ page }) => {
    const postCards = page.locator('section article');
    await expect.poll(() => postCards.count()).toBeGreaterThan(1);
  });

  test('preview images have consistent dimensions and leave mobile titles full width', async ({ page }) => {
    for (const width of [320, 390, 767, 768, 1023, 1440]) {
      await page.setViewportSize({ width, height: 1000 });

      const cards = page.locator('section article');
      const image = cards.first().locator('img');
      const title = cards.first().locator('a:has(h3)');
      const imageBox = await image.boundingBox();
      const titleBox = await title.boundingBox();
      const cardBox = await cards.first().boundingBox();

      expect(imageBox).not.toBeNull();
      expect(titleBox).not.toBeNull();
      expect(cardBox).not.toBeNull();

      if (!imageBox || !titleBox || !cardBox) {
        throw new Error('Expected the preview image, title, and article to have layout bounds.');
      }

      if (width >= 768) {
        expect(imageBox.width).toBe(width >= 1024 ? 320 : 256);
        expect(imageBox.height).toBe(width >= 1024 ? 180 : 144);
        expect(imageBox.x).toBeGreaterThan(titleBox.x + titleBox.width);
      } else {
        expect(imageBox.width).toBeCloseTo(cardBox.width, 1);
        expect(titleBox.width).toBeCloseTo(cardBox.width, 1);
        expect(titleBox.y).toBeGreaterThan(imageBox.y + imageBox.height);
      }

      const imageSizes = await cards.locator('img').evaluateAll((images) => images.map((item) => {
        const bounds = item.getBoundingClientRect();

        return [bounds.width, bounds.height];
      }));

      for (const [imageWidth, imageHeight] of imageSizes) {
        expect(imageWidth).toBeCloseTo(imageBox.width, 1);
        expect(imageHeight).toBeCloseTo(imageBox.height, 1);
      }

      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    }
  });
});
