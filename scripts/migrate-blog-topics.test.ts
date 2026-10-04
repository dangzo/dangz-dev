// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from './migrate-blog-topics.mts';
import { fixtureDocuments } from './lib/topic-migration.fixtures';
import { getProperty, parseDocuments, type ContentDocument } from './lib/topic-migration';

let documents: ContentDocument[];
let mutations: unknown[];
let outputDir: string;

beforeEach(() => {
  documents = fixtureDocuments();
  mutations = [];
  outputDir = path.resolve(`.tmp/topic-migration-test-${randomUUID()}`);
  vi.stubEnv('SANITY_STUDIO_PROJECT_ID', 'testproject');
  vi.stubEnv('SANITY_STUDIO_DATASET', 'test');
  vi.stubEnv('SANITY_API_READ_ONLY_TOKEN', 'test-read-token');
  vi.stubEnv('SANITY_API_WRITE_TOKEN', 'test-write-token');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(async (url: URL, init?: RequestInit) => {
    if (url.pathname.includes('/data/mutate/')) {
      const incoming: unknown = JSON.parse(String(init?.body));
      const operations = getProperty(incoming, 'mutations');

      if (!Array.isArray(operations)) {
        throw new Error('Invalid mutation request.');
      }

      const next = new Map(documents.map((document) => [document._id, document]));
      const modified: ContentDocument[] = [];

      for (const operation of operations) {
        mutations.push(operation);
        const created = getProperty(operation, 'create');
        const patch = getProperty(operation, 'patch');
        const id = created ? getProperty(created, '_id') : getProperty(patch, 'id');

        if (typeof id !== 'string') {
          throw new Error('Mutation missing document ID.');
        }

        const previous = next.get(id);

        if ((created && previous) || (patch && previous?._rev !== getProperty(patch, 'ifRevisionID'))) {
          return Response.json({}, { status: 409 });
        }

        const updated = {
          ...previous, ...(created as Readonly<Record<string, unknown>> | undefined),
          ...(getProperty(patch, 'set') as Readonly<Record<string, unknown>> | undefined),
          _rev: randomUUID(),
        };
        const unset = getProperty(patch, 'unset');

        for (const field of Array.isArray(unset) ? unset : []) {
          delete (updated as Record<string, unknown>)[String(field)];
        }

        const document = parseDocuments([updated])[0];
        next.set(id, document);
        modified.push(document);
      }

      documents = [...next.values()];

      return Response.json({ results: modified.map((document) => ({ id: document._id, document })) });
    }

    expect(init?.method).toBeUndefined();
    expect(url.searchParams.get('perspective')).toBe('raw');

    return Response.json({ result: documents });
  }));
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  await rm(outputDir, { recursive: true, force: true });
});

