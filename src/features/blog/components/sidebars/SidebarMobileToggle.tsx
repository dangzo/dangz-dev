'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface SidebarMobileToggleProps {
  children: React.ReactNode;
  showLabel?: string;
  hideLabel?: string;
  contentId?: string;
}

export default function SidebarMobileToggle({
  children,
  showLabel = 'Show content',
  hideLabel = 'Hide content',
  contentId = 'mobile-toggle-content',
}: SidebarMobileToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="mb-4 inline-flex items-center gap-2 rounded border border-border-light px-3 py-1.5 text-sm font-semibold text-main-light dark:border-border-dark dark:text-main-dark sm:hidden"
      >
        {isOpen ? hideLabel : showLabel}
      </button>

      <div
        id={contentId}
        className={clsx('sm:block', {
          block: isOpen,
          hidden: !isOpen,
        })}
      >
        {children}
      </div>
    </div>
  );
}