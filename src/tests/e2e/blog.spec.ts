import { expect, test } from '@playwright/test';

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('heading and tagline section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /all posts/i })).toBeVisible();
    await expect(page.getByText(/all things/i)).toBeVisible();
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

    await expect(firstPostCard.locator('a[href^="/blog/tags/"]').first()).toBeVisible();
    await expect(firstPostCard.getByRole('link', { name: /read more/i })).toBeVisible();
  });

  test('sidebar tags section renders tag navigation', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    await expect(sidebar.getByRole('heading', { name: /all tags/i })).toBeVisible();
    await expect(sidebar.locator('a[href^="/blog/tags/"]').first()).toBeVisible();

    const sidebarTagLinks = sidebar.locator('a[href^="/blog/tags/"]');
    await expect.poll(() => sidebarTagLinks.count()).toBeGreaterThan(0);
  });

  test('cards list contains multiple posts', async ({ page }) => {
    const postCards = page.locator('section article');
    await expect.poll(() => postCards.count()).toBeGreaterThan(1);
  });
});