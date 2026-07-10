import type { PostWithTags, PostReactionSummaryItem } from '@/features/blog/types/Post.types';
import { getClient } from '@/api/apollo-client';
import { gql, type TypedDocumentNode } from '@apollo/client';

interface PostListQueryResult {
  allPost: PostWithTags[];
  allReaction: Array<Pick<PostReactionSummaryItem, '_id' | 'name' | 'emoji' | 'sortOrder'>>;
  allPostReactionCount: Array<{
    count?: number;
    post?: { _id?: string };
    reaction?: { _id?: string };
  }>;
}

export const POST_LIST_QUERY = ({ limit = 12, offset = 0 }: {limit?: number, offset?: number}): TypedDocumentNode<PostListQueryResult> => {
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

export async function getPostList() {
  const client = getClient();
  const { data } = await client.query({
    query: POST_LIST_QUERY({ limit: 12, offset: 0 }),
  });

  const allPosts = data?.allPost ?? [];
  const allReactions = data?.allReaction ?? [];
  const allReactionCounts = data?.allPostReactionCount ?? [];

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
