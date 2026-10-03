import type { PostWithTags, PostWithTopicSource } from '@/features/blog/types/Post.types';
import { getClient, type ContentReadOptions } from '@/api/apollo-client';
import { gql } from '@apollo/client';
import { cache } from 'react';
import { resolvePrimaryTopic, getSearchKeywords } from '@/features/blog/utils/topics';
import { getPostTopicFields } from './topicFields';

/**
 * POSTS BY SLUG
 */

const POSTS_BY_SLUG_QUERY = () => {
  return gql`
    query postsBySlug($slug: String!) {
      allPost(where: { slug: { current: { eq: $slug } } }) {
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
        ${getPostTopicFields()}
        excerpt
        body: bodyRaw
        publishedAt
      }
    }
  `;
};

export const getPostBySlug = cache(async (slug: string): Promise<PostWithTags | undefined> => {
  const client = getClient();
  const { data } = await client.query<{ allPost: PostWithTopicSource[] }>({
    query: POSTS_BY_SLUG_QUERY(),
    variables: { slug },
  });
  const post = data?.allPost?.[0];

  return post ? { ...post, tags: post.tags ?? [], primaryTopic: resolvePrimaryTopic(post), keywords: getSearchKeywords(post) } : undefined;
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

export async function getPostSlugs(options: ContentReadOptions = { publishedOnly: true }): Promise<{ slug: { current: string } }[]> {
  const client = getClient(options);
  const { data } = await client.query<{ allPost: { slug: { current: string } }[] }>({
    query: POST_SLUGS_QUERY,
  });
  return data?.allPost ?? [];
}