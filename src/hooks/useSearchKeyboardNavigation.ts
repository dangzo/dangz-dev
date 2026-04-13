'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchHit } from './useBlogSearch';

type UseSearchKeyboardNavigationOptions = {
  isOpen: boolean;
  results: SearchHit[];
  onClose: () => void;
};

export function useSearchKeyboardNavigation({
  isOpen,
  results,
  onClose,
}: UseSearchKeyboardNavigationOptions) {
  const router = useRouter();
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const resultLinkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const safeActiveResultIndex =
    activeResultIndex >= 0 && activeResultIndex < results.length ? activeResultIndex : -1;

  useEffect(() => {
    if (safeActiveResultIndex < 0) {
      return;
    }

    resultLinkRefs.current[safeActiveResultIndex]?.scrollIntoView({ block: 'nearest' });
  }, [safeActiveResultIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (results.length === 0) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveResultIndex((prev) => (prev < 0 ? 0 : (prev + 1) % results.length));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveResultIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const targetIndex = safeActiveResultIndex >= 0 ? safeActiveResultIndex : 0;
        const selectedResult = results[targetIndex];
        if (!selectedResult) {
          return;
        }

        onClose();
        router.push(`/blog/${selectedResult.slug}`);
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [isOpen, onClose, results, router, safeActiveResultIndex]);

  return {
    activeResultIndex: safeActiveResultIndex,
    setActiveResultIndex,
    resultLinkRefs,
  };
}
