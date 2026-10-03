import { gql } from '@apollo/client';
import { getClient, getContentClient, usesPrimaryTopicModel, type ContentReadOptions } from '@/api/apollo-client';
import { TOPICS } from '@/features/blog/data/topics';
import type { TopicSource, TopicSummary, TopicWithCount } from '@/features/blog/types/Topic.types';
import type { SearchablePostSource } from '@/features/blog/types/Post.types';
import { normalizeTopic, resolvePrimaryTopic } from '@/features/blog/utils/topics';
import { getPrimaryTopicFields } from './topicFields';

export const TOPICS_WITH_COUNT_QUERY = () => gql`
  query AllTopics {
    allPost {
      _id
      ${getPrimaryTopicFields()}
    }
    ${usesPrimaryTopicModel()
    ? `allTopic(sort: [{ displayName: ASC }]) {
      _id
      displayName
      slug { current }
      description
      editorialGuidance
    }`
    : ''}
  }
`;

export async function getTopicsWithCount(options: ContentReadOptions & Readonly<{ outsideRender?: boolean }> = {}): Promise<{
  topics: TopicWithCount[];
  totalPostCount: number;
}> {
  const client = options.outsideRender ? getContentClient(options) : getClient(options);
  const { data } = await client.query<{
    allPost: SearchablePostSource[];
    allTopic?: readonly (TopicSource | null)[];
      }>({ query: TOPICS_WITH_COUNT_QUERY() });
  const posts = data?.allPost ?? [];
  const counts = new Map<string, number>();

  for (const post of posts) {
    const slug = resolvePrimaryTopic(post)?.slug.current;

    if (slug) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  const catalog = new Map<string, TopicSummary>(TOPICS.map((topic) => [topic.slug.current, topic]));

  if (usesPrimaryTopicModel()) {
    for (const source of data?.allTopic ?? []) {
      const topic = normalizeTopic(source);

      if (topic) {
        catalog.set(topic.slug.current, topic);
      }
    }
  }

  return {
    topics: [...catalog.values()].map((topic) => ({
      ...topic,
      postCount: counts.get(topic.slug.current) ?? 0,
    })),
    totalPostCount: posts.length,
  };
}

export async function getTopicBySlug(slug: string, options: ContentReadOptions = {}) {
  const { topics } = await getTopicsWithCount(options);

  return topics.find((topic) => topic.slug.current === slug);
}
