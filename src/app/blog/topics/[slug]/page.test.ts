import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateMetadata } from './page';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { getTopicArchive } from '../_archive';

vi.mock('@/features/blog/api/queries/topics', () => ({ getTopicsWithCount: vi.fn() }));
vi.mock('../_archive', () => ({ getTopicArchive: vi.fn(), getTopicArchivePosts: vi.fn() }));
vi.mock('@/features/blog/components', () => ({ PostList: vi.fn() }));

const topic = {
  _id: 'topic-ai',
  slug: { current: 'ai-assisted-development' },
  displayName: 'AI-Assisted Development',
  description: 'Working with coding agents in frontend engineering.',
  postCount: 1,
};

beforeEach(() => {
  vi.mocked(getTopicArchive).mockResolvedValue({ topic, page: 1, totalPages: 1, basePath: '/blog/topics/ai-assisted-development' });
});

describe('topic metadata', () => {
  it('uses the CMS name and description with an indexable canonical published root', async () => {
    vi.mocked(getTopicsWithCount).mockResolvedValue({ topics: [topic], totalPostCount: 1 });
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: topic.slug.current }) });

    expect(metadata.title).toBe(topic.displayName);
    expect(metadata.description).toBe(topic.description);
    expect(metadata.alternates?.canonical).toBe('/blog/topics/ai-assisted-development');
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(getTopicsWithCount).toHaveBeenCalledWith({ publishedOnly: true });
  });

  it('keeps a draft-only preview root out of the index', async () => {
    vi.mocked(getTopicsWithCount).mockResolvedValue({ topics: [{ ...topic, postCount: 0 }], totalPostCount: 0 });
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: topic.slug.current }) });

    expect(metadata.robots).toMatchObject({ index: false, follow: true, googleBot: { index: false } });
  });
});
