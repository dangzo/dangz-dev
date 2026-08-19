import { clsx } from 'clsx';
import { Link } from '@/components/ui';

import GithubIcon from './socials/GithubIcon';
import LinkedinIcon from './socials/LinkedinIcon';
import MailIcon from './socials/MailIcon';

const components = {
  mail: MailIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  icon: keyof typeof components;
  href?: string;
  size?: number;
  'data-umami-event'?: string;
};

const IconWrapper = ({ icon, size, ...rest }: React.SVGProps<SVGSVGElement> & {
  size?: number; icon: keyof typeof components
}) => {
  const SVGIcon = components[icon];

  return (
    <SVGIcon
      width={size}
      height={size}
      {...rest}
    />
  );
};

const Icon = ({ icon, href, size = 8, className, 'data-umami-event': umamiEvent, ...rest }: IconProps) => {
  if (!href) {
    return <IconWrapper icon={icon} size={size} {...rest} />;
  }

  return (
    <Link
      className="text-sm"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      data-umami-event={umamiEvent}
    >
      <span className="sr-only">{icon}</span>
      <IconWrapper
        icon={icon}
        className={clsx(`
          h-${size} w-${size}
          fill-current transition-colors duration-300
          hover:text-primary-500 dark:hover:text-primary-400 text-gray-700 dark:text-main-dark
        `, className)}
        {...rest}
      />
    </Link>
  );
};

export default Icon;
