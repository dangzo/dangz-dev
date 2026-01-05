import type { Tag } from '@/types/sanity.types';

export type TagWithCount = Tag & {
  postCount: number;
}
