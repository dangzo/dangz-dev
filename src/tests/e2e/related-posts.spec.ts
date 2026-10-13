import { expect, test } from '@playwright/test';

const articlePath = '/blog/stable-visual-regression-tests';
const expectedPaths = ['/blog/fixture-post-7', '/blog/fixture-post-8', '/blog/fixture-post-10'];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/reactions?*', (route) => route.fulfill({ json: {
    reactions: [{ _id: 'reaction-useful', name: 'Useful', emoji: '💡', count: 3 }],
  } }));
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [390, 1440]) {
    test(`next reads stay in the reading column at ${width}px in ${theme} theme`, async ({ page }) => {
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      const responseErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });
      page.on('requestfailed', (request) => {
        if (request.failure()?.errorText !== 'net::ERR_ABORTED') {
          failedRequests.push(`${request.url()} ${request.failure()?.errorText}`);
        }
      });
      page.on('response', (response) => {
        if (response.status() >= 400) {
          responseErrors.push(`${response.status()} ${response.url()}`);
        }
      });
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ colorScheme: theme });
      await page.addInitScript((initialTheme) => localStorage.setItem('theme', initialTheme), theme);
      await page.goto(articlePath);
      await expect(page.locator('[data-article-body] [aria-label="Reactions"]')).toBeAttached();
      await page.evaluate(() => document.fonts.ready);

      const recommendations = page.getByRole('region', { name: 'What to read next', exact: true });
      const rows = recommendations.getByRole('listitem');
      const links = recommendations.locator('a[data-post-opened-placement="title"]');
      const body = page.locator('[data-article-body]');

      await expect(recommendations).toBeVisible();
      await expect(rows).toHaveCount(3);
      await expect.poll(() => links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))).toEqual(expectedPaths);
      await expect(recommendations.locator('a[href*="unpublished-ai-workflow"]')).toHaveCount(0);
      await expect(recommendations.locator('a[href="/blog/stable-visual-regression-tests"]')).toHaveCount(0);
      await expect(recommendations.locator('[data-post-opened-placement="reaction_summary"]')).toHaveCount(0);
      await expect(recommendations.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0);
      await expect(rows.nth(1).getByRole('heading', { level: 3 })).toHaveText(/deliberately long article title/);
      await expect(recommendations.locator('img')).toHaveCount(2);
      await expect(rows.nth(1).locator('img')).toHaveCount(0);
      await expect(rows.first().locator('img')).toHaveAttribute('loading', 'lazy');
      await expect.poll(async () => {
        const rowBox = await links.first().boundingBox();
        const imageBox = await rows.first().locator('img').boundingBox();

        if (!rowBox || !imageBox) {
          return Number.POSITIVE_INFINITY;
        }

        return Math.max(
          Math.abs(imageBox.width - 112),
          Math.abs(imageBox.height - 84),
          Math.abs(imageBox.x + imageBox.width - rowBox.x - rowBox.width),
          Math.abs(imageBox.y + imageBox.height / 2 - rowBox.y - rowBox.height / 2),
        );
      }).toBeLessThanOrEqual(2);
      await expect(recommendations.getByRole('link')).toHaveCount(3);
      await expect(recommendations.locator('article')).toHaveCount(0);
      await expect(body.getByRole('heading', { name: 'What to read next', exact: true })).toHaveCount(0);
      await expect(page.getByRole('navigation', { name: 'Table of contents' }).getByRole('link', { name: 'What to read next', exact: true })).toHaveCount(0);
      await expect(page.locator('html')).toHaveAttribute('class', theme === 'dark' ? /dark/ : /light/);

      await expect.poll(async () => {
        const bodyBox = await body.boundingBox();
        const nextBox = await recommendations.boundingBox();

        if (!bodyBox || !nextBox) {
          return Number.POSITIVE_INFINITY;
        }

        return Math.max(Math.abs(bodyBox.x - nextBox.x), Math.abs(bodyBox.width - nextBox.width));
      }).toBeLessThanOrEqual(2);
      expect(await recommendations.evaluate((element) => {
        const reactions = document.querySelector('[data-article-body] [aria-label="Reactions"]');

        return Boolean(reactions && reactions.getBoundingClientRect().bottom <= element.getBoundingClientRect().top);
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await recommendations.scrollIntoViewIfNeeded();
      await recommendations.screenshot({ path: `.tmp/169-ui/next-reads-${theme}-${width}.png` });
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
      expect(responseErrors).toEqual([]);
    });
  }
}

test('recommendation rows resolve with keyboard and pointer navigation', async ({ page }) => {
  await page.goto(articlePath);
  await expect(page.locator('[data-article-body] [aria-label="Reactions"]')).toBeAttached();
  const recommendations = page.getByRole('region', { name: 'What to read next', exact: true });
  const title = recommendations.locator('a[data-post-opened-placement="title"]').first();

  await title.focus();
  await expect(title).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/blog\/fixture-post-7$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 7');

  await page.goto(articlePath);
  await expect(page.locator('[data-article-body] [aria-label="Reactions"]')).toBeAttached();
  const row = page.getByRole('region', { name: 'What to read next', exact: true }).getByRole('link').nth(1);
  await row.click();
  await expect(page).toHaveURL(/\/blog\/fixture-post-8$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 8');
});

test('recency fallback resolves the third recommendation', async ({ page }) => {
  await page.goto(articlePath);
  await expect(page.locator('[data-article-body] [aria-label="Reactions"]')).toBeAttached();
  await page.getByRole('region', { name: 'What to read next', exact: true }).getByRole('link').nth(2).click();

  await expect(page).toHaveURL(/\/blog\/fixture-post-10$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 10');
});
