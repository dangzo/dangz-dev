import { render, screen } from '@testing-library/react';
import { TopTags, TopTagsSkeleton } from './TopTags';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import type { TopicWithCount } from '@/features/blog/types/Topic.types';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));
vi.mock('react-loading-skeleton', () => ({
  default: function SkeletonMock() {
    return <div data-testid="topic-skeleton" />;
  },
}));
vi.mock('@/features/blog/api/queries/topics', () => ({ getTopicsWithCount: vi.fn() }));

const topic = (displayName: string, postCount: number): TopicWithCount => ({
  _id: displayName,
  displayName,
  slug: { current: displayName.toLowerCase() },
  description: '',
  postCount,
});

describe('TopTags', () => {
  it('links populated topics in descending count order with alphabetical ties', async () => {
    vi.mocked(getTopicsWithCount).mockResolvedValue({
      topics: [topic('Performance', 2), topic('Architecture', 3), topic('Accessibility', 2), topic('AI', 0)],
      totalPostCount: 7,
    });

    render(await TopTags());

    expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual(['Architecture', 'Accessibility', 'Performance']);
    expect(screen.getByRole('link', { name: 'Architecture' })).toHaveAttribute('href', '/blog/topics/architecture');
    expect(screen.queryByText('AI')).not.toBeInTheDocument();
    expect(screen.getByText('3 posts')).toBeInTheDocument();
  });

  it('renders no topic links for an empty corpus', async () => {
    vi.mocked(getTopicsWithCount).mockResolvedValue({ topics: [topic('Architecture', 0)], totalPostCount: 0 });

    render(await TopTags());

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Topics will appear as new writing is published.')).toBeVisible();
  });

  it('keeps the rest of Home usable when topic fetching fails', async () => {
    vi.mocked(getTopicsWithCount).mockRejectedValue(new Error('CMS unavailable'));

    render(await TopTags());

    expect(screen.getByText('Topics couldn’t load. Try again shortly.')).toBeVisible();
  });
});

describe('TopTagsSkeleton', () => {
  it('provides placeholders for the six curated topics', () => {
    render(<TopTagsSkeleton />);

    expect(screen.getAllByTestId('topic-skeleton')).toHaveLength(6);
  });
});
