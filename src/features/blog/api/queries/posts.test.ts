import { getClient } from '@/api/apollo-client';
import { PAGE_SIZE } from '@/features/blog/utils/pagination';
import { getPostList, POST_LIST_QUERY } from './posts';
import { TOPICS } from '@/features/blog/data/topics';

vi.mock('@/api/apollo-client', () => ({
  getClient: vi.fn(),
  usesPrimaryTopicModel: () => process.env.SANITY_TOPIC_MODEL === 'primary',
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
    vi.unstubAllEnvs();
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
  it('filters by one primary topic before paginating the complete corpus', async () => {
    const architecture = TOPICS.find((topic) => topic.slug.current === 'architecture');
    const performance = TOPICS.find((topic) => topic.slug.current === 'performance');
    const queryMock = vi.fn().mockResolvedValue({
      data: {
        allPost: [
          { ...post('1'), primaryTopic: architecture },
          { ...post('2'), primaryTopic: performance },
          { ...post('3'), primaryTopic: architecture },
        ],
      },
    });
    vi.mocked(getClient).mockReturnValue({ query: queryMock } as unknown as ReturnType<typeof getClient>);

    const result = await getPostList({ topicSlug: 'architecture', page: 2, pageSize: 1, publishedOnly: true });

    expect(queryBody(queryMock.mock.calls[0][0].query)).not.toContain('limit:');
    expect(result.map((item) => item._id)).toEqual(['3']);
    expect(getClient).toHaveBeenCalledWith({ publishedOnly: true });
  });

  it('returns a renderable post when a primary-mode draft topic is unfinished', async () => {
    vi.stubEnv('SANITY_TOPIC_MODEL', 'primary');
    const queryMock = vi.fn().mockResolvedValue({ data: {
      allPost: [{
        ...post('drafts.new-post'),
        primaryTopic: { _id: 'drafts.new-topic', displayName: 'Unfinished topic', slug: null },
      }],
    } });
    vi.mocked(getClient).mockReturnValue({ query: queryMock } as unknown as ReturnType<typeof getClient>);

    const result = await getPostList();

    expect(result[0]._id).toBe('drafts.new-post');
    expect(result[0].primaryTopic).toBeNull();
  });

  it('only requests deployed legacy fields by default and primary fields after cutover', () => {
    vi.stubEnv('SANITY_TOPIC_MODEL', 'legacy');
    expect(queryBody(POST_LIST_QUERY())).not.toContain('primaryTopic');
    expect(queryBody(POST_LIST_QUERY())).toContain('tags {');

    vi.stubEnv('SANITY_TOPIC_MODEL', 'primary');
    expect(queryBody(POST_LIST_QUERY())).toContain('primaryTopic');
    expect(queryBody(POST_LIST_QUERY())).toContain('keywords');
    expect(queryBody(POST_LIST_QUERY())).not.toContain('tags {');
  });

});
