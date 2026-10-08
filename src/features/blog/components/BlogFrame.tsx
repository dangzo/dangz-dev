'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { Link } from '@/components/ui';

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
      <article className="mx-auto max-w-6xl sm:py-4 md:py-12">
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
    <article className="group/article mx-auto max-w-6xl sm:py-4 md:py-12">
      <div className="mx-auto max-w-6xl">
        {heading}
        <div className="mt-4 hidden group-not-has-data-article-toc/article:block">
          <Link href="/blog" type="accent" size="small">
            ← Back to all posts
          </Link>
        </div>
      </div>
      <div className="mt-6 grid min-w-0 gap-6 border-t border-border-light pt-6 dark:border-border-dark xl:grid-cols-[240px_minmax(0,1fr)_240px] xl:gap-8 xl:group-not-has-data-article-toc/article:grid-cols-1">
        <aside className="mx-auto w-full min-w-0 max-w-[70ch] group-not-has-data-article-toc/article:hidden xl:col-start-1 xl:row-start-1">
          {sidebar}
        </aside>
        <section aria-label="Article content" className="min-w-0 xl:col-start-2 xl:row-start-1 xl:group-not-has-data-article-toc/article:col-start-1">
          {children}
        </section>
      </div>
    </article>
  );
}
