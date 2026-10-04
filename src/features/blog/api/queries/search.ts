import type { SearchablePost, SearchablePostSource } from '@/features/blog/types/Post.types';
import { getClient, type ContentReadOptions } from '@/api/apollo-client';
import { gql } from '@apollo/client';
import { resolvePrimaryTopic, getSearchKeywords } from '@/features/blog/utils/topics';
import { getPostTopicFields } from './topicFields';

export const SEARCHABLE_POSTS_QUERY = () => gql`
  query SearchablePosts {
    allPost(sort: [{ publishedAt: DESC }]) {
      _id
      title
      slug { current }
      excerpt
      ${getPostTopicFields()}
    }
  }
`;

export async function getSearchablePosts(options: ContentReadOptions = {}): Promise<SearchablePost[]> {
  const { data } = await getClient(options).query<{ allPost: SearchablePostSource[] }>({
    query: SEARCHABLE_POSTS_QUERY(),
    fetchPolicy: 'no-cache',
  });

  return (data?.allPost ?? []).map((post) => ({
    ...post,
    tags: post.tags ?? [],
    primaryTopic: resolvePrimaryTopic(post),
    keywords: getSearchKeywords(post),
  }));
}
