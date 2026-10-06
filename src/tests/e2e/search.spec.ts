import { expect, test, type Page } from '@playwright/test';

type Payload = Readonly<Record<string, unknown>>;
type AnalyticsWindow = Window & {
  searchEvents: Payload[];
  umami: { track: (payload: (defaults: Payload) => Payload) => Promise<void> };
};

const results = [
  { id: 'post-1', slug: 'stable-visual-regression-tests', title: 'First result', excerpt: '', primaryTopic: null },
  { id: 'post-2', slug: 'fixture-post-2', title: 'Second result', excerpt: '', primaryTopic: null },
];

async function events(page: Page) {
  return page.evaluate(() => (window as unknown as AnalyticsWindow).searchEvents);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow.searchEvents = [];
    analyticsWindow.umami = {
      track: async (payload) => {
        analyticsWindow.searchEvents.push(payload({
          website: 'fixture', hostname: location.hostname, language: 'en', screen: '100x100',
          url: location.href, referrer: 'https://example.com/?q=private-search-text', id: 'private-id',
        }));
      },
    };
  });
  await page.route('**/api/search?*', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q');
    if (query === 'failed') {
      await route.fulfill({ status: 500, json: { error: 'Unavailable' } });
      return;
    }
    await route.fulfill({ json: { results: query === 'empty' ? [] : results } });
  });
  await page.goto('/?q=private-search-text');
});

test('tracks button and shortcut transitions, successful counts, and private payloads', async ({ page }) => {
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Search posts' });
  await input.fill('  private-search-text  ');
  await expect(page.getByRole('link', { name: 'First result' })).toBeVisible();
  await input.fill('empty');
  await expect.poll(async () => (await events(page)).filter((event) => event.name === 'search_completed').length).toBe(2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Meta+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toHaveAttribute('aria-expanded', 'true');
  const payloads = await events(page);
  expect(payloads.map(({ name, data }) => ({ name, data }))).toEqual([
    { name: 'search_opened', data: { method: 'button' } },
    { name: 'search_completed', data: { query_length: 19, result_count: 2 } },
    { name: 'search_completed', data: { query_length: 5, result_count: 0 } },
    { name: 'search_opened', data: { method: 'shortcut' } },
    { name: 'search_opened', data: { method: 'shortcut' } },
  ]);
  expect(JSON.stringify(payloads)).not.toContain('private-search-text');
  expect(JSON.stringify(payloads)).not.toContain('private-id');
});

for (const selection of ['mouse', 'arrows', 'enter', 'focused link', 'modified click'] as const) {
  test(`tracks exactly one ${selection} selection and preserves navigation`, async ({ page }) => {
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search posts' }).fill('find');
    const second = page.getByRole('link', { name: 'Second result' });
    await expect(second).toBeVisible();
    if (selection === 'mouse') {
      await second.locator('p').click();
    } else if (selection === 'arrows') {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    } else if (selection === 'focused link') {
      await page.getByRole('link', { name: 'First result' }).focus();
      await page.keyboard.press('Enter');
    } else if (selection === 'modified click') {
      const popupPromise = page.context().waitForEvent('page');
      await second.click({ modifiers: ['Control'] });
      const popup = await popupPromise;
      await expect(popup).toHaveURL(/\/blog\/fixture-post-2$/);
      await popup.close();
      await expect(page).toHaveURL(/\/\?q=private-search-text$/);
    } else {
      await page.keyboard.press('Enter');
    }
    const firstSelected = selection === 'enter' || selection === 'focused link';
    if (selection !== 'modified click') {
      await expect(page).toHaveURL(firstSelected ? /\/blog\/stable-visual-regression-tests$/ : /\/blog\/fixture-post-2$/);
    }
    await expect(page.getByRole('dialog')).not.toBeVisible();
    const selected = (await events(page)).filter((event) => event.name === 'search_result_selected');
    expect(selected).toHaveLength(1);
    expect(selected[0].data).toEqual({ post_id: firstSelected ? 'post-1' : 'post-2', result_position: firstSelected ? 1 : 2 });
    expect(selected[0].url).toBe('/');
  });
}

test('failed and aborted requests do not produce completions', async ({ page }) => {
  await page.route('**/api/search?q=pending', async (route) => {
    await route.abort();
  });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Search posts' });
  for (const query of ['failed', 'pending']) {
    const response = query === 'failed'
      ? page.waitForResponse((response) => response.url().includes(`/api/search?q=${query}`))
      : page.waitForEvent('requestfailed', {
        predicate: (request) => request.url().includes(`/api/search?q=${query}`),
      });
    await input.fill(query);
    await response;
    await expect(page.getByText('Searching...', { exact: true })).not.toBeVisible();
  }
  expect((await events(page)).filter((event) => event.name === 'search_completed')).toEqual([]);
});
