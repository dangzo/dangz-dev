import { GET } from './route';
import { getSearchablePosts } from '@/features/blog/api/queries/search';
import { TOPICS } from '@/features/blog/data/topics';

const cacheMock = vi.hoisted(() => ({ reads: vi.fn() }));

vi.mock('next/cache', () => ({
  unstable_cache: (read: (...args: unknown[]) => unknown) => (...args: unknown[]) => {
    cacheMock.reads();
    return read(...args);
  },
}));

vi.mock('@/api/apollo-client', () => ({
  CMS_CONTENT_CACHE_TAG: 'sanity-content',
  SEARCH_CORPUS_CACHE_TAG: 'blog-search-corpus',
  isDraftPreviewEnabled: () => process.env.NODE_ENV === 'development' && Boolean(process.env.SANITY_API_READ_ONLY_TOKEN),
  usesPrimaryTopicModel: () => process.env.SANITY_TOPIC_MODEL === 'primary',
}));

vi.mock('@/features/blog/api/queries/search', () => ({ getSearchablePosts: vi.fn() }));

describe('search route', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('finds keyword-only technology matches and exposes only the primary topic', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(getSearchablePosts).mockResolvedValue([{
      _id: 'post', title: 'A complete application', slug: { current: 'application' },
      primaryTopic: TOPICS[0], keywords: ['GraphQL'],
    }]);

    const response = await GET(new Request('https://example.com/api/search?q=graphql'));
    const { results } = await response.json();

    expect(results).toHaveLength(1);
    expect(results[0].primaryTopic).toEqual(TOPICS[0]);
    expect(results[0].tags).toEqual([]);
    expect(results[0]).not.toHaveProperty('keywords');
    expect(getSearchablePosts).toHaveBeenCalledWith({ publishedOnly: true });
    expect(cacheMock.reads).toHaveBeenCalledOnce();
  });

  it('bypasses the persistent corpus in authenticated draft preview', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SANITY_API_READ_ONLY_TOKEN', 'local-preview-token');
    vi.mocked(getSearchablePosts).mockResolvedValue([]);

    await GET(new Request('https://example.com/api/search?q=architecture'));

    expect(cacheMock.reads).not.toHaveBeenCalled();
    expect(getSearchablePosts).toHaveBeenCalledWith({ publishedOnly: false });
  });

  it('bypasses persistent caching in published E2E fixtures', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('E2E_FIXTURES', 'true');
    vi.mocked(getSearchablePosts).mockResolvedValue([]);

    await GET(new Request('https://example.com/api/search?q=architecture'));

    expect(cacheMock.reads).not.toHaveBeenCalled();
    expect(getSearchablePosts).toHaveBeenCalledWith({ publishedOnly: true });
  });

  it('does not read the corpus for queries shorter than two characters', async () => {
    const response = await GET(new Request('https://example.com/api/search?q=a'));

    expect(await response.json()).toEqual({ results: [] });
    expect(getSearchablePosts).not.toHaveBeenCalled();
  });
});
