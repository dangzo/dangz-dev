import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  X,
  Threads,
  Instagram,
  Medium,
} from './icons';
import { Link } from '@/components/core';

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
};

type SocialIconProps = {
  kind: keyof typeof components;
  href: string | undefined;
  size?: number;
};

const SocialIcon = ({ kind, href, size = 8 }: SocialIconProps) => {
  if (
    !href ||
    (kind === 'mail' &&
      !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  )
    return null;

  const SocialSvg = components[kind];

  return (
    <Link
      className="text-sm"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`
          h-${size} w-${size}
          fill-current transition-colors duration-300
          hover:text-primary-500 dark:hover:text-primary-400 text-gray-700 dark:text-gray-200
        `}
      />
    </Link>
  );
};

export default SocialIcon;