describe('topic migration CLI', () => {
  it('defaults to a read-only dry run with private backup, exact report, and durable legacy export', async () => {
    await main(['--output-dir', outputDir]);
    const report = JSON.parse(await readFile(path.join(outputDir, 'report.json'), 'utf8'));
    const backup = await readFile(path.join(outputDir, 'backup.ndjson'), 'utf8');

    expect(mutations).toEqual([]);
    expect(report.plan.inventory).toMatchObject({ publishedPosts: 8, draftPosts: 1, legacyUrls: 20 });
    expect(backup.trim().split('\n')).toHaveLength(documents.length);
    expect((await stat(path.join(outputDir, 'backup.ndjson'))).mode & 0o777).toBe(0o600);
    expect(JSON.parse(await readFile(path.join(outputDir, 'legacy-tag-map.json'), 'utf8'))).toMatchObject({
      graphql: '/blog', lighthouse: '/blog/topics/performance',
    });
  });

  it('applies one reviewed transaction, verifies it, safely reruns, and rolls back post fields', async () => {
    const before = structuredClone(documents);
    await main(['--dry-run', '--output-dir', outputDir]);
    await main(['--apply', path.join(outputDir, 'report.json')]);
    const receipt = JSON.parse(await readFile(path.join(outputDir, 'applied.json'), 'utf8'));

    expect(Object.keys(receipt.revisions)).toHaveLength(15);
    expect(documents.filter((document) => document._type === 'post')).toHaveLength(9);
    expect(documents.find((document) => document._id === 'cecb1ab3-1182-4de2-9955-703b1d0a87cd')).toBeUndefined();
    const mutationCount = mutations.length;
    await main(['--apply', path.join(outputDir, 'report.json')]);
    expect(mutations).toHaveLength(mutationCount);
    await main(['--rollback', path.join(outputDir, 'applied.json')]);

    for (const original of before) {
      const restored = documents.find((document) => document._id === original._id)!;
      expect({ ...restored, _rev: original._rev }).toEqual(original);
    }

    expect(documents.filter((document) => document._type === 'topic')).toHaveLength(6);
    const rolledBackCount = mutations.length;
    await main(['--rollback', path.join(outputDir, 'applied.json')]);
    expect(mutations).toHaveLength(rolledBackCount);
  });

  it('rejects stale reports before any mutation', async () => {
    await main(['--output-dir', outputDir]);
    documents[1] = { ...documents[1], _rev: 'edited-since-review', title: 'Edited title' };

    await expect(main(['--apply', path.join(outputDir, 'report.json')])).rejects.toThrow('Content changed');
    expect(mutations).toEqual([]);
  });

  it('rejects modified reports and backups', async () => {
    await main(['--output-dir', outputDir]);
    const filename = path.join(outputDir, 'report.json');
    const report = JSON.parse(await readFile(filename, 'utf8'));
    report.plan.operations[0].after.displayName = 'Unreviewed topic';
    await writeFile(filename, JSON.stringify(report));

    await expect(main(['--apply', filename])).rejects.toThrow('no longer matches');
    await writeFile(path.join(outputDir, 'backup.ndjson'), '{}\n');
    await expect(main(['--apply', filename])).rejects.toThrow('integrity check failed');
    expect(mutations).toEqual([]);
  });

  it('refuses rollback after subsequent edits', async () => {
    await main(['--output-dir', outputDir]);
    await main(['--apply', path.join(outputDir, 'report.json')]);
    documents[1] = { ...documents[1], _rev: 'later-editorial-change' };
    const count = mutations.length;

    await expect(main(['--rollback', path.join(outputDir, 'applied.json')])).rejects.toThrow('will not overwrite');
    expect(mutations).toHaveLength(count);
  });

  it('recovers a lost apply receipt from exact resulting content without repeating writes', async () => {
    await main(['--output-dir', outputDir]);
    await main(['--apply', path.join(outputDir, 'report.json')]);
    await rm(path.join(outputDir, 'applied.json'));
    const count = mutations.length;
    await main(['--apply', path.join(outputDir, 'report.json')]);

    expect(mutations).toHaveLength(count);
    expect(await stat(path.join(outputDir, 'applied.json'))).toBeDefined();
  });

  it('recovers a lost rollback receipt only after exact restoration', async () => {
    await main(['--output-dir', outputDir]);
    await main(['--apply', path.join(outputDir, 'report.json')]);
    await main(['--rollback', path.join(outputDir, 'applied.json')]);
    await rm(path.join(outputDir, 'rolled-back.json'));
    const count = mutations.length;
    await main(['--rollback', path.join(outputDir, 'applied.json')]);

    expect(mutations).toHaveLength(count);
    expect(await stat(path.join(outputDir, 'rolled-back.json'))).toBeDefined();
  });

  it('rejects ambiguous modes and unsafe output locations without any API calls', async () => {
    await expect(main(['--dry-run', '--apply', 'report.json'])).rejects.toThrow('exactly one');
    await expect(main(['--output-dir', 'docs/private-backup'])).rejects.toThrow('ignored .tmp');
    expect(fetch).not.toHaveBeenCalled();
  });
});
