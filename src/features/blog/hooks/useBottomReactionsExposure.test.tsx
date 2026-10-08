import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { useBottomReactionsExposure } from './useBottomReactionsExposure';
import { UMAMI_READY_EVENT } from '@/utils/umami';

const route = vi.hoisted(() => ({ pathname: '/blog/first' }));

vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
}));

class ObserverMock implements IntersectionObserver {
  static instances: ObserverMock[] = [];
  readonly root = null;
  readonly rootMargin = '0px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0.25];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => []);

  constructor(private readonly callback: IntersectionObserverCallback) {
    ObserverMock.instances.push(this);
  }

  intersect(isIntersecting = true) {
    act(() => {
      this.callback([{ isIntersecting } as IntersectionObserverEntry], this);
    });
  }
}

function Section({ postId = 'first', ready = true, count = 0 }: Readonly<{
  postId?: string;
  ready?: boolean;
  count?: number;
}>) {
  const ref = useBottomReactionsExposure(postId, ready);

  return (
    ready ? <div ref={ref}>{count}</div> : null
  );
}

function latestObserver() {
  const observer = ObserverMock.instances.at(-1);
  if (!observer) {
    throw new Error('Expected a mounted exposure observer');
  }

  return observer;
}

function signalReady() {
  act(() => {
    window.dispatchEvent(new Event(UMAMI_READY_EVENT));
  });
}

describe('useBottomReactionsExposure', () => {
  beforeEach(() => {
    route.pathname = '/blog/first';
    window.history.replaceState(null, '', route.pathname);
    ObserverMock.instances = [];
    vi.stubGlobal('IntersectionObserver', ObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('dispatches once when visible with an already available tracker', () => {
    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    render(<Section />);

    signalReady();
    latestObserver().intersect(false);
    expect(track).not.toHaveBeenCalled();

    latestObserver().intersect();
    latestObserver().intersect();
    signalReady();

    expect(track).toHaveBeenCalledExactlyOnceWith('post_bottom_reactions_reached', { post_id: 'first' });
    expect(latestObserver().disconnect).toHaveBeenCalled();
  });

  it('retains exposure after leaving the viewport and reaction-count updates', () => {
    const { rerender } = render(<Section />);
    const observer = latestObserver();
    observer.intersect();
    observer.intersect(false);
    rerender(<Section count={12} />);

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    signalReady();

    expect(track).toHaveBeenCalledExactlyOnceWith('post_bottom_reactions_reached', { post_id: 'first' });
    expect(ObserverMock.instances).toHaveLength(1);
  });

  it('observes when reactions finish loading, even if readiness happened earlier', () => {
    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    const { rerender } = render(<Section ready={false} />);
    signalReady();
    expect(ObserverMock.instances).toHaveLength(0);

    rerender(<Section />);
    latestObserver().intersect();
    expect(track).toHaveBeenCalledOnce();
  });

  it('drops an unmounted observation and allows a new mounted visit', () => {
    const { unmount } = render(<Section />);
    const staleObserver = latestObserver();
    staleObserver.intersect();
    unmount();

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    signalReady();
    staleObserver.intersect();
    expect(track).not.toHaveBeenCalled();

    render(<Section />);
    latestObserver().intersect();
    expect(track).toHaveBeenCalledOnce();
  });

  it('drops the previous post and lets its replacement emit independently', () => {
    const { rerender } = render(<Section />);
    const staleObserver = latestObserver();
    staleObserver.intersect();

    route.pathname = '/blog/second';
    window.history.pushState(null, '', route.pathname);
    rerender(<Section postId="second" />);
    latestObserver().intersect();

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    staleObserver.intersect();
    signalReady();

    expect(track).toHaveBeenCalledExactlyOnceWith('post_bottom_reactions_reached', { post_id: 'second' });
  });

  it('cancels a departing visit without rebinding its post ID to the new pathname', () => {
    const { rerender } = render(<Section />);
    latestObserver().intersect();
    route.pathname = '/blog/second';
    window.history.pushState(null, '', route.pathname);
    rerender(<Section />);

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    signalReady();
    expect(track).not.toHaveBeenCalled();

    rerender(<Section postId="second" />);
    latestObserver().intersect();
    expect(track).toHaveBeenCalledExactlyOnceWith('post_bottom_reactions_reached', { post_id: 'second' });
  });

  it('rejects stale attribution when history changes before React cleanup', () => {
    render(<Section />);
    latestObserver().intersect();
    window.history.pushState(null, '', '/blog/second');

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    signalReady();
    window.history.replaceState(null, '', '/blog/first');
    signalReady();
    expect(track).not.toHaveBeenCalled();
  });

  it('keeps hash navigation within the mounted visit', () => {
    render(<Section />);
    latestObserver().intersect();
    window.history.replaceState(null, '', '/blog/first#heading');

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    signalReady();
    expect(track).toHaveBeenCalledOnce();
  });

  it('deduplicates observer and readiness callbacks under Strict Mode', () => {
    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    render(<StrictMode><Section /></StrictMode>);

    ObserverMock.instances[0].intersect();
    latestObserver().intersect();
    signalReady();
    expect(track).toHaveBeenCalledOnce();
  });

  it.each(['throw', 'reject', 'resolve'] as const)('never retries a tracker that will %s', async (outcome) => {
    const track = vi.fn(() => {
      if (outcome === 'throw') {
        throw new Error('Unavailable analytics');
      }

      return (
        outcome === 'reject'
          ? Promise.reject(new Error('Unavailable analytics'))
          : Promise.resolve()
      );
    });
    vi.stubGlobal('umami', { track });
    render(<Section />);
    latestObserver().intersect();

    await act(async () => {});
    latestObserver().intersect();
    signalReady();
    expect(track).toHaveBeenCalledOnce();
  });

  it('tolerates missing analytics and readiness without a callable tracker', () => {
    render(<Section />);
    latestObserver().intersect();
    signalReady();
    vi.stubGlobal('umami', {});
    signalReady();

    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    signalReady();
    expect(track).toHaveBeenCalledOnce();
  });

  it('does not invent exposure when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const track = vi.fn();
    vi.stubGlobal('umami', { track });
    render(<Section />);
    signalReady();
    expect(track).not.toHaveBeenCalled();
  });
});
