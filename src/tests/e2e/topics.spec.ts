import { expect, test } from '@playwright/test';

const preview = process.env.E2E_PREVIEW_DRAFTS === 'true';

test('topic navigation counts published and preview content consistently', async ({ page }) => {
  await page.goto('/blog');
  const sidebar = page.locator('aside').first();

  await expect(sidebar.getByRole('link', { name: /^architecture \(10\)$/i })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: /^all posts \(/i })).toHaveText(`All posts (${preview ? 16 : 15})`);
  await expect(sidebar.locator('a[href="/blog/topics/ai-assisted-development"]')).toHaveCount(preview ? 1 : 0);
  await expect(page.locator('section article a[href^="/blog/topics/"]')).toHaveCount(8);
  await expect(page.locator('a[href^="/blog/tags/"]')).toHaveCount(0);

  await sidebar.getByRole('link', { name: /^architecture \(10\)$/i }).click();
  await expect(page).toHaveURL(/\/blog\/topics\/architecture$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Architecture' })).toBeVisible();
  await expect(page.locator('section article')).toHaveCount(8);

  await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/blog\/topics\/architecture\/page\/2$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Architecture' })).toBeVisible();
  await expect(page.locator('section article')).toHaveCount(2);
  await expect(sidebar.getByRole('link', { name: /^architecture \(10\)$/i })).toHaveAttribute('href', '/blog/topics/architecture');
});

test('topic metadata is canonical and paginated archives are excluded from indexing', async ({ page }) => {
  await page.goto('/blog/topics/architecture');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/blog\/topics\/architecture$/);

  await page.goto('/blog/topics/architecture/page/2');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/blog\/topics\/architecture\/page\/2$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*follow/);
});

test('client navigation restores topic heading and sidebar after an article visit', async ({ page }) => {
  await page.goto('/blog/topics/architecture');
  await page.locator('section article a:has(h3)').first().click();

  await expect(page.getByRole('heading', { level: 1, name: 'Building stable visual regression tests' })).toBeVisible();
  await expect(page.locator('aside').getByRole('heading', { name: 'Table of contents' })).toBeVisible();
  await page.locator('article').first().getByRole('link', { name: 'Architecture' }).click();

  await expect(page).toHaveURL(/\/blog\/topics\/architecture$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Architecture' })).toBeVisible();
  await expect(page.locator('aside').getByRole('heading', { name: 'All topics' })).toBeVisible();
  await expect(page.locator('aside').getByRole('heading', { name: 'Table of contents' })).toHaveCount(0);
});

test('legacy archives redirect permanently in one hop using published destinations', async ({ request }) => {
  const legacyArchives = [
    ['frontend-architecture', '/blog/topics/architecture', '/blog/topics/architecture/page/2'],
    ['design-patterns', '/blog/topics/architecture', '/blog/topics/architecture/page/2'],
    ['scalability', '/blog/topics/architecture', '/blog/topics/architecture/page/2'],
    ['web-performance', '/blog/topics/performance', '/blog/topics/performance'],
    ['performance-optimizations', '/blog/topics/performance', '/blog/topics/performance'],
    ['core-web-vitals', '/blog/topics/performance', '/blog/topics/performance'],
    ['lighthouse', '/blog/topics/performance', '/blog/topics/performance'],
    ['full-stack-development', '/blog/topics/full-stack-engineering', '/blog/topics/full-stack-engineering'],
    ['cloud-deployment', '/blog/topics/full-stack-engineering', '/blog/topics/full-stack-engineering'],
    ['devops', '/blog/topics/full-stack-engineering', '/blog/topics/full-stack-engineering'],
    ['web-accessibility', '/blog/topics/accessibility', '/blog/topics/accessibility'],
    ['frontend-interviews', '/blog/topics/interviews', '/blog/topics/interviews'],
    ['clean-code', '/blog', '/blog/page/2'],
    ['react', '/blog', '/blog/page/2'],
    ['vue-js', '/blog', '/blog/page/2'],
    ['typescript', '/blog', '/blog/page/2'],
    ['next-js', '/blog', '/blog/page/2'],
    ['engineering-best-practices', '/blog', '/blog/page/2'],
    ['frameworks', '/blog', '/blog/page/2'],
    ['graphql', '/blog', '/blog/page/2'],
  ] as const;
  const redirects = [
    ...legacyArchives.flatMap(([slug, root, secondPage]) => [
      [`/blog/tags/${slug}`, root],
      [`/blog/tags/${slug}/page/2`, secondPage],
    ]),
    ['/blog/tags/frontend-architecture/page/3', '/blog/topics/architecture'],
    ['/blog/tags/graphql/page/3', '/blog'],
    ['/blog/topics/architecture/page/1', '/blog/topics/architecture'],
  ];

  for (const [source, destination] of redirects) {
    const response = await request.get(source, { maxRedirects: 0 });

    expect(response.status(), source).toBe(308);
    expect(new URL(response.headers().location, response.url()).pathname, source).toBe(destination);
    const canonical = await request.get(destination, { maxRedirects: 0 });
    expect(canonical.status(), destination).toBe(200);
  }
});

test('invalid topics and pages return 404, with draft-only topic visibility controlled by preview', async ({ request }) => {
  for (const path of [
    '/blog/topics/unknown', '/blog/topics/architecture/page/0',
    '/blog/topics/architecture/page/02', '/blog/topics/architecture/page/3',
    '/blog/tags/unknown', '/blog/tags/unknown/page/2',
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }

  expect((await request.get('/blog/topics/ai-assisted-development')).status()).toBe(preview ? 200 : 404);

  if (preview) {
    const draftTopic = await request.get('/blog/topics/ai-assisted-development');
    expect(await draftTopic.text()).toMatch(/name="robots" content="noindex[^"]*follow"/);
  }
});

test('search covers keyword matches beyond the first list page without exposing keywords as topics', async ({ request }) => {
  const response = await request.get('/api/search?q=pagination-keyword-only');
  const body = await response.json();

  expect(body.results).toHaveLength(1);
  expect(body.results[0]).toMatchObject({ slug: 'fixture-post-10', primaryTopic: { displayName: 'Architecture' } });
  expect(body.results[0]).not.toHaveProperty('keywords');

  const draftResponse = await request.get('/api/search?q=draft-only-keyword');
  expect((await draftResponse.json()).results).toHaveLength(preview ? 1 : 0);
});

test('sitemap includes published topic roots and excludes drafts, pagination, and legacy tags', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const xml = await response.text();

  expect(response.status()).toBe(200);
  expect(xml).toContain('/blog/topics/architecture</loc>');
  expect(xml).toContain('/blog/fixture-post-15</loc>');
  expect(xml).not.toContain('ai-assisted-development');
  expect(xml).not.toContain('unpublished-ai-workflow');
  expect(xml).not.toContain('/page/');
  expect(xml).not.toContain('/blog/tags/');
});
