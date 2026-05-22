import { render, screen } from '@testing-library/react';
import { getReactions } from '@/features/blog/api/queries/reactions';
import Reactions from './Reactions';

vi.mock('@/features/blog/api/queries/reactions', () => ({
  getReactions: vi.fn(),
}));

describe('Reactions', () => {
  it('renders heading, emoji buttons, names, and counters from the query result', async () => {
    vi.mocked(getReactions).mockResolvedValue([
      { _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 12 },
      { _id: '2', name: 'Fire', emoji: '🔥', sortOrder: 1, count: 1 },
    ]);

    render(await Reactions());

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
    vi.mocked(getReactions).mockResolvedValue([
      { _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0 },
    ]);

    render(await Reactions());

    expect(screen.getByText('0 votes')).toBeInTheDocument();
  });

  it('renders nothing when the query returns an empty list', async () => {
    vi.mocked(getReactions).mockResolvedValue([]);

    const { container } = render(await Reactions());

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'How do you find this article?' })).not.toBeInTheDocument();
  });
});