import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertAppliedContent, assertRolledBackContent, assertSnapshotUnchanged, buildMigrationPlan, equalValues,
  getApplyMutations, getProperty, getRollbackMutations, getString, parseDocuments,
  type ContentDocument, type Mutation,
} from './lib/topic-migration.ts';

type Options = Readonly<{ mode: 'dry-run' | 'apply' | 'rollback'; file?: string; outputDir?: string }>;
type Connection = Readonly<{ projectId: string; dataset: string; readToken: string; writeToken?: string }>;
type Receipt = Readonly<{
  reportSha256: string;
  transactionId: string;
  revisions: Readonly<Record<string, string>>;
}>;

function parseOptions(args: readonly string[]): Options {
  let mode: Options['mode'] = 'dry-run';
  let file: string | undefined;
  let outputDir: string | undefined;
  let selectedMode = false;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (['--dry-run', '--apply', '--rollback'].includes(arg)) {
      if (selectedMode) {
        throw new Error('Choose exactly one migration mode.');
      }

      selectedMode = true;
      mode = arg.slice(2) as Options['mode'];

      if (mode !== 'dry-run') {
        file = args[++index];

        if (!file || file.startsWith('--')) {
          throw new Error(`${arg} requires a saved report or receipt path.`);
        }
      }
    } else if (arg === '--output-dir') {
      outputDir = args[++index];

      if (!outputDir || outputDir.startsWith('--')) {
        throw new Error('--output-dir requires a path inside .tmp/.');
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (mode !== 'dry-run' && outputDir) {
    throw new Error('--output-dir is only supported for dry runs.');
  }

  return { mode, file, outputDir };
}

function getConnection(): Connection {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
  const dataset = process.env.SANITY_STUDIO_DATASET;
  const readToken = process.env.SANITY_API_READ_ONLY_TOKEN;

  if (!projectId || !/^[a-z0-9]+$/.test(projectId) || !dataset || !/^[a-z0-9_-]+$/.test(dataset) || !readToken) {
    throw new Error('Configure the Studio project/dataset and SANITY_API_READ_ONLY_TOKEN.');
  }

  return { projectId, dataset, readToken, writeToken: process.env.SANITY_API_WRITE_TOKEN };
}

function apiUrl(connection: Connection, endpoint: 'query' | 'mutate'): URL {
  return new URL(`https://${connection.projectId}.api.sanity.io/v2025-02-19/data/${endpoint}/${connection.dataset}`);
}

async function fetchDocuments(connection: Connection): Promise<readonly ContentDocument[]> {
  const documents: ContentDocument[] = [];
  let lastId = '';

  while (true) {
    const url = apiUrl(connection, 'query');
    url.searchParams.set('perspective', 'raw');
    url.searchParams.set('query', '*[_id > $lastId] | order(_id asc)[0...500]');
    url.searchParams.set('$lastId', JSON.stringify(lastId));
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${connection.readToken}` }, signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Read-only content inventory failed (HTTP ${response.status}).`);
    }

    const page = parseDocuments(getProperty(await response.json() as unknown, 'result'));
    documents.push(...page);

    if (page.length < 500) {
      return documents;
    }

    lastId = page[page.length - 1]._id;
  }
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function writePrivate(filename: string, value: string): Promise<void> {
  await writeFile(filename, value, { flag: 'wx', mode: 0o600 });
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function dryRun(connection: Connection, options: Options): Promise<void> {
  const createdAt = new Date().toISOString();
  const outputDir = path.resolve(options.outputDir ?? `.tmp/topic-migration/${createdAt.replace(/[:.]/g, '-')}`);
  const privateRoot = path.resolve('.tmp');

  if (!outputDir.startsWith(`${privateRoot}${path.sep}`)) {
    throw new Error('Store migration artifacts inside ignored .tmp/; they include unpublished content.');
  }

  const documents = await fetchDocuments(connection);
  // A second inventory catches editorial changes made while paginating the export.
  assertSnapshotUnchanged(documents, await fetchDocuments(connection));
  const plan = buildMigrationPlan(documents, { projectId: connection.projectId, dataset: connection.dataset, createdAt });
  const backup = `${documents.map((document) => JSON.stringify(document)).join('\n')}\n`;
  await mkdir(outputDir, { recursive: true, mode: 0o700 });
  await writePrivate(path.join(outputDir, 'backup.ndjson'), backup);
  await writePrivate(path.join(outputDir, 'report.json'), json({ backupSha256: hash(backup), plan }));
  await writePrivate(path.join(outputDir, 'legacy-tag-map.json'), json(plan.legacyRedirects));
  const lines = [
    '# Primary-topic migration dry run', '',
    `Dataset: ${connection.projectId}/${connection.dataset}`, '',
    `Published posts: ${plan.inventory.publishedPosts}; drafts: ${plan.inventory.draftPosts}; legacy tag documents: ${plan.inventory.legacyTagDocuments}; historical URLs: ${plan.inventory.legacyUrls}.`, '',
    `Topic creates: ${plan.operations.filter((operation) => operation.kind === 'create').length}; post patches: ${plan.operations.filter((operation) => operation.kind === 'patch').length}.`, '',
    '| Document ID | State | Topic ID | Changed fields |',
    '| --- | --- | --- | --- |',
    ...plan.posts.map((post) => `| ${post.id} | ${post.state} | ${post.topicId ?? 'Unclassified'} | ${post.changedFields.join(', ') || 'None'} |`), '',
    '## Issues', '', ...plan.issues.map((issue) => `- ${issue}`),
    ...(plan.issues.length ? [] : ['No issues.']), '',
    'No remote writes occurred. Review report.json for exact before/after field values. backup.ndjson contains private content and asset metadata; asset binaries are unchanged and are not included.', '',
  ];
  await writePrivate(path.join(outputDir, 'report.md'), lines.join('\n'));
  console.log(`Dry run saved to ${path.relative(process.cwd(), outputDir)}/report.md. ${plan.operations.length} planned changes; ${plan.issues.length} issues. No remote writes.`);

  if (plan.issues.length) {
    throw new Error('The report contains issues. Resolve them and generate a new dry run.');
  }
}

async function readReviewedReport(connection: Connection, filename: string) {
  const reportText = await readFile(filename, 'utf8');
  const report: unknown = JSON.parse(reportText);
  const savedPlan = getProperty(report, 'plan');
  const createdAt = getString(getProperty(savedPlan, 'createdAt'));
  const backupText = await readFile(path.join(path.dirname(filename), 'backup.ndjson'), 'utf8');

  if (!createdAt || getProperty(report, 'backupSha256') !== hash(backupText)) {
    throw new Error('The report/backup integrity check failed. Generate a new dry run.');
  }

  const backup = parseDocuments(backupText.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line) as unknown));
  const plan = buildMigrationPlan(backup, { projectId: connection.projectId, dataset: connection.dataset, createdAt });

  if (!equalValues(plan, savedPlan)) {
    throw new Error('The reviewed report no longer matches this dataset, migration code, or backup. Generate a new dry run.');
  }

  return { plan, backup, reportSha256: hash(reportText) };
}

