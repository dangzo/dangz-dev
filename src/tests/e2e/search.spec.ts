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
  const input = page.getByRole('textbox', { name: 'Search posts and commands' });
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

for (const selection of ['mouse', 'arrows', 'enter', 'focused link', 'modified click', 'middle click'] as const) {
  test(`tracks exactly one ${selection} selection and preserves navigation`, async ({ page }) => {
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search posts and commands' }).fill('private-search-text');
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
    } else if (selection === 'modified click' || selection === 'middle click') {
      const popupPromise = page.context().waitForEvent('page');
      if (selection === 'middle click') {
        await second.locator('p').click({ button: 'middle' });
      } else {
        await second.click({ modifiers: ['Control'] });
      }
      const popup = await popupPromise;
      await expect(popup).toHaveURL(/\/blog\/fixture-post-2$/);
      await popup.close();
      await expect(page).toHaveURL(/\/\?q=private-search-text$/);
    } else {
      await page.keyboard.press('Enter');
    }
    const firstSelected = selection === 'enter' || selection === 'focused link';
    if (selection !== 'modified click' && selection !== 'middle click') {
      await expect(page).toHaveURL(firstSelected ? /\/blog\/stable-visual-regression-tests$/ : /\/blog\/fixture-post-2$/);
    }
    if (selection === 'middle click') {
      await expect(page.getByRole('dialog')).toBeVisible();
    } else {
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
    const selected = (await events(page)).filter((event) => event.name === 'search_result_selected');
    expect(selected).toHaveLength(1);
    expect(selected[0].data).toEqual({ post_id: firstSelected ? 'post-1' : 'post-2', result_position: firstSelected ? 1 : 2 });
    expect(selected[0].url).toBe('/');
    expect(JSON.stringify(await events(page))).not.toContain('private-search-text');
    expect(JSON.stringify(await events(page))).not.toContain('private-id');
  });
}

test('right-click does not track a selection or navigate', async ({ page, context }) => {
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search posts and commands' }).fill('find');
  const second = page.getByRole('link', { name: 'Second result' });
  await expect(second).toBeVisible();
  await second.locator('p').click({ button: 'right' });

  await expect(page).toHaveURL(/\/\?q=private-search-text$/);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(context.pages()).toHaveLength(1);
  expect((await events(page)).filter((event) => event.name === 'search_result_selected')).toEqual([]);
});

test('middle-click still opens a new tab when the tracker is unavailable', async ({ page, context }) => {
  const errors: string[] = [];
  context.on('weberror', (error) => errors.push(error.error().message));
  await context.addInitScript(() => { Reflect.deleteProperty(window, 'umami'); });
  await page.evaluate(() => { Reflect.deleteProperty(window, 'umami'); });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search posts and commands' }).fill('find');
  const second = page.getByRole('link', { name: 'Second result' });
  await expect(second).toBeVisible();
  const popupPromise = context.waitForEvent('page');
  await second.locator('p').click({ button: 'middle' });
  const popup = await popupPromise;

  await expect(popup).toHaveURL(/\/blog\/fixture-post-2$/);
  await expect(page).toHaveURL(/\/\?q=private-search-text$/);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await events(page)).toEqual([]);
  expect(errors).toEqual([]);
  await popup.close();
});

test('failed and aborted requests do not produce completions', async ({ page }) => {
  await page.route('**/api/search?q=pending', async (route) => {
    await route.abort();
  });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Search posts and commands' });
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

test('shows immediate commands, contains focus, and restores the trigger after Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Search', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Search posts and commands' });
  const input = dialog.getByRole('textbox');
  await expect(input).toBeFocused();
  await expect(dialog.getByRole('link', { name: 'Go to Home', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Go to Post list', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Use system theme', exact: true })).toHaveCount(0);
  await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('link', { name: 'Connect on LinkedIn', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('link', { name: 'Download résumé', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(dialog.getByRole('link', { name: 'Connect on LinkedIn', exact: true })).toBeFocused();
  for (let index = 0; index < 14; index += 1) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await input.focus();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('navigation commands filter immediately and navigate with input Enter', async ({ page }) => {
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Search posts and commands' });
  await input.fill('a');
  await expect(page.getByRole('link', { name: 'Go to About', exact: true })).toBeVisible();
  await input.fill('Go to About');
  await expect(page.getByRole('link', { name: 'First result' })).toBeVisible();
  const dialog = page.getByRole('dialog');
  const links = dialog.getByRole('link');
  expect(await links.allTextContents()).toEqual(expect.arrayContaining(['First result', 'Second result']));
  const firstPost = await page.getByRole('link', { name: 'First result' }).elementHandle();
  expect(await dialog.getByRole('link', { name: 'Go to About', exact: true }).evaluate((command, post) =>
    Boolean(post && post.compareDocumentPosition(command) & Node.DOCUMENT_POSITION_FOLLOWING), firstPost)).toBe(true);
  await page.keyboard.press('ArrowUp');
  await expect(dialog.getByRole('link', { name: 'Go to About', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/about$/);
  expect((await events(page)).filter((event) => event.name === 'search_result_selected')).toEqual([]);
});

test('pending searches hide stale posts and require explicit command selection', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/search?q=about', async (route) => {
    await pending;
    await route.fulfill({ json: { results: [] } });
  });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Search posts and commands' });
  await input.fill('find');
  await expect(page.getByRole('link', { name: 'First result' })).toBeVisible();
  await input.fill('about');
  await expect(page.getByRole('link', { name: 'First result' })).not.toBeVisible();
  await expect(page.getByText('Searching...', { exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/\/\?q=private-search-text$/);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/about$/);
  release();
});

test('theme command toggles resolved appearance with mouse and focused Enter', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle light/dark theme', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle light/dark theme', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  expect((await events(page)).filter((event) => event.name === 'search_result_selected')).toEqual([]);
});

for (const row of ['post', 'command'] as const) {
  test(`typing and Backspace resume query editing from a focused ${row}`, async ({ page }) => {
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Search posts and commands' });
    await input.fill(row === 'post' ? 'find' : 'about');
    await expect(page.getByRole('link', { name: 'First result', exact: true })).toBeVisible();
    const rowLink = page.getByRole('link', { name: row === 'post' ? 'First result' : 'Go to About', exact: true });
    await rowLink.focus();
    await page.keyboard.type('Xy');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(row === 'post' ? 'findXy' : 'aboutXy');
    await input.fill(row === 'post' ? 'find' : 'about');
    await expect(rowLink).toBeVisible();
    await rowLink.focus();
    await page.keyboard.press('Backspace');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(row === 'post' ? 'fin' : 'abou');
    await page.keyboard.type('Z');
    await expect(input).toHaveValue(row === 'post' ? 'finZ' : 'abouZ');
    expect((await events(page)).filter((event) => event.name === 'search_result_selected')).toEqual([]);
    await expect(page.getByRole('dialog')).toBeVisible();
  });
}
