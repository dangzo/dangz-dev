import type { UmamiPayload } from './umami';

const defaults: UmamiPayload = {
  website: 'site', hostname: 'localhost', language: 'en', screen: '100x100',
  url: '/later?q=secret', referrer: 'https://example.com/?q=secret', id: 'private-id',
};

describe('search analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
    window.history.replaceState(null, '', '/blog?query=secret#secret');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://example.com/path?q=secret#secret');
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

  it('allowlists event properties and strips sensitive default metadata', async () => {
    const { trackSearchEvent } = await import('./searchAnalytics');
    const { payloads } = installTracker();
    const event = { name: 'search_completed' as const, query_length: 6, result_count: 2, query: 'secret' };
    trackSearchEvent(event);
    expect(payloads).toEqual([{
      website: 'site', hostname: 'localhost', language: 'en', screen: '100x100',
      url: '/blog', referrer: 'https://example.com/path', timestamp: 1791288000,
      name: 'search_completed', data: { query_length: 6, result_count: 2 },
    }]);
    expect(JSON.stringify(payloads)).not.toContain('secret');
    expect(payloads[0]).not.toHaveProperty('id');
  });

  it('buffers in order across navigation with original times and flushes only once', async () => {
    const { trackSearchEvent, flushPendingSearchEvents } = await import('./searchAnalytics');
    trackSearchEvent({ name: 'search_opened', method: 'shortcut' });
    vi.advanceTimersByTime(1000);
    trackSearchEvent({ name: 'search_result_selected', post_id: 'post-1', result_position: 2 });
    window.history.pushState(null, '', '/blog/article');
    const { track, payloads } = installTracker();
    flushPendingSearchEvents();
    flushPendingSearchEvents();
    expect(track).toHaveBeenCalledTimes(2);
    expect(payloads.map(({ url, timestamp }) => ({ url, timestamp }))).toEqual([
      { url: '/blog', timestamp: 1791288000 },
      { url: '/blog', timestamp: 1791288001 },
    ]);
  });

  it('expires queued events after 60 seconds', async () => {
    const { trackSearchEvent, flushPendingSearchEvents } = await import('./searchAnalytics');
    trackSearchEvent({ name: 'search_opened', method: 'button' });
    vi.advanceTimersByTime(60_000);
    const { track } = installTracker();
    flushPendingSearchEvents();
    expect(track).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains only the newest 50 events', async () => {
    const { trackSearchEvent, flushPendingSearchEvents } = await import('./searchAnalytics');
    for (let index = 0; index < 51; index += 1) {
      trackSearchEvent({ name: 'search_completed', query_length: 2, result_count: index });
    }
    const { payloads } = installTracker();
    flushPendingSearchEvents();
    expect(payloads).toHaveLength(50);
    expect(payloads[0].data).toEqual({ query_length: 2, result_count: 1 });
  });

  it('discards the queue and stops collecting after script failure', async () => {
    const { trackSearchEvent, discardPendingSearchEvents, flushPendingSearchEvents } = await import('./searchAnalytics');
    trackSearchEvent({ name: 'search_opened', method: 'button' });
    discardPendingSearchEvents();
    const { track } = installTracker();
    trackSearchEvent({ name: 'search_opened', method: 'shortcut' });
    flushPendingSearchEvents();
    expect(track).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['throw', 'reject'] as const)('contains tracker %s failures without retrying', async (failure) => {
    const { trackSearchEvent, flushPendingSearchEvents } = await import('./searchAnalytics');
    const track = vi.fn(() => {
      if (failure === 'throw') {
        throw new Error('Unavailable');
      }
      return Promise.reject(new Error('Unavailable'));
    });
    vi.stubGlobal('umami', { track });
    expect(() => trackSearchEvent({ name: 'search_opened', method: 'button' })).not.toThrow();
    await Promise.resolve();
    flushPendingSearchEvents();
    expect(track).toHaveBeenCalledOnce();
  });
});
