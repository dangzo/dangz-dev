import { EDITORIAL_SUMMARIES, getEditorialSummary } from './editorial-preview';

vi.mock('server-only', () => ({}));

const post = { _id: '27dd202f-fbfa-4549-b8a1-a9926769bfa6', excerpt: 'The CMS summary.' };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('local editorial preview', () => {
  it('uses proposed copy only when development preview is explicitly enabled', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOCAL_EDITORIAL_PREVIEW', 'true');

    expect(getEditorialSummary(post)).toBe(EDITORIAL_SUMMARIES[post._id]);
    expect(getEditorialSummary({ ...post, _id: `drafts.${post._id}` })).toBe(EDITORIAL_SUMMARIES[post._id]);
    expect(getEditorialSummary({ ...post, _id: 'unknown' })).toBe(post.excerpt);
  });

  it.each(['production', 'test'])('never overrides CMS copy in %s even with the switch enabled', (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    vi.stubEnv('LOCAL_EDITORIAL_PREVIEW', 'true');

    expect(getEditorialSummary(post)).toBe(post.excerpt);
  });

  it('uses CMS copy when the preview switch is absent', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOCAL_EDITORIAL_PREVIEW', undefined);

    expect(getEditorialSummary(post)).toBe(post.excerpt);
  });

  it('keeps all eight proposed summaries within the current CMS field limit', () => {
    expect(Object.values(EDITORIAL_SUMMARIES)).toHaveLength(8);

    for (const summary of Object.values(EDITORIAL_SUMMARIES)) {
      expect(summary.length).toBeLessThanOrEqual(300);
    }
  });
});
