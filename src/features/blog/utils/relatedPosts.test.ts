import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { TOPICS } from '@/features/blog/data/topics';
import { selectRelatedPosts } from './relatedPosts';

function post(id: string, overrides: Partial<PostWithTopic> = {}): PostWithTopic {
  return {
    _id: id,
    _type: 'post',
    _createdAt: '',
    _updatedAt: '',
    _rev: '',
    title: id,
    slug: { _type: 'slug', current: id },
    tags: [],
    ...overrides,
  };
}

describe('selectRelatedPosts', () => {
  it('prioritizes the primary topic, then shared keywords, then publication date', () => {
    const current = post('current', { primaryTopic: TOPICS[0], keywords: ['React', 'accessibility'] });
    const corpus = [
      post('other-topic', { primaryTopic: TOPICS[1], keywords: ['React', 'accessibility'], publishedAt: '2026-01-01' }),
      post('same-topic-new', { primaryTopic: TOPICS[0], publishedAt: '2026-01-01' }),
      post('same-topic-relevant', { primaryTopic: TOPICS[0], keywords: ['React'], publishedAt: '2020-01-01' }),
      post('same-topic-old', { primaryTopic: TOPICS[0], publishedAt: '2025-01-01' }),
    ];

    expect(selectRelatedPosts(current, corpus).map(({ _id }) => _id)).toEqual([
      'same-topic-relevant', 'same-topic-new', 'same-topic-old', 'other-topic',
    ]);
  });

  it('collapses technology aliases and punctuation without inflating distinct keyword overlap', () => {
    const current = post('current', { keywords: ['REACT.JS', ' Vue-js ', 'Next.js', 'TypeScript', 'unit testing'] });
    const corpus = [
      post('aliases', { keywords: ['React', 'ReactJS', 'react.js', 'frontend'], publishedAt: '2026-01-01' }),
      post('distinct', { keywords: ['VUE', ' next ', ' TS ', ' Unit---Testing '], publishedAt: '2020-01-01' }),
    ];

    expect(selectRelatedPosts(current, corpus).map(({ _id }) => _id)).toEqual(['distinct', 'aliases']);
  });

  it('uses recency for unrelated posts and ignores the universal frontend keyword', () => {
    const current = post('current', { keywords: ['frontend'] });
    const corpus = [
      post('older-frontend', { keywords: ['frontend'], publishedAt: '2020-01-01' }),
      post('newer', { publishedAt: '2025-01-01' }),
      post('newest', { publishedAt: '2026-01-01' }),
      post('invalid-date', { publishedAt: 'invalid' }),
    ];

    expect(selectRelatedPosts(current, corpus).map(({ _id }) => _id)).toEqual(['newest', 'newer', 'older-frontend', 'invalid-date']);
  });

  it('treats missing and invalid dates as oldest and uses deterministic ID ties', () => {
    const corpus = [post('z', { publishedAt: 'invalid' }), post('a'), post('dated', { publishedAt: '1970-01-01' })];

    expect(selectRelatedPosts(post('current'), corpus).map(({ _id }) => _id)).toEqual(['dated', 'a', 'z']);
    expect(selectRelatedPosts(post('current'), [...corpus].reverse()).map(({ _id }) => _id)).toEqual(['dated', 'a', 'z']);
  });

  it('excludes the current draft counterpart, current slug, drafts, and unusable cards, then deduplicates', () => {
    const current = post('drafts.current');
    const valid = post('valid');
    const corpus = [
      post('current'),
      post('renamed', { slug: current.slug }),
      post('drafts.other'),
      post('no-title', { title: ' ' }),
      post('no-slug', { slug: undefined }),
      post('empty-slug', { slug: { _type: 'slug', current: ' ' } }),
      post('', { slug: { _type: 'slug', current: 'empty-id' } }),
      valid,
      valid,
      post('z-duplicate-slug', { slug: valid.slug }),
      post('second'),
    ];

    expect(selectRelatedPosts(current, corpus).map(({ _id }) => _id)).toEqual(['second', 'valid']);
  });

  it('derives keyword matches from legacy tags and resolves approved legacy topic assignments', () => {
    const current = post('current', { primaryTopic: TOPICS.find((topic) => topic.slug.current === 'architecture') });
    const legacy = post('27dd202f-fbfa-4549-b8a1-a9926769bfa6');
    const newer = post('newer', { publishedAt: '2026-01-01' });

    expect(selectRelatedPosts(current, [newer, legacy])[0]).toBe(legacy);

    const tagged = post('tagged', { tags: [{ _id: 'react', _type: 'tag', _createdAt: '', _updatedAt: '', _rev: '', name: 'React.js' }] });

    expect(selectRelatedPosts(post('current', { keywords: ['ReactJS'] }), [newer, tagged])[0]).toBe(tagged);
  });

  it('selects at most four distinct destinations after deduplication', () => {
    const corpus = [post('e'), post('a'), post('a'), post('b'), post('c'), post('d')];

    expect(selectRelatedPosts(post('current'), corpus).map(({ _id }) => _id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns all eligible entries in a small corpus and handles empty corpora without changing input', () => {
    const current = post('current');
    const eligible = post('eligible');
    const corpus = Object.freeze([eligible, current]);

    expect(selectRelatedPosts(current, corpus)).toEqual([eligible]);
    expect(corpus).toEqual([eligible, current]);
    expect(selectRelatedPosts(current, [])).toEqual([]);
  });
});
