'use client';

import Script from 'next/script';
import { UMAMI_READY_EVENT } from '@/utils/umami';
import { discardPendingAnalyticsEvents, flushPendingAnalyticsEvents } from '@/utils/analyticsTransport';

export default function UmamiScript() {
  return (
    <Script
      strategy="lazyOnload"
      src="https://cloud.umami.is/script.js"
      data-website-id="546ca232-1b93-4b09-862d-8aebf53123d0"
      onReady={() => {
        flushPendingAnalyticsEvents();
        window.dispatchEvent(new Event(UMAMI_READY_EVENT));
      }}
      onError={discardPendingAnalyticsEvents}
    />
  );
}
