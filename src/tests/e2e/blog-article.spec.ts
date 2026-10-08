import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectCentered(locator: Locator, viewportWidth: number) {
  await expect.poll(async () => {
    const box = await locator.boundingBox();

    if (!box) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.abs(box.x + box.width / 2 - viewportWidth / 2);
  }).toBeLessThanOrEqual(2);
}

async function stubReactions(page: Page) {
  await page.route('**/api/reactions?*', async (route) => {
    await route.fulfill({
      json: {
        reactions: [
          { _id: 'reaction-useful', name: 'Useful', emoji: '💡', count: 3 },
          { _id: 'reaction-love', name: 'Love', emoji: '❤️', count: 1 },
        ],
      },
    });
  });
}

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
    await expect(headingArea.locator('a[href^="/blog/topics/"]').first()).toBeVisible();
  });

  test('table of contents section provides anchor navigation', async ({ page }) => {
    const tocSection = page.locator('aside').filter({ has: page.getByRole('navigation', { name: 'Table of contents' }) }).first();

    await expect(tocSection.getByRole('heading', { name: 'Contents', exact: true })).toBeVisible();
    await expect(tocSection.locator('a[href^="#"]').first()).toBeVisible();

    const tocLinks = tocSection.locator('a[href^="#"]');
    await expect.poll(() => tocLinks.count()).toBeGreaterThan(0);

    const backToBlogLink = tocSection.getByRole('link', { name: /back to all posts/i });
    await expect(backToBlogLink).toBeVisible();
    await expect(backToBlogLink).toHaveAttribute('href', '/blog');
  });

  test('article image is rendered', async ({ page }) => {
    const articleImage = page.locator('main article img').first();

    await expect(articleImage).toBeVisible();
  });

  test('mobile ToC preserves anchor navigation and rich content stays within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.getByRole('button', { name: 'Show Table of Contents' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    const anchor = page.locator('aside a[href^="#"]').first();
    const href = await anchor.getAttribute('href');

    if (!href) {
      throw new Error('Expected table of contents link to have an href');
    }

    await anchor.click();

    await expect(page).toHaveURL(url => url.href.endsWith(href));
    await expect(page.getByRole('button', { name: 'Show Table of Contents' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('pre').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('code blocks and rich content are rendered', async ({ page }) => {
    await expect(page.getByRole('button', { name: /copy code/i }).first()).toBeVisible();
    await expect(page.locator('main article pre').first()).toBeVisible();
    await expect(page.locator('main article h2').first()).toBeVisible();
    await expect(page.locator('main article p').first()).toBeVisible();

    const paragraphCount = page.locator('main article p');
    await expect.poll(() => paragraphCount.count()).toBeGreaterThan(3);
  });

  test('section headings provide copy-link controls', async ({ page }) => {
    const sectionHeading = page.getByRole('region', { name: 'Article content', exact: true }).locator('h2').first();

    await expect(sectionHeading).toBeVisible();
    await sectionHeading.hover();

    const copyLinkButton = sectionHeading.getByRole('button', { name: 'Copy link to this section' });
    await expect(copyLinkButton).toBeVisible();
    await expect(sectionHeading).toHaveAttribute('id', /.+/);
  });
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Article layout in ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.addInitScript((initialTheme) => localStorage.setItem('theme', initialTheme), theme);
      await stubReactions(page);
    });

    for (const width of [390, 768, 1024, 1152, 1279, 1280, 1440]) {
      test(`keeps article and reactions centered at ${width}px, including headingless posts`, async ({ page }) => {
        await page.setViewportSize({ width, height: 960 });
        await page.goto('/blog/stable-visual-regression-tests');
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('html')).toHaveAttribute('class', theme === 'dark' ? /dark/ : /light/);

        const content = page.getByRole('region', { name: 'Article content', exact: true });
        const body = content.locator('article');
        const reactions = content.locator('[aria-label="Reactions"]');

        await expect(reactions).toBeAttached();
        await expectCentered(page.getByRole('heading', { level: 1 }), width);
        await expect.poll(async () => (await page.getByRole('heading', { level: 1 }).boundingBox())?.width)
          .toBe(Math.min(1152, width - (width >= 640 ? 48 : 32)));
        await expectCentered(body, width);
        await expectCentered(reactions, width);
        await expectCentered(page.locator('footer'), width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

        const toggle = page.getByRole('button', { name: 'Show Table of Contents' });
        const navigation = page.getByRole('navigation', { name: 'Table of contents' });

        if (width < 1280) {
          await expect(toggle).toBeVisible();
          await expect(toggle).toHaveAttribute('aria-expanded', 'false');
          await expect(navigation).toBeHidden();
          await toggle.click();
          await expect(page.getByRole('button', { name: 'Hide Table of Contents' })).toHaveAttribute('aria-expanded', 'true');
          await expect(navigation).toBeVisible();
        } else {
          await expect(toggle).toBeHidden();
          await expect(navigation).toBeVisible();
        }

        const readingWidth = (await body.boundingBox())?.width;
        expect(readingWidth).toBeGreaterThan(0);

        await page.goto('/blog/fixture-post-4');
        const headinglessBody = page.getByRole('region', { name: 'Article content', exact: true }).locator('article');

        await expect(headinglessBody.locator('p').first()).toBeVisible();
        await expect(page.getByRole('navigation', { name: 'Table of contents' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: /(?:Show|Hide) Table of Contents/ })).toHaveCount(0);
        await expectCentered(page.getByRole('heading', { level: 1 }), width);
        await expect.poll(async () => (await page.getByRole('heading', { level: 1 }).boundingBox())?.width)
          .toBe(Math.min(1152, width - (width >= 640 ? 48 : 32)));
        await expectCentered(headinglessBody, width);
        await expect(headinglessBody.locator('[aria-label="Reactions"]')).toBeAttached();
        await expectCentered(headinglessBody.locator('[aria-label="Reactions"]'), width);
        if (width < 1280) {
          await expect.poll(async () => (await headinglessBody.boundingBox())?.width).toBe(readingWidth);
        } else {
          await expect.poll(async () => (await headinglessBody.boundingBox())?.width).toBeGreaterThanOrEqual(readingWidth ?? 0);
          await expect.poll(async () => (await headinglessBody.boundingBox())?.width).toBeLessThanOrEqual(770);
        }
      });
    }

    for (const width of [768, 1440]) {
      test(`lengthy contents keep the last keyboard-focused entry visible at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 600 });
        await page.goto('/blog/fixture-post-3');

        if (width < 1280) {
          await page.getByRole('button', { name: 'Show Table of Contents' }).click();
        }

        const navigation = page.getByRole('navigation', { name: 'Table of contents' });
        const links = navigation.getByRole('link');

        await expect(links).toHaveCount(30);
        await expect(page.getByText('Scroll for more sections ↓', { exact: true })).toBeVisible();
        await links.first().focus();

        for (let index = 1; index < 30; index += 1) {
          await page.keyboard.press('Tab');
        }

        await expect(links.last()).toBeFocused();
        await expect.poll(async () => links.last().evaluate((element) => {
          const box = element.getBoundingClientRect();
          let ancestor = element.parentElement;

          while (ancestor && !['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowY)) {
            ancestor = ancestor.parentElement;
          }

          if (!ancestor) {
            return false;
          }

          const scrollBox = ancestor.getBoundingClientRect();

          return ancestor.scrollHeight > ancestor.clientHeight
            && box.top >= Math.max(0, scrollBox.top) - 2
            && box.bottom <= Math.min(innerHeight, scrollBox.bottom) + 2;
        })).toBe(true);
        await expect(page.getByText('More sections above ↑', { exact: true })).toBeVisible();

        const href = await links.last().getAttribute('href');
        expect(href).toBeTruthy();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(url => url.hash === href);
        await expect(page.getByRole('region', { name: 'Article content', exact: true }).locator('h2, h3').last()).toBeFocused();

        if (width < 1280) {
          await expect(page.getByRole('button', { name: 'Show Table of Contents' })).toHaveAttribute('aria-expanded', 'false');
        }
      });
    }

    test('Escape closes tablet contents and returns keyboard focus to its toggle', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 960 });
      await page.goto('/blog/stable-visual-regression-tests');
      const toggle = page.getByRole('button', { name: 'Show Table of Contents' });

      await toggle.focus();
      await page.keyboard.press('Enter');

      const navigation = page.getByRole('navigation', { name: 'Table of contents' });
      await expect(navigation).toBeVisible();
      await navigation.getByRole('link').first().focus();
      await page.keyboard.press('Escape');

      await expect(navigation).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
    });

    test('desktop contents reveal the active section without shifting document scroll', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 600 });
      await page.goto('/blog/fixture-post-3');

      const lastEntry = page.getByRole('navigation', { name: 'Table of contents' }).getByRole('link').last();
      const content = page.getByRole('region', { name: 'Article content', exact: true });
      const finalHeading = content.locator('h2, h3').last();

      await expect(content.locator('[aria-label="Reactions"]')).toBeAttached();
      await expect(content.locator('[aria-label="Reactions loading"]')).toHaveCount(0);
      await content.locator('img').first().evaluate(async (element) => {
        await (element as HTMLImageElement).decode();
      });
      await page.evaluate(() => document.fonts.ready);

      await expect(page.getByText('Scroll for more sections ↓', { exact: true })).toBeVisible();
      const documentPosition = await finalHeading.evaluate(async (heading) => {
        window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - 80, behavior: 'instant' });
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

        return window.scrollY;
      });

      await expect(lastEntry).toHaveAttribute('aria-current', 'location');
      await expect.poll(async () => lastEntry.evaluate((element) => {
        const box = element.getBoundingClientRect();
        let ancestor = element.parentElement;

        while (ancestor && !['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowY)) {
          ancestor = ancestor.parentElement;
        }

        if (!ancestor) {
          return false;
        }

        const scrollBox = ancestor.getBoundingClientRect();

        return box.top >= scrollBox.top - 2 && box.bottom <= scrollBox.bottom + 2;
      })).toBe(true);
      expect(await page.evaluate(() => window.scrollY)).toBe(documentPosition);
    });
  });
}
