import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section shows heading and intro copy', async ({ page }) => {
    const heroSection = page.locator('article > div').first();

    await expect(heroSection.getByRole('heading', { level: 1, name: /hi, i'm daniele/i })).toBeVisible();
    await expect(heroSection.getByText(/notes from building real products/i)).toBeVisible();
    await expect(heroSection.getByText(/deepen my understanding through writing/i)).toBeVisible();
  });

  test('hero CTA links to blog', async ({ page }) => {
    const heroSection = page.locator('article > div').first();
    const diveInButton = heroSection.getByRole('link', { name: /explore the writing/i });

    await expect(diveInButton).toBeVisible();
    await expect(diveInButton).toHaveAttribute('href', '/blog');
  });

  test('top tags area renders tag links with post counts', async ({ page }) => {
    const topics = page.getByRole('region', { name: 'Follow your curiosity' });
    const tagLinks = topics.locator('a[href^="/blog/tags/"]');

    await expect(tagLinks.first()).toBeVisible();
    await expect.poll(() => tagLinks.count()).toBeGreaterThan(0);

    const postsCountBadges = topics.getByText(/\d+ posts?/, { exact: false });
    await expect(postsCountBadges.first()).toBeVisible();
  });

  test('main layout shell is visible', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('latest writing opens an article', async ({ page }) => {
    const writing = page.getByRole('region', { name: 'Latest writing' });
    await expect(writing.getByRole('article')).toHaveCount(3);

    const article = writing.getByRole('article').first();
    const title = await article.getByRole('heading').innerText();
    await article.getByRole('link').click();

    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  });

  test('mobile navigation stays out of keyboard order until opened', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('#mobile-nav-menu');
    await expect(menu).toHaveAttribute('inert', '');
    await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
    await expect(menu.getByRole('link', { name: 'About' })).toBeVisible();
    await menu.getByRole('link', { name: 'About' }).focus();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('inert', '');
    await expect(page.getByRole('button', { name: 'Toggle navigation menu' })).toBeFocused();
  });
});
