import type { Post, Tag } from '@/types/sanity.types';

export type PostWithTags = Post & {
  tags: Tag[];
};
