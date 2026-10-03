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

  test('topics area renders topic links with post counts', async ({ page }) => {
    const topics = page.getByRole('region', { name: 'Follow your curiosity' });
    const tagLinks = topics.locator('a[href^="/blog/topics/"]');

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
    await article.getByRole('link', { name: title, exact: true }).click();

    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  });

  test('latest writing shows four articles only in the two-column tablet layout', async ({ page }) => {
    const articles = page.getByRole('region', { name: 'Latest writing' }).getByRole('article');

    for (const [width, count] of [[390, 3], [767, 3], [768, 4], [1023, 4], [1024, 3], [1440, 3]]) {
      await page.setViewportSize({ width, height: 960 });
      await expect(articles).toHaveCount(count);
    }
  });

  test('latest writing topic link opens its canonical archive with the keyboard', async ({ page }) => {
    const article = page.getByRole('region', { name: 'Latest writing' }).getByRole('article').first();
    const topic = article.locator('a[href^="/blog/topics/"]');
    const href = await topic.getAttribute('href');
    const label = await topic.innerText();

    await topic.focus();
    await expect(topic).toBeFocused();
    await expect(topic).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(href ?? '');
    await expect(page.getByRole('heading', { level: 1, name: label, exact: true })).toBeVisible();
  });

  test('mobile writing uses cards with full-width images above the text', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const writing = page.getByRole('region', { name: 'Latest writing' });
    const article = writing.getByRole('article').first();
    const thumbnail = article.locator('img');

    await expect(thumbnail).toBeVisible();
    const bounds = await thumbnail.boundingBox();
    const cardBounds = await article.boundingBox();
    const titleBounds = await article.getByRole('heading').boundingBox();
    expect(bounds).not.toBeNull();
    expect(cardBounds).not.toBeNull();
    expect(titleBounds).not.toBeNull();

    if (bounds && cardBounds && titleBounds) {
      expect(Math.abs(bounds.width - (cardBounds.width - 2))).toBeLessThan(1);
      expect(bounds.y + bounds.height).toBeLessThan(titleBounds.y);
    }

    await expect(article.getByRole('heading')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
