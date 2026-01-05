import { clsx } from 'clsx';
import { default as NextLink } from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export type LinkType = 'accent' | 'primary' | 'secondary';
interface LinkProps extends NextLinkProps {
  isActive?: boolean;
  type?: string;
}

export default function Link({ href, className, type = 'primary', isActive = false, ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/');
  const isAnchorLink = href && href.startsWith('#');

  const linkClasses = clsx([
    'wrap-break-word transition-all duration-300',
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
    roboto.className,
  ]);

  if (isActive) {
    return <span className={clsx([linkClasses, className])} {...rest}>{rest.children}</span>;
  }

  if (isInternalLink) {
    return <NextLink className={clsx([linkClasses, className])} href={href} {...rest} />;
  }

  if (isAnchorLink) {
    return <a className={clsx([linkClasses, className])} href={href} {...rest} />;
  }

  return (
    <a className={clsx([linkClasses, className])} target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  );
}
