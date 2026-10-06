'use client';

import Script from 'next/script';
import { useLayoutEffect } from 'react';
import { UMAMI_READY_EVENT } from '@/utils/umami';
import { discardPendingAnalyticsEvents, flushPendingAnalyticsEvents } from '@/utils/analyticsTransport';
import { discardPendingPageviews, flushPendingPageviews, recordPageview } from '@/utils/pageviewAnalytics';

export default function UmamiScript({
  websiteId = '546ca232-1b93-4b09-862d-8aebf53123d0',
}: Readonly<{ websiteId?: string }>) {
  useLayoutEffect(() => {
    // The route observer's Suspense boundary can hydrate after the first navigation.
    recordPageview(`${window.location.pathname}${window.location.search}`);
  }, []);

  return (
    <Script
      strategy="lazyOnload"
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      data-exclude-hash="true"
      data-auto-pageview="false"
      onReady={() => {
        flushPendingPageviews();
        flushPendingAnalyticsEvents();
        window.dispatchEvent(new Event(UMAMI_READY_EVENT));
      }}
      onError={() => {
        discardPendingPageviews();
        discardPendingAnalyticsEvents();
      }}
    />
  );
}
