'use client';

import siteMetadata from '@/data/siteMetadata';
import Icon from '@/components/icons/Icon';
import useAnalytics from '@/hooks/useAnalytics';

function SocialIcons() {
  const { sendEvent } = useAnalytics();

  return (
    <div className="mb-3 flex space-x-4">
      <Icon
        icon="mail"
        href={`mailto:${siteMetadata.email}`}
        size={6}
        onClick={() => sendEvent({ page: 'footer', category: 'social-icons', value: 'email' })}
      />
      <Icon
        icon="github"
        href={siteMetadata.github}
        size={6}
        onClick={() => sendEvent({ page: 'footer', category: 'social-icons', value: 'github' })}
      />
      <Icon
        icon="linkedin"
        href={siteMetadata.linkedin}
        size={6}
        onClick={() => sendEvent({ page: 'footer', category: 'social-icons', value: 'linkedin' })}
      />
    </div>
  );
}

export default SocialIcons;