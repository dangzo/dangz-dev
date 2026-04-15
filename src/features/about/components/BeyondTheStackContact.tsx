'use client';

import { Link, Text } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

export default function BeyondTheStackContact() {
  const { sendEvent } = useAnalytics();

  return (
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
  );
}
