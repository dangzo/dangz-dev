'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Link } from '@/components/ui';
import type { TocItem } from '@/features/blog/hooks/usePostInsights';
import { useSidebarMobileClose } from './SidebarMobileToggle';

interface ToCNavProps {
  items: TocItem[];
}

const SCROLL_OFFSET = 112;

export default function ToCNav({ items }: Readonly<ToCNavProps>) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const closeSidebar = useSidebarMobileClose();

  useEffect(() => {
    const headingElements = items
      .map(item => ({ id: item.id, element: document.getElementById(item.id) }))
      .filter((item): item is { id: string; element: HTMLElement } => item.element !== null);

    if (headingElements.length === 0) {
      return;
    }

    const updateActiveHeading = () => {
      const scrollPosition = window.scrollY + SCROLL_OFFSET;
      let currentId = headingElements[0].id;

      for (const { id, element } of headingElements) {
        if (element.offsetTop <= scrollPosition) {
          currentId = id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
    };
  }, [items]);

  const handleItemClick = () => {
    closeSidebar?.();
  };

  return (
    <nav aria-label="Table of contents">
      <ul className="relative ml-0.5 space-y-1 border-l-2 border-border-light dark:border-border-dark md:space-y-0.5">
        {items.map(item => {
          const isActive = activeId === item.id;

          return (
            <li
              key={item.id}
              className={clsx({
                'pl-2 md:pl-3': item.level === 2,
                'pl-5 md:pl-6': item.level === 3,
              })}
            >
              <Link
                href={`#${item.id}`}
                type="secondary"
                size="small"
                aria-current={isActive ? 'location' : undefined}
                onClick={handleItemClick}
                className={clsx(
                  'block rounded-r-md border-l-2 py-2.5 pl-4 -ml-0.5 leading-snug transition-colors duration-200 active:bg-primary-50/70 md:py-1.5 md:pl-3 dark:active:bg-primary-950/40',
                  {
                    'text-sm font-semibold md:text-sm': item.level === 2,
                    'text-xs font-medium': item.level === 3,
                    'border-primary-500 bg-primary-50/50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400': isActive,
                    'border-transparent hover:border-primary-300/60 hover:text-main-light dark:hover:border-primary-600/60 dark:hover:text-main-dark': !isActive,
                  },
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
