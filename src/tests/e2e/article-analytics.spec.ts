import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { UMAMI_READY_EVENT } from '@/utils/umami';

test.use({ channel: 'chromium', permissions: ['clipboard-read', 'clipboard-write'] });

type EventPayload = Readonly<{ name: string; data: Readonly<Record<string, string>>; url: string }>;
const article = '/blog/fixture-post-2';
const references = [
  { label: 'HTTPS reference', host: 'references.example' },
  { label: 'HTTP reference', host: 'plain.example' },
  { label: 'Protocol relative reference', host: 'protocol.example' },
] as const;

async function loadTracker(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/__test/umami.js';
    script.setAttribute('data-website-id', '00000000-0000-0000-0000-000000000190');
    script.setAttribute('data-auto-pageview', 'false');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Tracker fixture failed to load'));
    document.head.appendChild(script);
  }));
  await page.evaluate((readyEvent) => window.dispatchEvent(new Event(readyEvent)), UMAMI_READY_EVENT);
}

function referenceData(host: string) {
  return { post_id: 'post-2', destination_host: host, placement: 'article_body' };
}

test.describe('Article analytics with the pinned real tracker and intercepted collector', () => {
  let events: EventPayload[];
  let pageErrors: string[];

  test.beforeEach(async ({ context, page }) => {
    events = [];
    pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const tracker = await readFile(path.join(process.cwd(), 'src/test-support/e2e/umami/tracker.txt'));
    await context.route('**/__test/umami.js', (route) => route.fulfill({ contentType: 'application/javascript', body: tracker }));
    await context.route('https://gateway.umami.is/api/send', async (route) => {
      const body = route.request().postDataJSON() as Readonly<{ type: string; payload: EventPayload }>;
      if (body.type === 'event') {
        events.push(body.payload);
      }
      await route.fulfill({ json: {} });
    });
    await context.route(/^https?:\/\/(references|plain|protocol)\.example(?::8080)?\//, (route) => route.fulfill({
      contentType: 'text/html', body: '<html><body>Article reference destination fixture</body></html>',
    }));
    await page.goto(article);
    await expect(page.getByLabel('Article content').getByRole('heading', { level: 4 })).toBeVisible();
  });

  test.afterEach(() => {
    expect(pageErrors).toEqual([]);
  });

  for (const activation of ['mouse', 'Enter', 'nested'] as const) {
    test(`references emit exact properties once for ${activation} activation`, async ({ page }) => {
      const content = page.getByLabel('Article content');
      const inventory = await content.locator('a[data-umami-event]').evaluateAll((anchors) => anchors.map((anchor) => ({
        name: anchor.getAttribute('data-umami-event'),
        data: Object.fromEntries(anchor.getAttributeNames()
          .filter((attribute) => attribute.startsWith('data-umami-event-'))
          .map((attribute) => [attribute.slice('data-umami-event-'.length), anchor.getAttribute(attribute)])),
      })));
      expect(inventory).toEqual(references.map(({ host }) => ({ name: 'outbound_link_clicked', data: referenceData(host) })));

      // Preserve delegated tracking while isolating destination actions, covered separately below.
      await page.evaluate(() => document.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a[data-umami-event-placement="article_body"]')) {
          event.preventDefault();
        }
      }, true));
      await loadTracker(page);

      for (const [index, reference] of references.entries()) {
        const link = content.getByRole('link', { name: reference.label });
        await expect(link).toHaveAttribute('target', '_blank');
        if (activation === 'Enter') {
          await link.focus();
          await page.keyboard.press('Enter');
        } else if (activation === 'nested' && index === 0) {
          await link.locator('code').click();
        } else {
          await link.click();
        }
        await expect.poll(() => events.length).toBe(index + 1);
      }
      expect(events.map(({ name, data }) => ({ name, data }))).toEqual(references.map(({ host }) => ({
        name: 'outbound_link_clicked', data: referenceData(host),
      })));
      expect(events.map(({ url }) => new URL(url, page.url()).pathname)).toEqual(references.map(() => article));
    });
  }

  for (const tracking of ['ready', 'absent', 'opted out'] as const) {
    test(`references preserve native new tabs with tracking ${tracking}`, async ({ page }) => {
      if (tracking === 'opted out') {
        await page.evaluate(() => localStorage.setItem('umami.disabled', '1'));
      }
      if (tracking !== 'absent') {
        await loadTracker(page);
      }
      const link = page.getByLabel('Article content').getByRole('link', { name: 'HTTPS reference' });
      const destination = await link.getAttribute('href');
      const popupPromise = page.waitForEvent('popup');
      await link.locator('code').click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(destination!);
      await expect(page).toHaveURL(new RegExp(`${article}$`));
      if (tracking === 'ready') {
        await expect.poll(() => events.length).toBe(1);
      }
      expect(events.map(({ name, data }) => ({ name, data }))).toEqual(tracking === 'ready'
        ? [{ name: 'outbound_link_clicked', data: referenceData('references.example') }]
        : []);
      await popup.close();
    });
  }

  test('fragment and relative references navigate without outbound events', async ({ page }) => {
    await loadTracker(page);
    const content = page.getByLabel('Article content');
    await content.getByRole('link', { name: 'Fragment reference', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${article}#reference-section$`));
    await expect(content.locator('h2').first()).toBeInViewport();
    expect(events.filter(({ name }) => name === 'outbound_link_clicked')).toEqual([]);

    await content.getByRole('link', { name: 'Relative reference', exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole('heading', { name: 'All Posts', exact: true })).toBeVisible();
    expect(events.filter(({ name }) => name === 'outbound_link_clicked')).toEqual([]);
  });

  test('native clipboard success reports H2, H3, H4 and duplicate heading IDs exactly once', async ({ page }) => {
    await loadTracker(page);
    const headings = page.getByLabel('Article content').locator('h2, h3, h4');
    await expect(headings).toHaveCount(4);
    const ids = await headings.evaluateAll((elements) => elements.map(({ id }) => id));
    expect(ids).toEqual(['reference-section', 'detailed-references', 'reference-details', 'reference-section-2']);

    for (const [index, id] of ids.entries()) {
      const heading = headings.nth(index);
      if (index !== 2) {
        await expect(page.locator(`aside a[href="#${id}"]`)).toHaveCount(1);
      }
      await heading.hover();
      await heading.getByRole('button', { name: 'Copy link to this section' }).click();
      await expect(heading.getByRole('button', { name: 'Link copied' })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${page.url()}#${id}`);
      await expect.poll(() => events.length).toBe(index + 1);
    }
    expect(events.map(({ name, data, url }) => ({ name, data, url }))).toEqual(ids.map((id) => ({
      name: 'heading_link_copied', data: { post_id: 'post-2', section_id: id }, url: article,
    })));
  });

  test('native clipboard copy remains functional with an opted-out tracker', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('umami.disabled', '1'));
    await loadTracker(page);
    const heading = page.getByLabel('Article content').locator('h2').first();
    await heading.hover();
    await heading.getByRole('button', { name: 'Copy link to this section' }).click();
    await expect(heading.getByRole('button', { name: 'Link copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${page.url()}#reference-section`);
    expect(events).toEqual([]);
  });

  test('clipboard rejection emits nothing and leaves the copy control usable', async ({ page }) => {
    await loadTracker(page);
    await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new Error('Fixture clipboard rejection')),
    }));
    const heading = page.getByLabel('Article content').locator('h2').first();
    await heading.hover();
    const button = heading.getByRole('button', { name: 'Copy link to this section' });
    await button.click();
    await expect(button).toBeVisible();
    await expect(heading.getByRole('button', { name: 'Link copied' })).toHaveCount(0);
    expect(events).toEqual([]);
  });

  test('pending clipboard writes emit only after success and retain activation context', async ({ page }) => {
    await loadTracker(page);
    await page.evaluate(() => {
      const clipboardWindow = window as Window & { completeClipboardWrite?: () => void };
      Object.defineProperty(navigator.clipboard, 'writeText', {
        value: () => new Promise<void>((resolve) => {
          clipboardWindow.completeClipboardWrite = resolve;
        }),
      });
    });
    const heading = page.getByLabel('Article content').locator('h2').first();
    await heading.hover();
    await heading.getByRole('button', { name: 'Copy link to this section' }).click();
    await expect(heading.getByRole('button', { name: 'Link copied' })).toHaveCount(0);
    expect(events).toEqual([]);
    await page.getByRole('link', { name: /back to all posts/i }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await page.evaluate(() => {
      const clipboardWindow = window as Window & { completeClipboardWrite?: () => void };
      clipboardWindow.completeClipboardWrite?.();
    });
    await expect.poll(() => events.length).toBe(1);
    expect(events.map(({ name, data, url }) => ({ name, data, url }))).toEqual([{
      name: 'heading_link_copied', data: { post_id: 'post-2', section_id: 'reference-section' }, url: article,
    }]);
  });

  test('copy buffers before tracker readiness and preserves source after client navigation', async ({ page }) => {
    const heading = page.getByLabel('Article content').locator('h2').first();
    await heading.hover();
    await heading.getByRole('button', { name: 'Copy link to this section' }).click();
    await expect(heading.getByRole('button', { name: 'Link copied' })).toBeVisible();
    expect(events).toEqual([]);
    await page.getByRole('link', { name: /back to all posts/i }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await loadTracker(page);
    await page.evaluate((readyEvent) => {
      window.dispatchEvent(new Event(readyEvent));
      window.dispatchEvent(new Event(readyEvent));
    }, UMAMI_READY_EVENT);
    await expect.poll(() => events.length).toBe(1);
    expect(events.map(({ name, data, url }) => ({ name, data, url }))).toEqual([{
      name: 'heading_link_copied', data: { post_id: 'post-2', section_id: 'reference-section' }, url: article,
    }]);
  });
});
