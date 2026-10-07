import { getClient } from '@/api/apollo-client';
import { getReactionsForPost, incrementReactionCount } from './reactions';

vi.mock('@/api/apollo-client', () => ({
  getClient: vi.fn(),
}));

describe('getReactionsForPost', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requests reactions with transport-level no-store options', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      data: {
        allReaction: [],
        allPostReactionCount: [],
      },
    });

    vi.mocked(getClient).mockReturnValue({
      query: queryMock,
    } as unknown as ReturnType<typeof getClient>);

    await getReactionsForPost('post-1');

    expect(queryMock).toHaveBeenCalledWith(expect.objectContaining({
      variables: { postId: 'post-1' },
      fetchPolicy: 'no-cache',
      context: {
        fetchOptions: {
          cache: 'no-store',
          next: { revalidate: 0 },
        },
      },
    }));
  });

  it('maps post reaction counts by reaction id', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      data: {
        allReaction: [
          { _id: 'r1', name: 'Like', emoji: '❤️', sortOrder: 1 },
          { _id: 'r2', name: 'Wow', emoji: '😮', sortOrder: 2 },
        ],
        allPostReactionCount: [
          { _id: 'd1', count: 8, reaction: { _id: 'r1' } },
        ],
      },
    });

    vi.mocked(getClient).mockReturnValue({
      query: queryMock,
    } as unknown as ReturnType<typeof getClient>);

    const reactions = await getReactionsForPost('post-1');

    expect(reactions).toEqual([
      { _id: 'r1', name: 'Like', emoji: '❤️', sortOrder: 1, count: 8 },
      { _id: 'r2', name: 'Wow', emoji: '😮', sortOrder: 2, count: 0 },
    ]);
  });
});

describe('incrementReactionCount', () => {
  beforeEach(() => {
    vi.stubEnv('SANITY_API_WRITE_TOKEN', 'fixture-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns the authoritative increment result and sends an atomic increment', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ document: { count: 0 } }, { document: { count: 12 } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(incrementReactionCount('post-1', 'love')).resolves.toBe(12);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body) as { mutations: unknown[] };
    expect(body.mutations[1]).toEqual({ patch: { id: 'postReactionCount-post-1-love', inc: { count: 1 } } });
  });

  it.each([undefined, '3', -1, 1.5, NaN, Infinity])('rejects an invalid increment count %s instead of fabricating success', async (count) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ document: { count: 0 } }, { document: { count } }] }),
    }));
    await expect(incrementReactionCount('post-1', 'love')).rejects.toThrow('invalid incremented reaction count');
  });

  it('rejects Sanity mutation errors even when the response contains a count', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ document: { count: 3 } }], errors: [{ message: 'Mutation rejected' }] }),
    }));
    await expect(incrementReactionCount('post-1', 'love')).rejects.toThrow('Mutation rejected');
  });
});
