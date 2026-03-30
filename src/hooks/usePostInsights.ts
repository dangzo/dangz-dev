import type { PostWithTags } from '@/types/Post.types';
import { createHeadingIdFactory } from '@/utils/posts';

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

export default function usePostInsights(post: PostWithTags) {
  function extractTocFromBody(body?: PortableTextBlock[]): TocItem[] {
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

  function estimateReadingTimeMinutes(body?: PortableTextBlock[]): number {
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

  const toc = extractTocFromBody(post.body);
  const readingTimeMinutes = estimateReadingTimeMinutes(post.body);

  return {
    toc,
    readingTimeMinutes,
  };
}