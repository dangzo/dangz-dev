import { expect, test } from '@playwright/test';

const articlePath = '/blog/stable-visual-regression-tests';
const expectedPaths = ['/blog/fixture-post-7', '/blog/fixture-post-8', '/blog/fixture-post-10', '/blog/fixture-post-9'];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/reactions?*', (route) => route.fulfill({ json: {
    reactions: [{ _id: 'reaction-useful', name: 'Useful', emoji: '💡', count: 3 }],
  } }));
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [390, 767, 768, 1023, 1024, 1440]) {
    test(`next-read cards span the article frame at ${width}px in ${theme} theme`, async ({ page }) => {
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
      const cards = recommendations.getByRole('listitem');
      const visibleCount = width >= 768 && width < 1024 ? 4 : 3;
      const columns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;
      const links = recommendations.locator('a[data-post-opened-placement="title"]:visible');
      const body = page.locator('[data-article-body]');

      await expect(recommendations).toBeVisible();
      await expect(cards).toHaveCount(visibleCount);
      await expect.poll(() => links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))).toEqual(expectedPaths.slice(0, visibleCount));
      await expect(recommendations.locator('a[href*="unpublished-ai-workflow"]')).toHaveCount(0);
      await expect(recommendations.locator('a[href="/blog/stable-visual-regression-tests"]')).toHaveCount(0);
      await expect(recommendations.locator('[data-post-opened-placement="reaction_summary"]')).toHaveCount(0);
      await expect(recommendations.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0);
      await expect(cards.nth(1).getByRole('heading', { level: 3 })).toHaveText(/deliberately long article title/);
      await expect(recommendations.locator('img:visible')).toHaveCount(visibleCount - 1);
      await expect(cards.nth(1).locator('img')).toHaveCount(0);
      await expect(cards.first().locator('img')).toHaveAttribute('loading', 'lazy');
      await expect.poll(async () => {
        const rowBox = await cards.first().getByRole('article').boundingBox();
        const imageBox = await cards.first().locator('img').boundingBox();

        if (!rowBox || !imageBox) {
          return Number.POSITIVE_INFINITY;
        }

        return Math.max(
          Math.abs(imageBox.width - rowBox.width + 2),
          Math.abs(imageBox.height - imageBox.width * 9 / 16),
          Math.abs(imageBox.x - rowBox.x - 1),
          Math.abs(imageBox.y - rowBox.y - 1),
        );
      }).toBeLessThanOrEqual(2);
      await expect(recommendations.locator('a[data-post-opened-placement="cta"]:visible')).toHaveCount(visibleCount);
      await expect(recommendations.getByRole('article')).toHaveCount(visibleCount);
      await expect(cards.first().getByRole('link', { name: /^Read article:/ })).toBeVisible();
      await expect(cards.first().locator('a[href^="/blog/topics/"]')).toHaveAttribute('href', '/blog/topics/architecture');
      await expect(body.getByRole('heading', { name: 'What to read next', exact: true })).toHaveCount(0);
      await expect(page.getByRole('navigation', { name: 'Table of contents' }).getByRole('link', { name: 'What to read next', exact: true })).toHaveCount(0);
      await expect(page.locator('html')).toHaveAttribute('class', theme === 'dark' ? /dark/ : /light/);

      await expect.poll(async () => {
        const bodyBox = await page.getByRole('heading', { level: 1 }).boundingBox();
        const nextBox = await recommendations.boundingBox();

        if (!bodyBox || !nextBox) {
          return Number.POSITIVE_INFINITY;
        }

        return Math.max(Math.abs(bodyBox.x - nextBox.x), Math.abs(bodyBox.width - nextBox.width));
      }).toBeLessThanOrEqual(2);
      await expect.poll(async () => (await recommendations.boundingBox())?.width)
        .toBe(Math.min(1152, width - (width >= 640 ? 48 : 32)));
      const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();

        return { x, y, width, height };
      }));
      for (const [index, box] of boxes.entries()) {
        expect(Math.abs(box.width - boxes[0].width)).toBeLessThanOrEqual(2);
        if (index < columns) {
          expect(Math.abs(box.y - boxes[0].y)).toBeLessThanOrEqual(2);
          expect(Math.abs(box.height - boxes[0].height)).toBeLessThanOrEqual(2);
        } else {
          expect(box.y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height + 23);
        }
        if (index > 0 && index < columns) {
          expect(box.x).toBeGreaterThan(boxes[index - 1].x + boxes[index - 1].width);
        }
      }
      expect(await recommendations.evaluate((element) => {
        const reactions = document.querySelector('[data-article-body] [aria-label="Reactions"]');

        return Boolean(reactions && reactions.getBoundingClientRect().bottom <= element.getBoundingClientRect().top);
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await recommendations.scrollIntoViewIfNeeded();
      await recommendations.screenshot({ path: `.tmp/article-next-read-layout/next-reads-${theme}-${width}.png` });
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
      expect(responseErrors).toEqual([]);
    });
  }
}

