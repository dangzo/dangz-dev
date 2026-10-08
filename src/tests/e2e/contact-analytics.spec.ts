import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// Use full Chromium for native modified-click windows; the headless shell can crash these targets.
test.use({ channel: 'chromium' });

type EventPayload = Readonly<{ name: string; data: Readonly<Record<string, string>>; url: string }>;
type Control = Readonly<{
  route: '/' | '/about';
  label: string;
  name: string;
  data: Readonly<Record<string, string>>;
  target: '_blank' | null;
  download?: boolean;
}>;

const controls: readonly Control[] = [
  { route: '/', label: 'Explore my GitHub', name: 'outbound_link_clicked', data: { destination_host: 'github.com', placement: 'home' }, target: null },
  { route: '/', label: 'Say hello', name: 'contact_clicked', data: { channel: 'email', placement: 'home' }, target: null },
  { route: '/', label: 'mail', name: 'contact_clicked', data: { channel: 'email', placement: 'footer' }, target: '_blank' },
  { route: '/', label: 'github', name: 'outbound_link_clicked', data: { destination_host: 'github.com', placement: 'footer' }, target: '_blank' },
  { route: '/', label: 'linkedin', name: 'contact_clicked', data: { channel: 'linkedin', placement: 'footer' }, target: '_blank' },
  { route: '/about', label: 'Download my resume', name: 'resume_download_clicked', data: { placement: 'about_intro' }, target: '_blank', download: true },
  { route: '/about', label: 'Connect on LinkedIn', name: 'contact_clicked', data: { channel: 'linkedin', placement: 'about_intro' }, target: '_blank' },
  { route: '/about', label: 'Download my resume', name: 'resume_download_clicked', data: { placement: 'about_journey' }, target: '_blank', download: true },
  { route: '/about', label: 'Email me', name: 'contact_clicked', data: { channel: 'email', placement: 'about_contact' }, target: '_blank' },
  { route: '/about', label: 'Connect on LinkedIn', name: 'contact_clicked', data: { channel: 'linkedin', placement: 'about_contact' }, target: '_blank' },
  { route: '/about', label: 'View GitHub', name: 'outbound_link_clicked', data: { destination_host: 'github.com', placement: 'about_contact' }, target: '_blank' },
];

function controlLink(page: Page, control: Control) {
  return page.getByRole('link', { name: control.label, exact: false })
    .and(page.locator(`[data-umami-event-placement="${control.data.placement}"]`));
}

async function loadTracker(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/__test/umami.js';
    script.setAttribute('data-website-id', '00000000-0000-0000-0000-000000000188');
    script.setAttribute('data-auto-pageview', 'false');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Tracker fixture failed to load'));
    document.head.appendChild(script);
  }));
}

