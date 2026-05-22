import { getClient } from '@/api/apollo-client';
import { getReactionsForPost } from './reactions';

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