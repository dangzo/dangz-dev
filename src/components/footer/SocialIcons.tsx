'use client';

import siteMetadata from '@/data/siteMetadata';
import Icon from '@/components/icons/Icon';

function SocialIcons() {
  return (
    <div className="mb-3 flex space-x-4">
      <Icon icon="mail" href={`mailto:${siteMetadata.email}`} size={6} />
      <Icon icon="github" href={siteMetadata.github} size={6} />
      <Icon icon="linkedin" href={siteMetadata.linkedin} size={6} />
    </div>
  );
}

export default SocialIcons;