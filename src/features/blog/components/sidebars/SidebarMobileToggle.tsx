'use client';

import { createContext, useContext, useState } from 'react';
import clsx from 'clsx';

interface SidebarMobileToggleProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  showLabel?: string;
  hideLabel?: string;
  contentId?: string;
  defaultOpen?: boolean;
}

interface SidebarMobileContextValue {
  close: () => void;
  isOpen: boolean;
}

const SidebarMobileContext = createContext<SidebarMobileContextValue | null>(null);

export function useSidebarMobileClose() {
  return useContext(SidebarMobileContext)?.close;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={clsx('size-5 shrink-0 text-secondary-light transition-transform duration-200 dark:text-secondary-dark', {
        'rotate-180': isOpen,
      })}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SidebarMobileToggle({
  children,
  header,
  showLabel = 'Show content',
  hideLabel = 'Hide content',
  contentId = 'mobile-toggle-content',
  defaultOpen = false,
}: SidebarMobileToggleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const close = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <SidebarMobileContext.Provider value={{ close, isOpen }}>
      <div>
        {header && (
          <div className="mb-4 hidden border-b border-border-light pb-4 dark:border-border-dark md:block">
            {header}
          </div>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className={clsx(
            'flex w-full items-center gap-3 text-left transition-colors md:hidden',
            header
              ? 'rounded-lg px-1 py-2 active:bg-background-main-light/80 dark:active:bg-background-main-dark/50'
              : 'mb-4 rounded-lg border border-border-light bg-background-main-light px-4 py-3 dark:border-border-dark dark:bg-background-main-dark',
          )}
        >
          {header
            ? (
              <>
                <div className="min-w-0 flex-1">{header}</div>
                <ChevronIcon isOpen={isOpen} />
              </>
            )
            : (
              <>
                <span className="flex-1 text-sm font-semibold text-main-light dark:text-main-dark">
                  {isOpen ? hideLabel : showLabel}
                </span>
                <ChevronIcon isOpen={isOpen} />
              </>
            )}
        </button>

        <div
          id={contentId}
          className={clsx('md:block', {
            'mt-4 block': isOpen,
            hidden: !isOpen,
          })}
        >
          {children}
        </div>
      </div>
    </SidebarMobileContext.Provider>
  );
}
