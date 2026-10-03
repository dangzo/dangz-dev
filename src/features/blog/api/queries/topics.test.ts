import { getClient } from '@/api/apollo-client';
import { getTopicsWithCount, TOPICS_WITH_COUNT_QUERY } from './topics';
import { TOPICS } from '@/features/blog/data/topics';

vi.mock('@/api/apollo-client', () => ({
  getClient: vi.fn(),
  getContentClient: vi.fn(),
  usesPrimaryTopicModel: () => process.env.SANITY_TOPIC_MODEL === 'primary',
}));

describe('topic counts', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('counts each post once and retains empty catalog entries', async () => {
    const query = vi.fn().mockResolvedValue({ data: {
      allPost: [
        { _id: 'one', primaryTopic: TOPICS[0] },
        { _id: 'two', primaryTopic: TOPICS[0] },
        { _id: 'unclassified' },
      ],
    } });
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);

    const result = await getTopicsWithCount({ publishedOnly: true });

    expect(result.totalPostCount).toBe(3);
    expect(result.topics[0].postCount).toBe(2);
    expect(result.topics.slice(1).every((topic) => topic.postCount === 0)).toBe(true);
    expect(getClient).toHaveBeenCalledWith({ publishedOnly: true });
  });

  it('ignores incomplete draft topic documents and references during primary-mode preview', async () => {
    vi.stubEnv('SANITY_TOPIC_MODEL', 'primary');
    const unfinished = { _id: 'drafts.topic-new', displayName: 'New topic', slug: null };
    const query = vi.fn().mockResolvedValue({ data: {
      allPost: [
        { _id: 'drafts.27dd202f-fbfa-4549-b8a1-a9926769bfa6', primaryTopic: unfinished },
        { _id: 'drafts.new-post', primaryTopic: unfinished },
      ],
      allTopic: [unfinished, { _id: 'drafts.topic-no-name', slug: { current: 'no-name' } }, null],
    } });
    vi.mocked(getClient).mockReturnValue({ query } as unknown as ReturnType<typeof getClient>);

    const result = await getTopicsWithCount();

    expect(result.totalPostCount).toBe(2);
    expect(result.topics).toHaveLength(TOPICS.length);
    expect(result.topics.find((topic) => topic.slug.current === 'architecture')?.postCount).toBe(1);
    expect(result.topics.every((topic) => topic.slug.current && topic.displayName)).toBe(true);
  });

  it('does not request undeployed topic documents in legacy mode', () => {
    vi.stubEnv('SANITY_TOPIC_MODEL', 'legacy');
    expect(TOPICS_WITH_COUNT_QUERY().loc?.source.body).not.toContain('allTopic');

    vi.stubEnv('SANITY_TOPIC_MODEL', 'primary');
    expect(TOPICS_WITH_COUNT_QUERY().loc?.source.body).toContain('allTopic');
  });
});
