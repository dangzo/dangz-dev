import { render, screen, waitFor } from '@testing-library/react';
import Reactions from './Reactions';

vi.mock('next/dynamic', async () => {
  const { default: ReactionsClient } = await import('./ReactionsClient');
  return {
    default: () => ReactionsClient,
  };
});

describe('Reactions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders heading, emoji buttons, names, and counters from the client fetch result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reactions: [
          { _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 12 },
          { _id: '2', name: 'Fire', emoji: '🔥', sortOrder: 1, count: 1 },
        ],
      }),
    }));

    render(<Reactions postId="post-1" />);

    expect(await screen.findByRole('heading', { name: 'How do you find this article?' })).toBeInTheDocument();

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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reactions: [{ _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0 }],
      }),
    }));

    render(<Reactions postId="post-1" />);

    expect(await screen.findByText('0 votes')).toBeInTheDocument();
  });

  it('renders nothing when the client fetch returns an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reactions: [] }),
    }));

    const { container } = render(<Reactions postId="post-1" />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole('heading', { name: 'How do you find this article?' })).not.toBeInTheDocument();
    });
  });
});