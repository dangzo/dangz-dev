'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { UMAMI_READY_EVENT, type UmamiWindow } from '@/utils/umami';

interface ExposureVisit {
  readonly postId: string;
  readonly pathname: string;
  status: 'unobserved' | 'pending' | 'attempted' | 'cancelled';
  flush?: () => void;
}

export function useBottomReactionsExposure(postId: string, hasReactions: boolean) {
  const pathname = usePathname();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const visitRef = useRef<ExposureVisit | null>(null);

  useEffect(() => {
    if (!visitRef.current || visitRef.current.postId !== postId) {
      visitRef.current = {
        postId,
        pathname: window.location.pathname,
        status: 'unobserved',
      };
    }

    const visit = visitRef.current;
    let isActive = true;

    const flush = () => {
      if (!isActive || visit.status === 'cancelled' || visit.status === 'attempted') {
        return;
      }

      // History can change before React cleans up the previous article.
      if (window.location.pathname !== visit.pathname || (pathname !== null && pathname !== visit.pathname)) {
        visit.status = 'cancelled';
        window.removeEventListener(UMAMI_READY_EVENT, flush);
        return;
      }

      const umami = (window as UmamiWindow).umami;
      if (visit.status !== 'pending' || typeof umami?.track !== 'function') {
        return;
      }

      // An attempt is terminal: tracker resolution does not acknowledge ingestion.
      visit.status = 'attempted';
      window.removeEventListener(UMAMI_READY_EVENT, flush);

      try {
        void Promise.resolve(umami.track('post_bottom_reactions_reached', { post_id: visit.postId })).catch(() => {});
      } catch {
        // Analytics must not interfere with reaction controls.
      }
    };

    visit.flush = flush;
    if (visit.status === 'attempted' || visit.status === 'cancelled') {
      return;
    }

    window.addEventListener(UMAMI_READY_EVENT, flush);
    flush();

    return () => {
      isActive = false;
      window.removeEventListener(UMAMI_READY_EVENT, flush);
      visit.flush = undefined;

      if (visit.status === 'pending') {
        visit.status = 'unobserved';
      }
    };
  }, [postId, pathname]);

  useEffect(() => {
    const element = sectionRef.current;
    const visit = visitRef.current;
    if (!hasReactions || !element || !visit || visit.status !== 'unobserved' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    let isActive = true;
    const observer = new IntersectionObserver((entries) => {
      if (!isActive || visit.status !== 'unobserved' || !entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      visit.status = 'pending';
      observer.disconnect();
      visit.flush?.();
    }, { threshold: 0.25 });

    observer.observe(element);

    return () => {
      isActive = false;
      observer.disconnect();
    };
  }, [postId, pathname, hasReactions]);

  return sectionRef;
}
