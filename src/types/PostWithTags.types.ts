import type { Post, Tag } from '@/types/sanity.types';

export type PostWithTags = Post & {
  bodyRaw?: Pick<Post, 'body'>['body'];
  tags: Tag[];
};
