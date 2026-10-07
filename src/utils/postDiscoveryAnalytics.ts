import { enqueueAnalyticsEvent } from './analyticsTransport';

export type PostOpenSource = 'home' | 'blog' | 'topic';
export type PostOpenPlacement = 'title' | 'cta' | 'reaction_summary';
export type PostOpenedData = Readonly<{
  post_id: string;
  source: PostOpenSource;
  placement: PostOpenPlacement;
}>;

export function getPostOpenedAttributes(data: PostOpenedData) {
  return {
    'data-post-opened-post-id': data.post_id,
    'data-post-opened-source': data.source,
    'data-post-opened-placement': data.placement,
  };
}

export function readPostOpenedData(anchor: HTMLAnchorElement): PostOpenedData | null {
  const postId = anchor.dataset.postOpenedPostId;
  const source = anchor.dataset.postOpenedSource;
  const placement = anchor.dataset.postOpenedPlacement;

  if (!postId?.trim()
    || (source !== 'home' && source !== 'blog' && source !== 'topic')
    || (placement !== 'title' && placement !== 'cta' && placement !== 'reaction_summary')) {
    return null;
  }

  return { post_id: postId, source, placement };
}

export function trackPostOpened(data: PostOpenedData) {
  enqueueAnalyticsEvent('post_opened', {
    post_id: data.post_id,
    source: data.source,
    placement: data.placement,
  });
}
