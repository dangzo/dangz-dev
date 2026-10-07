import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Payload = Readonly<{
  url: string;
  website: string;
  timestamp: number;
  name?: string;
  data?: Readonly<Record<string, unknown>>;
}>;

type Source = 'home' | 'blog' | 'topic';
type Placement = 'title' | 'cta' | 'reaction_summary';

const scriptUrl = 'https://cloud.umami.is/script.js';
const website = '00000000-0000-0000-0000-000000000186';
const article = '/blog/stable-visual-regression-tests';
const sources = [
  { route: '/', source: 'home', postId: 'post-1', placements: ['title', 'cta'] },
  { route: '/blog', source: 'blog', postId: 'post-1', placements: ['title', 'cta', 'reaction_summary'] },
  { route: '/blog/topics/architecture', source: 'topic', postId: 'post-1', placements: ['title', 'cta', 'reaction_summary'] },
  { route: '/blog/page/2', source: 'blog', postId: 'post-9', placements: ['title', 'cta'] },
  { route: '/blog/topics/architecture/page/2', source: 'topic', postId: 'post-9', placements: ['title', 'cta'] },
] as const;

function discoveryLink(page: Page, source: Source, placement: Placement) {
  return page.locator(`a[data-post-opened-source="${source}"][data-post-opened-placement="${placement}"]`).first();
}

function routeOf(payload: Payload) {
  const url = new URL(payload.url, 'http://fixture.local');

  return `${url.pathname}${url.search}`;
}

async function markDocument(page: Page) {
  await page.evaluate(() => { document.documentElement.dataset.discoveryDocument = 'original'; });
}

async function expectOriginalDocument(page: Page) {
  expect(await page.evaluate(() => document.documentElement.dataset.discoveryDocument)).toBe('original');
}

