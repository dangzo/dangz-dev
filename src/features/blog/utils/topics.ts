import { LEGACY_TAG_REDIRECTS, POST_TOPIC_ASSIGNMENTS, TOPICS } from '@/features/blog/data/topics';
import type { TopicSource, TopicSummary } from '@/features/blog/types/Topic.types';

import { PAGE_SIZE, parsePageParam } from './pagination';

export type LegacyTopicPost = Readonly<{
  _id: string;
  primaryTopic?: TopicSource | null;
  keywords?: readonly string[] | null;
  tags?: readonly Readonly<{
    name?: string;
    slug?: Readonly<{ current?: string }>;
  }>[] | null;
}>;

const TECHNOLOGY_ALIASES: Readonly<Record<string, readonly string[]>> = {
  react: ['React.js', 'ReactJS'],
  'vue-js': ['Vue', 'Vue.js', 'VueJS'],
  'next-js': ['Next', 'Next.js', 'NextJS'],
  typescript: ['TypeScript', 'TS'],
  graphql: ['GraphQL'],
};

function getPublishedId(id: string): string {
  return id.replace(/^drafts\./, '');
}

export function normalizeTopic(topic: TopicSource | null | undefined): TopicSummary | null {
  const displayName = topic?.displayName;
  const slug = topic?.slug?.current;

  if (!topic || !displayName?.trim() || !slug?.trim()) {
    return null;
  }

  return {
    _id: topic._id,
    displayName,
    slug: { current: slug },
    description: topic.description ?? '',
    editorialGuidance: topic.editorialGuidance ?? undefined,
  };
}

export function resolvePrimaryTopic(post: LegacyTopicPost): TopicSummary | null {
  const topic = normalizeTopic(post.primaryTopic);

  if (topic) {
    return topic;
  }

  const id = getPublishedId(post._id);

  if (!Object.hasOwn(POST_TOPIC_ASSIGNMENTS, id)) {
    return null;
  }

  const assignedSlug = POST_TOPIC_ASSIGNMENTS[id];

  return TOPICS.find((topic) => topic.slug.current === assignedSlug) ?? null;
}

export function getSearchKeywords(post: LegacyTopicPost): string[] {
  const keywords = [...(post.keywords ?? [])];

  for (const tag of post.tags ?? []) {
    if (tag.name) {
      keywords.push(tag.name);
    }

    const slug = tag.slug?.current;

    if (slug) {
      keywords.push(slug, slug.replace(/-/g, ' '));

      if (Object.hasOwn(TECHNOLOGY_ALIASES, slug)) {
        keywords.push(...TECHNOLOGY_ALIASES[slug]);
      }
    }
  }

  if (Object.hasOwn(POST_TOPIC_ASSIGNMENTS, getPublishedId(post._id))) {
    keywords.push('frontend');
  }

  const seen = new Set<string>();

  return keywords.map((keyword) => keyword.trim()).filter((keyword) => {
    const normalized = keyword.toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}

export function getTopicHref(topic: TopicSummary | string): string {
  const slug = typeof topic === 'string' ? topic : topic.slug.current;

  return `/blog/topics/${slug}`;
}

export function resolveLegacyTagRedirect(
  slug: string,
  rawPage: string | undefined,
  publishedCounts: Readonly<Record<string, number>>,
  pageSize: number = PAGE_SIZE,
): string | null {
  if (!Object.hasOwn(LEGACY_TAG_REDIRECTS, slug)) {
    return null;
  }

  const destination = LEGACY_TAG_REDIRECTS[slug];
  const topicCount = destination ? publishedCounts[destination] ?? 0 : 0;
  const hasPublishedTopic = destination !== null && topicCount > 0;
  const href = hasPublishedTopic ? getTopicHref(destination) : '/blog';
  // The 'all' count is the full published corpus, including posts without a topic.
  const count = hasPublishedTopic ? topicCount : publishedCounts.all ?? 0;
  const page = rawPage === undefined ? null : parsePageParam(rawPage);

  if (
    page !== null
    && Number.isSafeInteger(page)
    && page > 1
    && Number.isSafeInteger(pageSize)
    && pageSize > 0
    && page <= Math.ceil(count / pageSize)
  ) {
    return `${href}/page/${page}`;
  }

  return href;
}
