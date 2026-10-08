import { expect, test, type Page, type Route } from '@playwright/test';

const articlePath = '/blog/fixture-post-5';
const landscapeAlt = 'Landscape image with cropped thumbnail';
const portraitAlt = 'Portrait image without caption';

async function fulfillImage(route: Route) {
  const source = new URL(route.request().url()).searchParams.get('url') ?? '';
  const portrait = source.includes('1200x2400');
  const width = portrait ? 1200 : 2400;
  const height = portrait ? 2400 : 1200;

  await route.fulfill({
    contentType: 'image/svg+xml',
    body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#305e88"/><circle cx="${width / 2}" cy="${height / 2}" r="300" fill="#d8b4fe"/><rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#fde68a" stroke-width="20"/></svg>`,
  });
}

async function openImage(page: Page, alt: string) {
  const trigger = page.getByRole('button', { name: `View image: ${alt}`, exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Image viewer' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close image' })).toBeFocused();

  return { trigger, dialog };
}

test.describe('Article image viewer', () => {
  const diagnostics = new WeakMap<Page, { errors: string[]; failures: string[] }>();

  test.beforeEach(async ({ page }) => {
    const observed = { errors: [] as string[], failures: [] as string[] };
    diagnostics.set(page, observed);
    page.on('pageerror', error => observed.errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') {
        observed.errors.push(message.text());
      }
    });
    page.on('requestfailed', request => observed.failures.push(`${request.url()}: ${request.failure()?.errorText}`));
    await page.route('**/api/reactions?*', route => route.fulfill({ json: { reactions: [] } }));
    await page.route('**/_next/image?*', fulfillImage);
    await page.goto(articlePath);
  });

  test.afterEach(async ({ page }, testInfo) => {
    const observed = diagnostics.get(page)!;
    const expectedFailedLoad = testInfo.title.startsWith('loading remains dismissible');
    const unexpectedErrors = observed.errors.filter(message => !expectedFailedLoad || !message.includes('net::ERR_FAILED'));
    const unexpectedFailures = observed.failures.filter(message => !expectedFailedLoad || !message.includes('/_next/image?'));
    await testInfo.attach('viewer-browser-diagnostics', {
      body: JSON.stringify(observed, null, 2),
      contentType: 'application/json',
    });
    expect(unexpectedErrors).toEqual([]);
    expect(unexpectedFailures).toEqual([]);
  });

  for (const mobile of [false, true]) {
    for (const theme of ['light', 'dark']) {
      test(`${mobile ? 'mobile' : 'desktop'} ${theme} preserves the original image and fits the viewport`, async ({ page }) => {
        await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 960 });
        await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' });
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.reload();
        const requestPromise = page.waitForRequest(request => {
          if (!request.url().includes('/_next/image?')) {
            return false;
          }

          const source = new URL(request.url()).searchParams.get('url') ?? '';
          return source.includes('2400x1200') && !new URL(source).searchParams.has('w');
        });
        const { dialog } = await openImage(page, landscapeAlt);
        const request = await requestPromise;
        const original = new URL(new URL(request.url()).searchParams.get('url')!);
        expect(original.searchParams.has('rect')).toBe(false);
        const image = dialog.getByRole('img', { name: landscapeAlt, exact: true });
        await expect.poll(() => image.evaluate(element => {
          const loaded = element as HTMLImageElement;
          return loaded.naturalWidth / loaded.naturalHeight;
        })).toBeCloseTo(2, 2);
        if (!mobile) {
          expect(Number(new URL(request.url()).searchParams.get('w'))).toBeGreaterThan(930);
        }
        await expect(image).toHaveCSS('object-fit', 'contain');
        await expect(dialog.locator('figcaption')).toHaveText('The viewer shows the complete landscape image.');
        const bounds = await image.boundingBox();
        const viewport = page.viewportSize()!;
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
        await image.click();
        await dialog.locator('figcaption').click();
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        const portrait = await openImage(page, portraitAlt);
        await expect.poll(() => portrait.dialog.getByRole('img').evaluate(element => {
          const loaded = element as HTMLImageElement;
          return loaded.naturalWidth / loaded.naturalHeight;
        })).toBeCloseTo(0.5, 2);
        await expect(portrait.dialog.locator('figcaption')).toHaveCount(0);
        await portrait.dialog.getByRole('button', { name: 'Close image' }).click();
        await expect(portrait.dialog).toHaveCount(0);
      });
    }
  }

  test('keyboard opening traps focus, blocks shortcuts and scroll, then restores the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: `View image: ${landscapeAlt}`, exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const scrollPosition = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Image viewer' });
    const close = dialog.getByRole('button', { name: 'Close image' });
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.locator('figcaption')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.locator('figcaption')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    const lockedPosition = await page.evaluate(() => window.scrollY);
    await expect(page.locator('body')).toHaveCSS('top', `${-scrollPosition}px`);
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(lockedPosition);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollPosition);
    const { dialog: reopened } = await openImage(page, landscapeAlt);
    await reopened.click({ position: { x: 2, y: 2 } });
    await expect(reopened).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('cover opens with Space and closes repeatedly', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'View image: Abstract blue and purple shapes', exact: true });
    for (let iteration = 0; iteration < 2; iteration += 1) {
      await trigger.focus();
      await page.keyboard.press('Space');
      const dialog = page.getByRole('dialog', { name: 'Image viewer' });
      await expect(dialog.getByRole('img', { name: 'Abstract blue and purple shapes', exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Close image' }).click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  });

  test('loading remains dismissible and a failed load has a visible status', async ({ page }) => {
    await page.unroute('**/_next/image?*');
    let release: (() => void) | undefined;
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/_next/image?*', async route => {
      const source = new URL(route.request().url()).searchParams.get('url') ?? '';
      if (source.includes('2400x1200') && !new URL(source).searchParams.has('w')) {
        await held;
        await route.abort();
        return;
      }

      await fulfillImage(route);
    });
    const { dialog } = await openImage(page, landscapeAlt);
    await expect(dialog.getByRole('status')).toContainText(/loading/i);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    release!();
    const reopened = await openImage(page, landscapeAlt);
    await expect(reopened.dialog.getByRole('status')).toContainText(/unable|failed|could not/i);
    await reopened.dialog.getByRole('button', { name: 'Close image' }).click();
    await expect(reopened.dialog).toHaveCount(0);
  });

  test('mobile long captions scroll within the viewer and keep Close reachable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { dialog } = await openImage(page, 'Image with long caption');
    const caption = dialog.locator('figcaption');
    const dimensions = await caption.evaluate(element => ({
      height: element.clientHeight,
      content: element.scrollHeight,
      width: element.clientWidth,
      contentWidth: element.scrollWidth,
    }));
    expect(dimensions.content).toBeGreaterThan(dimensions.height);
    expect(dimensions.height).toBeLessThanOrEqual(844 * 0.25);
    expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.width);
    const bounds = await caption.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
    await page.keyboard.press('Tab');
    await expect(caption).toBeFocused();
    await page.keyboard.press('End');
    await expect.poll(() => caption.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    const close = dialog.getByRole('button', { name: 'Close image' });
    await expect(close).toBeInViewport();
    await close.click();
    await expect(dialog).toHaveCount(0);
  });

  test('closing keeps background restrictions until the fade completes', async ({ page }) => {
    const { dialog, trigger } = await openImage(page, landscapeAlt);
    await expect(dialog).toHaveCSS('opacity', '1');
    const closing = await dialog.evaluate(async element => {
      (element.querySelector('button') as HTMLButtonElement).click();
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

      return {
        attached: element.isConnected,
        transition: getComputedStyle(element).transitionDuration,
        bodyPosition: document.body.style.position,
        inertBackground: document.querySelector('main')?.closest('[inert]') !== null,
      };
    });
    expect(closing.attached).toBe(true);
    expect(closing.transition).toBe('0.2s');
    expect(closing.bodyPosition).toBe('fixed');
    expect(closing.inertBackground).toBe(true);
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('position', 'fixed');
  });

  test('reduced motion disables viewer transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const { dialog } = await openImage(page, landscapeAlt);
    await expect(dialog).toHaveCSS('transition-property', 'none');
    await expect(dialog.locator('figure')).toHaveCSS('transition-property', 'none');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
