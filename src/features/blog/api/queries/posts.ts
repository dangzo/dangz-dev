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
  const client = getClient();
  const { data } = await client.query<{ allPost: { slug: { current: string } }[] }>({
    query: POST_SLUGS_QUERY,
  });
  return data?.allPost ?? [];
}

export async function getPostList() {
  const client = getClient();
  const { data } = await client.query<{ allPost: PostWithTags[] }>({
    query: POST_LIST_QUERY({ limit: 12, offset: 0 }),
  });

  return data?.allPost;
}

export async function getPostBySlug(slug: string): Promise<PostWithTags | undefined> {
  const client = getClient();
  const { data } = await client.query<{ allPost: PostWithTags[] }>({
    query: POSTS_BY_SLUG_QUERY({ slug })
  });
  return data?.allPost?.[0];
}

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