import { enqueueAnalyticsEvent } from './analyticsTransport';

export {
  flushPendingAnalyticsEvents as flushPendingSearchEvents,
  discardPendingAnalyticsEvents as discardPendingSearchEvents,
} from './analyticsTransport';

export type SearchOpenMethod = 'button' | 'shortcut';

type SearchEvent =
  | Readonly<{ name: 'search_opened'; method: SearchOpenMethod }>
  | Readonly<{ name: 'search_completed'; query_length: number; result_count: number }>
  | Readonly<{ name: 'search_result_selected'; post_id: string; result_position: number }>;

export function trackSearchEvent(event: SearchEvent) {
  let data: Readonly<Record<string, string | number>>;
  switch (event.name) {
  case 'search_opened':
    data = { method: event.method };
    break;
  case 'search_completed':
    data = { query_length: event.query_length, result_count: event.result_count };
    break;
  case 'search_result_selected':
    data = { post_id: event.post_id, result_position: event.result_position };
    break;
  }

  enqueueAnalyticsEvent(event.name, data);
}

export function trackSearchResultSelected(result: Readonly<{ id: string }>, index: number) {
  trackSearchEvent({
    name: 'search_result_selected',
    post_id: result.id,
    result_position: index + 1,
  });
}
