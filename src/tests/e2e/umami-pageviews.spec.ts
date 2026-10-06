import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Payload = Readonly<{
  url: string;
  referrer: string;
  website: string;
  timestamp: number;
  name?: string;
  data?: Readonly<Record<string, unknown>>;
}>;

const article = '/blog/stable-visual-regression-tests';
const scriptUrl = 'https://cloud.umami.is/script.js';
const website = '00000000-0000-0000-0000-000000000186';

function routeOf(payload: Payload) {
  const url = new URL(payload.url);

  return `${url.pathname}${url.search}${url.hash}`;
}

async function visitBlogAndReturn(page: Page) {
  await page.getByRole('link', { name: /back to all posts/i }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await page.locator(`section article a[href="${article}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`${article}$`));
}

test.describe('Pageviews with the application integration and intercepted real tracker', () => {
  let payloads: Payload[];
  let releaseTracker: () => void;
  let trackerRequested: boolean;
  let scriptRequests: number;
  let pageviewArrivals: number[];

  const pageviews = () => payloads.filter((payload) => !payload.name);

  test.beforeEach(async ({ context }) => {
    payloads = [];
    trackerRequested = false;
    scriptRequests = 0;
    pageviewArrivals = [];
    const tracker = await readFile(path.join(process.cwd(), 'src/test-support/e2e/umami/tracker.txt'));
    const gate = new Promise<void>((resolve) => { releaseTracker = resolve; });
    await context.route(scriptUrl, async (route) => {
      trackerRequested = true;
      scriptRequests += 1;
      await gate;
      await route.fulfill({ contentType: 'application/javascript', body: tracker });
    });
    await context.route('https://gateway.umami.is/api/send', async (route) => {
      const body = route.request().postDataJSON() as Readonly<{ type: string; payload: Payload }>;
      if (body.type === 'event') {
        payloads.push(body.payload);
        if (!body.payload.name) {
          pageviewArrivals.push(Date.now());
        }
      }
      await route.fulfill({ json: {} });
    });
    await context.route('**/api/reactions*', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON() as Readonly<{ currentCount: number }>;
        await route.fulfill({ json: { count: body.currentCount + 1 } });
        return;
      }
      await route.fulfill({ json: {
        reactions: [{ _id: 'reaction-love', name: 'Love', emoji: '❤️', count: 3 }],
      } });
    });
  });

  test.afterEach(() => {
    releaseTracker();
    expect(payloads.every((payload) => payload.website === website)).toBe(true);
  });

  test('counts initial loads and reloads once, retaining external and reload referrers', async ({ page, baseURL }) => {
    await page.route('http://example.com/source', (route) => route.fulfill({
      contentType: 'text/html', body: `<a href="${baseURL}${article}">Article</a>`,
    }));
    await page.goto('http://example.com/source');
    await page.getByRole('link', { name: 'Article', exact: true }).click();
    releaseTracker();
    await expect.poll(() => pageviews().length).toBe(1);
    expect(pageviews()[0]).toMatchObject({ referrer: 'http://example.com/' });
    expect(routeOf(pageviews()[0])).toBe(article);

    const reloadReferrer = await page.evaluate(() => document.referrer);
    await page.reload();
    await expect.poll(() => pageviews().length).toBe(2);
    expect(pageviews()[1].referrer).toBe(reloadReferrer);
    expect(routeOf(pageviews()[1])).toBe(article);
    await page.waitForTimeout(400);
    expect(pageviews()).toHaveLength(2);
  });

  test('ignores ToC jumps, direct fragments, and hash-only Back/Forward', async ({ page }) => {
    releaseTracker();
    await page.goto(`${article}#a-predictable-content-hierarchy`);
    await expect.poll(() => pageviews().length).toBe(1);
    expect(routeOf(pageviews()[0])).toBe(article);
    const toc = page.getByRole('navigation', { name: 'Table of contents', exact: true });
    await toc.getByRole('link', { name: 'A compact comparison table', exact: true }).click();
    await expect(page).toHaveURL(/#a-compact-comparison-table$/);
    await page.goBack();
    await page.goForward();
    await page.waitForTimeout(400);

    expect(pageviews()).toHaveLength(1);
    expect(scriptRequests).toBe(1);
  });

  test('tracks paced navigation and Back/Forward with the preceding route as referrer', async ({ page }) => {
    releaseTracker();
    await page.goto(article);
    await expect.poll(() => pageviews().length).toBe(1);
    await page.getByRole('link', { name: /back to all posts/i }).click();
    await expect.poll(() => pageviews().length).toBe(2);
    await page.waitForTimeout(1000);
    await page.locator(`section article a[href="${article}"]`).first().click();
    await expect.poll(() => pageviews().length).toBe(3);
    await page.goBack();
    await expect.poll(() => pageviews().length).toBe(4);
    await page.goForward();
    await expect.poll(() => pageviews().length).toBe(5);

    expect(pageviews().map(routeOf)).toEqual([article, '/blog', article, '/blog', article]);
    expect(pageviews().map(({ referrer }) => referrer)).toEqual(['', article, '/blog', article, '/blog']);
    expect(scriptRequests).toBe(1);
  });

  test('counts consecutive client-link round trips without duplicate final article views', async ({ page }) => {
    releaseTracker();
    await page.goto(article);
    await expect.poll(() => pageviews().length).toBe(1);
    await visitBlogAndReturn(page);
    await expect.poll(() => pageviews().length).toBe(3);
    // Dispatch actual link clicks immediately, without locator scrolling/stability delays.
    await page.getByRole('link', { name: /back to all posts/i }).evaluate((link: HTMLAnchorElement) => link.click());
    await page.locator(`section article a[href="${article}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
    await expect.poll(() => pageviews().length).toBe(5);
    await page.waitForTimeout(400);

    expect(pageviews().map(routeOf)).toEqual([article, '/blog', article, '/blog', article]);
    expect(pageviews().map(({ referrer }) => referrer)).toEqual(['', article, '/blog', article, '/blog']);
    expect(scriptRequests).toBe(1);
    await test.info().attach('client-link-pageview-interval', {
      body: JSON.stringify({ intermediateToFinalMs: pageviewArrivals[4] - pageviewArrivals[3] }),
      contentType: 'application/json',
    });
  });

  test('counts rapid committed changes without delayed duplicate final-route views', async ({ page }) => {
    releaseTracker();
    await page.goto(article);
    await expect.poll(() => pageviews().length).toBe(1);
    // Native history changes exercise Next's route hooks without dev compilation/network latency.
    await page.evaluate(() => history.pushState(null, '', '/blog'));
    await expect.poll(() => pageviews().length).toBe(2);
    await page.evaluate((url) => history.pushState(null, '', url), article);
    await expect.poll(() => pageviews().length).toBe(3);
    await page.waitForTimeout(400);

    expect(pageviews().map(routeOf)).toEqual([article, '/blog', article]);
    expect(pageviews().map(({ referrer }) => referrer)).toEqual(['', article, '/blog']);
    expect(pageviewArrivals[2] - pageviewArrivals[1]).toBeLessThan(300);
    expect(scriptRequests).toBe(1);
  });

  test('flushes visits observed before lazy tracker readiness once, with original metadata', async ({ page }) => {
    await page.goto(article);
    await expect.poll(() => trackerRequested).toBe(true);
    await visitBlogAndReturn(page);
    expect(payloads).toEqual([]);
    releaseTracker();
    await expect.poll(() => pageviews().map(routeOf)).toEqual([article, '/blog', article]);
    await page.waitForTimeout(400);

    expect(pageviews().map(routeOf)).toEqual([article, '/blog', article]);
    expect(pageviews().map(({ referrer }) => referrer)).toEqual(['', article, '/blog']);
    expect(scriptRequests).toBe(1);
  });

  test('counts query changes while preserving query strings in URLs and referrers', async ({ page }) => {
    releaseTracker();
    await page.goto(`${article}?source=share%20link#section`);
    await expect.poll(() => pageviews().length).toBe(1);
    await page.evaluate((url) => history.pushState(null, '', url), `${article}?source=home#other`);
    await expect.poll(() => pageviews().length).toBe(2);

    expect(pageviews().map(routeOf)).toEqual([`${article}?source=share%20link`, `${article}?source=home`]);
    expect(pageviews()[1].referrer).toBe(`${article}?source=share%20link`);
  });

  test('preserves reaction clicks, exposure, search and contact events with one tracker', async ({ page }) => {
    releaseTracker();
    await page.goto(article);
    await expect.poll(() => pageviews().length).toBe(1);
    const compact = page.getByLabel('Reactions', { exact: true }).first();
    await compact.getByRole('button', { name: 'Love', exact: true }).click();
    await expect(compact.getByText('4', { exact: true })).toBeVisible();
    const reactions = page.getByLabel('Article content').getByLabel('Reactions', { exact: true });
    await reactions.scrollIntoViewIfNeeded();
    await reactions.getByRole('button', { name: 'Love', exact: true }).click();
    await expect(reactions.getByText('5', { exact: true })).toBeVisible();
    for (const eventName of ['reaction_attempted', 'reaction_submission_succeeded']) {
      await expect.poll(() => payloads
        .filter(({ name }) => name === eventName)
        .map(({ data }) => data?.placement)
        .sort()).toEqual(['bottom', 'compact']);
    }
    await expect.poll(() => payloads.some(({ name }) => name === 'post_bottom_reactions_reached')).toBe(true);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect.poll(() => payloads.some(({ name }) => name === 'search_opened')).toBe(true);
    await page.keyboard.press('Escape');
    await page.locator('a[data-umami-event="contact_clicked"][data-umami-event-placement="footer"][data-umami-event-channel="email"]').click();
    await expect.poll(() => payloads.some(({ name }) => name === 'contact_clicked')).toBe(true);

    expect(pageviews()).toHaveLength(1);
    expect(scriptRequests).toBe(1);
    expect(await page.locator(`script[src="${scriptUrl}"]`).count()).toBe(1);
  });

  test('respects tracker opt-out while reactions remain usable', async ({ page, context }) => {
    await context.addInitScript(() => localStorage.setItem('umami.disabled', '1'));
    releaseTracker();
    await page.goto(article);
    const reactions = page.getByLabel('Article content').getByLabel('Reactions', { exact: true });
    await reactions.scrollIntoViewIfNeeded();
    await reactions.getByRole('button', { name: 'Love', exact: true }).click();
    await expect(reactions.getByText('4', { exact: true })).toBeVisible();
    await visitBlogAndReturn(page);
    await page.waitForTimeout(400);

    expect(payloads).toEqual([]);
  });

  test('leaves reactions and navigation usable when the tracker script is blocked', async ({ page }) => {
    await page.route(scriptUrl, (route) => route.abort('blockedbyclient'));
    await page.goto(article);
    const reactions = page.getByLabel('Article content').getByLabel('Reactions', { exact: true });
    await reactions.scrollIntoViewIfNeeded();
    await reactions.getByRole('button', { name: 'Love', exact: true }).click();
    await expect(reactions.getByText('4', { exact: true })).toBeVisible();
    await visitBlogAndReturn(page);

    expect(payloads).toEqual([]);
  });
});
