// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createReleasePr, describeRelease, type Commit, type GitHubApi, type PullRequest } from './lib/release-pr';

const commit: Commit = { sha: 'feature', commit: { message: 'Add code variants' } };
const source: PullRequest = {
  number: 222,
  title: 'Add code variants',
  body: '## Changes\n\n- Accessible tabs.\n- Bash support.\n\n## Related issues\n\nCloses #167.\nRefs #200; live verification remains.\n\n## Risks and rollout (optional)\n\nDeploy Studio after the frontend.',
  html_url: 'https://github.com/owner/repo/pull/222',
  merged_at: '2026-10-09T15:00:00Z',
  merge_commit_sha: 'feature',
  base: { ref: 'dev' },
  head: { ref: 'feature', sha: 'feature' },
  labels: [],
};

type Call = Readonly<{ path: string; method: string; body?: unknown }>;
type Options = Readonly<{
  commits?: readonly Commit[];
  closed?: readonly PullRequest[];
  existing?: PullRequest;
  files?: readonly Readonly<{ filename: string; previous_filename?: string }>[];
  changedHead?: boolean;
  incorrectSavedBase?: boolean;
}>;

function fixture(options: Options = {}) {
  const calls: Call[] = [];
  const commits = options.commits ?? [commit];
  let release: PullRequest = {
    ...(options.existing ?? source), number: 223, merged_at: null,
    base: { ref: 'main' }, head: { ref: 'dev', sha: 'dev-sha' },
  };
  let headReads = 0;
  const api: GitHubApi = async <T>(path: string, method = 'GET', body?: unknown): Promise<T> => {
    calls.push({ path, method, body });
    let result: unknown;

    if (path.endsWith('/branches/main')) {
      result = { commit: { sha: 'main-sha' } };
    } else if (path.endsWith('/branches/dev')) {
      headReads++;
      result = { commit: { sha: options.changedHead && headReads > 1 ? 'changed' : 'dev-sha' } };
    } else if (path.includes('/compare/')) {
      const page = Number(new URL(`https://github.com${path}`).searchParams.get('page'));
      result = { total_commits: commits.length, commits: commits.slice((page - 1) * 100, page * 100) };
    } else if (path.includes('/pulls?state=closed')) {
      result = options.closed ?? [source];
    } else if (path.includes('/pulls?state=open')) {
      result = options.existing ? [release] : [];
    } else if (path.includes('/commits?')) {
      result = [{ sha: 'feature-child' }];
    } else if (path.includes('/files?')) {
      result = options.files ?? [{ filename: 'src/components/ui/CodeBlock.tsx' }];
    } else if (path.includes('/labels')) {
      if (method === 'POST') {
        release = { ...release, labels: [{ name: 'skip-ci' }, { name: 'skip-review' }] };
      } else {
        release = { ...release, labels: release.labels.filter((label) => !path.endsWith(`/${label.name}`)) };
      }
    } else if (method === 'POST' || method === 'PATCH') {
      const description = body as { title: string; body: string };
      release = { ...release, title: description.title, body: description.body };
      result = release;
    } else if (path.endsWith('/pulls/223')) {
      result = options.incorrectSavedBase ? { ...release, base: { ref: 'dev' } } : release;
    } else if (path === '/repos/owner/repo') {
      result = { default_branch: 'dev' };
    } else {
      throw new Error(`Unexpected request: ${method} ${path}`);
    }

    return result as T;
  };

  return { api, calls, saved: () => release };
}

describe('release summaries', () => {
  it('summarizes PR changes, keeps completed and partial issue references, and preserves rollout notes', () => {
    const result = describeRelease([source], [], 'owner/repo', 'dev');

    expect(result.title).toBe('Release: Add code variants');
    expect(result.body).toContain('Accessible tabs. Bash support.');
    expect(result.body).toContain('Closes #167.');
    expect(result.body).toContain('Refs #200; live verification remains.');
    expect(result.body).toContain('do not automatically close issues');
    expect(result.body).toContain('Deploy Studio after the frontend.');
    expect(result.body).not.toContain('checks passed');
  });

  it('does not copy template comments or invent issue references', () => {
    const result = describeRelease([{ ...source, body: '## Related issues\n<!-- Closes #123 -->\nNone' }], [], 'owner/repo', 'main');

    expect(result.body).toContain('## Related issues\n\nNone');
    expect(result.body).not.toContain('#123');
  });

  it('includes direct commits and handles shell metacharacters as text', () => {
    const direct = { ...commit, commit: { message: 'fix: literal $(echo private) and `code`\n\nDetails' } };
    const result = describeRelease([], [direct], 'owner/repo', 'dev');

    expect(result.body).toContain('literal $(echo private) and `code`');
    expect(result.body).toContain('/commit/feature');
    expect(result.body).not.toContain('Details');
  });
});

