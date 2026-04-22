import { Button } from '@/components/ui';
import { links } from '@/data/siteMetadata';

async function ResumeDownloadButton() {
  return (
    <Button
      to={links.resumeURL}
      download
      type="ghost"
      size="small"
      data-umami-event="Download Resume Click"
    >
      Download my resume
    </Button>
  );
}

export default ResumeDownloadButton;