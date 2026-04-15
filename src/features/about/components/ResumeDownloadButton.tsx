'use client';

import { Button } from '@/components/ui';
import useAnalytics from '@/hooks/useAnalytics';
import { links } from '@/data/siteMetadata';

export default function ResumeDownloadButton() {
  const { sendEvent } = useAnalytics();

  return (
    <Button
      to={links.resumeURL}
      download
      type="ghost"
      size="small"
      onClick={() => sendEvent({
        page: 'about',
        category: 'my-journey-so-far',
        value: 'download_resume',
      })}
    >
      Download my resume
    </Button>
  );
}
