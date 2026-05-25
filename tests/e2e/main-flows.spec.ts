import { expect, test } from '@playwright/test';

const ARTICLE_PATH = '/blog/building-a-real-time-chat-app-with-websockets-in-5-hours';

test.describe('Main User Flows', () => {
  test('home page shows hero, CTA, tags, and main content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /hi, i'm daniele/i })).toBeVisible();
    await expect(page.getByText(/document my journey on software engineering/i)).toBeVisible();

    const diveInButton = page.getByRole('link', { name: /let's dive in/i });
    await expect(diveInButton).toBeVisible();
    await expect(diveInButton).toHaveAttribute('href', '/blog');

    await expect(page.locator('a[href^="/blog/tags/"]').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('blog page shows post cards with metadata and sidebar tags', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.getByRole('heading', { name: /all posts/i })).toBeVisible();

    const firstPostCard = page.locator('section article').first();
    await expect(firstPostCard).toBeVisible();
    await expect(firstPostCard.locator('a:has(h3)')).toBeVisible();
    await expect(firstPostCard.locator('img')).toBeVisible();
    await expect(firstPostCard.locator('time')).toBeVisible();
    await expect(firstPostCard.locator('a[href^="/blog/tags/"]').first()).toBeVisible();
    await expect(firstPostCard.getByRole('link', { name: /read more/i })).toBeVisible();

    const sidebar = page.locator('aside');
    await expect(sidebar.getByRole('heading', { name: /all tags/i })).toBeVisible();
    await expect(sidebar.locator('a[href^="/blog/tags/"]').first()).toBeVisible();
  });

  test('single article page renders toc, hero image, code blocks, and rich content', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('article > div img').first()).toBeVisible();

    const tocSection = page.locator('aside').filter({ hasText: /table of contents/i }).first();
    await expect(tocSection.getByRole('heading', { name: /table of contents/i })).toBeVisible();
    await expect(tocSection.locator('a[href^="#"]').first()).toBeVisible();

    await expect(page.getByRole('button', { name: /copy code/i }).first()).toBeVisible();

    const articleImages = page.locator('main article img');
    await expect(articleImages.first()).toBeVisible();
    await expect.poll(() => articleImages.count()).toBeGreaterThan(1);

    await expect(page.locator('main article p').first()).toBeVisible();
  });

  test('about page shows content, lets talk frontend ctas, and resume download', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /hi, i'm daniele/i })).toBeVisible();
    await expect(page.getByText(/craft frontend solutions/i)).toBeVisible();

    const resumeBtn = page.getByRole('link', { name: /download my resume/i }).first();
    await expect(resumeBtn).toBeVisible();
    await expect(resumeBtn).toHaveAttribute('href', /Daniele-Gazzelloni-Resume-2026\.pdf$/);
    await expect(resumeBtn).toHaveAttribute('download', '');

    await expect(page.getByRole('heading', { name: /let's talk frontend/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /email me/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /connect on linkedin/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /view github/i }).first()).toBeVisible();
  });

  test('theme switch, footer links, and app version are visible', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const isDarkBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    await page.getByRole('button', { name: /theme switcher/i }).click();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .not.toBe(isDarkBefore);

    await expect(html).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /mail/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /github/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /linkedin/i })).toBeVisible();
    await expect(footer.getByText(/v\d+\.\d+\.\d+/)).toBeVisible();
  });
});