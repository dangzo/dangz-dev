'use client';

import { useEffect, useRef, useState } from 'react';
import type { TopicSummary } from '@/features/blog/types/Topic.types';
import { trackSearchEvent, type SearchOpenMethod } from '@/utils/searchAnalytics';

export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  primaryTopic: TopicSummary | null;
};

export function useBlogSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestRequestIdRef = useRef(0);
  const pendingOpenMethodRef = useRef<SearchOpenMethod | null>(null);
  const previouslyOpenRef = useRef(false);

  const closeSearch = () => {
    latestRequestIdRef.current += 1;
    pendingOpenMethodRef.current = null;
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setIsLoading(false);
  };

  const openSearch = (method: SearchOpenMethod = 'button') => {
    if (!isOpen && pendingOpenMethodRef.current === null) {
      pendingOpenMethodRef.current = method;
    }

    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen && !previouslyOpenRef.current) {
      trackSearchEvent({ name: 'search_opened', method: pendingOpenMethodRef.current ?? 'button' });
      pendingOpenMethodRef.current = null;
    }

    previouslyOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
   
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    const isCurrentRequest = () => {
      return latestRequestIdRef.current === requestId && !controller.signal.aborted;
    };

    const timeout = window.setTimeout(async () => {
      if (!isCurrentRequest()) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
            cache: 'no-store',
          },
        );

        if (!isCurrentRequest()) {
          return;
        }

        if (!response.ok) {
          if (isCurrentRequest()) {
            setResults([]);
          }
          return;
        }

        const data: unknown = await response.json();
        if (isCurrentRequest()) {
          if (typeof data !== 'object' || data === null || !('results' in data) || !Array.isArray(data.results)) {
            setResults([]);
            return;
          }

          setResults(data.results as SearchHit[]);
          trackSearchEvent({
            name: 'search_completed',
            query_length: trimmedQuery.length,
            result_count: data.results.length,
          });
        }
      } catch (error) {
        if (controller.signal.aborted || !isCurrentRequest()) {
          return;
        }

        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults([]);
        }
      } finally {
        if (isCurrentRequest()) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, isOpen]);

  return {
    isOpen,
    query,
    results,
    isLoading,
    inputRef,
    openSearch,
    closeSearch,
    setQuery,
  };
}
