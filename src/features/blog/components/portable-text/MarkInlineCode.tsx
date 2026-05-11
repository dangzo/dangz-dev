import { ReactNode } from 'react';

interface MarkInlineCodeProps {
  children: ReactNode;
}

export default function MarkInlineCode({ children }: MarkInlineCodeProps) {
  return (
    <code
      className="
        text-nowrap
        rounded px-1 py-0.5 text-[0.8em]!
        bg-accent-light/10 dark:bg-neutral-100/10
      "
    >
      {children}
    </code>
  );
}
