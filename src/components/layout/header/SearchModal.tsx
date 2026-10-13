'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRef, type RefObject } from 'react';
import { useTheme } from 'next-themes';
import { filterPaletteCommands } from './paletteCommands';
import { useSearchDialogFocus } from '@/hooks/useSearchDialogFocus';
import styles from './SearchModal.module.css';
import HighlightText from './HighlightText';
import PaletteCommandRow from './PaletteCommandRow';
import { type SearchHit } from '@/features/blog/hooks/useBlogSearch';
import { useSearchKeyboardNavigation } from '@/hooks/useSearchKeyboardNavigation';
import { getSearchShortcutLabel } from './getSearchShortcutLabel';
import { trackSearchResultSelected } from '@/utils/searchAnalytics';

export type { SearchHit };

type SearchModalProps = Readonly<{
  isOpen: boolean;
  query: string;
  results: SearchHit[];
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}>;

const SearchModal = ({
  isOpen,
  query,
  results,
  isLoading,
  inputRef,
  onQueryChange,
  onClose,
}: SearchModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const commands = filterPaletteCommands(query);
  const visibleResults = query.trim().length >= 2 && !isLoading ? results : [];
  const itemIds = [...visibleResults.map((result) => `post-${result.id}`), ...commands.map((command) => command.id)];
  const { activeItemIndex, setActiveItemIndex, itemRefs } = useSearchKeyboardNavigation({
    isOpen, itemIds, query, isLoading, inputRef, onQueryChange,
  });
  useSearchDialogFocus({ isOpen, dialogRef, inputRef });

  const isDark = resolvedTheme === 'dark'
    || (resolvedTheme === undefined && typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const commandRowClassName = (index: number) => {
    return `flex min-h-11 w-full items-center rounded-md px-3 py-1 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 focus-visible:outline-2 focus-visible:outline-primary-500 sm:min-h-9 ${activeItemIndex === index ? 'bg-gray-100 dark:bg-gray-900' : ''}`;
  };

  const rowClassName = (index: number) => {
    return `block w-full text-left rounded-xl border border-border-light/70 dark:border-border-dark/70 px-4 py-3 transition-colors hover:border-primary-500/60 hover:bg-gray-100 dark:hover:border-primary-400/60 dark:hover:bg-gray-900 focus-visible:outline-2 focus-visible:outline-primary-500 ${styles.resultCard} ${activeItemIndex === index ? 'border-primary-500/70 bg-gray-100 dark:border-primary-400/70 dark:bg-gray-900' : ''}`;
  };

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div ref={dialogRef} className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Search posts and commands">
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-white/18 dark:bg-black/45 backdrop-blur-md ${styles.backdrop}`}
      />

      <div
        data-search-panel
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
              placeholder="Search posts or type a command..."
              aria-label="Search posts and commands"
              className="min-w-0 w-full bg-transparent text-base text-main-light dark:text-main-dark outline-none placeholder:text-main-light/60 dark:placeholder:text-main-dark/50"
            />

            <div className="flex shrink-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="hidden lg:inline text-sm font-medium text-main-light/70 dark:text-main-dark/60"
              >
                {getSearchShortcutLabel()}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="hidden lg:inline text-sm font-medium text-main-light dark:text-main-dark hover:text-primary-500 dark:hover:text-primary-400"
              >
                Esc
              </button>
            </div>
          </div>
        </div>

        <div className={`max-h-[58vh] overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 ${styles.resultsSurface}`}>
          {query.trim().length < 2
            ? (
              <p className="mb-6 text-sm text-main-light dark:text-main-dark/80">
              Type a command, or at least 2 characters to search posts.
              </p>
            )
            : null}

          {query.trim().length >= 2 && isLoading
            ? (
              <p className="text-sm text-main-light dark:text-main-dark/80">Searching...</p>
            )
            : null}

          {query.trim().length >= 2 && !isLoading && visibleResults.length === 0 && commands.length === 0
            ? (
              <p className="text-sm text-main-light dark:text-main-dark/80">
              No posts or commands found for "{query.trim()}".
              </p>
            )
            : null}

          {visibleResults.length > 0
            ? (
              <>
                <p className="mb-4 text-xs text-main-light/70 dark:text-main-dark/60">
                Posts — Use arrow keys to select and Enter to open
                </p>
                <ul className="space-y-3">
                  {visibleResults.map((result, index) => (
                    <li key={result.id}>
                      <Link
                        href={`/blog/${result.slug}`}
                        onClick={() => {
                          trackSearchResultSelected(result, index);
                          onClose();
                        }}
                        onAuxClick={(event) => {
                          if (event.button === 1) {
                            trackSearchResultSelected(result, index);
                          }
                        }}
                        ref={(element) => {
                          itemRefs.current[index] = element;
                        }}
                        onMouseEnter={() => {
                          setActiveItemIndex(index);
                        }}
                        onFocus={() => setActiveItemIndex(index)}
                        className={rowClassName(index)}
                      >
                        <p className="font-semibold text-main-light dark:text-main-dark">
                          <HighlightText text={result.title || 'Untitled post'} query={query} />
                        </p>
                        {result.excerpt
                          ? (
                            <p className="mt-1 text-sm text-main-light/85 dark:text-main-dark/80 line-clamp-2">
                              <HighlightText text={result.excerpt} query={query} />
                            </p>
                          )
                          : null}
                        {result.primaryTopic
                          ? (
                            <p className="mt-2 text-xs text-primary-500 dark:text-primary-400">
                              <HighlightText text={result.primaryTopic.displayName} query={query} />
                            </p>
                          )
                          : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )
            : null}
          {commands.length > 0
            ? (
              <section aria-label="Commands" className={visibleResults.length > 0 ? 'mt-5' : ''}>
                <h2 className="mb-2 text-xs font-medium text-main-light/70 dark:text-main-dark/60">
                  Commands — Use arrow keys to select and Enter to run
                </h2>
                <ul>
                  {commands.map((command, commandIndex) => {
                    const index = visibleResults.length + commandIndex;

                    return (
                      <li key={command.id}>
                        <PaletteCommandRow
                          command={command}
                          className={commandRowClassName(index)}
                          elementRef={(element) => {
                            itemRefs.current[index] = element;
                          }}
                          onSelect={() => setActiveItemIndex(index)}
                          onClose={onClose}
                          onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )
            : null}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default SearchModal;
