export type Commit = Readonly<{ sha: string; commit: Readonly<{ message: string }> }>;
export type PullRequest = Readonly<{
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  merged_at: string | null;
  merge_commit_sha: string | null;
  base: Readonly<{ ref: string }>;
  head: Readonly<{ ref: string; sha: string }>;
  labels: readonly Readonly<{ name: string }>[];
}>;
export type GitHubApi = <T>(path: string, method?: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: unknown) => Promise<T>;
type Comparison = Readonly<{ total_commits: number; commits: readonly Commit[] }>;
type Branch = Readonly<{ commit: Readonly<{ sha: string }> }>;
type File = Readonly<{ filename: string; previous_filename?: string }>;
type Description = Readonly<{ title: string; body: string }>;

const marker = '<!-- release-pr-automation -->';
const skipLabels = ['skip-ci', 'skip-review'];

async function paginate<T>(api: GitHubApi, path: string): Promise<T[]> {
  const items: T[] = [];

  for (let page = 1; ; page++) {
    const batch = await api<T[]>(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    items.push(...batch);

    if (batch.length < 100) {
      return items;
    }
  }
}

function section(body: string | null, heading: string): string {
  const sections = (body ?? '').replace(/<!--[^]*?-->/g, '').split(/^##\s+/m);
  const found = sections.find((part) => part.split('\n')[0].trim().toLowerCase().startsWith(heading));

  return found?.split('\n').slice(1).join('\n').trim() ?? '';
}

function inline(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/([\\[\]<>])/g, '\\$1').trim();
}

function shorten(text: string, length = 200): string {
  const value = text.replace(/\s+/g, ' ').trim();

  return value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value;
}

export function describeRelease(
  pulls: readonly PullRequest[],
  directCommits: readonly Commit[],
  repository: string,
  defaultBranch: string,
): Description {
  const changes = pulls.map((pull) => {
    const bullets = section(pull.body, 'changes').split('\n').filter((line) => /^\s*[-*]\s+/.test(line));
    const summary = bullets.slice(0, 2).map((line) => shorten(line.replace(/^\s*[-*]\s+/, ''))).join(' ');

    return `- ${inline(pull.title)} ([#${pull.number}](${pull.html_url}))${summary ? ` — ${summary}` : ''}`;
  });

  for (const commit of directCommits) {
    changes.push(`- ${inline(commit.commit.message.split('\n')[0])} ([${commit.sha.slice(0, 7)}](https://github.com/${repository}/commit/${commit.sha}))`);
  }

  const references = pulls.flatMap((pull) => {
    const related = section(pull.body, 'related issues');
    const source = related || (pull.body ?? '').replace(/<!--[^]*?-->/g, '');

    return source.split('\n').filter((line) => /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|refs)\s+(?:#\d+|[\w.-]+\/[\w.-]+#\d+|https:\/\/github\.com\/[^\s]+\/issues\/\d+)/i.test(line));
  });
  const issues = [...new Set(references.map((line) => line.trim()))];
  const risks = pulls.filter((pull) => section(pull.body, 'risks and rollout'))
    .map((pull) => `- [#${pull.number}](${pull.html_url}): ${section(pull.body, 'risks and rollout')}`);
  const parts = [
    marker,
    '## Problem and result',
    'Release the unreleased changes from `dev` to production on `main`.',
    '## Changes',
    changes.join('\n'),
    '## Related issues',
    issues.length ? issues.join('\n\n') : 'None',
    ...(defaultBranch !== 'main' && issues.length
      ? [`The default branch is \`${defaultBranch}\`; closing references do not automatically close issues when this PR merges into \`main\`.`]
      : []),
    '## Validation',
    'Review the release diff and wait for this PR’s required checks to pass. Source PRs link their validation evidence; this automation does not run application tests or verify production deployment.',
    ...(risks.length ? ['## Risks and rollout', risks.join('\n\n')] : []),
  ];
  const title = pulls.length === 1 && directCommits.length === 0
    ? `Release: ${pulls[0].title}`
    : `Release: ${changes.length} updates`;

  return { title: shorten(title, 250), body: `${parts.join('\n\n')}\n` };
}

function documentationFile(path: string): boolean {
  return path.endsWith('.md') && (
    /^(?:docs|\.agents|\.claude|\.codex|\.github)\//.test(path)
    || ['README.md', 'AGENTS.md', 'CLAUDE.md'].includes(path)
  );
}

export async function createReleasePr(api: GitHubApi, repository: string, dryRun = false): Promise<string> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    throw new Error('GITHUB_REPOSITORY must be owner/repository.');
  }

  const root = `/repos/${repository}`;
  const repo = await api<{ default_branch: string }>(root);
  const [base, head] = await Promise.all([
    api<Branch>(`${root}/branches/main`), api<Branch>(`${root}/branches/dev`),
  ]);
  const commits: Commit[] = [];

  for (let page = 1; ; page++) {
    const comparison = await api<Comparison>(`${root}/compare/${base.commit.sha}...${head.commit.sha}?per_page=100&page=${page}`);
    commits.push(...comparison.commits);

    if (commits.length >= comparison.total_commits) {
      break;
    }

    if (!comparison.commits.length) {
      throw new Error('Incomplete commit comparison; refusing to publish a partial release summary.');
    }
  }

  if (!commits.length) {
    return 'Nothing to release: main already contains dev.';
  }

  const commitShas = new Set(commits.map((commit) => commit.sha));
  const closed = await paginate<PullRequest>(api, `${root}/pulls?state=closed&base=dev`);
  const pulls = closed.filter((pull) => pull.merged_at && pull.merge_commit_sha && commitShas.has(pull.merge_commit_sha))
    .sort((a, b) => a.number - b.number);
  const covered = new Set(pulls.map((pull) => pull.merge_commit_sha));

  for (const pull of pulls) {
    const included = await paginate<Readonly<{ sha: string }>>(api, `${root}/pulls/${pull.number}/commits`);

    for (const commit of included) {
      covered.add(commit.sha);
    }
  }

  const directCommits = commits.filter((commit) => !covered.has(commit.sha));
  const description = describeRelease(pulls, directCommits, repository, repo.default_branch);

  if (description.body.length > 60000) {
    throw new Error('Release description is too large; reduce the release scope instead of dropping changes or issue references.');
  }

  if (dryRun) {
    return `${description.title}\n\n${description.body}`;
  }

  const open = await paginate<PullRequest>(api, `${root}/pulls?state=open&base=main&head=${repository.split('/')[0]}:dev`);

  if (open.length > 1) {
    throw new Error('Multiple dev-to-main PRs exist; resolve duplicates before running this workflow.');
  }

  const existing = open[0];
  const preserveDescription = existing && !existing.body?.includes(marker);

  const [currentBase, currentHead] = await Promise.all([
    api<Branch>(`${root}/branches/main`), api<Branch>(`${root}/branches/dev`),
  ]);

  if (currentBase.commit.sha !== base.commit.sha || currentHead.commit.sha !== head.commit.sha) {
    throw new Error('main or dev changed while preparing the release. Run the workflow again.');
  }

  const pull = preserveDescription
    ? existing
    : existing
      ? await api<PullRequest>(`${root}/pulls/${existing.number}`, 'PATCH', description)
      : await api<PullRequest>(`${root}/pulls`, 'POST', { ...description, base: 'main', head: 'dev' });
  const files = await paginate<File>(api, `${root}/pulls/${pull.number}/files`);
  const docsOnly = files.length > 0 && files.length < 3000 && files.every((file) => (
    documentationFile(file.filename) && (!file.previous_filename || documentationFile(file.previous_filename))
  ));
  const removedSkipCi = !docsOnly && pull.labels.some((label) => label.name === 'skip-ci');

  if (docsOnly) {
    await api(`${root}/issues/${pull.number}/labels`, 'POST', { labels: skipLabels });
  } else {
    for (const label of pull.labels.filter((label) => skipLabels.includes(label.name))) {
      await api(`${root}/issues/${pull.number}/labels/${label.name}`, 'DELETE');
    }
  }

  const saved = await api<PullRequest>(`${root}/pulls/${pull.number}`);
  const savedSkips = saved.labels.filter((label) => skipLabels.includes(label.name));
  const expectedDescription = preserveDescription ? existing : description;

  if (saved.base.ref !== 'main' || saved.head.ref !== 'dev' || saved.head.sha !== head.commit.sha
    || saved.title !== expectedDescription.title || saved.body !== expectedDescription.body
    || savedSkips.length !== (docsOnly ? 2 : 0)) {
    throw new Error(`Release PR changed or did not save correctly: ${pull.html_url}. Review it and run the workflow again.`);
  }

  const checkWarning = removedSkipCi
    ? '\n\nRequired with GITHUB_TOKEN: close and reopen this PR to start fresh checks before merging. Removing skip-ci with the built-in token does not start CI; do not rely on previously skipped checks. GitHub App runs trigger fresh checks automatically.'
    : '';

  if (preserveDescription) {
    return `Release PR already exists: ${saved.html_url}. Its manually written description was preserved; skip labels were checked against the current diff.${checkWarning}`;
  }

  return `Release PR ${existing ? 'updated' : 'created'}: ${saved.html_url}\n\nReview the description and diff, wait for required checks, then choose Create a merge commit. Keep dev.\n\nIf GitHub shows Approve workflows to run, click it to start CI.${checkWarning}`;
}
