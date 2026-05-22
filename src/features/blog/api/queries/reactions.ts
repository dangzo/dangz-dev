import { getClient } from '@/api/apollo-client';
import { gql } from '@apollo/client';
import { cache } from 'react';

export interface ReactionWithEmoji {
  _id: string;
  name: string;
  emoji: string;
  sortOrder: number;
  count?: number;
}

interface ReactionCountUpdate {
  _id: string;
  count?: number;
}

const ALL_REACTIONS_QUERY = gql`
  query AllReactions {
    allReaction(sort: [{ sortOrder: ASC }]) {
      _id
      name
      emoji
      sortOrder
      count
    }
  }
`;

export const getReactions = cache(async (): Promise<ReactionWithEmoji[]> => {
  const client = getClient();
  const { data } = await client.query<{ allReaction: ReactionWithEmoji[] }>({
    query: ALL_REACTIONS_QUERY,
    fetchPolicy: 'no-cache',
  });

  return data?.allReaction ?? [];
});

export async function incrementReactionCount(reactionId: string, currentCount: number): Promise<number> {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;

  if (!writeToken) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN for reaction mutations.');
  }

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
          patch: {
            id: reactionId,
            inc: {
              count: 1,
            },
            setIfMissing: {
              count: 0,
            },
          },
        },
      ],
    }),
    cache: 'no-store',
  });

  const payload = await response.json() as {
    results?: Array<{
      document?: ReactionCountUpdate;
    }>;
    errors?: Array<{ message?: string }>;
    error?: { description?: string };
  };

  if (!response.ok || payload.errors?.length) {
    const errorMessage = payload.errors?.map((error) => error.message).filter(Boolean).join(' | ')
      || payload.error?.description;
    throw new Error(errorMessage || `Failed to increment reaction count (status ${response.status}).`);
  }

  return payload.results?.[0]?.document?.count ?? currentCount + 1;
}