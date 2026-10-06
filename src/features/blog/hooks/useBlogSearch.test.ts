import { act, renderHook } from '@testing-library/react';

import { useBlogSearch, type SearchHit } from './useBlogSearch';
import { trackSearchEvent } from '@/utils/searchAnalytics';

vi.mock('@/utils/searchAnalytics', () => ({ trackSearchEvent: vi.fn() }));

type MockFetchResponse = {
  ok: boolean;
  json: () => Promise<{ results?: SearchHit[] }>;
};

function makeFetchResponse({
  ok = true,
  results = [],
}: {
  ok?: boolean;
  results?: SearchHit[];
} = {}): MockFetchResponse {
  return {
    ok,
    json: async () => ({ results }),
  };
}

describe('useBlogSearch', () => {
  const sampleResults: SearchHit[] = [
    {
      id: '1',
      slug: 'react-testing',
      title: 'React Testing',
      excerpt: 'Testing hooks',
      primaryTopic: null,
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    vi.mocked(trackSearchEvent).mockClear();

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 1;
    });

    vi.stubGlobal('fetch', vi.fn());
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts closed with empty query and results', () => {
    const { result } = renderHook(() => useBlogSearch());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('tracks one confirmed transition with the first pending opening method', () => {
    const { result, rerender } = renderHook(() => useBlogSearch());
    act(() => {
      result.current.openSearch('shortcut');
      result.current.openSearch('button');
    });
    rerender();
    act(() => result.current.openSearch('button'));
    expect(trackSearchEvent).toHaveBeenCalledExactlyOnceWith({ name: 'search_opened', method: 'shortcut' });
    act(() => result.current.closeSearch());
    act(() => result.current.openSearch('button'));
    expect(trackSearchEvent).toHaveBeenLastCalledWith({ name: 'search_opened', method: 'button' });
    expect(trackSearchEvent).toHaveBeenCalledTimes(2);
  });

  it('opens search, locks body scroll, and closes on Escape', () => {
    const { result } = renderHook(() => useBlogSearch());

    act(() => {
      result.current.openSearch();
    });

    expect(result.current.isOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('does not fetch for queries shorter than 2 trimmed characters', () => {
    const fetchMock = vi.mocked(fetch);
    const { result } = renderHook(() => useBlogSearch());

    act(() => {
      result.current.openSearch();
      result.current.setQuery(' a ');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(trackSearchEvent).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'search_completed' }));
  });

  it('fetches debounced search results and updates state', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(
      makeFetchResponse({ results: sampleResults }) as unknown as Response,
    );

    const { result } = renderHook(() => useBlogSearch());

    act(() => {
      result.current.openSearch();
      result.current.setQuery('  react  ');
    });

    await act(async () => {
      vi.advanceTimersByTime(179);
      await Promise.resolve();
    });

    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/search?q=react', {
      signal: expect.any(AbortSignal),
      cache: 'no-store',
    });
    expect(result.current.results).toEqual(sampleResults);
    expect(result.current.isLoading).toBe(false);
    expect(trackSearchEvent).toHaveBeenCalledWith({ name: 'search_completed', query_length: 5, result_count: 1 });
  });

  it('clears results on non-ok response', async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValue(makeFetchResponse({ ok: false }) as unknown as Response);

    const { result } = renderHook(() => useBlogSearch());

    act(() => {
      result.current.openSearch();
      result.current.setQuery('react');
    });

    await act(async () => {
      vi.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(trackSearchEvent).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'search_completed' }));
  });

  it('ignores stale request results and keeps only the latest query response', async () => {
    let resolveFirst: ((value: Response) => void) | undefined;
    const fetchMock = vi
      .mocked(fetch)
      .mockImplementationOnce(
        () => new Promise<Response>(resolve => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce(
        makeFetchResponse({
          results: [{ ...sampleResults[0], id: '2', slug: 'latest', title: 'Latest' }],
        }) as unknown as Response,
      );

    const { result } = renderHook(() => useBlogSearch());

    act(() => {
      result.current.openSearch();
      result.current.setQuery('react');
    });

    await act(async () => {
      vi.advanceTimersByTime(180);
      await Promise.resolve();
    });

    const firstCallArgs = fetchMock.mock.calls[0]?.[1] as { signal?: AbortSignal } | undefined;

    act(() => {
      result.current.setQuery('latest');
    });

    await act(async () => {
      vi.advanceTimersByTime(180);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.results).toEqual([
      { ...sampleResults[0], id: '2', slug: 'latest', title: 'Latest' },
    ]);
    expect(firstCallArgs?.signal?.aborted).toBe(true);

    await act(async () => {
      resolveFirst?.(makeFetchResponse({ results: sampleResults }) as unknown as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.results).toEqual([
      { ...sampleResults[0], id: '2', slug: 'latest', title: 'Latest' },
    ]);
    expect(vi.mocked(trackSearchEvent).mock.calls.filter(([event]) => event.name === 'search_completed')).toEqual([
      [{ name: 'search_completed', query_length: 6, result_count: 1 }],
    ]);
  });

  it.each([
    ['zero results', { ok: true, json: async () => ({ results: [] }) }, true],
    ['missing results', { ok: true, json: async () => ({}) }, false],
    ['invalid results', { ok: true, json: async (): Promise<unknown> => ({ results: null }) }, false],
    ['null body', { ok: true, json: async (): Promise<unknown> => null }, false],
    ['invalid JSON', { ok: true, json: async (): Promise<unknown> => { throw new SyntaxError('Invalid'); } }, false],
  ] as const)('counts completion correctly for %s', async (_name, response, shouldTrack) => {
    vi.mocked(fetch).mockResolvedValue(response as unknown as Response);
    const { result } = renderHook(() => useBlogSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery('  empty  ');
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(180); });
    const completions = vi.mocked(trackSearchEvent).mock.calls.filter(([event]) => event.name === 'search_completed');
    expect(completions).toEqual(shouldTrack ? [[{ name: 'search_completed', query_length: 5, result_count: 0 }]] : []);
  });

  it('does not complete after closing while JSON parsing is pending', async () => {
    let resolveJson: ((data: { results: SearchHit[] }) => void) | undefined;
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => new Promise((resolve) => { resolveJson = resolve; }),
    } as unknown as Response);
    const { result } = renderHook(() => useBlogSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery('react');
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(180); });
    act(() => result.current.closeSearch());
    await act(async () => { resolveJson?.({ results: sampleResults }); });
    expect(trackSearchEvent).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'search_completed' }));
  });
});
