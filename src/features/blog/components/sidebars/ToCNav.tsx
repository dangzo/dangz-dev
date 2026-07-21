'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Link } from '@/components/ui';
import type { TocItem } from '@/features/blog/hooks/usePostInsights';

interface ToCNavProps {
  items: TocItem[];
}

const SCROLL_OFFSET = 112;

export default function ToCNav({ items }: Readonly<ToCNavProps>) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

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

  return (
    <nav aria-label="Table of contents">
      <ul className="relative space-y-0.5">
        {items.map(item => {
          const isActive = activeId === item.id;

          return (
            <li
              key={item.id}
              className={clsx({
                'pl-0': item.level === 2,
                'pl-4': item.level === 3,
              })}
            >
              <Link
                href={`#${item.id}`}
                type="secondary"
                size="small"
                aria-current={isActive ? 'location' : undefined}
                className={clsx(
                  'block border-l-2 py-1.5 pl-3 -ml-0.5 leading-snug transition-colors duration-200',
                  {
                    'text-sm font-semibold': item.level === 2,
                    'text-xs font-medium': item.level === 3,
                    'border-primary-500 text-primary-600 dark:text-primary-400': isActive,
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
