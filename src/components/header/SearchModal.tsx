'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import styles from './SearchModal.module.css';

export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

type SearchModalProps = {
  isMounted: boolean;
  isOpen: boolean;
  query: string;
  results: SearchHit[];
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onClose: () => void;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text: string, query: string): ReactNode => {
  const terms = Array.from(
    new Set(
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length >= 2),
    ),
  );

  if (!text || terms.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const isMatch = terms.includes(part.toLowerCase());
    if (!isMatch) {
      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    }

    return (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-primary-100 px-0.5 text-main-light dark:bg-primary-900/55 dark:text-main-dark"
      >
        {part}
      </mark>
    );
  });
};

const SearchModal = ({
  isMounted,
  isOpen,
  query,
  results,
  isLoading,
  inputRef,
  onQueryChange,
  onClose,
}: SearchModalProps) => {
  const router = useRouter();
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const resultLinkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    if (!isOpen || results.length === 0) {
      setActiveResultIndex(-1);
      return;
    }

    setActiveResultIndex(0);
  }, [isOpen, query, results]);

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

  if (!isMounted || !isOpen) {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Search posts">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className={`absolute inset-0 bg-white/18 dark:bg-black/45 backdrop-blur-md ${styles.backdrop}`}
      />

      <div
        className={`absolute left-1/2 top-[12vh] w-[min(90vw,780px)] max-h-[76vh] overflow-hidden rounded-2xl border border-border-light/80 dark:border-border-dark/80 shadow-[0_24px_80px_rgba(15,23,42,0.16)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.55)] ${styles.popover}`}
      >
        <div className={`border-b border-border-light/70 dark:border-border-dark/70 px-4 py-4 sm:px-6 ${styles.headerSurface}`}>
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-main-light dark:text-main-dark"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search titles, tags, content..."
              className="w-full bg-transparent text-base text-main-light dark:text-main-dark outline-none placeholder:text-main-light/60 dark:placeholder:text-main-dark/50"
            />

            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-main-light dark:text-main-dark hover:text-primary-500 dark:hover:text-primary-400"
            >
              Esc
            </button>
          </div>
        </div>

        <div className={`max-h-[58vh] overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 ${styles.resultsSurface}`}>
          {query.trim().length < 2 ? (
            <p className="text-sm text-main-light dark:text-main-dark/80">
              Type at least 2 characters to search posts.
            </p>
          ) : null}

          {query.trim().length >= 2 && isLoading ? (
            <p className="text-sm text-main-light dark:text-main-dark/80">Searching...</p>
          ) : null}

          {query.trim().length >= 2 && !isLoading && results.length === 0 ? (
            <p className="text-sm text-main-light dark:text-main-dark/80">
              No results found for "{query.trim()}".
            </p>
          ) : null}

          {!isLoading && results.length > 0 ? (
            <>
              <p className="mb-4 text-xs text-main-light/70 dark:text-main-dark/60">
                Tip: Use keyboard [Arrow Keys] to move between results, [Enter] to open.
              </p>
              <ul className="space-y-3">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <Link
                      href={`/blog/${result.slug}`}
                      onClick={onClose}
                      ref={(element) => {
                        resultLinkRefs.current[index] = element;
                      }}
                      onMouseEnter={() => {
                        setActiveResultIndex(index);
                      }}
                      className={`block rounded-xl border border-border-light/70 dark:border-border-dark/70 px-4 py-3 transition-colors hover:border-primary-500/60 hover:bg-gray-100 dark:hover:border-primary-400/60 dark:hover:bg-gray-900 ${styles.resultCard} ${activeResultIndex === index ? 'border-primary-500/70 bg-gray-100 dark:border-primary-400/70 dark:bg-gray-900' : ''}`}
                    >
                      <p className="font-semibold text-main-light dark:text-main-dark">
                        {highlightText(result.title || 'Untitled post', query)}
                      </p>
                      {result.excerpt ? (
                        <p className="mt-1 text-sm text-main-light/85 dark:text-main-dark/80 line-clamp-2">
                          {highlightText(result.excerpt, query)}
                        </p>
                      ) : null}
                      {result.tags.length > 0 ? (
                        <p className="mt-2 text-xs text-primary-500 dark:text-primary-400">
                          {result.tags.map((tag, index) => (
                            <Fragment key={`${tag}-${index}`}>
                              {index > 0 ? ' • ' : null}
                              {highlightText(tag, query)}
                            </Fragment>
                          ))}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default SearchModal;
