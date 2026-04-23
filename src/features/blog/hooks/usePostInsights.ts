import { createHeadingIdFactory } from '@/features/blog/utils/posts';
import type { Post } from '@/types/sanity.types';

export type PortableTextBody = NonNullable<Post['body']>;
export type PortableTextBlock = Extract<PortableTextBody[number], { _type: 'block' }>;

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

function isPortableTextBlock(block: PortableTextBody[number]): block is PortableTextBlock {
  return block._type === 'block';
}

export default function usePostInsights() {
  function extractTocFromBody(body?: PortableTextBody): TocItem[] {
    if (!body?.length) {
      return [];
    }

    const getHeadingId = createHeadingIdFactory();
    const toc: TocItem[] = [];

    for (const block of body) {
      if (!isPortableTextBlock(block)) {
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

  function getReadingTimeMinutes(body?: PortableTextBody): number {
    if (!body?.length) {
      return 1;
    }

    const text = body
      .filter(isPortableTextBlock)
      .map(block => (block.children || []).map(child => child.text || '').join(' '))
      .join(' ')
      .trim();

    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 220));
  }

  return {
    extractTocFromBody,
    getReadingTimeMinutes,
  };
}