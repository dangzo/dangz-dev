import type { UmamiPayload, UmamiWindow } from './umami';

export type SearchOpenMethod = 'button' | 'shortcut';

type SearchEvent =
  | Readonly<{ name: 'search_opened'; method: SearchOpenMethod }>
  | Readonly<{ name: 'search_completed'; query_length: number; result_count: number }>
  | Readonly<{ name: 'search_result_selected'; post_id: string; result_position: number }>;

type PendingEvent = Readonly<{
  name: SearchEvent['name'];
  data: Readonly<Record<string, string | number>>;
  url: string;
  referrer: string;
  timestamp: number;
  expiresAt: number;
}>;

const MAX_PENDING_EVENTS = 50;
const RETENTION_MS = 60_000;
let pendingEvents: PendingEvent[] = [];
let expiryTimer: number | undefined;
let trackerFailed = false;

const safeReferrer = () => {
  if (!document.referrer) {
    return '';
  }

  try {
    const referrer = new URL(document.referrer);
    return `${referrer.origin}${referrer.pathname}`;
  } catch {
    return '';
  }
};

const prunePendingEvents = () => {
  window.clearTimeout(expiryTimer);
  expiryTimer = undefined;
  pendingEvents = pendingEvents.filter((event) => event.expiresAt > Date.now());

  if (pendingEvents.length > 0) {
    expiryTimer = window.setTimeout(prunePendingEvents, pendingEvents[0].expiresAt - Date.now());
  }
};

const dispatchEvent = (event: PendingEvent) => {
  const tracker = (window as UmamiWindow).umami;
  if (typeof tracker?.track !== 'function') {
    return false;
  }

  try {
    // Only safe metadata is inherited; delivery may follow a client-side navigation.
    const payload = (defaults: UmamiPayload): UmamiPayload => {
      return {
        website: defaults.website,
        hostname: defaults.hostname,
        language: defaults.language,
        screen: defaults.screen,
        url: event.url,
        referrer: event.referrer,
        timestamp: event.timestamp,
        name: event.name,
        data: event.data,
      };
    };

    void Promise.resolve(tracker.track(payload)).catch(() => {});
  } catch {
    // An attempted send is terminal; retrying could count the same action twice.
  }

  return true;
};

export function flushPendingSearchEvents() {
  if (typeof window === 'undefined') {
    return;
  }

  prunePendingEvents();
  const events = pendingEvents;
  pendingEvents = [];

  for (const event of events) {
    if (!dispatchEvent(event)) {
      pendingEvents.push(event);
    }
  }

  prunePendingEvents();
}

export function discardPendingSearchEvents() {
  trackerFailed = true;
  pendingEvents = [];

  if (typeof window !== 'undefined') {
    window.clearTimeout(expiryTimer);
    expiryTimer = undefined;
  }
}

export function trackSearchEvent(event: SearchEvent) {
  if (typeof window === 'undefined' || trackerFailed) {
    return;
  }

  let data: PendingEvent['data'];
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

  pendingEvents.push({
    name: event.name,
    data,
    url: window.location.pathname,
    referrer: safeReferrer(),
    timestamp: Math.floor(Date.now() / 1000),
    expiresAt: Date.now() + RETENTION_MS,
  });
  pendingEvents = pendingEvents.slice(-MAX_PENDING_EVENTS);
  flushPendingSearchEvents();
}

export function trackSearchResultSelected(result: Readonly<{ id: string }>, index: number) {
  trackSearchEvent({
    name: 'search_result_selected',
    post_id: result.id,
    result_position: index + 1,
  });
}
