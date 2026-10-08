'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Text } from '@/components/ui';
import type { TocItem } from '@/features/blog/hooks/usePostInsights';
import { useSidebarMobileClose } from './SidebarMobileContext';
import SidebarNav from './SidebarNav';
import SidebarNavItem from './SidebarNavItem';

interface ToCNavProps {
  items: TocItem[];
}

const SCROLL_OFFSET = 112;

type OverflowState = Readonly<{ above: boolean; below: boolean }>;

function getOverflowCue({ above, below }: OverflowState) {
  if (above && below) {
    return 'More sections above ↑ · below ↓';
  }

  if (below) {
    return 'Scroll for more sections ↓';
  }

  if (above) {
    return 'More sections above ↑';
  }

  return null;
}

export default function ToCNav({ items }: Readonly<ToCNavProps>) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [overflow, setOverflow] = useState<OverflowState>({ above: false, below: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeSidebar = useSidebarMobileClose();
  const overflowCue = getOverflowCue(overflow);

  const updateOverflow = useCallback(() => {
    const region = scrollRef.current;

    if (!region) {
      return;
    }

    const above = region.clientHeight > 0 && region.scrollTop > 1;
    const below = region.clientHeight > 0 && region.scrollTop + region.clientHeight < region.scrollHeight - 1;

    setOverflow(previous => previous.above === above && previous.below === below
      ? previous
      : { above, below });
  }, []);

  useEffect(() => {
    const region = scrollRef.current;

    if (!region) {
      return;
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(region);

    if (region.firstElementChild) {
      observer.observe(region.firstElementChild);
    }

    const frame = requestAnimationFrame(updateOverflow);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateOverflow]);

  useEffect(() => {
    const headingElements = items
      .map(item => ({ id: item.id, element: document.getElementById(item.id) }))
      .filter((item): item is { id: string; element: HTMLElement } => item.element !== null);

    if (headingElements.length === 0) {
      return;
    }

    const updateActiveHeading = () => {
      let currentId = headingElements[0].id;

      for (const { id, element } of headingElements) {
        if (element.getBoundingClientRect().top <= SCROLL_OFFSET) {
          currentId = id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [items]);

  useEffect(() => {
    const revealActiveLink = () => {
      const region = scrollRef.current;
      const activeLink = region?.querySelector<HTMLElement>('[aria-current="location"]');

      if (!region || !activeLink || !window.matchMedia('(min-width: 1280px)').matches) {
        return;
      }

      const regionBounds = region.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();

      if (linkBounds.top < regionBounds.top) {
        region.scrollTop += linkBounds.top - regionBounds.top;
      } else if (linkBounds.bottom > regionBounds.bottom) {
        region.scrollTop += linkBounds.bottom - regionBounds.bottom;
      }
    };

    revealActiveLink();
    window.addEventListener('resize', revealActiveLink);

    return () => {
      window.removeEventListener('resize', revealActiveLink);
    };
  }, [activeId, items]);

  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    const targetId = event.currentTarget.hash.slice(1);
    closeSidebar?.();

    if (event.detail === 0) {
      requestAnimationFrame(() => {
        const heading = document.getElementById(targetId);

        if (heading) {
          if (!heading.hasAttribute('tabindex')) {
            heading.setAttribute('tabindex', '-1');
          }

          heading.focus({ preventScroll: true });
        }
      });
    }
  };

  return (
    <div>
      <div ref={scrollRef} onScroll={updateOverflow} className="max-h-[min(480px,60dvh)] overflow-y-auto pr-2 xl:max-h-[calc(100dvh-220px)]">
        <SidebarNav label="Table of contents">
          {items.map(item => (
            <SidebarNavItem
              key={item.id}
              href={`#${item.id}`}
              isActive={activeId === item.id}
              indent={item.level === 3}
              className={item.level === 2 ? 'font-semibold' : 'font-medium'}
              onClick={handleItemClick}
            >
              {item.title}
            </SidebarNavItem>
          ))}
        </SidebarNav>
      </div>

      {overflowCue && (
        <Text size="x-small" className="mt-2! mb-0!">
          {overflowCue}
        </Text>
      )}
    </div>
  );
}
