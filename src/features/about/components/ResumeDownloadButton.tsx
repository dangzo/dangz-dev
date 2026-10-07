import { contactAnalytics } from '@/utils/contactAnalytics';
import { Button } from '@/components/ui';
import { links } from '@/data/siteMetadata';

async function ResumeDownloadButton() {
  return (
    <Button
      to={links.resumeURL}
      download
      type="ghost"
      size="small"
      {...contactAnalytics({ name: 'resume_download_clicked', placement: 'about_journey' })}
    >
      Download my resume
    </Button>
  );
}

export default ResumeDownloadButton;