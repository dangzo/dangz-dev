import { expect, test } from '@playwright/test';

test.describe('Blog Article Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');

    const firstArticleLink = page.locator('section article a:has(h3)').first();
    await expect(firstArticleLink).toBeVisible();
    await expect(firstArticleLink).toHaveAttribute('href', /\/blog\/.+/);

    const href = await firstArticleLink.getAttribute('href');
    if (!href) {
      throw new Error('Expected first article link to have an href');
    }

    const expectedPathname = new URL(href, 'http://127.0.0.1:3000').pathname;

    await page.goto(href);
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(expectedPathname);
  });

  test('heading and article metadata are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const headingArea = page.locator('article').first();
    await expect(headingArea.locator('time')).toBeVisible();
    await expect(headingArea.getByText(/min read/i)).toBeVisible();
    await expect(headingArea.locator('a[href^="/blog/tags/"]').first()).toBeVisible();
  });

  test('table of contents section provides anchor navigation', async ({ page }) => {
    const tocSection = page.locator('aside').filter({ hasText: /table of contents/i }).first();

    await expect(tocSection.getByRole('heading', { name: /table of contents/i })).toBeVisible();
    await expect(tocSection.locator('a[href^="#"]').first()).toBeVisible();

    const tocLinks = tocSection.locator('a[href^="#"]');
    await expect.poll(() => tocLinks.count()).toBeGreaterThan(0);

    const backToBlogLink = tocSection.getByRole('link', { name: /back to all posts/i });
    await expect(backToBlogLink).toBeVisible();
    await expect(backToBlogLink).toHaveAttribute('href', '/blog');
  });

  test('hero and inline images are rendered', async ({ page }) => {
    await expect(page.locator('article > div img').first()).toBeVisible();

    const articleImages = page.locator('main article img');
    await expect(articleImages.first()).toBeVisible();
    await expect.poll(() => articleImages.count()).toBeGreaterThan(1);
  });

  test('code blocks and rich content are rendered', async ({ page }) => {
    await expect(page.getByRole('button', { name: /copy code/i }).first()).toBeVisible();
    await expect(page.locator('main article pre').first()).toBeVisible();
    await expect(page.locator('main article h2').first()).toBeVisible();
    await expect(page.locator('main article p').first()).toBeVisible();

    const paragraphCount = page.locator('main article p');
    await expect.poll(() => paragraphCount.count()).toBeGreaterThan(3);
  });
});