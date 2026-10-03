import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import {
  CMS_CONTENT_CACHE_TAG,
  SEARCH_CORPUS_CACHE_TAG,
  isDraftPreviewEnabled,
  usesPrimaryTopicModel,
} from '@/api/apollo-client';
import { getSearchablePosts } from '@/features/blog/api/queries/search';
import type { TopicSummary } from '@/features/blog/types/Topic.types';

export type SearchResult = Readonly<{
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  primaryTopic: TopicSummary | null;
  // Older browser bundles still read tags.length after a frontend deployment.
  tags: readonly string[];
  score: number;
}>;

type SearchCorpusEntry = Omit<SearchResult, 'score' | 'tags'> & Readonly<{
  searchableTitle: string;
  searchableExcerpt: string;
  searchableTopic: string;
  searchableKeywords: readonly string[];
}>;

const normalize = (value: string) => value.trim().toLowerCase();

const buildSearchCorpus = async (publishedOnly: boolean): Promise<SearchCorpusEntry[]> => {
  const posts = await getSearchablePosts({ publishedOnly });

  return posts.map((post) => {
    const title = post.title ?? '';
    const slug = post.slug?.current ?? '';
    const excerpt = post.excerpt ?? '';
    const primaryTopic = post.primaryTopic ?? null;

    return {
      id: post._id,
      slug,
      title,
      excerpt,
      primaryTopic,
      searchableTitle: normalize(title),
      searchableExcerpt: normalize(excerpt),
      searchableTopic: normalize(primaryTopic?.displayName ?? ''),
      searchableKeywords: (post.keywords ?? []).map(normalize),
    };
  }).filter((post) => post.slug.length > 0);
};

const getPublishedSearchCorpus = (model: string) => {
  return unstable_cache(
    async () => buildSearchCorpus(true),
    ['search-corpus-v3', model],
    { revalidate: 3600, tags: [CMS_CONTENT_CACHE_TAG, SEARCH_CORPUS_CACHE_TAG] },
  )();
};

const scorePost = (post: SearchCorpusEntry, query: string) => {
  let score = 0;

  if (post.searchableTitle.includes(query)) {
    score += 6;
  }

  if (post.searchableExcerpt.includes(query)) {
    score += 4;
  }

  if (post.searchableTopic.includes(query)) {
    score += 3;
  }

  score += post.searchableKeywords.filter((keyword) => keyword.includes(query)).length * 3;

  return score;
};

export async function GET(request: Request) {
  const query = normalize(new URL(request.url).searchParams.get('q') ?? '');

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Drafts must never enter the persistent published corpus, even locally.
  const preview = isDraftPreviewEnabled();
  const bypassCache = preview || process.env.E2E_FIXTURES === 'true';
  const posts = bypassCache
    ? await buildSearchCorpus(!preview)
    : await getPublishedSearchCorpus(usesPrimaryTopicModel() ? 'primary' : 'legacy');

  const results: SearchResult[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    primaryTopic: post.primaryTopic,
    tags: [],
    score: scorePost(post, query),
  })).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return NextResponse.json({ results });
}
