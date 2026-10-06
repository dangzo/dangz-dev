import { expect, test, type Page } from '@playwright/test';
import { UMAMI_READY_EVENT, type UmamiPayload, type UmamiWindow } from '@/utils/umami';

interface Exposure {
  readonly name: string;
  readonly data: Readonly<Record<string, string | number>>;
  readonly pathname: string;
}

interface AnalyticsTestWindow extends UmamiWindow {
  captureExposure: (exposure: Exposure) => Promise<void>;
}

const firstPost = '/blog/stable-visual-regression-tests';
const secondPost = '/blog/fixture-post-2';

async function reachBottom(page: Page) {
  const bottom = page.getByLabel('Article content').getByLabel('Reactions', { exact: true });
  await expect(bottom).toBeVisible();
  await bottom.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
}

async function makeTrackerReady(page: Page) {
  await page.evaluate((readyEvent) => {
    const analyticsWindow = window as unknown as AnalyticsTestWindow;
    analyticsWindow.umami = {
      track: async (
        name: string | ((defaults: UmamiPayload) => UmamiPayload),
        data?: Readonly<Record<string, string | number>>,
      ) => {
        if (typeof name === 'string') {
          await analyticsWindow.captureExposure({ name, data: data ?? {}, pathname: location.pathname });
        }
      },
    };
    window.dispatchEvent(new Event(readyEvent));
  }, UMAMI_READY_EVENT);
}

test.describe('Bottom reactions exposure with simulated tracker readiness', () => {
  let exposures: Exposure[];

  test.beforeEach(async ({ page }) => {
    exposures = [];
    await page.exposeFunction('captureExposure', (exposure: Exposure) => {
      exposures.push(exposure);
    });
    await page.route('**/api/reactions*', async (route) => {
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

  test('retains exposure after scrolling away and reaction updates, then sends exactly once', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(firstPost);
    await reachBottom(page);
    const bottom = page.getByLabel('Article content').getByLabel('Reactions', { exact: true });
    await bottom.getByRole('button', { name: 'Love', exact: true }).click();
    await expect(bottom.getByText('4', { exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(exposures).toHaveLength(0);

    await makeTrackerReady(page);
    await expect.poll(() => exposures).toEqual([{
      name: 'post_bottom_reactions_reached',
      data: { post_id: 'post-1' },
      pathname: firstPost,
    }]);
    await reachBottom(page);
    await makeTrackerReady(page);
    expect(exposures).toHaveLength(1);
    expect(pageErrors).toEqual([]);
  });

  test('drops an earlier post on client navigation and counts later mounted visits independently', async ({ page }) => {
    await page.goto(firstPost);
    await reachBottom(page);
    await page.getByRole('link', { name: /back to all posts/i }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await page.locator(`section article a[href="${secondPost}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${secondPost}$`));
    await reachBottom(page);
    await makeTrackerReady(page);

    await expect.poll(() => exposures).toEqual([{
      name: 'post_bottom_reactions_reached',
      data: { post_id: 'post-2' },
      pathname: secondPost,
    }]);

    await page.getByRole('link', { name: /back to all posts/i }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await page.locator(`section article a[href="${firstPost}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${firstPost}$`));
    await reachBottom(page);
    await expect.poll(() => exposures).toHaveLength(2);
    expect(exposures[1]).toEqual({
      name: 'post_bottom_reactions_reached',
      data: { post_id: 'post-1' },
      pathname: firstPost,
    });
  });

  test('leaves reactions usable when analytics never becomes available', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(firstPost);
    await reachBottom(page);
    const bottom = page.getByLabel('Article content').getByLabel('Reactions', { exact: true });
    await bottom.getByRole('button', { name: 'Love', exact: true }).click();
    await expect(bottom.getByText('4', { exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await reachBottom(page);

    expect(exposures).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
