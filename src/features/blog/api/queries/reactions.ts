import { getClient } from '@/api/apollo-client';
import { gql } from '@apollo/client';

export interface ReactionWithEmoji {
  _id: string;
  name: string;
  emoji: string;
  sortOrder: number;
  count?: number;
}

interface PostReactionCountDocument {
  _id: string;
  count?: number;
  reaction?: {
    _id?: string;
  };
}

interface MutationResultDocument {
  count?: number;
}

const REACTIONS_FOR_POST_QUERY = gql`
  query ReactionsForPost($postId: ID!) {
    allReaction(sort: [{ sortOrder: ASC }]) {
      _id
      name
      emoji
      sortOrder
    }
    allPostReactionCount(where: { _: { references: $postId } }) {
      _id
      count
      reaction {
        _id
      }
    }
  }
`;

export async function getReactionsForPost(postId: string): Promise<ReactionWithEmoji[]> {
  const client = getClient();
  const { data } = await client.query<{
    allReaction: ReactionWithEmoji[];
    allPostReactionCount: PostReactionCountDocument[];
  }>({
    query: REACTIONS_FOR_POST_QUERY,
    variables: { postId },
    fetchPolicy: 'no-cache',
  });

  const countsByReactionId = new Map<string, number>();
  for (const item of data?.allPostReactionCount ?? []) {
    const reactionId = item.reaction?._id;
    if (!reactionId) {
      continue;
    }
    countsByReactionId.set(reactionId, item.count ?? 0);
  }

  return (data?.allReaction ?? []).map((reaction) => ({
    ...reaction,
    count: countsByReactionId.get(reaction._id) ?? 0,
  }));
}

const createPostReactionCountDocumentId = (postId: string, reactionId: string) => {
  const safePostId = postId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeReactionId = reactionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `postReactionCount-${safePostId}-${safeReactionId}`;
};

export async function incrementReactionCount(
  postId: string,
  reactionId: string,
  currentCount: number,
): Promise<number> {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;

  if (!writeToken) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN for reaction mutations.');
  }

  const reactionCountDocId = createPostReactionCountDocumentId(postId, reactionId);

  const response = await fetch('https://wdxhl3tc.api.sanity.io/v2025-02-19/data/mutate/production', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${writeToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      returnDocuments: true,
      mutations: [
        {
          createIfNotExists: {
            _id: reactionCountDocId,
            _type: 'postReactionCount',
            post: {
              _type: 'reference',
              _ref: postId,
            },
            reaction: {
              _type: 'reference',
              _ref: reactionId,
            },
            count: 0,
          },
        },
        {
          patch: {
            id: reactionCountDocId,
            inc: {
              count: 1,
            },
          },
        },
      ],
    }),
    cache: 'no-store',
  });

  const payload = await response.json() as {
    results?: Array<{
      document?: MutationResultDocument;
    }>;
    errors?: Array<{ message?: string }>;
    error?: { description?: string };
  };

  if (!response.ok || payload.errors?.length) {
    const errorMessage = payload.errors?.map((error) => error.message).filter(Boolean).join(' | ')
      || payload.error?.description;
    throw new Error(errorMessage || `Failed to increment reaction count (status ${response.status}).`);
  }

  const updatedCount = payload.results?.reduce<number | undefined>((acc, result) => {
    if (typeof result.document?.count === 'number') {
      return result.document.count;
    }
    return acc;
  }, undefined);

  return updatedCount ?? currentCount + 1;
}