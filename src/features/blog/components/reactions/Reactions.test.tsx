import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Reactions from './Reactions';

describe('Reactions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a skeleton while reactions are loading', () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);

    render(<Reactions postId="post-1" />);

    expect(screen.getByTestId('reactions-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'How do you find this article?' })).not.toBeInTheDocument();
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

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('falls back to zero votes when count is not provided', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reactions: [{ _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0 }],
      }),
    }));

    render(<Reactions postId="post-1" />);

    expect(await screen.findByText('0')).toBeInTheDocument();
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

  it('optimistically increments and then syncs with API response count', async () => {
    const user = userEvent.setup();
    let resolveVote: ((value: { ok: boolean; json: () => Promise<{ count: number }> }) => void) | undefined;
    const votePromise = new Promise<{ ok: boolean; json: () => Promise<{ count: number }> }>((resolve) => {
      resolveVote = resolve;
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reactions: [{ _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 }],
        }),
      })
      .mockReturnValueOnce(votePromise);
    vi.stubGlobal('fetch', fetchMock);

    render(<Reactions postId="post-1" />);

    expect(await screen.findByText('3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    expect(screen.getByText('4')).toBeInTheDocument();

    resolveVote?.({
      ok: true,
      json: async () => ({ count: 10 }),
    });

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith('/api/reactions', expect.objectContaining({
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenCalledWith('/api/reactions', expect.objectContaining({
      body: expect.stringContaining('"postId":"post-1"'),
    }));
  });

  it('rolls back optimistic count when the API request fails', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reactions: [{ _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 }],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'fail' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<Reactions postId="post-1" />);

    expect(await screen.findByText('3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('does not allow multiple votes while a request is pending', async () => {
    const user = userEvent.setup();
    let resolveVote: ((value: { ok: boolean; json: () => Promise<{ count: number }> }) => void) | undefined;
    const votePromise = new Promise<{ ok: boolean; json: () => Promise<{ count: number }> }>((resolve) => {
      resolveVote = resolve;
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reactions: [{ _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 }],
        }),
      })
      .mockReturnValueOnce(votePromise);
    vi.stubGlobal('fetch', fetchMock);

    render(<Reactions postId="post-1" />);

    expect(await screen.findByText('3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    expect(screen.getByText('4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    expect(screen.getByText('4')).toBeInTheDocument();

    resolveVote?.({
      ok: true,
      json: async () => ({ count: 10 }),
    });

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does render umami data attributes on emoji buttons', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reactions: [{ _id: '1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 12 }],
      }),
    }));

    render(<Reactions postId="post-1" />);

    const loveButton = await screen.findByRole('button', { name: 'Love' });
    expect(loveButton).toHaveAttribute('data-umami-event', 'Reaction Love Click');
  });
});