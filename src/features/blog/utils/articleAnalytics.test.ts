import type { UmamiPayload } from '@/utils/umami';
import { UMAMI_READY_EVENT } from '@/utils/umami';

const context = { url: '/blog/original', referrer: 'https://source.example/article' };
const defaults = { website: 'site', hostname: 'dangz.dev', url: '/later?private=value', id: 'private-id' };

describe('article analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    const { discardPendingAnalyticsEvents } = await import('@/utils/analyticsTransport');
    discardPendingAnalyticsEvents();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('allowlists copy properties and retains the original context', async () => {
    const { trackHeadingLinkCopied } = await import('./articleAnalytics');
    const payloads: UmamiPayload[] = [];
    const track = vi.fn((payload: (metadata: UmamiPayload) => UmamiPayload) => {
      payloads.push(payload(defaults));
    });
    vi.stubGlobal('umami', { track });
    const event = { post_id: 'post-1', section_id: 'section', copied_url: 'private', heading_text: 'private' };

    trackHeadingLinkCopied(event, context);

    expect(track).toHaveBeenCalledOnce();
    expect(payloads[0]).toMatchObject({
      name: 'heading_link_copied', data: { post_id: 'post-1', section_id: 'section' }, ...context,
    });
    expect(payloads[0].data).toEqual({ post_id: 'post-1', section_id: 'section' });
    expect(JSON.stringify(payloads)).not.toContain('private');
  });

  it('buffers copies until readiness and does not flush twice', async () => {
    const { trackHeadingLinkCopied } = await import('./articleAnalytics');
    trackHeadingLinkCopied({ post_id: 'post-1', section_id: 'section' }, context);
    const track = vi.fn();
    vi.stubGlobal('umami', { track });

    window.dispatchEvent(new Event(UMAMI_READY_EVENT));
    window.dispatchEvent(new Event(UMAMI_READY_EVENT));

    expect(track).toHaveBeenCalledOnce();
  });

  it.each(['throw', 'reject'] as const)('contains tracker %s failures without retrying', async (failure) => {
    const { trackHeadingLinkCopied } = await import('./articleAnalytics');
    const track = vi.fn(() => {
      if (failure === 'throw') {
        throw new Error('Tracker unavailable');
      }
      return Promise.reject(new Error('Collector unavailable'));
    });
    vi.stubGlobal('umami', { track });

    expect(() => trackHeadingLinkCopied({ post_id: 'post-1', section_id: 'section' }, context)).not.toThrow();
    await Promise.resolve();
    window.dispatchEvent(new Event(UMAMI_READY_EVENT));
    expect(track).toHaveBeenCalledOnce();
  });
});
