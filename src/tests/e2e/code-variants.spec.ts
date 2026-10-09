import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  for (const width of [390, 1440]) {
    test(`code variants work at ${width}px in ${theme} theme`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ colorScheme: theme });
      await page.addInitScript((initialTheme) => localStorage.setItem('theme', initialTheme), theme);
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: async (code: string) => { document.documentElement.dataset.copiedCode = code; } },
        });
      });
      await page.goto('/blog/fixture-post-6');
      const groups = page.locator('[data-code-group]');
      await expect(groups).toHaveCount(5);
      const group = groups.first();
      const vue = group.getByRole('tab', { name: 'Vue', exact: true });
      const react = group.getByRole('tab', { name: 'React', exact: true });
      const shell = group.getByRole('tab', { name: 'Shell', exact: true });

      await expect(vue).toHaveAttribute('aria-selected', 'true');
      await expect(group.getByRole('tabpanel')).toHaveCount(1);
      const headerBox = await group.getByRole('tablist').boundingBox();
      const panelBox = await group.getByRole('tabpanel').boundingBox();
      expect(headerBox).not.toBeNull();
      expect(panelBox).not.toBeNull();
      expect(Math.abs((headerBox?.y ?? 0) + (headerBox?.height ?? 0) - (panelBox?.y ?? 0))).toBeLessThanOrEqual(1);
      await react.click();
      await expect(group.getByRole('tabpanel')).toContainText('export function Counter()');
      const copy = group.getByRole('button', { name: 'Copy code' });
      await copy.click();
      await expect(copy).toHaveText('Copied');
      await expect(page.locator('html')).toHaveAttribute('data-copied-code', 'export function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}');

      await react.focus();
      await page.keyboard.press('ArrowRight');
      await expect(shell).toBeFocused();
      await expect(shell).toHaveAttribute('aria-selected', 'true');
      await expect(copy).toHaveText('Copy');
      const pre = group.getByRole('tabpanel').locator('pre');
      await expect(pre).toContainText('#!/usr/bin/env bash');
      await expect(pre.locator('span[style]').first()).toBeVisible();
      expect(await pre.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
      expect(await pre.locator('.line').first().evaluate((element) => getComputedStyle(element, '::before').content)).toContain('counter');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.screenshot({ path: `.tmp/issue-167/code-variants-${theme}-${width}.png`, fullPage: true });
      await page.keyboard.press('ArrowRight');
      await expect(vue).toBeFocused();
      await page.keyboard.press('End');
      await expect(shell).toBeFocused();
      await page.keyboard.press('Home');
      await expect(vue).toBeFocused();
      await expect(groups.nth(1).getByRole('tab', { name: 'Vue', exact: true })).toHaveAttribute('aria-selected', 'true');
      await expect(groups.nth(2).getByRole('tab', { name: 'bash', exact: true })).toHaveAttribute('aria-selected', 'true');
      await expect(groups.nth(3).getByRole('tab', { name: 'bash', exact: true })).toBeVisible();
      await expect(groups.nth(4).getByRole('tab', { name: 'plaintext', exact: true })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Article content', exact: true })).toContainText('Hello from sh');
      await expect(page.getByRole('region', { name: 'Article content', exact: true })).toContainText('Legacy Bash');
      await expect(page.locator('main article pre.shiki-fallback')).toHaveText('<safe> & plaintext');
      expect(errors).toEqual([]);
    });
  }
}
