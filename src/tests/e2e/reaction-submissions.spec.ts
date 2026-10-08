import { expect, test, type Page, type Route } from '@playwright/test';
import { UMAMI_READY_EVENT, type UmamiPayload, type UmamiWindow } from '@/utils/umami';

type AnalyticsWindow = UmamiWindow & { reactionEvents: UmamiPayload[] };
const article = '/blog/stable-visual-regression-tests';

async function installTracker(page: Page) {
  await page.evaluate((readyEvent) => {
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow.reactionEvents ??= [];
    analyticsWindow.umami = {
      track: async (event: string | ((defaults: UmamiPayload) => UmamiPayload)) => {
        if (typeof event === 'function') {
          analyticsWindow.reactionEvents.push(event({ website: 'fixture', hostname: location.hostname, id: 'private-id' }));
        }
      },
    };
    window.dispatchEvent(new Event(readyEvent));
  }, UMAMI_READY_EVENT);
}

async function events(page: Page) {
  return page.evaluate(() => (window as unknown as AnalyticsWindow).reactionEvents ?? []);
}

function control(page: Page, placement: 'compact' | 'bottom') {
  const region = placement === 'bottom'
    ? page.getByLabel('Article content').getByLabel('Reactions', { exact: true })
    : page.getByLabel('Reactions', { exact: true }).first();
  return region.getByRole('button', { name: 'Love', exact: true });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/reactions*', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { currentCount: number };
      await route.fulfill({ json: { count: body.currentCount + 1 } });
      return;
    }
    await route.fulfill({ json: { reactions: [{ _id: 'love', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 }] } });
  });
  await page.goto(article);
  // The two reaction components load independently; first() must resolve to the header.
  await expect(page.getByLabel('Reactions', { exact: true })).toHaveCount(2);
  await expect(control(page, 'compact')).toBeVisible();
  await expect(control(page, 'bottom')).toBeVisible();
});

for (const placement of ['compact', 'bottom'] as const) {
  test(`${placement} reports mouse, Enter, Space and nested emoji submissions exactly once`, async ({ page }) => {
    await installTracker(page);
    const button = control(page, placement);
    await expect(button).not.toHaveAttribute('data-umami-event');
    for (const activation of ['mouse', 'Enter', 'Space', 'emoji']) {
      if (activation === 'mouse') {
        await button.click();
      } else if (activation === 'emoji') {
        await button.getByRole('img', { name: 'Love' }).click();
      } else {
        await button.focus();
        await button.press(activation);
      }
      await expect(button).toHaveAttribute('aria-busy', 'false');
    }
    await expect.poll(async () => (await events(page)).length).toBe(8);
    expect((await events(page)).map(({ name, data }) => ({ name, data }))).toEqual(
      Array.from({ length: 4 }).flatMap(() => [
        { name: 'reaction_attempted', data: { post_id: 'post-1', reaction_id: 'love', placement } },
        { name: 'reaction_submission_succeeded', data: { post_id: 'post-1', reaction_id: 'love', placement } },
      ]),
    );
  });
}

test('ignores pending clicks while preserving independent cross-placement submissions', async ({ page }) => {
  const held: Route[] = [];
  await page.route('**/api/reactions', async (route) => {
    held.push(route);
  });
  await installTracker(page);
  const compact = control(page, 'compact');
  const bottom = control(page, 'bottom');
  await compact.click();
  await compact.click();
  await bottom.click();
  await bottom.press('Enter');
  await expect.poll(() => held.length).toBe(2);
  expect((await events(page)).map(({ data }) => data)).toEqual([
    { post_id: 'post-1', reaction_id: 'love', placement: 'compact' },
    { post_id: 'post-1', reaction_id: 'love', placement: 'bottom' },
  ]);
  await held[1].fulfill({ json: { count: 4 } });
  await expect(bottom).toHaveAttribute('aria-busy', 'false');
  await held[0].fulfill({ json: { count: 3 } });
  await expect(compact).toHaveAttribute('aria-busy', 'false');
  await expect.poll(async () => (await events(page)).length).toBe(4);
  await expect(page.getByLabel('Article content').getByLabel('Reactions', { exact: true }).getByText('4', { exact: true })).toBeVisible();
  expect((await events(page)).slice(2).map(({ data }) => data)).toEqual([
    { post_id: 'post-1', reaction_id: 'love', placement: 'bottom' },
    { post_id: 'post-1', reaction_id: 'love', placement: 'compact' },
  ]);
});

for (const failure of ['http', 'network', 'invalid', 'json'] as const) {
  test(`${failure} failure emits no success and rolls back`, async ({ page }) => {
    await installTracker(page);
    await page.route('**/api/reactions', async (route) => {
      if (failure === 'network') {
        await route.abort();
      } else if (failure === 'http') {
        await route.fulfill({ status: 500, json: { error: 'Private failure' } });
      } else if (failure === 'json') {
        await route.fulfill({ contentType: 'application/json', body: 'invalid json' });
      } else {
        await route.fulfill({ json: { count: 'invalid' } });
      }
    });
    await control(page, 'bottom').click();
    await expect(control(page, 'bottom')).toHaveAttribute('aria-busy', 'false');
    await expect.poll(async () => (await events(page)).length).toBe(2);
    expect((await events(page)).map(({ name }) => name)).toEqual(['reaction_attempted', 'reaction_submission_failed']);
    await expect(page.getByLabel('Article content').getByLabel('Reactions', { exact: true }).getByText('2', { exact: true })).toBeVisible();
    expect(JSON.stringify(await events(page))).not.toContain('Private');
  });
}

test('buffers before readiness and retains source after client navigation', async ({ page }) => {
  await control(page, 'compact').click();
  await expect(control(page, 'compact')).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('link', { name: /back to all posts/i }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await installTracker(page);
  await installTracker(page);
  await expect.poll(async () => (await events(page)).length).toBe(2);
  expect((await events(page)).map(({ name, url }) => ({ name, url }))).toEqual([
    { name: 'reaction_attempted', url: article },
    { name: 'reaction_submission_succeeded', url: article },
  ]);
});

test('submits normally without analytics and without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await control(page, 'bottom').click();
  await expect(control(page, 'bottom')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByLabel('Article content').getByLabel('Reactions', { exact: true }).getByText('3', { exact: true })).toBeVisible();
  expect(await events(page)).toEqual([]);
  expect(errors).toEqual([]);
});
