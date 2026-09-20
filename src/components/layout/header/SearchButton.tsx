'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getSearchShortcutLabel } from './getSearchShortcutLabel';

const SearchModalBridge = dynamic(() => import('./SearchModalBridge'), {
  ssr: false,
});

const subscribeToNothing = () => {
  return () => {
    // Shortcut label is derived from the platform and does not change at runtime.
  };
};

const SearchButton = () => {
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openRequest, setOpenRequest] = useState(0);
  const [closeRequest, setCloseRequest] = useState(0);
  const shortcutLabel = useSyncExternalStore(
    subscribeToNothing,
    getSearchShortcutLabel,
    () => 'Ctrl+K',
  );

  const openSearch = () => {
    if (!isSearchEnabled) {
      setIsSearchEnabled(true);
    }

    setOpenRequest((current) => current + 1);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') {
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      event.preventDefault();

      if (isOpen) {
        setCloseRequest((current) => current + 1);
        return;
      }

      setIsSearchEnabled(true);
      setOpenRequest((current) => current + 1);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Search"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-keyshortcuts="Control+K Meta+K"
          className="flex h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-md lg:w-auto lg:px-3"
          onClick={openSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 text-main-light hover:text-primary-500 dark:text-main-dark dark:hover:text-primary-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span
            aria-hidden="true"
            className="hidden text-[10px] font-medium leading-none text-main-light/60 dark:text-main-dark/50 lg:inline"
          >
            {shortcutLabel}
          </span>
        </button>
      </div>

      {isSearchEnabled
        ? (
          <SearchModalBridge
            openRequest={openRequest}
            closeRequest={closeRequest}
            onOpenChange={setIsOpen}
          />
        )
        : null}
    </>
  );
};

export default SearchButton;
