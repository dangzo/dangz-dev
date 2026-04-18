'use client';

import { Button, Heading, Text } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

export default function LetsTalkFrontend() {
  const { sendEvent } = useAnalytics();

  return (
    <section
      className="
        text-center
        mt-10 rounded-2xl border border-border-light/70 bg-primary-50/90 p-6
        dark:border-border-dark/60 dark:bg-background-secondary-dark/30
        dark:shadow-none md:mt-12 md:p-8
      "
    >
      <Heading as="h2" className="mb-3">
        Let&apos;s talk frontend
      </Heading>

      <Text className="mb-3 max-w-3xl mx-auto md:mb-5">
        If you&apos;re working on a frontend product and think I could help, feel free to reach out.
      </Text>

      <Text className="mb-5 md:mb-6 max-w-3xl mx-auto">
        I&apos;m always up for a good conversation about programming languages, frontend architecture, product direction, or the tradeoffs that come with building things for real users.
      </Text>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap items-center justify-center sm:pt-4">
        <Button
          className="w-full sm:w-auto"
          to={`mailto:${links.email}`}
          type="primary"
          size="medium"
          onClick={() => sendEvent({ page: 'about', category: 'lets-talk-frontend', value: 'email' })}
        >
          Email me
        </Button>

        <Button
          className="w-full sm:w-auto"
          to={links.linkedin}
          type="ghost"
          size="medium"
          onClick={() => sendEvent({ page: 'about', category: 'lets-talk-frontend', value: 'linkedin' })}
        >
          Connect on LinkedIn
        </Button>

        <Button
          className="w-full sm:w-auto"
          to={links.github}
          type="ghost"
          size="medium"
          onClick={() => sendEvent({ page: 'about', category: 'lets-talk-frontend', value: 'github' })}
        >
          View GitHub
        </Button>
      </div>
    </section>
  );
}
