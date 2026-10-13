import { gql, type TypedDocumentNode } from '@apollo/client';
import { cache } from 'react';
import { getClient } from '@/api/apollo-client';
import type { PostWithTopic, PostWithTopicSource } from '@/features/blog/types/Post.types';
import { selectRelatedPosts } from '@/features/blog/utils/relatedPosts';
import { getSearchKeywords, resolvePrimaryTopic } from '@/features/blog/utils/topics';
import { getPostTopicFields } from './topicFields';

export const RELATED_POSTS_QUERY = (): TypedDocumentNode<{ allPost: PostWithTopicSource[] }> => {
  return gql`
    query AllRelatedPosts {
      allPost {
        _id
        title
        slug { current }
        publishedAt
        excerpt
        imageAltText
        image {
          asset { url }
        }
        ${getPostTopicFields()}
      }
    }
  `;
};

const getPublishedCorpus = cache(async (): Promise<PostWithTopic[]> => {
  try {
    const { data } = await getClient({ publishedOnly: true }).query({ query: RELATED_POSTS_QUERY() });

    return (data?.allPost ?? []).map((post) => ({
      ...post,
      tags: post.tags ?? [],
      primaryTopic: resolvePrimaryTopic(post),
      keywords: getSearchKeywords(post),
    }));
  } catch {
    // Avoid logging CMS errors that could include query context or credentials.
    // eslint-disable-next-line no-console -- Optional CMS reads need server-side failure visibility.
    console.error('Unable to fetch published article recommendations.');

    return [];
  }
});

export async function getRelatedPosts(post: PostWithTopic): Promise<PostWithTopic[]> {
  return selectRelatedPosts(post, await getPublishedCorpus());
}
