import { render, screen } from '@testing-library/react';
import type { ScriptProps } from 'next/script';
import UmamiScript from './UmamiScript';
import { UMAMI_READY_EVENT } from '@/utils/umami';
import { discardPendingAnalyticsEvents, flushPendingAnalyticsEvents } from '@/utils/analyticsTransport';
import { discardPendingPageviews, flushPendingPageviews, recordPageview } from '@/utils/pageviewAnalytics';

vi.mock('@/utils/pageviewAnalytics', () => ({
  discardPendingPageviews: vi.fn(),
  flushPendingPageviews: vi.fn(),
  recordPageview: vi.fn(),
}));

vi.mock('@/utils/analyticsTransport', () => ({
  discardPendingAnalyticsEvents: vi.fn(),
  flushPendingAnalyticsEvents: vi.fn(),
}));

const script = vi.hoisted(() => ({
  onReady: undefined as ScriptProps['onReady'],
  onError: undefined as ScriptProps['onError'],
}));

vi.mock('next/script', () => ({
  default: ({ onReady, onError, ...props }: Readonly<ScriptProps>) => {
    script.onReady = onReady;
    script.onError = onError;

    return (
      <script data-testid="umami-script" {...props} />
    );
  },
}));

it('preserves the tracker configuration and announces script readiness', () => {
  const onReady = vi.fn();
  window.addEventListener(UMAMI_READY_EVENT, onReady);

  try {
    render(<UmamiScript />);
    const element = screen.getByTestId('umami-script');
    expect(element).toHaveAttribute('src', 'https://cloud.umami.is/script.js');
    expect(element).toHaveAttribute('strategy', 'lazyOnload');
    expect(element).toHaveAttribute('data-website-id', '546ca232-1b93-4b09-862d-8aebf53123d0');
    expect(element).toHaveAttribute('data-auto-pageview', 'false');
    expect(element).toHaveAttribute('data-exclude-hash', 'true');
    expect(element).not.toHaveAttribute('data-auto-track');
    expect(onReady).not.toHaveBeenCalled();
    expect(recordPageview).toHaveBeenCalledWith(`${location.pathname}${location.search}`);

    script.onReady?.();
    expect(onReady).toHaveBeenCalledOnce();
    expect(flushPendingAnalyticsEvents).toHaveBeenCalledOnce();
    expect(flushPendingPageviews).toHaveBeenCalledOnce();
  } finally {
    window.removeEventListener(UMAMI_READY_EVENT, onReady);
  }
});

it('discards queued pageviews and analytics events when the script fails', () => {
  render(<UmamiScript />);
  script.onError?.(new Error('Blocked'));
  expect(discardPendingAnalyticsEvents).toHaveBeenCalledOnce();
  expect(discardPendingPageviews).toHaveBeenCalledOnce();
});

it('supports an isolated fixture website ID', () => {
  render(<UmamiScript websiteId="fixture-site" />);
  expect(screen.getByTestId('umami-script')).toHaveAttribute('data-website-id', 'fixture-site');
});
