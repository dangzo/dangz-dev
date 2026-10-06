import { UMAMI_READY_EVENT, type UmamiPayload, type UmamiWindow } from './umami';

export type AnalyticsContext = Readonly<{ url: string; referrer: string }>;

type PendingEvent = Readonly<{
  name: string;
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
    window.addEventListener(UMAMI_READY_EVENT, flushPendingAnalyticsEvents);
    expiryTimer = window.setTimeout(prunePendingEvents, pendingEvents[0].expiresAt - Date.now());
  } else {
    window.removeEventListener(UMAMI_READY_EVENT, flushPendingAnalyticsEvents);
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

export function flushPendingAnalyticsEvents() {
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

export function discardPendingAnalyticsEvents() {
  trackerFailed = true;
  pendingEvents = [];

  if (typeof window !== 'undefined') {
    window.clearTimeout(expiryTimer);
    window.removeEventListener(UMAMI_READY_EVENT, flushPendingAnalyticsEvents);
    expiryTimer = undefined;
  }
}

export function captureAnalyticsContext(): AnalyticsContext {
  return {
    url: typeof window === 'undefined' ? '' : window.location.pathname,
    referrer: typeof document === 'undefined' ? '' : safeReferrer(),
  };
}

export function enqueueAnalyticsEvent(
  name: string,
  data: Readonly<Record<string, string | number>>,
  context: AnalyticsContext = captureAnalyticsContext(),
) {
  if (typeof window === 'undefined' || trackerFailed) {
    return;
  }

  pendingEvents.push({
    name,
    data,
    ...context,
    timestamp: Math.floor(Date.now() / 1000),
    expiresAt: Date.now() + RETENTION_MS,
  });
  pendingEvents = pendingEvents.slice(-MAX_PENDING_EVENTS);
  flushPendingAnalyticsEvents();
}
