import type { Tag } from '@/types/sanity.types';

export type TagWithCount = Tag & {
  postCount: number;
}

export type PostTags = {
  tags: Pick<Tag, 'slug'>[];
};
