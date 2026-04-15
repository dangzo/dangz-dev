'use client';

import { Button } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

export default function IntroCTAs() {
  const { sendEvent } = useAnalytics();

  return (
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
  );
}
