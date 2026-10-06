import { contactAnalytics } from '@/utils/contactAnalytics';
import { links } from '@/data/siteMetadata';
import Icon from '@/components/icons/Icon';

async function SocialIcons() {
  return (
    <div className="mb-3 flex space-x-4">
      <Icon
        icon="mail"
        href={`mailto:${links.email}`}
        size={6}
        analytics={contactAnalytics({ name: 'contact_clicked', channel: 'email', placement: 'footer' })}
      />
      <Icon
        icon="github"
        href={links.github}
        size={6}
        analytics={contactAnalytics({ name: 'outbound_link_clicked', destination_host: 'github.com', placement: 'footer' })}
      />
      <Icon
        icon="linkedin"
        href={links.linkedin}
        size={6}
        analytics={contactAnalytics({ name: 'contact_clicked', channel: 'linkedin', placement: 'footer' })}
      />
    </div>
  );
}

export default SocialIcons;