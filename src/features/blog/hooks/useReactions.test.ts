import { act, renderHook, waitFor } from '@testing-library/react';

import { useReactions } from './useReactions';

type MockFetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

function makeFetchResponse(payload: unknown, ok = true): MockFetchResponse {
  return {
    ok,
    json: async () => payload,
  };
}

describe('useReactions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches reactions for the provided post on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeFetchResponse({
        reactions: [
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
        ],
      }) as unknown as Response,
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useReactions('post-1'));

    await waitFor(() => {
      expect(result.current.reactions).toEqual([
        { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
      ]);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/reactions?postId=post-1', {
      cache: 'no-store',
    });
  });

  it('optimistically increments and then syncs with the server count', async () => {
    let resolveVote: ((value: Response) => void) | undefined;
    const votePromise = new Promise<Response>((resolve) => {
      resolveVote = resolve;
    });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
          ],
        }) as unknown as Response,
      )
      .mockReturnValueOnce(votePromise);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useReactions('post-1'));

    await waitFor(() => {
      expect(result.current.reactions?.[0]?.count).toBe(3);
    });

    await act(async () => {
      void result.current.reactToPost('r1');
      await Promise.resolve();
    });

    expect(result.current.reactions?.[0]?.count).toBe(4);

    await act(async () => {
      resolveVote?.(makeFetchResponse({ count: 10 }) as unknown as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.reactions?.[0]?.count).toBe(10);
      expect(result.current.pendingIds.r1).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/reactions', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"postId":"post-1"'),
    }));
  });

  it('rolls back the optimistic count when the vote request fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 3 },
          ],
        }) as unknown as Response,
      )
      .mockResolvedValueOnce(
        makeFetchResponse({ error: 'fail' }, false) as unknown as Response,
      );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useReactions('post-1'));

    await waitFor(() => {
      expect(result.current.reactions?.[0]?.count).toBe(3);
    });

    await act(async () => {
      await result.current.reactToPost('r1');
    });

    expect(result.current.reactions?.[0]?.count).toBe(3);
    expect(result.current.pendingIds.r1).toBe(false);
  });

  it('keeps multiple hook instances in sync for the same post', async () => {
    let resolveVote: ((value: Response) => void) | undefined;
    const votePromise = new Promise<Response>((resolve) => {
      resolveVote = resolve;
    });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 },
          ],
        }) as unknown as Response,
      )
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 },
          ],
        }) as unknown as Response,
      )
      .mockReturnValueOnce(votePromise);
    vi.stubGlobal('fetch', fetchMock);

    const { result: first } = renderHook(() => useReactions('post-1'));
    const { result: second } = renderHook(() => useReactions('post-1'));

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(2);
      expect(second.current.reactions?.[0]?.count).toBe(2);
    });

    await act(async () => {
      void first.current.reactToPost('r1');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(3);
      expect(second.current.reactions?.[0]?.count).toBe(3);
    });

    await act(async () => {
      resolveVote?.(makeFetchResponse({ count: 7 }) as unknown as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(7);
      expect(second.current.reactions?.[0]?.count).toBe(7);
    });
  });

  it('uses the shared store snapshot for back-to-back reactions', async () => {
    const firstVotePromise = new Promise<Response>(() => {});
    const secondVotePromise = new Promise<Response>(() => {});

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 },
          ],
        }) as unknown as Response,
      )
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 },
          ],
        }) as unknown as Response,
      )
      .mockReturnValueOnce(firstVotePromise)
      .mockReturnValueOnce(secondVotePromise);
    vi.stubGlobal('fetch', fetchMock);

    const { result: first } = renderHook(() => useReactions('post-1'));
    const { result: second } = renderHook(() => useReactions('post-1'));

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(2);
      expect(second.current.reactions?.[0]?.count).toBe(2);
    });

    await act(async () => {
      void first.current.reactToPost('r1');
      void second.current.reactToPost('r1');
      await Promise.resolve();
    });

    expect(first.current.reactions?.[0]?.count).toBe(4);
    expect(second.current.reactions?.[0]?.count).toBe(4);

    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/reactions', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"currentCount":2'),
    }));

    expect(fetchMock).toHaveBeenNthCalledWith(4, '/api/reactions', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"currentCount":3'),
    }));
  });

  it('does not allow stale fetch responses to overwrite newer optimistic shared state', async () => {
    const postId = 'post-stale-guard';

    let resolveFirstFetch: ((value: Response) => void) | undefined;
    let resolveSecondFetch: ((value: Response) => void) | undefined;
    let resolveVote: ((value: Response) => void) | undefined;

    const firstFetchPromise = new Promise<Response>((resolve) => {
      resolveFirstFetch = resolve;
    });
    const secondFetchPromise = new Promise<Response>((resolve) => {
      resolveSecondFetch = resolve;
    });
    const votePromise = new Promise<Response>((resolve) => {
      resolveVote = resolve;
    });

    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstFetchPromise)
      .mockReturnValueOnce(secondFetchPromise)
      .mockReturnValueOnce(votePromise);
    vi.stubGlobal('fetch', fetchMock);

    const { result: first } = renderHook(() => useReactions(postId));
    const { result: second } = renderHook(() => useReactions(postId));

    await act(async () => {
      resolveSecondFetch?.(makeFetchResponse({
        reactions: [
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 },
        ],
      }) as unknown as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(2);
      expect(second.current.reactions?.[0]?.count).toBe(2);
    });

    await act(async () => {
      void first.current.reactToPost('r1');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(3);
      expect(second.current.reactions?.[0]?.count).toBe(3);
    });

    await act(async () => {
      resolveFirstFetch?.(makeFetchResponse({
        reactions: [
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 2 },
        ],
      }) as unknown as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(3);
      expect(second.current.reactions?.[0]?.count).toBe(3);
    });

    await act(async () => {
      resolveVote?.(makeFetchResponse({ count: 7 }) as unknown as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(first.current.reactions?.[0]?.count).toBe(7);
      expect(second.current.reactions?.[0]?.count).toBe(7);
    });
  });

  it('clears the cached reactions when the last hook instance unmounts', async () => {
    let resolveSecondFetch: ((value: Response) => void) | undefined;
    const secondFetchPromise = new Promise<Response>((resolve) => {
      resolveSecondFetch = resolve;
    });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        makeFetchResponse({
          reactions: [
            { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 5 },
          ],
        }) as unknown as Response,
      )
      .mockReturnValueOnce(secondFetchPromise);
    vi.stubGlobal('fetch', fetchMock);

    const firstRender = renderHook(() => useReactions('post-1'));

    await waitFor(() => {
      expect(firstRender.result.current.reactions?.[0]?.count).toBe(5);
    });

    firstRender.unmount();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const secondRender = renderHook(() => useReactions('post-1'));

    expect(secondRender.result.current.reactions).toBeNull();

    await act(async () => {
      resolveSecondFetch?.(makeFetchResponse({
        reactions: [
          { _id: 'r1', name: 'Love', emoji: '❤️', sortOrder: 0, count: 8 },
        ],
      }) as unknown as Response);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(secondRender.result.current.reactions?.[0]?.count).toBe(8);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});