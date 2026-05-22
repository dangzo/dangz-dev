import { getClient } from '@/api/apollo-client';
import { gql } from '@apollo/client';
import { cache } from 'react';

export interface ReactionWithEmoji {
  _id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

const ALL_REACTIONS_QUERY = gql`
  query AllReactions {
    allReaction(sort: [{ sortOrder: ASC }]) {
      _id
      name
      emoji
      sortOrder
    }
  }
`;

export const getReactions = cache(async (): Promise<ReactionWithEmoji[]> => {
  const client = getClient();
  const { data } = await client.query<{ allReaction: ReactionWithEmoji[] }>({
    query: ALL_REACTIONS_QUERY,
  });

  return data?.allReaction ?? [];
});