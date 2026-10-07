'use client';

import { useLayoutEffect } from 'react';
import { readPostOpenedData, trackPostOpened } from '@/utils/postDiscoveryAnalytics';

export default function PostDiscoveryAnalytics() {
  useLayoutEffect(() => {
    const onActivation = (event: MouseEvent) => {
      if ((event.type === 'click' && event.button !== 0)
        || (event.type === 'auxclick' && event.button !== 1)) {
        return;
      }

      const target = event.target instanceof Element
        ? event.target
        : event.target instanceof Node ? event.target.parentElement : null;
      const anchor = target?.closest('a[href][data-post-opened-post-id]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const data = readPostOpenedData(anchor);
      if (data) {
        trackPostOpened(data);
      }
    };

    // Capture source metadata before Next handles the link without changing its action.
    document.addEventListener('click', onActivation, true);
    document.addEventListener('auxclick', onActivation, true);

    return () => {
      document.removeEventListener('click', onActivation, true);
      document.removeEventListener('auxclick', onActivation, true);
    };
  }, []);

  return null;
}
