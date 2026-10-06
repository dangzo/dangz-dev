import type { UmamiPayload } from './umami';

const defaults: UmamiPayload = {
  website: 'site', hostname: 'localhost', language: 'en', screen: '100x100',
  url: '/wrong', referrer: '/wrong', title: 'Later title', tag: 'tag', id: 'visitor',
};

describe('pageview analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
    window.history.replaceState(null, '', '/blog/article');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://example.com/source?q=1#section');
    document.title = 'Article';
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function installTracker() {
    const payloads: UmamiPayload[] = [];
    const track = vi.fn((payload: (metadata: UmamiPayload) => UmamiPayload) => {
      payloads.push(payload(defaults));
      return Promise.resolve();
    });
    vi.stubGlobal('umami', { track });

    return { track, payloads };
  }

  it('preserves initial metadata, strips fragments, and inherits tracker identity', async () => {
    const { recordPageview } = await import('./pageviewAnalytics');
    const { payloads } = installTracker();
    recordPageview('/blog/article?source=share#heading');

    expect(payloads).toEqual([{
      ...defaults,
      url: `${location.origin}/blog/article?source=share`,
      referrer: 'https://example.com/source?q=1',
      title: 'Article',
      timestamp: 1791288000,
    }]);
    expect(payloads[0]).not.toHaveProperty('name');
  });

  it('retains immutable visits and referrers through rapid transitions and late readiness', async () => {
    const { recordPageview, flushPendingPageviews } = await import('./pageviewAnalytics');
    recordPageview('/blog/article');
    vi.advanceTimersByTime(1000);
    document.title = 'Blog';
    recordPageview('/blog');
    vi.advanceTimersByTime(50);
    document.title = 'Article again';
    recordPageview('/blog/article');
    window.history.pushState(null, '', '/about');
    document.title = 'Wrong current title';
    const { payloads } = installTracker();
    flushPendingPageviews();
    flushPendingPageviews();

    expect(payloads.map(({ url, referrer, title, timestamp }) => ({ url, referrer, title, timestamp }))).toEqual([
      { url: `${location.origin}/blog/article`, referrer: 'https://example.com/source?q=1', title: 'Article', timestamp: 1791288000 },
      { url: `${location.origin}/blog`, referrer: '/blog/article', title: 'Blog', timestamp: 1791288001 },
      { url: `${location.origin}/blog/article`, referrer: '/blog', title: 'Article again', timestamp: 1791288001 },
    ]);
  });

  it('ignores duplicate observations and hashes but counts queries and return visits', async () => {
    const { recordPageview, flushPendingPageviews } = await import('./pageviewAnalytics');
    const { payloads } = installTracker();
    recordPageview('/blog/article');
    recordPageview('/blog/article#one');
    recordPageview('/blog/article#two');
    recordPageview('/blog/article');
    recordPageview('/blog/article?page=2');
    recordPageview('/blog');
    recordPageview('/blog/article');
    flushPendingPageviews();

    expect(payloads.map(({ url, referrer }) => ({ url, referrer }))).toEqual([
      { url: `${location.origin}/blog/article`, referrer: 'https://example.com/source?q=1' },
      { url: `${location.origin}/blog/article?page=2`, referrer: '/blog/article' },
      { url: `${location.origin}/blog`, referrer: '/blog/article?page=2' },
      { url: `${location.origin}/blog/article`, referrer: '/blog' },
    ]);
  });

  it.each(['', 'invalid', `${location.origin}/blog?source=home#heading`])('handles initial referrer %s', async (referrer) => {
    vi.spyOn(document, 'referrer', 'get').mockReturnValue(referrer);
    const { recordPageview } = await import('./pageviewAnalytics');
    const { payloads } = installTracker();
    recordPageview('/blog/article');

    expect(payloads[0].referrer).toBe(referrer.startsWith(location.origin) ? '/blog?source=home' : '');
  });

  it('expires old views without losing younger views or their original referrer', async () => {
    const { recordPageview, flushPendingPageviews } = await import('./pageviewAnalytics');
    recordPageview('/old');
    vi.advanceTimersByTime(30_000);
    recordPageview('/young');
    vi.advanceTimersByTime(30_000);
    const { payloads } = installTracker();
    flushPendingPageviews();

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({ url: `${location.origin}/young`, referrer: '/old' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('drops the oldest views when the queue exceeds 50', async () => {
    const { recordPageview, flushPendingPageviews } = await import('./pageviewAnalytics');
    for (let index = 0; index < 51; index += 1) {
      recordPageview(`/route-${index}`);
    }
    const { payloads } = installTracker();
    flushPendingPageviews();

    expect(payloads).toHaveLength(50);
    expect(payloads[0]).toMatchObject({ url: `${location.origin}/route-1`, referrer: '/route-0' });
  });

  it('clears pending views and stops recording after script failure', async () => {
    const { recordPageview, discardPendingPageviews, flushPendingPageviews } = await import('./pageviewAnalytics');
    recordPageview('/first');
    discardPendingPageviews();
    const { track } = installTracker();
    recordPageview('/second');
    flushPendingPageviews();

    expect(track).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['throw', 'reject'] as const)('contains tracker %s failures and still attempts later visits', async (failure) => {
    const { recordPageview, flushPendingPageviews } = await import('./pageviewAnalytics');
    const track = vi.fn(() => {
      if (failure === 'throw') {
        throw new Error('Unavailable');
      }

      return Promise.reject(new Error('Unavailable'));
    });
    vi.stubGlobal('umami', { track });
    expect(() => recordPageview('/first')).not.toThrow();
    expect(() => recordPageview('/second')).not.toThrow();
    await Promise.resolve();
    flushPendingPageviews();

    expect(track).toHaveBeenCalledTimes(2);
  });
});
