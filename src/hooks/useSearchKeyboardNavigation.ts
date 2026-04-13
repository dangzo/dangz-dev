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

  useEffect(() => {
    if (!isOpen || results.length === 0) {
      setActiveResultIndex(-1);
      return;
    }

    setActiveResultIndex(0);
  }, [isOpen, results]);

  useEffect(() => {
    if (activeResultIndex < 0) {
      return;
    }

    resultLinkRefs.current[activeResultIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeResultIndex]);

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
        const targetIndex = activeResultIndex >= 0 ? activeResultIndex : 0;
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
  }, [activeResultIndex, isOpen, onClose, results, router]);

  return {
    activeResultIndex,
    setActiveResultIndex,
    resultLinkRefs,
  };
}
