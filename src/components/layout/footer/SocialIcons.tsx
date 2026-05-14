import { links } from '@/data/siteMetadata';
import Icon from '@/components/icons/Icon';

async function SocialIcons() {
  return (
    <div className="mb-3 flex space-x-4">
      <Icon
        icon="mail"
        href={`mailto:${links.email}`}
        size={6}
        data-umami-event="Email Click"
      />
      <Icon
        icon="github"
        href={links.github}
        size={6}
        data-umami-event="GitHub Click"
      />
      <Icon
        icon="linkedin"
        href={links.linkedin}
        size={6}
        data-umami-event="LinkedIn Click"
      />
    </div>
  );
}

export default SocialIcons;