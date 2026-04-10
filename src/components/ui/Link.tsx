import { clsx } from 'clsx';
import { default as NextLink } from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

export type LinkType = 'accent' | 'primary' | 'secondary';
export type LinkSize = 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
interface LinkProps extends NextLinkProps {
  isActive?: boolean;
  type?: string;
  size?: LinkSize;
}

export default function Link({ href, className, type = 'primary', size = 'medium', isActive = false, ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/');
  const isAnchorLink = href && href.startsWith('#');

  const linkClasses = clsx([
    'wrap-break-word transition-all duration-300 font-body',
    {
      'text-xs md:text-xs leading-4 md:leading-4': size === 'x-small',
      'text-sm md:text-sm leading-5 md:leading-5': size === 'small',
      'text-sm md:text-base leading-6 md:leading-6': size === 'medium',
      'text-base md:text-lg leading-6 md:leading-7.5': size === 'large',
      'text-lg md:text-xl lg:text-2xl leading-7 md:leading-8': size === 'x-large',
    },
    {
      'text-accent-light dark:text-accent-dark hover:text-primary-500 dark:hover:text-primary-300': type === 'accent',
      'text-main-light dark:text-main-dark hover:text-primary-500 dark:hover:text-primary-500': type === 'primary',
      'text-secondary-light dark:text-secondary-dark hover:text-secondary-dark dark:hover:text-secondary-light': type === 'secondary',
    },
    {
      'text-primary-500 dark:text-primary-300': isActive && type === 'accent',
      'text-primary-500 dark:text-primary-500': isActive && type === 'primary',
      'text-secondary-dark dark:text-secondary-light': isActive && type === 'secondary',
    },
  ]);

  if (isActive) {
    return <span className={clsx([linkClasses, className])} {...rest}>{rest.children}</span>;
  }

  if (isInternalLink) {
    return <NextLink className={clsx([linkClasses, className])} href={href} {...rest} />;
  }

  if (isAnchorLink) {
    return <NextLink className={clsx([linkClasses, className])} href={href} {...rest} />;
  }

  return (
    <NextLink className={clsx([linkClasses, className])} href={href} target="_blank" rel="noopener noreferrer" {...rest} />
  );
}
