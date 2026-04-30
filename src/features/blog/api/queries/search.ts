import type { PostWithTags } from '@/features/blog/types/Post.types';
import { getClient } from '@/api/apollo-client';
import { gql } from '@apollo/client';

const SEARCHABLE_POSTS_QUERY = gql`
  query SearchablePosts {
    allPost(sort: [{ publishedAt: DESC }], limit: 200) {
      _id
      title
      slug {
        current
      }
      excerpt
      tags {
        _id
        name
        slug {
          current
        }
      }
    }
  }
`;

export async function getSearchablePosts(): Promise<PostWithTags[]> {
  const client = getClient();
  const { data } = await client.query<{ allPost: PostWithTags[] }>({
    query: SEARCHABLE_POSTS_QUERY,
    fetchPolicy: 'no-cache',
  });

  return data?.allPost ?? [];
}