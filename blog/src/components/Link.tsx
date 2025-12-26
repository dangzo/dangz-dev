import { default as NextLink } from 'next/link';
import type { LinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

export default function Link({ href, ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  const linkClasses = 'wrap-break-word';

  if (isInternalLink) {
    return <NextLink className={linkClasses} href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <a className={linkClasses} href={href} {...rest} />
  }

  return (
    <a className={linkClasses} target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  )
}
