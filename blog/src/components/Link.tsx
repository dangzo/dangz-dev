import { clsx } from 'clsx';
import { default as NextLink } from 'next/link';
import type { LinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

export default function Link({ href, className, ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  const linkClasses = 'wrap-break-word text-accent-light dark:text-accent-dark hover:underline';

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
