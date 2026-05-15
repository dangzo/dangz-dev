import { act, renderHook } from '@testing-library/react';

import { useBlogSearch, type SearchHit } from './useBlogSearch';

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
      tags: ['react', 'testing'],
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();

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
  });
});
