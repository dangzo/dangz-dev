import { POST_TOPIC_ASSIGNMENTS, TOPICS } from '@/features/blog/data/topics';

import { getSearchKeywords, getTopicHref, normalizeTopic, resolveLegacyTagRedirect, resolvePrimaryTopic } from './topics';

const architectureId = '27dd202f-fbfa-4549-b8a1-a9926769bfa6';
const performance = TOPICS.find((topic) => topic.slug.current === 'performance')!;

describe('resolvePrimaryTopic', () => {
  it('keeps a populated CMS assignment authoritative over the migration manifest', () => {
    expect(resolvePrimaryTopic({ _id: architectureId, primaryTopic: performance })).toEqual(performance);
  });

  it('resolves approved published and draft IDs to the same topic', () => {
    expect(resolvePrimaryTopic({ _id: architectureId })?.slug.current).toBe('architecture');
    expect(resolvePrimaryTopic({ _id: `drafts.${architectureId}` })?.slug.current).toBe('architecture');
  });

  it('uses approved assignments when a draft topic reference is unfinished', () => {
    const unfinished = { _id: 'draft-topic', displayName: 'Draft topic', slug: null };

    expect(resolvePrimaryTopic({ _id: `drafts.${architectureId}`, primaryTopic: unfinished })?.slug.current).toBe('architecture');
    expect(resolvePrimaryTopic({ _id: 'new-draft', primaryTopic: unfinished })).toBeNull();
    expect(resolvePrimaryTopic({ _id: 'new-draft', primaryTopic: { _id: 'draft-topic', slug: { current: 'draft-topic' } } })).toBeNull();
  });

  it('normalizes optional editorial fields only after a draft has a topic name and slug', () => {
    expect(normalizeTopic({ _id: 'draft-topic', displayName: 'Draft topic', slug: { current: 'draft-topic' } })).toEqual({
      _id: 'draft-topic', displayName: 'Draft topic', slug: { current: 'draft-topic' }, description: '', editorialGuidance: undefined,
    });
    expect(normalizeTopic({ _id: 'draft-topic', displayName: ' ', slug: { current: 'draft-topic' } })).toBeNull();
    expect(normalizeTopic({ _id: 'draft-topic', displayName: 'Draft topic', slug: { current: ' ' } })).toBeNull();
  });

  it('keeps unknown posts unclassified even when legacy tags resemble a topic', () => {
    expect(resolvePrimaryTopic({ _id: 'unknown', tags: [{ name: 'Architecture' }] })).toBeNull();
    expect(resolvePrimaryTopic({ _id: '__proto__' })).toBeNull();
  });

  it('produces the approved published distribution without counting the unpublished AI draft', () => {
    const counts: Record<string, number> = {};

    for (const id of Object.keys(POST_TOPIC_ASSIGNMENTS)) {
      if (id === 'cecb1ab3-1182-4de2-9955-703b1d0a87cd') {
        continue;
      }

      const topic = resolvePrimaryTopic({ _id: id });
      const slug = topic!.slug.current;
      counts[slug] = (counts[slug] ?? 0) + 1;
    }

    expect(counts).toEqual({
      architecture: 3,
      performance: 2,
      accessibility: 1,
      'full-stack-engineering': 1,
      interviews: 1,
    });
  });
});

describe('getSearchKeywords', () => {
  it('preserves legacy labels, slug search matches, aliases, and explicit keywords', () => {
    expect(getSearchKeywords({
      _id: architectureId,
      keywords: ['authentication', ' React ', ''],
      tags: [
        { name: 'React', slug: { current: 'react' } },
        { name: 'Vue.js', slug: { current: 'vue-js' } },
        { name: 'Clean Code', slug: { current: 'clean-code' } },
      ],
    })).toEqual([
      'authentication', 'React', 'React.js', 'ReactJS', 'Vue.js', 'vue-js',
      'vue js', 'Vue', 'VueJS', 'Clean Code', 'clean-code', 'frontend',
    ]);
  });

  it('adds frontend only to approved existing articles and tolerates absent tags', () => {
    expect(getSearchKeywords({ _id: `drafts.${architectureId}` })).toEqual(['frontend']);
    expect(getSearchKeywords({ _id: 'unknown', keywords: [' Accessibility ', 'accessibility'] })).toEqual(['Accessibility']);
  });
});

describe('legacy tag redirects', () => {
  const counts = { architecture: 18, performance: 2, 'full-stack-engineering': 1 };

  it('points archives directly to canonical topics and preserves valid pagination', () => {
    expect(resolveLegacyTagRedirect('frontend-architecture', undefined, counts)).toBe('/blog/topics/architecture');
    expect(resolveLegacyTagRedirect('design-patterns', '2', counts)).toBe('/blog/topics/architecture/page/2');
    expect(resolveLegacyTagRedirect('scalability', '3', counts)).toBe('/blog/topics/architecture/page/3');
    expect(resolveLegacyTagRedirect('lighthouse', undefined, counts)).toBe('/blog/topics/performance');
    expect(resolveLegacyTagRedirect('devops', undefined, counts)).toBe('/blog/topics/full-stack-engineering');
  });

  it.each(['1', '0', '-1', '01', '1.0', '2.5', '4', '9007199254740993', 'abc'])('normalizes invalid or unnecessary page %s to the destination root', (page) => {
    expect(resolveLegacyTagRedirect('frontend-architecture', page, counts)).toBe('/blog/topics/architecture');
  });

  it('falls back to the blog when a mapped topic has no published content', () => {
    expect(resolveLegacyTagRedirect('web-accessibility', '2', counts)).toBe('/blog');
    expect(resolveLegacyTagRedirect('frontend-architecture', '2', { architecture: 0 })).toBe('/blog');
  });

  it('preserves only valid blog pagination for broad tags and empty topic destinations', () => {
    const publishedCounts = { ...counts, all: 25 };

    expect(resolveLegacyTagRedirect('react', '3', publishedCounts)).toBe('/blog/page/3');
    expect(resolveLegacyTagRedirect('web-accessibility', '4', publishedCounts)).toBe('/blog/page/4');
    expect(resolveLegacyTagRedirect('react', '5', publishedCounts)).toBe('/blog');
    expect(resolveLegacyTagRedirect('react', '01', publishedCounts)).toBe('/blog');
  });

  it('keeps technology archives at the blog root and unknown slugs missing', () => {
    expect(resolveLegacyTagRedirect('react', '2', counts)).toBe('/blog');
    expect(resolveLegacyTagRedirect('graphql', undefined, counts)).toBe('/blog');
    expect(resolveLegacyTagRedirect('unknown', undefined, counts)).toBeNull();
    expect(resolveLegacyTagRedirect('__proto__', undefined, counts)).toBeNull();
  });

  it('builds topic links consistently from documents and slugs', () => {
    expect(getTopicHref(performance)).toBe('/blog/topics/performance');
    expect(getTopicHref('performance')).toBe('/blog/topics/performance');
  });
});
