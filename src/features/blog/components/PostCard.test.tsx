import { render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { TOPICS } from '@/features/blog/data/topics';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const post: PostWithTopic = {
  _id: 'post',
  _type: 'post',
  _createdAt: '2026-01-01',
  _updatedAt: '2026-01-01',
  _rev: '1',
  slug: { _type: 'slug', current: 'sample' },
  title: 'A readable article title',
  excerpt: 'Learn to make your application easier to maintain.',
  publishedAt: '2026-01-01',
  tags: [],
  primaryTopic: TOPICS[0],
  reactions: [{ _id: 'love', emoji: '❤️', count: 1 }],
};

describe('PostCard', () => {
  it('uses one canonical topic label and preserves the summary and reaction link', () => {
    render(<PostCard source="blog" post={post} preload={false} />);

    expect(screen.getByRole('link', { name: TOPICS[0].displayName })).toHaveAttribute('href', `/blog/topics/${TOPICS[0].slug.current}`);
    expect(screen.getByText(post.excerpt ?? '')).toBeVisible();
    expect(screen.getByRole('link', { name: '1 reaction - open post' })).toHaveAttribute('href', '/blog/sample');
    expect(screen.getByRole('heading', { name: post.title })).toBeVisible();
  });

  it('keeps a text-only preview usable when image, topic, summary, and reactions are absent', () => {
    render(<PostCard source="blog" post={{ ...post, primaryTopic: null, excerpt: undefined, reactions: [] }} preload={false} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(/no description/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute('href', '/blog/sample');
  });
});

it.each(['blog', 'topic'] as const)('marks only article entry points with source %s', (source) => {
  const { container } = render(<PostCard source={source} post={post} preload={false} />);
  const links = container.querySelectorAll('a[data-post-opened-post-id]');
  expect(Array.from(links).map((link) => ({
    id: link.getAttribute('data-post-opened-post-id'),
    source: link.getAttribute('data-post-opened-source'),
    placement: link.getAttribute('data-post-opened-placement'),
  }))).toEqual(['title', 'cta', 'reaction_summary'].map((placement) => ({ id: post._id, source, placement })));
  expect(screen.getByRole('link', { name: TOPICS[0].displayName })).not.toHaveAttribute('data-post-opened-post-id');
  expect(container.querySelector('a[data-umami-event]')).toBeNull();
});
