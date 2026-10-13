import { getClient } from '@/api/apollo-client';
import { TOPICS } from '@/features/blog/data/topics';
import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { getRelatedPosts, RELATED_POSTS_QUERY } from './relatedPosts';

vi.mock('@/api/apollo-client', () => ({
  getClient: vi.fn(),
  usesPrimaryTopicModel: () => process.env.SANITY_TOPIC_MODEL === 'primary',
}));

const current = {
  _id: 'current',
  _type: 'post',
  _createdAt: '',
  _updatedAt: '',
  _rev: '',
  title: 'Current',
  slug: { _type: 'slug', current: 'current' },
  tags: [],
} satisfies PostWithTopic;

describe('published article recommendations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('uses the published perspective even during preview and adapts metadata for cards', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SANITY_API_READ_ONLY_TOKEN', 'test-preview-token');
    const query = vi.fn().mockResolvedValue({ data: { allPost: [
      { _id: 'related', title: 'Related', slug: { current: 'related' }, primaryTopic: TOPICS[0], keywords: ['React'], image: { asset: { url: '/cover.jpg' } } },
      { _id: 'drafts.private', title: 'Private', slug: { current: 'private' } },
    ] } });
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);

    const results = await getRelatedPosts(current);

    expect(getClient).toHaveBeenCalledWith({ publishedOnly: true });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ _id: 'related', primaryTopic: TOPICS[0], keywords: ['React'], tags: [], image: { asset: { url: '/cover.jpg' } } });
  });

  it('requests only recommendation metadata and switches topic fields with the deployed model', () => {
    vi.stubEnv('SANITY_TOPIC_MODEL', 'legacy');
    const legacy = RELATED_POSTS_QUERY().loc?.source.body;

    expect(legacy).toContain('query AllRelatedPosts');
    expect(legacy).toContain('tags {');
    expect(legacy).not.toContain('primaryTopic');
    expect(legacy).toContain('image {');
    expect(legacy).not.toMatch(/body|metadata|allReaction|allPostReactionCount/);

    vi.stubEnv('SANITY_TOPIC_MODEL', 'primary');
    const primary = RELATED_POSTS_QUERY().loc?.source.body;

    expect(primary).toContain('primaryTopic');
    expect(primary).toContain('keywords');
    expect(primary).not.toContain('tags {');
  });

  it('returns no recommendations if the corpus is absent', async () => {
    const query = vi.fn().mockResolvedValue({ data: undefined });
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);

    await expect(getRelatedPosts(current)).resolves.toEqual([]);
  });

  it('preserves article rendering on query failure and logs without private query details', async () => {
    const query = vi.fn().mockRejectedValue(new Error('private authorization token'));
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(getRelatedPosts(current)).resolves.toEqual([]);
    expect(log).toHaveBeenCalledExactlyOnceWith('Unable to fetch published article recommendations.');
  });
});
