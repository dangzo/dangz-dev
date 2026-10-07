import { enqueueAnalyticsEvent, type AnalyticsContext } from '@/utils/analyticsTransport';

const INTERNAL_HOSTS = new Set(['dangz.dev', 'www.dangz.dev', 'localhost', '[::1]']);

export type ArticleOutboundAttributes = Readonly<{
  'data-umami-event': 'outbound_link_clicked';
  'data-umami-event-post_id': string;
  'data-umami-event-destination_host': string;
  'data-umami-event-placement': 'article_body';
}>;

export function articleOutboundAnalytics(postId: string, href: string): ArticleOutboundAttributes | undefined {
  try {
    const url = new URL(href.startsWith('//') ? `https:${href}` : href);
    const isLoopback = /^127\.\d+\.\d+\.\d+$/.test(url.hostname);

    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || INTERNAL_HOSTS.has(url.hostname) || isLoopback) {
      return undefined;
    }

    return {
      'data-umami-event': 'outbound_link_clicked',
      'data-umami-event-post_id': postId,
      'data-umami-event-destination_host': url.hostname,
      'data-umami-event-placement': 'article_body',
    };
  } catch {
    return undefined;
  }
}

export function trackHeadingLinkCopied(
  event: Readonly<{ post_id: string; section_id: string }>,
  context: AnalyticsContext,
) {
  enqueueAnalyticsEvent('heading_link_copied', {
    post_id: event.post_id,
    section_id: event.section_id,
  }, context);
}
