import type { TopicSummary } from '@/features/blog/types/Topic.types';

import { getE2EGraphQLResponse } from './sanity-fixtures';

function getPosts(response: ReturnType<typeof getE2EGraphQLResponse>): readonly Readonly<{
  _id?: string;
  slug: { current: string };
  primaryTopic?: TopicSummary | null;
  keywords?: readonly string[];
}>[] {
  return response.allPost ?? [];
}

const primaryFields = 'allPost { primaryTopic { slug { current } } keywords }';

describe('Sanity E2E content perspectives', () => {
  it('keeps the published corpus complete, unclassified posts included, and AI drafts hidden', () => {
    const response = getE2EGraphQLResponse({ operationName: 'AllTopics', query: primaryFields });
    const posts = getPosts(response);

    expect(posts).toHaveLength(15);
    expect(posts.filter((post) => post.primaryTopic?.slug.current === 'architecture')).toHaveLength(10);
    expect(posts.filter((post) => post.primaryTopic === null)).toHaveLength(1);
    expect(posts.some((post) => post._id?.startsWith('drafts.'))).toBe(false);
  });

  it('exposes the AI topic only in preview and keeps published slug reads clean', () => {
    const preview = getE2EGraphQLResponse({ operationName: 'AllTopics', query: primaryFields, perspective: 'previewDrafts' });
    const publicSlugs = getE2EGraphQLResponse({ operationName: 'AllPostSlugs', query: '' });

    expect(preview.allPost).toHaveLength(16);
    expect(getPosts(preview).some((post) => post.primaryTopic?.slug.current === 'ai-assisted-development')).toBe(true);
    expect(publicSlugs.allPost?.some((post) => post.slug.current === 'unpublished-ai-workflow')).toBe(false);
  });

  it('paginates lists but returns the complete search corpus including keyword-only matches', () => {
    const list = getE2EGraphQLResponse({ operationName: 'AllPosts', query: 'allPost(limit: 8, offset: 0) { keywords }' });
    const search = getE2EGraphQLResponse({ operationName: 'SearchablePosts', query: primaryFields });

    expect(list.allPost).toHaveLength(8);
    expect(getPosts(list).some((post) => post.keywords?.includes('pagination-keyword-only'))).toBe(false);
    expect(search.allPost).toHaveLength(15);
    expect(getPosts(search).some((post) => post.keywords?.includes('pagination-keyword-only'))).toBe(true);
  });

  it('does not supply new fields to legacy queries or legacy tags to primary queries', () => {
    const legacy = getE2EGraphQLResponse({ operationName: 'AllPosts', query: 'allPost { tags { name } }' });
    const primary = getE2EGraphQLResponse({ operationName: 'AllPosts', query: primaryFields });

    expect(legacy.allPost?.[0]).toHaveProperty('tags');
    expect(legacy.allPost?.[0]).not.toHaveProperty('primaryTopic');
    expect(legacy.allPost?.[0]).not.toHaveProperty('keywords');
    expect(primary.allPost?.[0]).toHaveProperty('primaryTopic');
    expect(primary.allPost?.[0]).not.toHaveProperty('tags');
  });

  it('resolves article variables and respects draft isolation', () => {
    const published = getE2EGraphQLResponse({ operationName: 'postsBySlug', query: '', variables: { slug: 'stable-visual-regression-tests' } });
    const draft = { operationName: 'postsBySlug', query: '', variables: { slug: 'unpublished-ai-workflow' } };

    expect(published.allPost).toHaveLength(1);
    expect(getE2EGraphQLResponse(draft).allPost).toHaveLength(0);
    expect(getE2EGraphQLResponse({ ...draft, perspective: 'previewDrafts' }).allPost).toHaveLength(1);
  });
});