test('recommendation cards resolve with keyboard and pointer navigation', async ({ page }) => {
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
  const row = page.getByRole('region', { name: 'What to read next', exact: true }).locator('a[data-post-opened-placement="title"]').nth(1);
  await row.click();
  await expect(page).toHaveURL(/\/blog\/fixture-post-8$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 8');
});

test('recency fallback resolves the third recommendation', async ({ page }) => {
  await page.goto(articlePath);
  await expect(page.locator('[data-article-body] [aria-label="Reactions"]')).toBeAttached();
  await page.getByRole('region', { name: 'What to read next', exact: true }).locator('a[data-post-opened-placement="title"]').nth(2).click();

  await expect(page).toHaveURL(/\/blog\/fixture-post-10$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 10');
});

test('desktop contents stay sticky while reading and scroll away above next reads', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto('/blog/fixture-post-3');
  await expect(page.locator('[data-article-body] [aria-label="Reactions"]')).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  const sidebar = page.locator('[data-article-toc]');
  const recommendations = page.getByRole('region', { name: 'What to read next', exact: true });
  const sidebarStart = await sidebar.evaluate((element) => element.getBoundingClientRect().top + scrollY);

  for (const offset of [200, 400]) {
    await page.evaluate((top) => scrollTo(0, top), sidebarStart + offset);
    await expect.poll(async () => (await sidebar.boundingBox())?.y).toBe(48);
  }

  const nextStart = await recommendations.evaluate((element) => element.getBoundingClientRect().top + scrollY);
  await page.evaluate((top) => scrollTo(0, top), nextStart - 80);
  await expect.poll(async () => (await sidebar.boundingBox())?.y ?? 48).toBeLessThan(48);
  expect(await sidebar.evaluate((element) => {
    const next = document.getElementById('related-posts-heading')?.closest('section');

    return Boolean(next && element.getBoundingClientRect().bottom <= next.getBoundingClientRect().top);
  })).toBe(true);
  await expect(recommendations.getByRole('heading', { level: 2 })).toBeInViewport();
  await page.screenshot({ path: '.tmp/article-next-read-layout/sidebar-boundary.png' });
});

test('headingless articles retain a full-width recommendation section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/blog/fixture-post-4');
  const recommendations = page.getByRole('region', { name: 'What to read next', exact: true });

  await expect(page.locator('[data-article-toc]')).toHaveCount(0);
  await expect.poll(async () => (await recommendations.boundingBox())?.width).toBe(1152);
  await expect(recommendations.getByRole('listitem')).toHaveCount(3);
});

test('the fourth suggestion is available only in the two-column layout and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 960 });
  await page.goto(articlePath);
  const fourth = page.getByRole('region', { name: 'What to read next', exact: true }).locator('li').nth(3).locator('a[data-post-opened-placement="title"]');

  await expect(fourth).toBeVisible();
  await expect(fourth).toHaveAttribute('href', '/blog/fixture-post-9');
  await page.setViewportSize({ width: 1024, height: 960 });
  await expect(fourth).toBeHidden();
  await page.setViewportSize({ width: 390, height: 960 });
  await expect(fourth).toBeHidden();
  await page.setViewportSize({ width: 768, height: 960 });
  await fourth.click();
  await expect(page).toHaveURL(/\/blog\/fixture-post-9$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 9');
});

for (const entry of ['cover', 'cta'] as const) {
  test(`recommendation ${entry} link opens its article`, async ({ page }) => {
    await page.goto(articlePath);
    const card = page.getByRole('region', { name: 'What to read next', exact: true }).getByRole('article').first();
    const link = card.getByRole('link', { name: entry === 'cover' ? /^Open article:/ : /^Read article:/ });

    await expect(link).toHaveAttribute('href', '/blog/fixture-post-7');
    if (entry === 'cover') {
      await link.locator('img').click();
    } else {
      await link.focus();
      await expect(link).toBeFocused();
      await page.keyboard.press('Enter');
    }
    await expect(page).toHaveURL(/\/blog\/fixture-post-7$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture post 7');
  });
}
