import type { Post, Tag } from '@/types/sanity.types';

export interface PostReactionSummaryItem {
  _id: string;
  name?: string;
  emoji?: string;
  count?: number;
  sortOrder?: number;
}

export type PostWithTags = Omit<Post, 'tags' | 'image'> & {
  excerpt?: string;
  tags: Tag[];
  reactions?: PostReactionSummaryItem[];
  image?: {
    asset?: {
      url?: string;
      metadata?: {
        lqip?: string;
      };
    };
  };
};
