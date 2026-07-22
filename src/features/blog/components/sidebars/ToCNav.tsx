'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/features/blog/hooks/usePostInsights';
import { useSidebarMobileClose } from './SidebarMobileContext';
import SidebarNav from './SidebarNav';
import SidebarNavItem from './SidebarNavItem';

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
    <SidebarNav label="Table of contents">
      {items.map(item => (
        <SidebarNavItem
          key={item.id}
          href={`#${item.id}`}
          isActive={activeId === item.id}
          activeMode="desktop"
          indent={item.level === 3}
          className={item.level === 2 ? 'font-semibold' : 'font-medium'}
          onClick={handleItemClick}
        >
          {item.title}
        </SidebarNavItem>
      ))}
    </SidebarNav>
  );
}
