import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

export type MockNextLinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;

/** Test double for `next/link` default export (renders a plain anchor). */
export default function MockNextLink({ children, href, ...props }: MockNextLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
