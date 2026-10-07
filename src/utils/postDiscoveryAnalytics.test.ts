import { UMAMI_READY_EVENT, type UmamiPayload } from './umami';

const data = { post_id: 'post-1', source: 'home', placement: 'title' } as const;

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
  window.history.replaceState(null, '', '/?query=private#section');
  vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://example.com/source?q=private');
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function installTracker() {
  const payloads: UmamiPayload[] = [];
  const track = vi.fn((payload: (defaults: UmamiPayload) => UmamiPayload) => {
    payloads.push(payload({ website: 'site', hostname: 'localhost', language: 'en', screen: '100x100', id: 'private' }));
  });
  vi.stubGlobal('umami', { track });
  return { track, payloads };
}

it('allowlists properties and preserves query-free source metadata', async () => {
  const { trackPostOpened } = await import('./postDiscoveryAnalytics');
  const { payloads } = installTracker();
  const event = { ...data, title: 'private' };
  trackPostOpened(event);
  expect(payloads).toEqual([{
    website: 'site', hostname: 'localhost', language: 'en', screen: '100x100',
    url: '/', referrer: 'https://example.com/source', timestamp: 1791374400,
    name: 'post_opened', data,
  }]);
});

it('flushes buffered activation once after navigation with its original source/time', async () => {
  const { trackPostOpened } = await import('./postDiscoveryAnalytics');
  const { flushPendingAnalyticsEvents, discardPendingAnalyticsEvents } = await import('./analyticsTransport');
  trackPostOpened(data);
  vi.advanceTimersByTime(1000);
  window.history.pushState(null, '', '/blog/article');
  const { track, payloads } = installTracker();
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  flushPendingAnalyticsEvents();
  expect(track).toHaveBeenCalledOnce();
  expect(payloads[0]).toMatchObject({ url: '/', timestamp: 1791374400, data });
  discardPendingAnalyticsEvents();
});

it('expires missing-tracker events and discards events after script failure', async () => {
  const { trackPostOpened } = await import('./postDiscoveryAnalytics');
  const { flushPendingAnalyticsEvents, discardPendingAnalyticsEvents } = await import('./analyticsTransport');
  expect(() => trackPostOpened(data)).not.toThrow();
  vi.advanceTimersByTime(60_000);
  const { track } = installTracker();
  flushPendingAnalyticsEvents();
  expect(track).not.toHaveBeenCalled();
  discardPendingAnalyticsEvents();
  trackPostOpened(data);
  expect(track).not.toHaveBeenCalled();
});

it.each(['throw', 'reject'] as const)('contains tracker %s failures without retrying', async (failure) => {
  const { trackPostOpened } = await import('./postDiscoveryAnalytics');
  const { flushPendingAnalyticsEvents } = await import('./analyticsTransport');
  const track = vi.fn(() => {
    if (failure === 'throw') {
      throw new Error('Unavailable');
    }
    return Promise.reject(new Error('Unavailable'));
  });
  vi.stubGlobal('umami', { track });
  expect(() => trackPostOpened(data)).not.toThrow();
  await Promise.resolve();
  flushPendingAnalyticsEvents();
  expect(track).toHaveBeenCalledOnce();
});
