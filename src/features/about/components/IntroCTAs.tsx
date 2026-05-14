import { Button } from '@/components/ui';
import { links } from '@/data/siteMetadata';

async function IntroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mt-3">
      <Button
        to={links.resumeURL}
        download
        type="primary"
        size="medium"
        data-umami-event-about="Download Resume Click"
      >
        Download my resume
      </Button>
      <Button
        to={links.linkedin}
        type="ghost"
        size="medium"
        data-umami-event-about="Connect LinkedIn Click"
      >
        Connect on LinkedIn
      </Button>
    </div>
  );
}

export default IntroCTAs;