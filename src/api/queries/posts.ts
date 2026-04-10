import type { PostWithTags } from '@/types/Post.types';
import { query } from '@/api/apollo-client';
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

const POST_SLUGS_QUERY = gql`
  query AllPostSlugs {
    allPost {
      slug { current }
    }
  }
`;

export async function getPostSlugs(): Promise<{ slug: { current: string } }[]> {
  const { data } = await query<{ allPost: { slug: { current: string } }[] }>({
    query: POST_SLUGS_QUERY,
  });
  return data?.allPost ?? [];
}

export async function getPostList() {
  const { data } = await query<{ allPost: PostWithTags[] }>({
    query: POST_LIST_QUERY({ limit: 12, offset: 0 }),
  });

  return data?.allPost;
}

export async function getPostBySlug(slug: string): Promise<PostWithTags | undefined> {
  const { data } = await query<{ allPost: PostWithTags[] }>({
    query: POSTS_BY_SLUG_QUERY({ slug })
  });
  return data?.allPost?.[0];
}