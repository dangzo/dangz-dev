import type { Tag } from '@/types/sanity.types';

export type PostTags = {
  tags: Pick<Tag, 'slug'>[];
};
