import type { Post, Tag } from '@/types/sanity.types';
import type { TopicSource, TopicSummary } from './Topic.types';

export interface PostReactionSummaryItem {
  _id: string;
  name?: string;
  emoji?: string;
  count?: number;
  sortOrder?: number;
}

export type PostWithTags = Omit<Post, 'tags' | 'image' | 'primaryTopic' | 'keywords'> & {
  excerpt?: string;
  primaryTopic?: TopicSummary | null;
  keywords?: readonly string[];
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

export type PostWithTopic = PostWithTags;

export type SearchablePost = Readonly<{
  _id: string;
  title?: string;
  slug?: Readonly<{ current?: string }>;
  excerpt?: string;
  primaryTopic?: TopicSummary | null;
  keywords?: readonly string[];
  tags?: readonly Readonly<{ name?: string; slug?: Readonly<{ current?: string }> }>[];
}>;

export type PostWithTopicSource = Omit<PostWithTopic, 'primaryTopic'> & Readonly<{
  primaryTopic?: TopicSource | null;
}>;

export type SearchablePostSource = Omit<SearchablePost, 'primaryTopic'> & Readonly<{
  primaryTopic?: TopicSource | null;
}>;
