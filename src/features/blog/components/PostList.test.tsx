import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PostWithTags } from '@/features/blog/types/Post.types';
import { PostList, PostListSkeleton } from './PostList';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

vi.mock('./PostCard', () => {
  return {
    PostCard: ({ post, preload }: { post: PostWithTags; preload: boolean }) => {
      return (
        <div
          data-testid={`post-card-${post._id}`}
          data-preload={String(preload)}
        />
      );
    },
    PostCardSkeleton: () => {
      return <div data-testid="post-card-skeleton" />;
    },
  };
});

describe('PostList', () => {
  const posts = [
    { _id: 'post-1' },
    { _id: 'post-2' },
    { _id: 'post-3' },
  ] as PostWithTags[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders each post and preloads the first two cards', () => {
    const { container } = render(<PostList posts={posts} />);

    expect(screen.getByTestId('post-card-post-1')).toHaveAttribute('data-preload', 'true');
    expect(screen.getByTestId('post-card-post-2')).toHaveAttribute('data-preload', 'true');
    expect(screen.getByTestId('post-card-post-3')).toHaveAttribute('data-preload', 'false');
    expect(container.querySelectorAll('li')).toHaveLength(3);
  });

  it('does not render pagination when no pagination prop is passed', () => {
    render(<PostList posts={posts} />);

    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('renders pagination when a pagination prop with more than one page is passed', () => {
    render(<PostList posts={posts} pagination={{ currentPage: 1, totalPages: 3, basePath: '/blog' }} />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders the skeleton rows with the same list structure', () => {
    const { container } = render(<PostListSkeleton />);

    expect(screen.getAllByTestId('post-card-skeleton')).toHaveLength(3);
    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelectorAll('li')[0]).toHaveClass('md:pr-4');
  });
});