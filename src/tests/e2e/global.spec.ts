import { expect, test } from '@playwright/test';

test.describe('Global UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header navigation and action buttons are visible', async ({ page }) => {
    const header = page.locator('header').first();

    await expect(header.getByRole('link', { name: 'Home' }).first()).toBeVisible();
    await expect(header.getByRole('link', { name: 'Blog' }).first()).toBeVisible();
    await expect(header.getByRole('link', { name: 'About' }).first()).toBeVisible();

    await expect(header.getByRole('button', { name: /search/i })).toBeVisible();
    await expect(header.getByRole('button', { name: /theme switcher/i })).toBeVisible();
  });

  test('terminal-like prompt reflects current path', async ({ page }) => {
    await page.goto('/blog');

    const prompt = page.locator('p').filter({ hasText: /guest@dangz\.dev/i }).first();
    await expect(prompt).toBeVisible();
    await expect(prompt.getByRole('link', { name: '~' })).toBeVisible();
    await expect(prompt.getByRole('link', { name: 'blog' })).toBeVisible();
  });

  test('theme switch toggles document class', async ({ page }) => {
    const html = page.locator('html');

    const isDarkBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    await page.getByRole('button', { name: /theme switcher/i }).click();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .not.toBe(isDarkBefore);

    await expect(html).toBeVisible();
  });

  test('footer links and app version are visible', async ({ page }) => {
    const footer = page.locator('footer');

    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /mail/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /github/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /linkedin/i })).toBeVisible();

    await expect(footer.getByRole('link', { name: /mail/i })).toHaveAttribute('href', /mailto:/i);
    await expect(footer.getByRole('link', { name: /github/i })).toHaveAttribute('href', /github\.com/i);
    await expect(footer.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', /linkedin\.com/i);

    await expect(footer.getByText(/v\d+\.\d+\.\d+/)).toBeVisible();
  });
});