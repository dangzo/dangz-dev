import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proxy } from './proxy';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import type { TopicWithCount } from '@/features/blog/types/Topic.types';

vi.mock('@/features/blog/api/queries/topics', () => ({ getTopicsWithCount: vi.fn() }));

const topic = (slug: string, postCount: number): TopicWithCount => ({
  _id: slug,
  slug: { current: slug },
  displayName: slug,
  description: '',
  postCount,
});

const request = (path: string) => new NextRequest(`https://dangz.dev${path}`);

beforeEach(() => {
  vi.mocked(getTopicsWithCount).mockResolvedValue({
    topics: [topic('architecture', 10), topic('performance', 2), topic('ai-assisted-development', 0)],
    totalPostCount: 12,
  });
});

describe('legacy topic HTTP redirects', () => {
  it('returns a 308 before route rendering and preserves a valid page in one hop', async () => {
    const response = await proxy(request('/blog/tags/frontend-architecture/page/2'));

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://dangz.dev/blog/topics/architecture/page/2');
    expect(getTopicsWithCount).toHaveBeenCalledWith({ publishedOnly: true, outsideRender: true });
  });

  it('normalizes page one and out-of-range legacy pages to the destination root', async () => {
    for (const path of ['/blog/tags/web-performance/page/1', '/blog/tags/web-performance/page/2']) {
      const response = await proxy(request(path));

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://dangz.dev/blog/topics/performance');
    }
  });

  it('preserves valid broad technology pagination in the full published corpus', async () => {
    const response = await proxy(request('/blog/tags/react/page/2'));

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://dangz.dev/blog/page/2');
  });

  it('falls back to the blog for empty mapped destinations', async () => {
    vi.mocked(getTopicsWithCount).mockResolvedValue({ topics: [topic('architecture', 0)], totalPostCount: 1 });
    const response = await proxy(request('/blog/tags/frontend-architecture'));

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://dangz.dev/blog');
  });

  it('lets unknown legacy slugs reach the route not-found boundary', async () => {
    const response = await proxy(request('/blog/tags/unknown'));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('normalizes a populated topic page one with an HTTP 308', async () => {
    const response = await proxy(request('/blog/topics/architecture/page/1'));

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://dangz.dev/blog/topics/architecture');
  });

  it('leaves an empty canonical topic page one to the route not-found boundary', async () => {
    const response = await proxy(request('/blog/topics/ai-assisted-development/page/1'));

    expect(response.headers.get('location')).toBeNull();
  });
});
