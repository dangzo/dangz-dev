'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
import { SidebarMobileContext } from './SidebarMobileContext';

interface SidebarMobileToggleProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  showLabel?: string;
  hideLabel?: string;
  contentId?: string;
  defaultOpen?: boolean;
  desktopBreakpoint?: 'md' | 'xl';
  closeOnEscape?: boolean;
}

function ChevronIcon({ isOpen }: Readonly<{ isOpen: boolean }>) {
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
  desktopBreakpoint = 'md',
  closeOnEscape = false,
}: Readonly<SidebarMobileToggleProps>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <SidebarMobileContext.Provider value={{ close, isOpen }}>
      <div
        onKeyDown={(event) => {
          const desktopWidth = desktopBreakpoint === 'xl' ? 1280 : 768;

          if (closeOnEscape && isOpen && event.key === 'Escape' && !window.matchMedia(`(min-width: ${desktopWidth}px)`).matches) {
            event.preventDefault();
            close();
            toggleRef.current?.focus();
          }
        }}
      >
        {header && (
          <div className={clsx('hidden border-b border-border-light dark:border-border-dark', {
            'mb-4 pb-4 md:block': desktopBreakpoint === 'md',
            'mb-3 pb-3 xl:block': desktopBreakpoint === 'xl',
          })}>
            {header}
          </div>
        )}

        <button
          type="button"
          ref={toggleRef}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className={clsx('mb-0 flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors active:bg-background-main-light/80 dark:active:bg-background-main-dark/50', {
            'md:hidden': desktopBreakpoint === 'md',
            'xl:hidden': desktopBreakpoint === 'xl',
          })}
        >
          <span className="min-w-0 flex-1 text-sm font-semibold text-main-light dark:text-main-dark">
            {isOpen ? hideLabel : showLabel}
          </span>
          <ChevronIcon isOpen={isOpen} />
        </button>

        <div
          id={contentId}
          className={clsx({
            'md:block': desktopBreakpoint === 'md',
            'xl:block': desktopBreakpoint === 'xl',
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
