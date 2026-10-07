import type { ReactNode } from 'react';
import { articleOutboundAnalytics } from '@/features/blog/utils/articleAnalytics';

interface MarkLinkProps {
  children: ReactNode;
  postId: string;
  value?: {
    href?: string;
  };
}

export default function MarkLink({ children, postId, value }: Readonly<MarkLinkProps>) {
  const href = typeof value?.href === 'string' ? value.href : '#';
  const analytics = articleOutboundAnalytics(postId, href);
  const isExternal = analytics !== undefined;

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...analytics}
    >
      {children}
    </a>
  );
}
