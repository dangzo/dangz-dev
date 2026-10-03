'use client';

import { useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Link } from '@/components/ui';
import type { TopicWithCount } from '@/features/blog/types/Topic.types';
import { getTopicHref } from '@/features/blog/utils/topics';

type TopicNavigationProps = Readonly<{
  activeSlug?: string;
  topics: readonly TopicWithCount[];
  totalPostCount: number;
}>;

function TopicNavigationContent({ activeSlug, topics, totalPostCount }: TopicNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const visibleTopics = topics
    .filter(topic => topic.postCount > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const currentTopic = visibleTopics.find(topic => topic.slug.current === activeSlug);
  const options = [
    { slug: '', label: 'All posts', count: totalPostCount, href: '/blog' },
    ...visibleTopics.map(topic => ({ slug: topic.slug.current, label: topic.displayName, count: topic.postCount, href: getTopicHref(topic) })),
  ];

  return (
    <nav
      aria-label="Topics"
      className="border-b border-border-light py-4 dark:border-border-dark"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          setIsOpen(false);
          toggleRef.current?.focus();
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 md:hidden">
        <p className="min-w-0 text-sm font-semibold">
          {currentTopic?.displayName ?? 'All posts'} ({currentTopic?.postCount ?? totalPostCount})
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {activeSlug && (
            <Link href="/blog" type="accent" size="small" onClick={() => setIsOpen(false)}>All posts</Link>
          )}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={() => setIsOpen(open => !open)}
            className="rounded-lg border border-border-light px-3 py-2 text-sm font-medium hover:bg-background-secondary-light dark:border-border-dark dark:hover:bg-background-secondary-dark"
          >
            {isOpen ? 'Hide topics' : 'Browse topics'}
          </button>
        </div>
      </div>

      <div id={contentId} className={clsx('md:block', isOpen ? 'mt-4 block md:mt-0' : 'hidden')}>
        <ul className="flex flex-col gap-2 md:flex-row md:flex-wrap">
          {options.map(option => {
            const isActive = option.slug === (activeSlug ?? '');

            return (
              <li key={option.href}>
                <Link
                  href={option.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'block rounded-lg border px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'border-primary-500 bg-primary-50/50 font-semibold text-accent-light dark:bg-primary-950/30 dark:text-accent-dark'
                      : 'border-border-light text-secondary-light hover:border-primary-500 hover:text-accent-light dark:border-border-dark dark:text-secondary-dark dark:hover:text-accent-dark',
                  )}
                >
                  {option.label} ({option.count})
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default function TopicNavigation(props: TopicNavigationProps) {
  return (
    <TopicNavigationContent key={props.activeSlug ?? 'all'} {...props} />
  );
}
