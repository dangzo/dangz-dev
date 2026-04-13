'use client';

import { useEffect, useRef, useState } from 'react';

export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export function useBlogSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestRequestIdRef = useRef(0);

  const closeSearch = () => {
    latestRequestIdRef.current += 1;
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setIsLoading(false);
  };

  const openSearch = () => setIsOpen(true);

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

        const data = (await response.json()) as { results?: SearchHit[] };
        if (isCurrentRequest()) {
          setResults(data.results ?? []);
        }
      } catch (error) {
        if (controller.signal.aborted || !isCurrentRequest()) {
          return;
        }

        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults([]);
        }
      } finally {
        setIsLoading(false);
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
