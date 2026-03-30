import { isValidElement, type ReactNode } from 'react';

type PortableTextSpan = {
  _type?: 'span';
  text?: string;
};

type PortableTextBlock = {
  _type?: 'block';
  style?: string;
  children?: PortableTextSpan[];
};

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  return normalized || 'section';
}

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
    return getNodeText(node?.props?.children);
  }

  return '';
}

export function extractTocFromBody(body?: PortableTextBlock[]): TocItem[] {
  if (!body?.length) {
    return [];
  }

  const getHeadingId = createHeadingIdFactory();
  const toc: TocItem[] = [];

  for (const block of body) {
    if (block?._type !== 'block') {
      continue;
    }

    if (block.style !== 'h2' && block.style !== 'h3') {
      continue;
    }

    const text = (block.children || [])
      .map(child => child.text || '')
      .join('')
      .trim();

    if (!text) {
      continue;
    }

    toc.push({
      id: getHeadingId(text),
      title: text,
      level: block.style === 'h2' ? 2 : 3,
    });
  }

  return toc;
}

export function estimateReadingTimeMinutes(body?: PortableTextBlock[]): number {
  if (!body?.length) {
    return 1;
  }

  const text = body
    .filter(block => block?._type === 'block')
    .map(block => (block.children || []).map(child => child.text || '').join(' '))
    .join(' ')
    .trim();

  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 220));
}