test.describe('Contact analytics with the pinned real tracker and intercepted collector', () => {
  let events: EventPayload[];

  test.beforeEach(async ({ context }) => {
    events = [];
    const tracker = await readFile(path.join(process.cwd(), 'src/test-support/e2e/umami/tracker.txt'));

    await context.route('**/__test/umami.js', (route) => route.fulfill({ contentType: 'application/javascript', body: tracker }));
    await context.route('https://gateway.umami.is/api/send', async (route) => {
      const body = route.request().postDataJSON() as Readonly<{ type: string; payload: EventPayload }>;
      if (body.type === 'event') {
        events.push(body.payload);
      }
      await route.fulfill({ json: {} });
    });
    await context.route(/https:\/\/(github\.com|www\.linkedin\.com)\//, (route) => route.fulfill({
      contentType: 'text/html', body: '<html><body>Outbound destination fixture</body></html>',
    }));
  });

  for (const route of ['/', '/about'] as const) {
    for (const activation of ['mouse', 'Enter'] as const) {
      test(`${route} emits exactly one event for each ${activation} activation, including nested elements`, async ({ page }) => {
        await page.goto(route);
        const rendered = controls.filter((control) => control.route === route || (route === '/about' && control.data.placement === 'footer'));

        const inventory = await page.locator('a[data-umami-event]').evaluateAll((anchors) => anchors.map((anchor) => ({
          name: anchor.getAttribute('data-umami-event'),
          data: Object.fromEntries(anchor.getAttributeNames()
            .filter((attribute) => attribute.startsWith('data-umami-event-'))
            .map((attribute) => [attribute.slice('data-umami-event-'.length), anchor.getAttribute(attribute)])),
        })));
        expect(inventory).toHaveLength(rendered.length);
        expect(inventory).toEqual(expect.arrayContaining(rendered.map(({ name, data }) => ({ name, data }))));

        for (const control of rendered) {
          const link = controlLink(page, control);
          expect(await link.getAttribute('target')).toBe(control.target);
          expect(await link.getAttribute('download')).toBe(control.download ? '' : null);
          if (control.data.channel === 'email') {
            await expect(link).toHaveAttribute('href', /^mailto:/);
          }
        }

        // Isolate delivery from destination actions; native navigation/downloads are tested below.
        // The tracker redirects same-tab anchors itself, so cancellation also needs a blank target.
        await page.evaluate(() => {
          for (const link of document.querySelectorAll('a[data-umami-event]')) {
            link.setAttribute('target', '_blank');
          }
          document.addEventListener('click', (event) => {
            if (event.target instanceof Element && event.target.closest('a[data-umami-event]')) {
              event.preventDefault();
            }
          }, true);
        });
        await loadTracker(page);

        for (const [index, control] of rendered.entries()) {
          const link = controlLink(page, control);
          if (activation === 'Enter') {
            await link.focus();
            await page.keyboard.press('Enter');
          } else {
            const nested = link.locator('svg path, span[aria-hidden="true"]').first();
            if (await nested.count()) {
              await nested.click();
            } else {
              await link.click();
            }
          }
          await expect.poll(() => events.length).toBe(index + 1);
          expect(events[index].name).toBe(control.name);
          expect(events[index].data).toEqual(control.data);
          expect(new URL(events[index].url, page.url()).pathname).toBe(route);
        }

        expect(events.map(({ name, data }) => ({ name, data }))).toEqual(rendered.map(({ name, data }) => ({ name, data })));
      });
    }
  }

  for (const tracking of ['ready', 'absent', 'opted out'] as const) {
    test(`Home GitHub keeps same-tab navigation with tracking ${tracking}`, async ({ page }) => {
      await page.goto('/');
      if (tracking === 'opted out') {
        await page.evaluate(() => localStorage.setItem('umami.disabled', '1'));
      }
      if (tracking !== 'absent') {
        await loadTracker(page);
      }

      const link = controlLink(page, controls[0]);
      const destination = await link.getAttribute('href');
      await link.locator('span').click();
      await expect(page).toHaveURL(destination!);
      expect(events.map(({ name, data }) => ({ name, data }))).toEqual(tracking === 'ready'
        ? [{
          name: 'outbound_link_clicked', data: { destination_host: 'github.com', placement: 'home' },
        }]
        : []);
    });

    for (const placement of ['about_intro', 'about_journey'] as const) {
      test(`${placement} downloads the résumé with tracking ${tracking}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto('/about');
        if (tracking === 'opted out') {
          await page.evaluate(() => localStorage.setItem('umami.disabled', '1'));
        }
        if (tracking !== 'absent') {
          await loadTracker(page);
        }

        const control = controls.find((candidate) => candidate.download && candidate.data.placement === placement)!;
        const downloadPromise = page.waitForEvent('download');
        await controlLink(page, control).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('Daniele-Gazzelloni-Resume-2026.pdf');
        expect(await download.failure()).toBeNull();
        const contents = await readFile((await download.path())!);
        expect(contents.subarray(0, 5).toString()).toBe('%PDF-');
        await expect(page).toHaveURL(/\/about$/);
        if (tracking === 'ready') {
          await expect.poll(() => events.length).toBe(1);
        }
        expect(events.map(({ name, data }) => ({ name, data }))).toEqual(tracking === 'ready'
          ? [{
            name: 'resume_download_clicked', data: { placement },
          }]
          : []);
        expect(errors).toEqual([]);
      });
    }
  }

  for (const control of controls.filter((control) => control.target === '_blank' && !control.download && control.data.channel !== 'email')) {
    test(`${control.data.placement} ${control.label} preserves its new tab`, async ({ page }) => {
      await page.goto(control.route);
      await loadTracker(page);
      const link = controlLink(page, control);
      const destination = await link.getAttribute('href');
      const popupPromise = page.waitForEvent('popup');
      await link.click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(destination!);
      expect(new URL(page.url()).pathname).toBe(control.route);
      await expect.poll(() => events.length).toBe(1);
      expect(events[0].name).toBe(control.name);
      expect(events[0].data).toEqual(control.data);
      await popup.close();
    });
  }

  for (const modifier of ['Control', 'Shift'] as const) {
    test(`Home GitHub preserves ${modifier}-click navigation`, async ({ page }) => {
      await page.goto('/');
      await loadTracker(page);
      const link = controlLink(page, controls[0]);
      const destination = await link.getAttribute('href');
      const popupPromise = page.context().waitForEvent('page');
      await link.click({ modifiers: [modifier] });
      const popup = await popupPromise;
      await popup.waitForURL(destination!, { waitUntil: 'commit' });
      expect(new URL(page.url()).pathname).toBe('/');
      await expect.poll(() => events.length).toBe(1);
      expect(events[0].name).toBe('outbound_link_clicked');
      expect(events[0].data).toEqual({ destination_host: 'github.com', placement: 'home' });
      await popup.close();
    });
  }
});
