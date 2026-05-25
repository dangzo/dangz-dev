import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section shows heading and intro copy', async ({ page }) => {
    const heroSection = page.locator('article > div').first();

    await expect(heroSection.getByRole('heading', { level: 1, name: /hi, i'm daniele/i })).toBeVisible();
    await expect(heroSection.getByText(/document my journey on software engineering/i)).toBeVisible();
    await expect(heroSection.getByText(/share insights and write about things i enjoy/i)).toBeVisible();
  });

  test('hero CTA links to blog', async ({ page }) => {
    const heroSection = page.locator('article > div').first();
    const diveInButton = heroSection.getByRole('link', { name: /let's dive in/i });

    await expect(diveInButton).toBeVisible();
    await expect(diveInButton).toHaveAttribute('href', '/blog');
  });

  test('top tags area renders tag links with post counts', async ({ page }) => {
    const heroSection = page.locator('article > div').first();
    const tagLinks = heroSection.locator('a[href^="/blog/tags/"]');

    await expect(tagLinks.first()).toBeVisible();
    await expect.poll(() => tagLinks.count()).toBeGreaterThan(0);

    const postsCountBadges = heroSection.getByText(/\d+ posts?/, { exact: false });
    await expect(postsCountBadges.first()).toBeVisible();
  });

  test('main layout shell is visible', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});