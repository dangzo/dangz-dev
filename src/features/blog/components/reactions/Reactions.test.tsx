import { render, screen } from '@testing-library/react';
import { getReactionsForPost } from '@/features/blog/api/queries/reactions';
import Reactions from './Reactions';

vi.mock('@/features/blog/api/queries/reactions', () => ({
  getReactionsForPost: vi.fn(),
}));

describe('Reactions', () => {
  it('renders heading, emoji buttons, names, and counters from the query result', async () => {
    vi.mocked(getReactionsForPost).mockResolvedValue([
      { _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 12 },
      { _id: '2', name: 'Fire', emoji: '🔥', sortOrder: 1, count: 1 },
    ]);

    render(await Reactions({ postId: 'post-1' }));

    expect(screen.getByRole('heading', { name: 'How do you find this article?' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Love' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fire' })).toBeInTheDocument();

    expect(screen.getByText('Love')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'Love' })).toHaveTextContent('❤️');
    expect(screen.getByRole('img', { name: 'Fire' })).toHaveTextContent('🔥');

    expect(screen.getByText('12 votes')).toBeInTheDocument();
    expect(screen.getByText('1 vote')).toBeInTheDocument();
  });

  it('falls back to zero votes when count is not provided', async () => {
    vi.mocked(getReactionsForPost).mockResolvedValue([
      { _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0 },
    ]);

    render(await Reactions({ postId: 'post-1' }));

    expect(screen.getByText('0 votes')).toBeInTheDocument();
  });

  it('renders nothing when the query returns an empty list', async () => {
    vi.mocked(getReactionsForPost).mockResolvedValue([]);

    const { container } = render(await Reactions({ postId: 'post-1' }));

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'How do you find this article?' })).not.toBeInTheDocument();
  });
});