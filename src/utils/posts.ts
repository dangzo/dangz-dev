import { isValidElement, type ReactNode } from 'react';
import { slugify } from '@/utils/strings';

export function createHeadingIdFactory() {
  const counts = new Map<string, number>();

  return (text: string): string => {
    const base = slugify(text);
    const count = (counts.get(base) || 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

export function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join('');
  }

  if (isValidElement(node)) {
    return getNodeText(
      (node?.props as { children?: ReactNode })?.children
    );
  }

  return '';
}
