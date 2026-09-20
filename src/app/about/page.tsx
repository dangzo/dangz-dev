import type { Metadata } from 'next';
import {
  BeyondTheStack,
  LetsTalkFrontend,
  ToolsITrust,
  IntroTextAndCTAs,
  MyJourneySoFar,
} from '@/features/about/components';

export const metadata: Metadata = {
  title: 'About',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <article className="sm:py-4 md:py-12">
      <div className="mx-auto flex flex-col">
        <IntroTextAndCTAs />

        <nav aria-label="About sections" className="mb-12 flex flex-wrap justify-center gap-x-6 gap-y-3 border-y border-border-light py-5 text-sm font-medium dark:border-border-dark">
          <a href="#journey" className="py-2 hover:text-accent-light dark:hover:text-accent-dark">Experience</a>
          <a href="#beyond" className="py-2 hover:text-accent-light dark:hover:text-accent-dark">Beyond the stack</a>
          <a href="#tools" className="py-2 hover:text-accent-light dark:hover:text-accent-dark">Tools I trust</a>
          <a href="#contact" className="py-2 hover:text-accent-light dark:hover:text-accent-dark">Get in touch</a>
        </nav>

        <section id="journey" className="scroll-mt-8">
          <MyJourneySoFar />
        </section>

        <section id="beyond" className="scroll-mt-8">
          <BeyondTheStack />
        </section>

        <section id="tools" className="scroll-mt-8">
          <ToolsITrust />
        </section>

        <section id="contact" className="scroll-mt-8">
          <LetsTalkFrontend />
        </section>
      </div>
    </article>
  );
}
