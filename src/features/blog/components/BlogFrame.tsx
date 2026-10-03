'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

type BlogFrameProps = Readonly<{
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}>;

export default function BlogFrame({ children, heading, sidebar }: BlogFrameProps) {
  const segment = useSelectedLayoutSegment();
  const isListing = segment === null || ['page', 'topics', 'tags'].includes(segment);

  if (isListing) {
    return (
      <article className="mx-auto max-w-4xl pb-8">
        {heading}
        <div className="mt-6 border-t border-border-light dark:border-border-dark">
          {sidebar}
          <section aria-label="Articles" className="min-w-0">
            {children}
          </section>
        </div>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-6xl pb-8">
      <div className="max-w-4xl">{heading}</div>
      <div className="mt-6 grid min-w-0 gap-6 border-t border-border-light pt-6 dark:border-border-dark md:grid-cols-[240px_minmax(0,1fr)] md:gap-8">
        <aside className="min-w-0">{sidebar}</aside>
        <section aria-label="Article content" className="min-w-0">
          {children}
        </section>
      </div>
    </article>
  );
}
