import type { PostWithTags } from '@/features/blog/types/Post.types';
import { getClient } from '@/api/apollo-client';
import { gql } from '@apollo/client';
import { cache } from 'react';

/**
 * POSTS BY SLUG
 */

const POSTS_BY_SLUG_QUERY = ({ slug }: { slug: string }) => {
  return gql`
    query postsBySlug {
      allPost(where: { slug: { current: { eq: "${slug}" } } }) {
        _id
        title
        slug {
          current
        }
        image {
          asset {
            url
            metadata {
              lqip
            }
          }
        }
        imageAltText
        tags {
          _id
          name
          slug {
            current
          }
        }
        excerpt
        body: bodyRaw
        publishedAt
      }
    }
  `;
};

export const getPostBySlug = cache(async (slug: string): Promise<PostWithTags | undefined> => {
  const client = getClient();
  const { data } = await client.query<{ allPost: PostWithTags[] }>({
    query: POSTS_BY_SLUG_QUERY({ slug })
  });
  return data?.allPost?.[0];
});

/**
 * POST SLUGS
 */

const POST_SLUGS_QUERY = gql`
  query AllPostSlugs {
    allPost {
      slug { current }
    }
  }
`;

export async function getPostSlugs(): Promise<{ slug: { current: string } }[]> {
  const client = getClient();
  const { data } = await client.query<{ allPost: { slug: { current: string } }[] }>({
    query: POST_SLUGS_QUERY,
  });
  return data?.allPost ?? [];
}