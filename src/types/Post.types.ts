import type { Post, Tag } from '@/types/sanity.types';

export type PostWithTags = Omit<Post, 'tags'> & {
  tags: Tag[];
};
