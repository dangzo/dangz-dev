'use client';

import { Button, Heading, Text } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

const devYears = new Date().getFullYear() - 2013;

function IntroTextAndCTAs() {
  const { sendEvent } = useAnalytics();

  return (
    <section className="mb-16 md:mb-44">
      <Text size="small" className="hidden sm:block uppercase tracking-[0.2em] font-semibold text-primary-500 dark:text-primary-300">
        About
      </Text>

      <Heading as="h1" className="max-w-3xl mb-6">
        <span className="block text-3xl md:text-4xl lg:text-6xl leading-loose">
          Hi, I'm Daniele.
        </span>
        <span className="block text-xl md:text-2xl lg:text-4xl">
          I craft frontend solutions that help teams ship and products scale.
        </span>
      </Heading>

      <Text size="large" className="max-w-3xl">
        Over the last { devYears } years, I have grown from full-stack and freelance work into a
        senior frontend role focused on&nbsp;
        <strong className="text-accent-dark">React</strong>,&nbsp;
        <strong className="text-accent-dark">Vue</strong> and&nbsp;
        <strong className="text-accent-dark">TypeScript</strong>.
      </Text>

      <Text size="large" className="max-w-3xl mb-0">
        Today I work remotely from Santa Cruz de Tenerife, collaborating with distributed teams,
        mentoring engineers, and helping products move from idea to production with confidence.
      </Text>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mt-3">
        <Button
          to={links.resumeURL}
          download
          type="primary"
          size="medium"
          onClick={() => sendEvent({
            page: 'about',
            category: 'intro-ctas',
            value: 'download_resume',
          })}
        >
          Download my resume
        </Button>
        <Button
          to={links.linkedin}
          type="ghost"
          size="medium"
          onClick={() => sendEvent({
            page: 'about',
            category: 'intro-ctas',
            value: 'connect_linkedin',
          })}
        >
          Connect on LinkedIn
        </Button>
      </div>
    </section>
  );
}

export default IntroTextAndCTAs;