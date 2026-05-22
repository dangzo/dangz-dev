import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReactionsClient from './ReactionsClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReactionsClient', () => {
  it('fetches reactions on mount and renders them', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reactions: [
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ReactionsClient postId="post-1" />);

    expect(await screen.findByText('3 votes')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/reactions?postId=post-1', expect.objectContaining({
      cache: 'no-store',
    }));
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

    render(<ReactionsClient postId="post-1" />);

    expect(await screen.findByText('3 votes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    expect(screen.getByText('4 votes')).toBeInTheDocument();

    resolveVote?.({
      ok: true,
      json: async () => ({ count: 10 }),
    });

    await waitFor(() => {
      expect(screen.getByText('10 votes')).toBeInTheDocument();
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

    render(<ReactionsClient postId="post-1" />);

    expect(await screen.findByText('3 votes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    await waitFor(() => {
      expect(screen.getByText('3 votes')).toBeInTheDocument();
    });

  });
});