import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { links } from '@/data/siteMetadata';
import LatestWriting from '@/features/home/components/LatestWriting';
import { TopTags, TopTagsSkeleton } from '@/features/home/components/TopTags';

export const metadata: Metadata = {
  title: 'Daniele Gazzelloni | Frontend Engineering Blog',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <article className="mx-auto max-w-6xl pb-8">
      <div className="grid gap-8 border-b border-border-light py-8 dark:border-border-dark md:grid-cols-[1fr_280px] md:items-center md:gap-16 md:py-20">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-accent-light dark:text-accent-dark">Senior Frontend Engineer</p>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Hi, I'm Daniele.<br />
            <span className="text-accent-light dark:text-accent-dark">I craft interfaces for the web.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-secondary-light dark:text-secondary-dark md:text-lg">
            Notes from building real products with React, Vue and TypeScript.
            Frontend architecture, thoughtful tradeoffs, and lessons worth sharing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button to="/blog" size="large">Explore the writing <span aria-hidden="true">→</span></Button>
            <Link href="/about" className="py-3 font-medium underline decoration-primary-500/40 underline-offset-8 hover:text-accent-light dark:hover:text-accent-dark">A little about me <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <aside aria-label="About this space" className="border-l-2 border-primary-500 pl-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-secondary-light dark:text-secondary-dark">Why I write and build here</p>
          <p className="hidden font-heading text-xl leading-relaxed md:block">Building things.<br />Making sense of them.<br />Sharing what sticks.</p>
          <p className="text-sm leading-6 text-secondary-light dark:text-secondary-dark md:mt-4 md:leading-7">A place to share my work and how I think, experiment with new technologies, and deepen my understanding through writing.</p>
          <a href={links.github} className="mt-2 inline-block py-2 text-sm font-medium text-accent-light underline-offset-4 hover:underline dark:text-accent-dark md:mt-4">Explore my GitHub <span aria-hidden="true">↗︎</span></a>
        </aside>
      </div>

      <section aria-labelledby="writing-heading" className="py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-secondary-light dark:text-secondary-dark">From the notebook</p>
            <h2 id="writing-heading" className="font-heading text-3xl font-bold">Latest writing</h2>
          </div>
          <Link href="/blog" className="py-2 text-sm font-medium text-accent-light hover:underline dark:text-accent-dark">All articles <span aria-hidden="true">→</span></Link>
        </div>
        <Suspense fallback={<p className="py-12 text-secondary-light dark:text-secondary-dark" role="status">Loading the latest writing…</p>}><LatestWriting /></Suspense>
      </section>

      <section aria-labelledby="topics-heading" className="border-y border-border-light py-8 dark:border-border-dark md:flex md:items-start md:gap-10">
        <div className="mb-5 shrink-0 md:mb-0">
          <h2 id="topics-heading" className="font-heading text-xl font-semibold">Follow your curiosity</h2>
          <p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">Find a topic to dig into.</p>
        </div>
        <div className="flex flex-wrap gap-3"><Suspense fallback={<TopTagsSkeleton />}><TopTags /></Suspense></div>
      </section>

      <section className="mt-10 flex flex-col justify-between gap-5 rounded-2xl bg-background-secondary-light p-6 dark:bg-background-secondary-dark sm:flex-row sm:items-center md:p-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Good software starts with a conversation.</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-secondary-light dark:text-secondary-dark">An interesting frontend problem, a different perspective, or something you read here? I’d love to hear it.</p>
        </div>
        <a href={`mailto:${links.email}`} className="shrink-0 self-start rounded-lg border border-primary-600 px-5 py-3 font-medium text-accent-light hover:bg-primary-50 dark:text-accent-dark dark:hover:bg-primary-950 sm:self-auto">Say hello <span aria-hidden="true">↗︎</span></a>
      </section>
    </article>
  );
}
