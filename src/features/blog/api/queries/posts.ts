import type { PostWithTags, PostReactionSummaryItem } from '@/features/blog/types/Post.types';
import { getClient } from '@/api/apollo-client';
import { gql, type TypedDocumentNode } from '@apollo/client';
import { PAGE_SIZE } from '@/features/blog/utils/pagination';

interface PostListQueryResult {
  allPost: PostWithTags[];
  allReaction: Array<Pick<PostReactionSummaryItem, '_id' | 'name' | 'emoji' | 'sortOrder'>>;
  allPostReactionCount: Array<{
    count?: number;
    post?: { _id?: string };
    reaction?: { _id?: string };
  }>;
}

export const POST_LIST_QUERY = ({ limit, offset }: {limit?: number, offset?: number} = {}): TypedDocumentNode<PostListQueryResult> => {
  // Sanity's auto-generated GraphQL PostFilter has no field for the `tags`
  // reference array, so tag filtering can't be pushed into `where` here —
  // omitting limit/offset fetches every post, which callers filter/paginate
  // in JS (see getPostList's tagSlug branch).
  const pagination = typeof limit === 'number' ? `, limit: ${limit}, offset: ${offset ?? 0}` : '';

  return gql`
    query AllPosts {
      allPost(sort: [{ publishedAt: DESC }]${pagination}) {
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
      allReaction(sort: [{ sortOrder: ASC }]) {
        _id
        name
        emoji
        sortOrder
      }
      allPostReactionCount {
        count
        post {
          _id
        }
        reaction {
          _id
        }
      }
    }
  `;
};

interface GetPostListParams {
  page?: number;
  pageSize?: number;
  tagSlug?: string;
}

export async function getPostList({ page = 1, pageSize = PAGE_SIZE, tagSlug }: GetPostListParams = {}) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : PAGE_SIZE;
  const offset = (safePage - 1) * safePageSize;

  const client = getClient();
  const { data } = await client.query({
    // Tag filtering happens in JS below, so a filtered page needs the full
    // unbounded set rather than a single limit/offset slice.
    query: tagSlug
      ? POST_LIST_QUERY()
      : POST_LIST_QUERY({ limit: safePageSize, offset }),
  });

  let allPosts = data?.allPost ?? [];
  const allReactions = data?.allReaction ?? [];
  const allReactionCounts = data?.allPostReactionCount ?? [];

  if (tagSlug) {
    allPosts = allPosts
      .filter((post) => post.tags?.some((tag) => tag.slug?.current === tagSlug))
      .slice(offset, offset + safePageSize);
  }

  const reactionsById = new Map(allReactions.map((reaction) => [reaction._id, reaction]));

  const countsByPostId = allReactionCounts.reduce((acc, item) => {
    const postId = item.post?._id;
    const reactionId = item.reaction?._id;

    if (!postId || !reactionId) {
      return acc;
    }

    const entries = acc.get(postId) ?? [];
    entries.push({ reactionId, count: item.count ?? 0 });
    acc.set(postId, entries);
    return acc;
  }, new Map<string, Array<{ reactionId: string; count: number }>>());

  return allPosts.map((post) => {
    const postReactionCounts = countsByPostId.get(post._id) ?? [];

    const reactions = postReactionCounts.reduce<PostReactionSummaryItem[]>((acc, item) => {
      const reaction = reactionsById.get(item.reactionId);

      if (!reaction) {
        return acc;
      }

      acc.push({
        _id: reaction._id,
        name: reaction.name,
        emoji: reaction.emoji,
        sortOrder: reaction.sortOrder,
        count: item.count,
      });

      return acc;
    }, [])
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return {
      ...post,
      reactions,
    };
  });
}
