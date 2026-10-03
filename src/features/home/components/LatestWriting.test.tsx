import { render, screen } from '@testing-library/react';
import LatestWriting from './LatestWriting';
import { getPostList } from '@/features/blog/api/queries/posts';

vi.mock('@/features/blog/api/queries/posts', () => ({ getPostList: vi.fn() }));

describe('LatestWriting', () => {
  it('offers a blog link when the CMS request fails', async () => {
    vi.mocked(getPostList).mockRejectedValue(new Error('CMS unavailable'));

    render(await LatestWriting());

    expect(screen.getByRole('link', { name: 'Visit the blog' })).toHaveAttribute('href', '/blog');
    expect(screen.getByText(/latest articles couldn’t load/i)).toBeVisible();
  });

  it('shows a useful empty state instead of an empty grid', async () => {
    vi.mocked(getPostList).mockResolvedValue([]);

    render(await LatestWriting());

    expect(screen.getByText('New writing is on its way. Come back soon.')).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
