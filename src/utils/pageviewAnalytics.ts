import type { UmamiPayload, UmamiWindow } from './umami';

type Pageview = Readonly<{
  url: string;
  referrer: string;
  title: string;
  timestamp: number;
  expiresAt: number;
}>;

const MAX_PENDING_VIEWS = 50;
const RETENTION_MS = 60_000;
let pendingViews: Pageview[] = [];
let previousUrl: string | undefined;
let expiryTimer: number | undefined;
let trackerFailed = false;

function normalizeReferrer(raw: string) {
  if (!raw) {
    return '';
  }

  try {
    const url = new URL(raw);
    url.hash = '';

    return url.origin === window.location.origin ? `${url.pathname}${url.search}` : url.href;
  } catch {
    return '';
  }
}

function prunePendingViews() {
  window.clearTimeout(expiryTimer);
  expiryTimer = undefined;
  pendingViews = pendingViews.filter((view) => view.expiresAt > Date.now());

  if (pendingViews.length > 0) {
    expiryTimer = window.setTimeout(prunePendingViews, pendingViews[0].expiresAt - Date.now());
  }
}

export function flushPendingPageviews() {
  if (typeof window === 'undefined' || trackerFailed) {
    return;
  }

  prunePendingViews();
  const tracker = (window as UmamiWindow).umami;
  if (typeof tracker?.track !== 'function') {
    return;
  }

  const views = pendingViews;
  pendingViews = [];
  prunePendingViews();

  for (const view of views) {
    const payload = (defaults: UmamiPayload): UmamiPayload => {
      return {
        ...defaults,
        url: view.url,
        referrer: view.referrer,
        title: view.title,
        timestamp: view.timestamp,
      };
    };

    try {
      // An attempted send is terminal; tracker resolution does not acknowledge ingestion.
      void Promise.resolve(tracker.track(payload)).catch(() => {});
    } catch {
      // Analytics must not interrupt navigation or retry a possibly delivered view.
    }
  }
}

export function discardPendingPageviews() {
  trackerFailed = true;
  pendingViews = [];

  if (typeof window !== 'undefined') {
    window.clearTimeout(expiryTimer);
    expiryTimer = undefined;
  }
}

export function recordPageview(route: string) {
  if (typeof window === 'undefined' || trackerFailed) {
    return;
  }

  const url = new URL(route, window.location.origin);
  url.hash = '';

  // Document-scoped state survives effect replay and readiness callbacks, but allows return visits.
  if (url.href === previousUrl) {
    return;
  }

  pendingViews.push({
    url: url.href,
    referrer: normalizeReferrer(previousUrl ?? document.referrer),
    title: document.title,
    timestamp: Math.floor(Date.now() / 1000),
    expiresAt: Date.now() + RETENTION_MS,
  });
  previousUrl = url.href;
  pendingViews = pendingViews.slice(-MAX_PENDING_VIEWS);
  flushPendingPageviews();
}