test.describe('Article discovery with the application integration and intercepted real tracker', () => {
  let payloads: Payload[];
  let releaseTracker: () => void;
  let scriptRequests: number;

  const opened = () => payloads.filter(({ name }) => name === 'post_opened');
  const pageviews = () => payloads.filter(({ name }) => !name);

  test.beforeEach(async ({ context }) => {
    payloads = [];
    scriptRequests = 0;
    const tracker = await readFile(path.join(process.cwd(), 'src/test-support/e2e/umami/tracker.txt'));
    const gate = new Promise<void>((resolve) => { releaseTracker = resolve; });

    await context.route(scriptUrl, async (route) => {
      scriptRequests += 1;
      await gate;
      await route.fulfill({ contentType: 'application/javascript', body: tracker });
    });
    await context.route('https://gateway.umami.is/api/send', async (route) => {
      const body = route.request().postDataJSON() as Readonly<{ type: string; payload: Payload }>;
      if (body.type === 'event') {
        payloads.push(body.payload);
      }
      await route.fulfill({ json: {} });
    });
    await context.route('**/api/reactions*', async (route) => {
      if (route.request().method() === 'POST') {
        throw new Error('Discovery tests must not submit reactions');
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

  for (const { route, source, postId, placements } of sources) {
    for (const placement of placements) {
      test(`${route} ${placement} sends one discovery event and preserves client navigation`, async ({ page }) => {
        releaseTracker();
        await page.goto(route);
        await expect.poll(() => pageviews().length).toBe(1);
        await markDocument(page);
        const link = discoveryLink(page, source, placement);
        await expect(link).toHaveAttribute('data-post-opened-post-id', postId);
        await expect(link).not.toHaveAttribute('data-umami-event');
        const destination = await link.getAttribute('href');
        expect(destination).toBeTruthy();

        // Exercise nested event targets where the rendered control contains them.
        if (placement === 'cta') {
          await link.locator('span').click();
        } else if (placement === 'reaction_summary') {
          await link.locator('span').last().click();
        } else if (source !== 'home') {
          await link.getByRole('heading').click();
        } else {
          await link.click();
        }

        await expect(page).toHaveURL(new RegExp(`${destination}$`));
        await expectOriginalDocument(page);
        await expect.poll(() => opened().length).toBe(1);
        await expect.poll(() => pageviews().map(routeOf)).toEqual([route, destination]);
        expect(opened()[0].data).toEqual({ post_id: postId, source, placement });
        expect(opened()[0].url).toBe(route);
        await page.waitForTimeout(400);
        expect(opened()).toHaveLength(1);
        expect(pageviews()).toHaveLength(2);
        expect(scriptRequests).toBe(1);
        await expect(page.locator(`script[src="${scriptUrl}"]`)).toHaveCount(1);
      });
    }
  }

  test('Enter activation sends one event while preserving client navigation', async ({ page }) => {
    releaseTracker();
    await page.goto('/blog');
    await expect.poll(() => pageviews().length).toBe(1);
    await markDocument(page);
    await discoveryLink(page, 'blog', 'title').focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(new RegExp(`${article}$`));
    await expectOriginalDocument(page);
    await expect.poll(() => opened().length).toBe(1);
    expect(opened()[0].data).toEqual({ post_id: 'post-1', source: 'blog', placement: 'title' });
    await expect.poll(() => pageviews().map(routeOf)).toEqual(['/blog', article]);
    await page.waitForTimeout(400);
    expect(opened()).toHaveLength(1);
    expect(pageviews()).toHaveLength(2);
    expect(scriptRequests).toBe(1);
  });

  for (const activation of ['Control click', 'middle click'] as const) {
    test(`${activation} opens a new tab and records discovery on the source page`, async ({ page, context }) => {
      releaseTracker();
      await page.goto('/blog/topics/architecture');
      await expect.poll(() => pageviews().length).toBe(1);
      await markDocument(page);
      const popupPromise = context.waitForEvent('page');
      const link = discoveryLink(page, 'topic', 'cta');

      if (activation === 'Control click') {
        await link.click({ modifiers: ['Control'] });
      } else {
        await link.click({ button: 'middle' });
      }

      const popup = await popupPromise;
      await expect(popup).toHaveURL(new RegExp(`${article}$`));
      await expect(page).toHaveURL(/\/blog\/topics\/architecture$/);
      await expectOriginalDocument(page);
      await expect.poll(() => opened().length).toBe(1);
      expect(opened()[0].data).toEqual({ post_id: 'post-1', source: 'topic', placement: 'cta' });
      expect(opened()[0].url).toBe('/blog/topics/architecture');
      await expect.poll(() => pageviews().map(routeOf)).toEqual(['/blog/topics/architecture', article]);
      await page.waitForTimeout(400);
      expect(opened()).toHaveLength(1);
      expect(pageviews()).toHaveLength(2);
      expect(scriptRequests).toBe(2);
      await popup.close();
    });
  }

  test('discovery captured before readiness flushes once with its original source and timestamp', async ({ page }) => {
    await page.goto('/blog');
    await expect.poll(() => scriptRequests).toBe(1);
    await markDocument(page);
    const beforeActivation = Math.floor(Date.now() / 1000);
    await discoveryLink(page, 'blog', 'title').getByRole('heading').click();
    const afterActivation = Math.floor(Date.now() / 1000);
    await expect(page).toHaveURL(new RegExp(`${article}$`));
    await expectOriginalDocument(page);
    expect(payloads).toEqual([]);

    releaseTracker();
    await expect.poll(() => opened().length).toBe(1);
    await expect.poll(() => pageviews().map(routeOf)).toEqual(['/blog', article]);
    expect(opened()[0].url).toBe('/blog');
    expect(opened()[0].data).toEqual({ post_id: 'post-1', source: 'blog', placement: 'title' });
    expect(opened()[0].timestamp).toBeGreaterThanOrEqual(beforeActivation);
    expect(opened()[0].timestamp).toBeLessThanOrEqual(afterActivation);
    await page.waitForTimeout(400);
    expect(opened()).toHaveLength(1);
    expect(pageviews()).toHaveLength(2);
    expect(scriptRequests).toBe(1);
  });

  test('topic and pagination navigation produce destination pageviews without discovery', async ({ page }) => {
    releaseTracker();
    await page.goto('/blog');
    await expect.poll(() => pageviews().length).toBe(1);
    await markDocument(page);
    const topics = page.getByRole('navigation', { name: 'Topics', exact: true });
    const topic = topics.getByRole('link', { name: /^Architecture \(10\)$/i });
    await expect(topic).not.toHaveAttribute('data-post-opened-post-id');
    await topic.click();
    await expect(page).toHaveURL(/\/blog\/topics\/architecture$/);
    await expect.poll(() => pageviews().length).toBe(2);
    const next = page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Next' });
    await expect(next).not.toHaveAttribute('data-post-opened-post-id');
    await next.click();
    await expect(page).toHaveURL(/\/blog\/topics\/architecture\/page\/2$/);
    await expect.poll(() => pageviews().map(routeOf)).toEqual(['/blog', '/blog/topics/architecture', '/blog/topics/architecture/page/2']);
    await expectOriginalDocument(page);
    await page.waitForTimeout(400);
    expect(opened()).toEqual([]);
    expect(pageviews()).toHaveLength(3);
    expect(scriptRequests).toBe(1);
  });

  test('search selection sends its search event without a discovery event', async ({ page }) => {
    releaseTracker();
    await page.goto('/blog');
    await expect.poll(() => pageviews().length).toBe(1);
    await markDocument(page);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search posts' }).fill('stable visual');
    const result = page.getByRole('dialog').getByRole('link', { name: /Building stable visual regression tests/ });
    await expect(result).toBeVisible();
    await expect(result).not.toHaveAttribute('data-post-opened-post-id');
    await result.click();

    await expect(page).toHaveURL(new RegExp(`${article}$`));
    await expectOriginalDocument(page);
    await expect.poll(() => payloads.filter(({ name }) => name === 'search_result_selected').length).toBe(1);
    const selected = payloads.find(({ name }) => name === 'search_result_selected');
    expect(selected?.data).toEqual({ post_id: 'post-1', result_position: 1 });
    expect(selected?.url).toBe('/blog');
    await expect.poll(() => pageviews().map(routeOf)).toEqual(['/blog', article]);
    await page.waitForTimeout(400);
    expect(opened()).toEqual([]);
    expect(pageviews()).toHaveLength(2);
    expect(scriptRequests).toBe(1);
  });

  for (const failure of ['blocked tracker', 'tracker opt-out'] as const) {
    test(`${failure} preserves article navigation without sending analytics`, async ({ page, context }) => {
      if (failure === 'blocked tracker') {
        await page.route(scriptUrl, (route) => route.abort('blockedbyclient'));
      } else {
        await context.addInitScript(() => localStorage.setItem('umami.disabled', '1'));
      }
      releaseTracker();
      await page.goto('/blog');
      await markDocument(page);
      await discoveryLink(page, 'blog', 'cta').click();
      await expect(page).toHaveURL(new RegExp(`${article}$`));
      await expectOriginalDocument(page);
      await page.waitForTimeout(400);

      expect(payloads).toEqual([]);
    });
  }
});
