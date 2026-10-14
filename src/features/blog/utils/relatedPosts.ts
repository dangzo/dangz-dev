import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { getSearchKeywords, resolvePrimaryTopic } from './topics';

const KEYWORD_ALIASES: Readonly<Record<string, string>> = {
  react: 'react',
  reactjs: 'react',
  vue: 'vue',
  vuejs: 'vue',
  next: 'nextjs',
  nextjs: 'nextjs',
  ts: 'typescript',
  typescript: 'typescript',
};

function getRankingKeywords(post: PostWithTopic): Set<string> {
  const keywords = getSearchKeywords(post).map((keyword) => {
    const normalized = keyword.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const compact = normalized.replace(/ /g, '');

    return Object.hasOwn(KEYWORD_ALIASES, compact) ? KEYWORD_ALIASES[compact] : normalized;
  });

  return new Set(keywords.filter((keyword) => keyword && keyword !== 'frontend'));
}

function getPublicationTime(post: PostWithTopic): number {
  const time = Date.parse(post.publishedAt ?? '');

  return Number.isFinite(time) ? time : -Infinity;
}

export function selectRelatedPosts(currentPost: PostWithTopic, corpus: readonly PostWithTopic[]): PostWithTopic[] {
  const currentId = currentPost._id.replace(/^drafts\./, '');
  const currentSlug = currentPost.slug?.current?.trim();
  const currentTopic = resolvePrimaryTopic(currentPost)?.slug.current;
  const currentKeywords = getRankingKeywords(currentPost);
  const ranked = corpus.filter((post) => {
    const slug = post.slug?.current?.trim();

    return Boolean(post._id.trim() && !post._id.startsWith('drafts.')
      && post._id !== currentId && post.title?.trim() && slug && slug !== currentSlug);
  }).map((post) => ({
    post,
    sameTopic: Boolean(currentTopic && resolvePrimaryTopic(post)?.slug.current === currentTopic),
    sharedKeywords: [...getRankingKeywords(post)].filter((keyword) => currentKeywords.has(keyword)).length,
    publicationTime: getPublicationTime(post),
  })).sort((a, b) => {
    if (a.sameTopic !== b.sameTopic) {
      return a.sameTopic ? -1 : 1;
    }

    if (a.sharedKeywords !== b.sharedKeywords) {
      return b.sharedKeywords - a.sharedKeywords;
    }

    if (a.publicationTime !== b.publicationTime) {
      return a.publicationTime > b.publicationTime ? -1 : 1;
    }

    return a.post._id < b.post._id ? -1 : a.post._id > b.post._id ? 1 : 0;
  });
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const result: PostWithTopic[] = [];

  for (const { post } of ranked) {
    const slug = post.slug?.current?.trim();

    if (!slug || seenIds.has(post._id) || seenSlugs.has(slug)) {
      continue;
    }

    seenIds.add(post._id);
    seenSlugs.add(slug);
    result.push(post);

    if (result.length === 4) {
      break;
    }
  }

  return result;
}
