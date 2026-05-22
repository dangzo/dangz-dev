import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReactionsClient from './ReactionsClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReactionsClient', () => {
  it('optimistically increments and then syncs with API response count', async () => {
    const user = userEvent.setup();
    let resolveFetch: ((value: { ok: boolean; json: () => Promise<{ count: number }> }) => void) | undefined;
    const fetchPromise = new Promise<{ ok: boolean; json: () => Promise<{ count: number }> }>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(fetchPromise);
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ReactionsClient
        reactions={[
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
        ]}
      />,
    );

    expect(screen.getByText('3 votes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Love' }));

    expect(screen.getByText('4 votes')).toBeInTheDocument();

    resolveFetch?.({
      ok: true,
      json: async () => ({ count: 10 }),
    });

    await waitFor(() => {
      expect(screen.getByText('10 votes')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/reactions', expect.objectContaining({
      method: 'POST',
    }));

  });

  it('rolls back optimistic count when the API request fails', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'fail' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ReactionsClient
        reactions={[
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Love' }));

    await waitFor(() => {
      expect(screen.getByText('3 votes')).toBeInTheDocument();
    });

  });
});