describe('release PR automation', () => {
  it('does nothing when dev is already released', async () => {
    const test = fixture({ commits: [] });

    expect(await createReleasePr(test.api, 'owner/repo')).toContain('Nothing to release');
    expect(test.calls.every((call) => call.method === 'GET')).toBe(true);
  });

  it('creates and reads back a dev-to-main PR without merging it', async () => {
    const test = fixture();

    expect(await createReleasePr(test.api, 'owner/repo')).toContain('Release PR created');
    expect(test.calls.find((call) => call.method === 'POST')?.body).toMatchObject({ base: 'main', head: 'dev' });
    expect(test.saved().body).toContain('Closes #167');
    expect(test.calls.at(-1)?.path).toBe('/repos/owner/repo/pulls/223');
    expect(test.calls.some((call) => call.path.includes('/merge'))).toBe(false);
  });

  it('updates an existing generated PR rather than creating another', async () => {
    const existing = { ...source, number: 223, body: '<!-- release-pr-automation --> old' };
    const test = fixture({ existing });

    expect(await createReleasePr(test.api, 'owner/repo')).toContain('Release PR updated');
    expect(test.calls.some((call) => call.method === 'PATCH')).toBe(true);
    expect(test.calls.some((call) => call.method === 'POST' && call.path.endsWith('/pulls'))).toBe(false);
  });

  it('preserves an existing manual release PR', async () => {
    const test = fixture({ existing: source });

    expect(await createReleasePr(test.api, 'owner/repo')).toContain('manually written description was preserved');
    expect(test.calls.every((call) => call.method === 'GET')).toBe(true);
  });

  it('removes stale skip labels from a manual release PR without rewriting its description', async () => {
    const existing = { ...source, labels: [{ name: 'skip-ci' }, { name: 'skip-review' }] };
    const test = fixture({ existing });

    const result = await createReleasePr(test.api, 'owner/repo');
    expect(test.saved().labels).toEqual([]);
    expect(test.saved().body).toBe(existing.body);
    expect(test.calls.some((call) => call.method === 'PATCH')).toBe(false);
    expect(result).toContain('close and reopen this PR to start fresh checks before merging');
  });

  it('dry-run only reads GitHub and emits the complete prepared body', async () => {
    const test = fixture();

    expect(await createReleasePr(test.api, 'owner/repo', true)).toContain('Closes #167');
    expect(test.calls.every((call) => call.method === 'GET')).toBe(true);
  });

  it('excludes previously released PRs and commits covered by an included PR', async () => {
    const test = fixture({
      commits: [commit, { ...commit, sha: 'feature-child' }],
      closed: [source, { ...source, number: 200, title: 'Already released', merge_commit_sha: 'released' }],
    });

    await createReleasePr(test.api, 'owner/repo');
    expect(test.saved().title).toBe('Release: Add code variants');
    expect(test.saved().body).not.toContain('Already released');
    expect(test.saved().body).not.toContain('/commit/feature-child');
  });

  it('paginates commit comparisons instead of silently omitting changes', async () => {
    const commits = Array.from({ length: 101 }, (_, index) => ({ ...commit, sha: `sha-${index}` }));
    const test = fixture({ commits, closed: [] });

    const result = await createReleasePr(test.api, 'owner/repo', true);
    expect(result).toContain('/commit/sha-100');
    expect(test.calls.filter((call) => call.path.includes('/compare/'))).toHaveLength(2);
  });

  it('refuses a stale summary if dev changed while reading PRs', async () => {
    const test = fixture({ changedHead: true });

    await expect(createReleasePr(test.api, 'owner/repo')).rejects.toThrow('changed while preparing');
    expect(test.calls.every((call) => call.method === 'GET')).toBe(true);
  });

  it('rejects an incorrect saved target branch', async () => {
    const test = fixture({ incorrectSavedBase: true });

    await expect(createReleasePr(test.api, 'owner/repo')).rejects.toThrow('did not save correctly');
  });

  it('adds both skip labels for a complete documentation-only diff', async () => {
    const test = fixture({ files: [{ filename: 'docs/RELEASES.md' }, { filename: 'README.md' }] });

    await createReleasePr(test.api, 'owner/repo');
    expect(test.saved().labels).toEqual([{ name: 'skip-ci' }, { name: 'skip-review' }]);
  });

  it.each([
    { files: [{ filename: 'src/content/article.md' }] },
    { files: [{ filename: '.github/workflows/create-release-pr.yml' }] },
    { files: [{ filename: 'docs/file.md', previous_filename: 'src/content/article.md' }] },
  ])('does not skip checks for production or workflow changes: $files', async ({ files }) => {
    const existing = {
      ...source, number: 223, body: '<!-- release-pr-automation --> old',
      labels: [{ name: 'skip-ci' }, { name: 'skip-review' }, { name: 'release' }],
    };
    const test = fixture({ files, existing });

    await createReleasePr(test.api, 'owner/repo');
    expect(test.saved().labels).toEqual([{ name: 'release' }]);
  });
});
