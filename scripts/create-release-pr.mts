import { appendFile } from 'node:fs/promises';
import { createReleasePr, type GitHubApi } from './lib/release-pr.ts';

const args = process.argv.slice(2);

if (args.some((arg) => arg !== '--dry-run')) {
  throw new Error('Usage: node scripts/create-release-pr.mts [--dry-run]');
}

const token = process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

if (!token || !repository) {
  throw new Error('GH_TOKEN and GITHUB_REPOSITORY are required.');
}

const api: GitHubApi = async <T,>(path: string, method = 'GET', body?: unknown): Promise<T> => {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`GitHub ${method} ${path} failed (${response.status}). Check token permissions and Settings → Actions → General → Allow GitHub Actions to create and approve pull requests.`);
  }

  return response.status === 204 ? undefined as T : await response.json() as T;
};

const result = await createReleasePr(api, repository, args.includes('--dry-run'));
console.log(result);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${result}\n`);
}
