import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const lintableExtensions = /\.(?:[cm]?js|[cm]?jsx|[cm]?ts|[cm]?tsx)$/;
const fromUpstream = process.argv.includes('--from-upstream');

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function safeRunGit(args) {
  try {
    return runGit(args);
  } catch {
    return '';
  }
}

function resolveDiffRange() {
  const upstream = safeRunGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);
  if (upstream) return `${upstream}...HEAD`;

  const originHeadRef = safeRunGit(['symbolic-ref', 'refs/remotes/origin/HEAD']);
  if (originHeadRef) return `${originHeadRef}...HEAD`;

  return 'HEAD~1...HEAD';
}

function getChangedFiles() {
  const diffArgs = fromUpstream
    ? ['diff', '--name-only', '--diff-filter=ACMR', resolveDiffRange()]
    : ['diff', '--cached', '--name-only', '--diff-filter=ACMR'];

  const output = safeRunGit(diffArgs);
  if (!output) return [];

  return output
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => lintableExtensions.test(file))
    .filter((file) => fs.existsSync(file));
}

const files = getChangedFiles();

if (!files.length) {
  console.log(fromUpstream
    ? 'No changed lintable files found since upstream. Skipping ESLint.'
    : 'No staged lintable files found. Skipping ESLint.');
  process.exit(0);
}

console.log(`Running ESLint on ${files.length} changed file(s)...`);

const lint = spawnSync('yarn', ['eslint', '--max-warnings=0', ...files], {
  stdio: 'inherit',
});

process.exit(lint.status ?? 1);