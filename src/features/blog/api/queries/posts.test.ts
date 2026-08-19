import { getClient } from '@/api/apollo-client';
import { PAGE_SIZE } from '@/features/blog/utils/pagination';
import { getPostList, POST_LIST_QUERY } from './posts';

vi.mock('@/api/apollo-client', () => ({
  getClient: vi.fn(),
}));

const queryBody = (query: ReturnType<typeof POST_LIST_QUERY>) => query.loc?.source.body ?? '';

describe('POST_LIST_QUERY', () => {
  it('omits limit/offset when none are given, fetching every post', () => {
    const body = queryBody(POST_LIST_QUERY());

    expect(body).not.toContain('limit:');
    expect(body).not.toContain('offset:');
  });

  it('includes limit/offset when a limit is given', () => {
    const body = queryBody(POST_LIST_QUERY({ limit: 12, offset: 24 }));

    expect(body).toContain('limit: 12');
    expect(body).toContain('offset: 24');
  });

  it('defaults offset to 0 when only a limit is given', () => {
    const body = queryBody(POST_LIST_QUERY({ limit: 12 }));

    expect(body).toContain('offset: 0');
  });
});

describe('getPostList', () => {
  const post = (id: string, tagSlug?: string) => ({
    _id: id,
    title: id,
    tags: tagSlug ? [{ _id: `tag-${tagSlug}`, name: tagSlug, slug: { current: tagSlug } }] : [],
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('paginates via limit/offset computed from page and pageSize', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      data: { allPost: [post('1')], allReaction: [], allPostReactionCount: [] },
    });
    vi.mocked(getClient).mockReturnValue({ query: queryMock } as unknown as ReturnType<typeof getClient>);

    await getPostList({ page: 3, pageSize: 5 });

    const calledQuery = queryMock.mock.calls[0][0].query;
    expect(queryBody(calledQuery)).toContain('limit: 5');
    expect(queryBody(calledQuery)).toContain('offset: 10');
  });

  it('clamps invalid page/pageSize to safe defaults', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      data: { allPost: [post('1')], allReaction: [], allPostReactionCount: [] },
    });
    vi.mocked(getClient).mockReturnValue({ query: queryMock } as unknown as ReturnType<typeof getClient>);

    await getPostList({ page: -1, pageSize: 0 });

    const calledQuery = queryMock.mock.calls[0][0].query;
    expect(queryBody(calledQuery)).toContain(`limit: ${PAGE_SIZE}`);
    expect(queryBody(calledQuery)).toContain('offset: 0');
  });

  it('fetches the unbounded set and filters/paginates in JS when tagSlug is given', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      data: {
        allPost: [post('1', 'react'), post('2', 'vue'), post('3', 'react')],
        allReaction: [],
        allPostReactionCount: [],
      },
    });
    vi.mocked(getClient).mockReturnValue({ query: queryMock } as unknown as ReturnType<typeof getClient>);

    const result = await getPostList({ page: 1, pageSize: 1, tagSlug: 'react' });

    const calledQuery = queryMock.mock.calls[0][0].query;
    expect(queryBody(calledQuery)).not.toContain('limit:');
    expect(result.map((p) => p._id)).toEqual(['1']);
  });

  it('returns an empty array when no post matches the tag', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      data: { allPost: [post('1', 'vue')], allReaction: [], allPostReactionCount: [] },
    });
    vi.mocked(getClient).mockReturnValue({ query: queryMock } as unknown as ReturnType<typeof getClient>);

    const result = await getPostList({ tagSlug: 'react' });

    expect(result).toEqual([]);
  });
});
