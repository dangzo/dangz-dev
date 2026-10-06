import { act, renderHook, waitFor } from '@testing-library/react';
import { useReactions } from './useReactions';
import { trackReactionEvent } from '@/utils/reactionAnalytics';

vi.mock('@/utils/reactionAnalytics', () => ({
  trackReactionEvent: vi.fn(),
  captureReactionContext: () => ({ url: '/original', referrer: '' }),
}));

function response(payload: unknown, ok = true): Response {
  return { ok, json: async () => payload } as Response;
}

function deferred() {
  let resolve!: (response: Response) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Response>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

let nextPost = 0;
async function setup() {
  const postId = `lifecycle-${nextPost++}`;
  const votes = [deferred(), deferred(), deferred()];
  const fetchMock = vi.fn().mockImplementation((_url: string, options?: RequestInit) => {
    if (options?.method === 'POST') {
      return votes[fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST').length - 1].promise;
    }
    return Promise.resolve(response({ reactions: [
      { _id: 'love', name: 'Love', emoji: '❤️', count: 2 },
      { _id: 'wow', name: 'Wow', emoji: '😮', count: 5 },
    ] }));
  });
  vi.stubGlobal('fetch', fetchMock);
  const first = renderHook(() => useReactions(postId, 'compact'));
  const second = renderHook(() => useReactions(postId, 'bottom'));
  await waitFor(() => expect(first.result.current.reactions?.[0].count).toBe(2));
  return { postId, votes, fetchMock, first, second };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('guards repeated calls before rerender and reports only the initiating submission', async () => {
  const { first, second, votes, fetchMock, postId } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
    void first.result.current.reactToPost('love');
    void first.result.current.reactToPost('love');
  });
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1);
  expect(second.result.current.reactions?.[0].count).toBe(3);
  await act(async () => { votes[0].resolve(response({ count: 3 })); });
  expect(vi.mocked(trackReactionEvent).mock.calls.map(([event]) => event)).toEqual([
    { name: 'reaction_attempted', post_id: postId, reaction_id: 'love', placement: 'compact' },
    { name: 'reaction_submission_succeeded', post_id: postId, reaction_id: 'love', placement: 'compact' },
  ]);
});

it.each([
  [true, true, false, 4], [true, true, true, 4],
  [true, false, false, 3], [true, false, true, 3],
  [false, true, false, 3], [false, true, true, 3],
  [false, false, false, 2], [false, false, true, 2],
])('reconciles compact=%s bottom=%s reversed=%s to %s', async (compactOk, bottomOk, reversed, expected) => {
  const { first, second, votes } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
    void second.result.current.reactToPost('love');
  });
  expect(first.result.current.reactions?.[0].count).toBe(4);
  const counts = [3, compactOk ? 4 : 3];
  for (const index of reversed ? [1, 0] : [0, 1]) {
    await act(async () => {
      votes[index].resolve(response({ count: counts[index] }, index === 0 ? compactOk : bottomOk));
    });
  }
  expect(first.result.current.reactions?.[0].count).toBe(expected);
  expect(second.result.current.reactions?.[0].count).toBe(expected);
  const events = vi.mocked(trackReactionEvent).mock.calls.map(([event]) => event);
  expect(events).toHaveLength(4);
  expect(events.slice(2).map((event) => event.placement)).toEqual(reversed ? ['bottom', 'compact'] : ['compact', 'bottom']);
});

it.each([{}, null, { count: '3' }, { count: -1 }, { count: 1.5 }, { count: NaN }, { count: Infinity }])('rolls back invalid response %j and emits failure', async (payload) => {
  const { first, votes } = await setup();
  await act(async () => { void first.result.current.reactToPost('love'); });
  await act(async () => { votes[0].resolve(response(payload)); });
  expect(first.result.current.reactions?.[0].count).toBe(2);
  expect(first.result.current.pendingIds.love).toBe(false);
  expect(vi.mocked(trackReactionEvent).mock.calls.map(([event]) => event.name)).toEqual([
    'reaction_attempted', 'reaction_submission_failed',
  ]);
});

