import { clsx } from 'clsx';
import { default as NextLink } from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

export type LinkType = 'accent' | 'primary' | 'secondary';
interface LinkProps extends NextLinkProps {
  type?: string;
}

export default function Link({ href, className, type = 'primary', ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  const linkClasses = clsx([
    'wrap-break-word transition-all duration-300',
    {
      'text-accent-light dark:text-accent-dark hover:text-primary-500 dark:hover:text-primary-300': type === 'accent',
      'text-main-light dark:text-main-dark hover:text-gray-600 dark:hover:text-gray-300': type === 'primary',
      'text-secondary-light dark:text-secondary-dark hover:text-secondary-dark dark:hover:text-secondary-light': type === 'secondary',
    }
  ]);

  if (isInternalLink) {
    return <NextLink className={clsx([linkClasses, className])} href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <a className={clsx([linkClasses, className])} href={href} {...rest} />
  }

  return (
    <a className={clsx([linkClasses, className])} target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  )
}
