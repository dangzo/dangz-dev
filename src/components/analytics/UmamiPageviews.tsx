'use client';

import { useLayoutEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { recordPageview } from '@/utils/pageviewAnalytics';

export default function UmamiPageviews() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useLayoutEffect(() => {
    // Capture at commit and preserve browser query encoding rather than reserializing it.
    recordPageview(`${window.location.pathname}${window.location.search}`);
  }, [pathname, search]);

  return null;
}
