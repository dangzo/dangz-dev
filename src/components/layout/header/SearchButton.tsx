'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getSearchShortcutLabel } from './getSearchShortcutLabel';

const SearchModalBridge = dynamic(() => import('./SearchModalBridge'), {
  ssr: false,
});

const SearchButton = () => {
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openRequest, setOpenRequest] = useState(0);
  const [closeRequest, setCloseRequest] = useState(0);
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl+K');

  const openSearch = () => {
    if (!isSearchEnabled) {
      setIsSearchEnabled(true);
    }

    setOpenRequest((current) => current + 1);
  };

  useEffect(() => {
    setShortcutLabel(getSearchShortcutLabel());
  }, []);

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
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          aria-label="Search"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-keyshortcuts="Control+K Meta+K"
          className="cursor-pointer"
          onClick={openSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="hover:text-primary-500 dark:hover:text-primary-400 h-6 w-6 text-main-light dark:text-main-dark"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
        <span
          aria-hidden="true"
          className="text-[10px] leading-none font-medium text-main-light/60 dark:text-main-dark/50"
        >
          {shortcutLabel}
        </span>
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
