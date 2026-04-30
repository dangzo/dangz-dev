import type { PostWithTags } from '@/features/blog/types/Post.types';
import { getClient } from '@/api/apollo-client';
import { gql } from '@apollo/client';

export const POST_LIST_QUERY = ({ limit = 12, offset = 0 }: {limit?: number, offset?: number}) => {
  return gql`
    query AllPosts {
      allPost(sort: [{ publishedAt: DESC }], limit: ${limit}, offset: ${offset}) {
        _id
        title
        slug {
          current
        }
        imageAltText
        excerpt
        image {
          asset {
            url
            metadata {
              lqip
            }
          }
        }
        tags {
          _id
          name
          slug {
            current
          }
        }
        publishedAt
      }
    }
  `;
};

export async function getPostList() {
  const client = getClient();
  const { data } = await client.query<{ allPost: PostWithTags[] }>({
    query: POST_LIST_QUERY({ limit: 12, offset: 0 }),
  });

  return data?.allPost;
}