async function mutate(
  connection: Connection,
  mutations: readonly Mutation[],
  transactionId: string,
): Promise<Readonly<Record<string, string>>> {
  if (!connection.writeToken) {
    throw new Error('Explicit application/rollback requires SANITY_API_WRITE_TOKEN.');
  }

  if (!mutations.length) {
    return {};
  }

  const url = apiUrl(connection, 'mutate');
  url.searchParams.set('returnDocuments', 'true');
  url.searchParams.set('visibility', 'sync');
  url.searchParams.set('transactionId', transactionId);
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${connection.writeToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }), signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Atomic migration transaction failed (HTTP ${response.status}). Preserve pending.json; re-run only after inspecting current content.`);
  }

  const results = getProperty(await response.json() as unknown, 'results');

  if (!Array.isArray(results)) {
    throw new Error('Missing mutation receipt. Preserve pending.json and inspect the transaction before recovery.');
  }

  const documents = parseDocuments(results.map((result: unknown) => getProperty(result, 'document')));

  if (documents.length !== mutations.length) {
    throw new Error('Incomplete mutation receipt. Preserve pending.json before recovery.');
  }

  return Object.fromEntries(documents.map((document) => [document._id, document._rev]));
}

async function exists(filename: string): Promise<boolean> {
  try {
    await readFile(filename);

    return true;
  } catch (error) {
    if (getProperty(error, 'code') === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function apply(connection: Connection, filename: string): Promise<void> {
  const { plan, backup, reportSha256 } = await readReviewedReport(connection, filename);
  const mutations = getApplyMutations(plan);
  const receiptFile = path.join(path.dirname(filename), 'applied.json');

  if (await exists(receiptFile)) {
    const receipt: unknown = JSON.parse(await readFile(receiptFile, 'utf8'));

    if (getProperty(receipt, 'reportSha256') !== reportSha256) {
      throw new Error('The existing receipt belongs to a different report.');
    }

    console.log('This report was already applied. Generate a new dry run to inspect current content.');

    return;
  }

  const current = await fetchDocuments(connection);
  const pendingFile = path.join(path.dirname(filename), 'pending.json');
  let receipt: Receipt;

  if (await exists(pendingFile)) {
    const pending: unknown = JSON.parse(await readFile(pendingFile, 'utf8'));
    const transactionId = getString(getProperty(pending, 'transactionId'));

    if (getProperty(pending, 'reportSha256') !== reportSha256 || !transactionId) {
      throw new Error('The pending transaction belongs to a different report.');
    }

    // Recover an interrupted receipt only when every resulting document is exact.
    assertAppliedContent(plan, backup, current);
    receipt = { reportSha256, transactionId, revisions: Object.fromEntries(current
      .filter((document) => plan.operations.some((operation) => operation.id === document._id))
      .map((document) => [document._id, document._rev])) };
  } else {
    assertSnapshotUnchanged(backup, current);
    const transactionId = randomUUID();
    await writePrivate(pendingFile, json({ reportSha256, transactionId }));
    receipt = { reportSha256, transactionId, revisions: await mutate(connection, mutations, transactionId) };
  }

  await writePrivate(receiptFile, json(receipt));
  assertAppliedContent(plan, backup, await fetchDocuments(connection));
  console.log(`Applied and verified ${plan.operations.length} changes. Receipt: ${receiptFile}`);
}

async function rollback(connection: Connection, filename: string): Promise<void> {
  const reportFile = path.join(path.dirname(filename), 'report.json');
  const { plan, backup, reportSha256 } = await readReviewedReport(connection, reportFile);
  const saved: unknown = JSON.parse(await readFile(filename, 'utf8'));
  const savedRevisions = getProperty(saved, 'revisions');

  if (getProperty(saved, 'reportSha256') !== reportSha256 || !savedRevisions
    || typeof savedRevisions !== 'object'
    || !Object.values(savedRevisions).every((revision) => typeof revision === 'string')) {
    throw new Error('Invalid rollback receipt.');
  }

  const revisions = savedRevisions as Readonly<Record<string, string>>;
  const rollbackFile = path.join(path.dirname(filename), 'rolled-back.json');

  if (await exists(rollbackFile)) {
    console.log('This receipt was already rolled back.');

    return;
  }

  const current = await fetchDocuments(connection);
  const pendingFile = path.join(path.dirname(filename), 'rollback-pending.json');

  if (await exists(pendingFile)) {
    const pending: unknown = JSON.parse(await readFile(pendingFile, 'utf8'));

    if (getProperty(pending, 'reportSha256') !== reportSha256) {
      throw new Error('The pending rollback belongs to a different report.');
    }

    assertRolledBackContent(plan, backup, current);
    await writePrivate(rollbackFile, json({
      reportSha256, transactionId: getProperty(pending, 'transactionId'),
      revisions: Object.fromEntries(current.filter((document) => plan.operations
        .some((operation) => operation.kind === 'patch' && operation.id === document._id))
        .map((document) => [document._id, document._rev])),
    }));
    console.log('Recovered the completed rollback receipt without repeating writes.');

    return;
  }

  for (const operation of plan.operations) {
    if (operation.kind === 'patch' && current.find((document) => document._id === operation.id)?._rev !== revisions[operation.id]) {
      throw new Error(`Post ${operation.id} changed after migration. Review it manually; rollback will not overwrite it.`);
    }
  }

  const transactionId = randomUUID();
  await writePrivate(pendingFile, json({ reportSha256, transactionId }));
  const restored = await mutate(connection, getRollbackMutations(plan, revisions), transactionId);
  await writePrivate(rollbackFile, json({ reportSha256, transactionId, revisions: restored }));
  assertRolledBackContent(plan, backup, await fetchDocuments(connection));

  console.log('Restored migration-owned post fields. Topic documents and canonical destinations remain available.');
}

export async function main(args: readonly string[]): Promise<void> {
  const options = parseOptions(args);
  const connection = getConnection();

  if (options.mode !== 'dry-run' && !connection.writeToken) {
    throw new Error('Explicit application/rollback requires SANITY_API_WRITE_TOKEN.');
  }

  if (options.mode === 'dry-run') {
    await dryRun(connection, options);
  } else if (options.mode === 'apply') {
    await apply(connection, path.resolve(options.file!));
  } else {
    await rollback(connection, path.resolve(options.file!));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Migration failed.');
    process.exitCode = 1;
  });
}
