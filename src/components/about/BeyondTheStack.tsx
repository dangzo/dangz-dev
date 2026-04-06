'use client';

import { Heading, Link, Text } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

function BeyondTheStack() {
  const { sendEvent } = useAnalytics();

  return (
    <section 
      className="
        rounded-2xl border border-primary-300/40 dark:border-primary-500/40 bg-primary-100/40 dark:bg-primary-900/20 p-6 md:p-8
      "
    >
      <Heading as="h2">
        Beyond the stack
      </Heading>

      <Text className="max-w-3xl mb-4">
        I hold a Bachelor in Computer Engineering from the&nbsp;
        <strong>University of Rome "La Sapienza"</strong>, but most of
        what shaped me came from shipping real products with real teams.
      </Text>

      <Text className="max-w-3xl mb-4">
        My coding journey started when I was still a teenager, wandering school corridors in
        search of books of <strong>Pascal</strong> and <strong>BASIC</strong>, which sooner
        became of <strong>C++</strong>, <strong>JavaScript</strong> and <strong>CSS</strong>.
        Reading about hacker news, experimenting with Linux and open source, writing software
        of every kind.
      </Text>

      <Text className="mt-4 mb-0">
        In my free time you may find me practicing sport, like tennis, padel, calisthenics, or
        going for a free run.
      </Text>

      <Text className="max-w-3xl mb-6 mt-6 border-b border-border-light/60 dark:border-border-dark/60 pb-6">
        I'm fluent in <strong>English</strong>, <strong>Spanish</strong>, and&nbsp;
        <strong>Italian</strong>.
      </Text>

      <Text className="max-w-3xl mb-4">
        If you&apos;d like to talk frontend architecture, design systems,
        or product engineering, reach out via&nbsp;
        <Link
          href={`mailto:${links.email}`}
          type="accent"
          onClick={() => sendEvent({ page: 'about', category: 'beyond-the-stack', value: 'email' })}
        >
          email
        </Link>, connect on <Link
          href={links.linkedin}
          type="accent"
          onClick={() => sendEvent({ page: 'about', category: 'beyond-the-stack', value: 'linkedin' })}
        >
          LinkedIn
        </Link>,
        or explore my work on{' '}
        <Link
          href={links.github}
          type="accent"
          onClick={() => sendEvent({ page: 'about', category: 'beyond-the-stack', value: 'github' })}
        >
          GitHub
        </Link>.
      </Text>
    </section>
  );
}

export default BeyondTheStack;