it('retains attribution and shared state when the initiating component unmounts', async () => {
  const { first, second, votes } = await setup();
  await act(async () => { void first.result.current.reactToPost('love'); });
  first.unmount();
  await act(async () => { votes[0].resolve(response({ count: 3 })); });
  expect(second.result.current.reactions?.[0].count).toBe(3);
  expect(vi.mocked(trackReactionEvent).mock.calls[1][0].placement).toBe('compact');
});

it('keeps rollback independent for different reactions', async () => {
  const { first, second, votes } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
    void second.result.current.reactToPost('wow');
  });
  await act(async () => { votes[1].resolve(response({ count: 6 })); });
  await act(async () => { votes[0].resolve(response({}, false)); });
  expect(first.result.current.reactions?.map(({ count }) => count)).toEqual([2, 6]);
});

it.each(['network', 'json'] as const)('rolls back a %s failure without sending raw errors', async (failure) => {
  const { first, votes } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
  });
  await act(async () => {
    if (failure === 'network') {
      votes[0].reject(new Error('Private network error'));
    } else {
      votes[0].resolve({ ok: true, json: async () => { throw new Error('Private JSON error'); } } as unknown as Response);
    }
  });
  expect(first.result.current.reactions?.[0].count).toBe(2);
  expect(vi.mocked(trackReactionEvent).mock.calls.map(([event]) => event.name)).toEqual([
    'reaction_attempted', 'reaction_submission_failed',
  ]);
  expect(JSON.stringify(vi.mocked(trackReactionEvent).mock.calls)).not.toContain('Private');
});

it('preserves submission context when the hook changes post or placement', async () => {
  const { postId, votes } = await setup();
  const hook = renderHook(({ id, placement }: { id: string; placement: 'compact' | 'bottom' }) => {
    return useReactions(id, placement);
  }, { initialProps: { id: postId, placement: 'compact' } });
  await waitFor(() => expect(hook.result.current.reactions?.[0].count).toBe(2));
  await act(async () => {
    void hook.result.current.reactToPost('love');
  });
  hook.rerender({ id: 'another-post', placement: 'bottom' });
  await act(async () => {
    votes[0].resolve(response({ count: 3 }));
  });
  expect(vi.mocked(trackReactionEvent).mock.calls[1]).toEqual([
    { name: 'reaction_submission_succeeded', post_id: postId, reaction_id: 'love', placement: 'compact' },
    { url: '/original', referrer: '' },
  ]);
  expect(hook.result.current.pendingIds.love).toBeUndefined();
});

it('cleans up a retained store after the last subscriber unmounts and the request settles', async () => {
  const { first, second, votes, postId } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
  });
  first.unmount();
  second.unmount();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await act(async () => {
    votes[0].resolve(response({ count: 3 }));
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
  const remounted = renderHook(() => useReactions(postId, 'bottom'));
  expect(remounted.result.current.reactions).toBeNull();
  expect(vi.mocked(trackReactionEvent)).toHaveBeenCalledTimes(2);
});

it('accepts another completed-control submission while the other placement remains pending', async () => {
  const { first, second, votes } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
    void second.result.current.reactToPost('love');
  });
  await act(async () => {
    votes[0].resolve(response({ count: 3 }));
  });
  await act(async () => {
    void first.result.current.reactToPost('love');
  });
  expect(first.result.current.reactions?.[0].count).toBe(5);
  await act(async () => {
    votes[2].resolve(response({ count: 5 }));
  });
  await act(async () => {
    votes[1].resolve(response({ count: 4 }));
  });
  expect(first.result.current.reactions?.[0].count).toBe(5);
  expect(second.result.current.reactions?.[0].count).toBe(5);
  expect(vi.mocked(trackReactionEvent)).toHaveBeenCalledTimes(6);
});

it('accepts zero as a valid numeric response', async () => {
  const { first, votes } = await setup();
  await act(async () => {
    void first.result.current.reactToPost('love');
  });
  await act(async () => {
    votes[0].resolve(response({ count: 0 }));
  });
  expect(first.result.current.reactions?.[0].count).toBe(0);
  expect(vi.mocked(trackReactionEvent).mock.calls[1][0].name).toBe('reaction_submission_succeeded');
});
