import { UMAMI_READY_EVENT, type UmamiPayload } from './umami';

const defaults: UmamiPayload = {
  website: 'site', hostname: 'localhost', language: 'en', screen: '100x100',
  url: '/later?private=query', referrer: 'https://example.com/?private=query', id: 'private-id',
};

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
  window.history.replaceState(null, '', '/blog/original?private=query#fragment');
  vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://example.com/path?private=query#fragment');
});

afterEach(async () => {
  const { discardPendingAnalyticsEvents } = await import('./analyticsTransport');
  discardPendingAnalyticsEvents();
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

it('buffers attempts and outcomes with original attribution and individual occurrence times', async () => {
  const { captureReactionContext, trackReactionEvent } = await import('./reactionAnalytics');
  const { trackSearchEvent } = await import('./searchAnalytics');
  const context = captureReactionContext();
  const data = { post_id: 'post-1', reaction_id: 'love', placement: 'compact' as const };
  trackReactionEvent({ name: 'reaction_attempted', ...data, error: 'private-error' } as Parameters<typeof trackReactionEvent>[0], context);
  vi.advanceTimersByTime(1000);
  window.history.pushState(null, '', '/blog/next?private=query');
  trackSearchEvent({ name: 'search_opened', method: 'button' });
  trackReactionEvent({ name: 'reaction_submission_succeeded', ...data }, context);
  const { payloads, track } = installTracker();
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  expect(track).toHaveBeenCalledTimes(3);
  expect(payloads.map(({ name, url, timestamp }) => ({ name, url, timestamp }))).toEqual([
    { name: 'reaction_attempted', url: '/blog/original', timestamp: 1791288000 },
    { name: 'search_opened', url: '/blog/next', timestamp: 1791288001 },
    { name: 'reaction_submission_succeeded', url: '/blog/original', timestamp: 1791288001 },
  ]);
  expect(payloads[0].data).toEqual(data);
  expect(JSON.stringify(payloads)).not.toContain('private');
  expect(payloads[0]).not.toHaveProperty('id');
});

it.each(['throw', 'reject'] as const)('contains tracker %s without retries or blocking', async (failure) => {
  const { captureReactionContext, trackReactionEvent } = await import('./reactionAnalytics');
  const track = vi.fn(() => {
    if (failure === 'throw') {
      throw new Error('Private analytics failure');
    }
    return Promise.reject(new Error('Private analytics failure'));
  });
  vi.stubGlobal('umami', { track });
  const context = captureReactionContext();
  expect(() => trackReactionEvent({ name: 'reaction_attempted', post_id: 'post-1', reaction_id: 'love', placement: 'bottom' }, context)).not.toThrow();
  await Promise.resolve();
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  expect(track).toHaveBeenCalledOnce();
});

it('expires attempts and outcomes and clears timers when readiness never arrives', async () => {
  const { captureReactionContext, trackReactionEvent } = await import('./reactionAnalytics');
  const context = captureReactionContext();
  trackReactionEvent({ name: 'reaction_attempted', post_id: 'post-1', reaction_id: 'love', placement: 'bottom' }, context);
  vi.advanceTimersByTime(60_000);
  const { track } = installTracker();
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  expect(track).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('discards reaction and search events together after script failure', async () => {
  const { captureReactionContext, trackReactionEvent } = await import('./reactionAnalytics');
  const { trackSearchEvent } = await import('./searchAnalytics');
  const { discardPendingAnalyticsEvents } = await import('./analyticsTransport');
  const event = { name: 'reaction_attempted' as const, post_id: 'post-1', reaction_id: 'love', placement: 'bottom' as const };
  trackReactionEvent(event, captureReactionContext());
  trackSearchEvent({ name: 'search_opened', method: 'button' });
  discardPendingAnalyticsEvents();
  const { track } = installTracker();
  trackReactionEvent(event, captureReactionContext());
  window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  expect(track).not.toHaveBeenCalled();
});
