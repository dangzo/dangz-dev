import { NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';
import { POST } from './route';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('next-sanity/webhook', () => ({ parseBody: vi.fn() }));
vi.mock('@/api/apollo-client', () => ({
  CMS_CONTENT_CACHE_TAG: 'sanity-content', SEARCH_CORPUS_CACHE_TAG: 'blog-search-corpus',
}));

const request = () => new NextRequest('https://example.com/api/revalidate', { method: 'POST' });

const signedPayload = (body: unknown, valid = true) => {
  vi.mocked(parseBody).mockResolvedValue({ body, isValidSignature: valid });
};

describe('content webhook', () => {
  beforeEach(() => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it.each(['post', 'topic', 'tag'])('invalidates all shared content after a %s change', async (_type) => {
    signedPayload({ _type, slug: { current: 'new' }, previousSlug: 'old' });

    expect((await POST(request())).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/blog', 'layout');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/api/search');
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
    expect(revalidateTag).toHaveBeenCalledWith('sanity-content', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('blog-search-corpus', { expire: 0 });
  });

  it('also invalidates both article slugs after a rename', async () => {
    signedPayload({ _type: 'post', slug: { current: 'new' }, previous: { slug: { current: 'old' } } });

    await POST(request());

    expect(revalidatePath).toHaveBeenCalledWith('/blog/new');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/old');
  });

  it('rejects a signed unsupported payload without invalidating anything', async () => {
    signedPayload({ _type: 'reaction' });

    expect((await POST(request())).status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects invalid signatures', async () => {
    signedPayload({ _type: 'post' }, false);

    expect((await POST(request())).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
