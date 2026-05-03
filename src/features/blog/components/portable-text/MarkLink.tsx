import { ReactNode } from 'react';

const ALLOWED_INTERNAL_HOSTS = new Set(['localhost', 'dangz.dev', 'www.dangz.dev']);

function isExternalArticleLink(href: string): boolean {
  if (!href) {
    return false;
  }

  if (href.startsWith('/') || href.startsWith('#')) {
    return false;
  }

  try {
    const url = new URL(href);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    return !ALLOWED_INTERNAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

interface MarkLinkProps {
  children: ReactNode;
  value?: {
    href?: string;
  };
}

export default function MarkLink({ children, value }: MarkLinkProps) {
  const href = typeof value?.href === 'string' ? value.href : '#';
  const isExternal = isExternalArticleLink(href);

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}
