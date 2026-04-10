import type { Post, Tag } from '@/types/sanity.types';

export type PostWithTags = Omit<Post, 'tags' | 'image'> & {
  tags: Tag[];
  image?: {
    asset?: {
      url?: string;
      metadata?: {
        lqip?: string;
      };
    };
  };
};
