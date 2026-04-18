'use client';

import { Link, Text } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

export default function BeyondTheStackContact() {
  const { sendEvent } = useAnalytics();

  return (
    <Text
      className="
        border-t border-border-light/60 dark:border-border-dark/60
        mb-4 pt-6 mt-12 max-w-5xl mx-auto inline-block
      "
    >
      If you&apos;d like to talk with me about any things frontend -- reach out via&nbsp;
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
  );
}
