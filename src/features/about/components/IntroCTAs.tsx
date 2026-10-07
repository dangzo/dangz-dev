import { contactAnalytics } from '@/utils/contactAnalytics';
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
        {...contactAnalytics({ name: 'resume_download_clicked', placement: 'about_intro' })}
      >
        Download my resume
      </Button>
      <Button
        to={links.linkedin}
        type="ghost"
        size="medium"
        {...contactAnalytics({ name: 'contact_clicked', channel: 'linkedin', placement: 'about_intro' })}
      >
        Connect on LinkedIn
      </Button>
    </div>
  );
}

export default IntroCTAs;