import { getClient } from '@/api/apollo-client';
import { getSearchablePosts, SEARCHABLE_POSTS_QUERY } from './search';

vi.mock('@/api/apollo-client', () => ({
  getClient: vi.fn(),
  usesPrimaryTopicModel: () => process.env.SANITY_TOPIC_MODEL === 'primary',
}));

describe('search data', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('fetches the complete lightweight projection, preserving legacy aliases', async () => {
    const query = vi.fn().mockResolvedValue({ data: { allPost: Array.from({ length: 201 }, (_, index) => ({
      _id: String(index),
      slug: { current: String(index) },
      tags: [{ name: 'Vue.js', slug: { current: 'vue-js' } }],
    })) } });
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);

    const result = await getSearchablePosts({ publishedOnly: true });

    expect(result).toHaveLength(201);
    expect(result[200].keywords).toContain('VueJS');
    expect(SEARCHABLE_POSTS_QUERY().loc?.source.body).not.toContain('limit:');
    expect(SEARCHABLE_POSTS_QUERY().loc?.source.body).not.toContain('bodyRaw');
    expect(getClient).toHaveBeenCalledWith({ publishedOnly: true });
  });
  it('keeps an article searchable when its primary-mode draft topic reference is incomplete', async () => {
    vi.stubEnv('SANITY_TOPIC_MODEL', 'primary');
    const query = vi.fn().mockResolvedValue({ data: { allPost: [{
      _id: 'drafts.new-post', title: 'A draft article', slug: { current: 'draft-article' },
      primaryTopic: { _id: 'drafts.new-topic', displayName: null, slug: null },
      keywords: ['React'],
    }] } });
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);

    const result = await getSearchablePosts();

    expect(result[0].primaryTopic).toBeNull();
    expect(result[0].keywords).toEqual(['React']);
  });

});
