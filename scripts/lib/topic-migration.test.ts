// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST_TOPIC_ASSIGNMENTS, TOPICS } from '../../src/data/blogTopics';
import {
  assertAppliedContent, assertSnapshotUnchanged, buildMigrationPlan, getApplyMutations,
  getRollbackMutations,
} from './topic-migration';
import { applyFixture, fixtureDocuments } from './topic-migration.fixtures';

const aiId = 'cecb1ab3-1182-4de2-9955-703b1d0a87cd';
const context = { projectId: 'testproject', dataset: 'test', createdAt: '2026-10-04T00:00:00.000Z' };

describe('primary-topic migration planner', () => {
  it('accounts for all published posts and the AI draft without creating or deleting posts', () => {
    const plan = buildMigrationPlan(fixtureDocuments(), context);

    expect(plan.issues).toEqual([]);
    expect(plan.inventory).toMatchObject({ publishedPosts: 8, draftPosts: 1, legacyUrls: 20 });
    expect(plan.operations.filter((operation) => operation.kind === 'create')).toHaveLength(6);
    expect(plan.operations.filter((operation) => operation.kind === 'patch')).toHaveLength(9);
    expect(plan.posts.find((post) => post.id === `drafts.${aiId}`)).toMatchObject({
      state: 'draft', topicId: 'topic-ai-assisted-development', changedFields: ['primaryTopic', 'keywords'],
    });
    expect(getApplyMutations(plan).every((mutation) => 'create' in mutation || 'patch' in mutation)).toBe(true);
    expect(plan.legacyRedirects.graphql).toBe('/blog');
    expect(plan.legacyRedirects.lighthouse).toBe('/blog/topics/performance');
  });

  it('preserves bodies, slugs, asset references, IDs, tags, and draft-only state', () => {
    const documents = fixtureDocuments();
    const plan = buildMigrationPlan(documents, context);
    const migrated = applyFixture(plan, documents);

    expect(() => assertAppliedContent(plan, documents, migrated)).not.toThrow();
    expect(migrated.find((post) => post._id === aiId)).toBeUndefined();

    for (const original of documents.filter((document) => document._type === 'post')) {
      expect(migrated.find((document) => document._id === original._id)).toMatchObject({
        _id: original._id, body: original.body, slug: original.slug,
        image: original.image, tags: original.tags, _createdAt: original._createdAt,
      });
    }
  });

  it('preserves aliases and produces no changes on a second run', () => {
    const documents = fixtureDocuments();
    const plan = buildMigrationPlan(documents, context);
    const migrated = applyFixture(plan, documents);
    const second = buildMigrationPlan(migrated, context);

    expect(second.issues).toEqual([]);
    expect(second.operations).toEqual([]);
    expect(migrated.find((post) => post._type === 'post')?.keywords).toEqual(['React', 'React.js', 'ReactJS', 'frontend']);
  });

  it('migrates draft variants independently, preserving their pending body changes', () => {
    const documents = fixtureDocuments();
    const published = documents.find((document) => document._type === 'post' && !document._id.startsWith('drafts.'))!;
    const draft = { ...published, _id: `drafts.${published._id}`, _rev: 'draft-revision', body: ['Different draft body'] };
    const plan = buildMigrationPlan([...documents, draft], context);
    const migrated = applyFixture(plan, [...documents, draft]);

    expect(plan.issues).toEqual([]);
    expect(plan.inventory.draftPosts).toBe(2);
    expect(migrated.find((document) => document._id === draft._id)?.body).toEqual(draft.body);
    expect(plan.operations.find((operation) => operation.id === draft._id)).toMatchObject({ expectedRevision: 'draft-revision' });
  });

  it('blocks unmapped posts, unresolved references, and missing expected articles', () => {
    const documents = fixtureDocuments();
    const plan = buildMigrationPlan([
      ...documents.filter((document) => document._id !== `drafts.${aiId}`),
      { _id: 'drafts.new-article', _type: 'post', _rev: 'new', tags: [{ _ref: 'missing' }] },
    ], context);

    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.stringContaining('is missing'), expect.stringContaining('approved valid primary-topic'),
      expect.stringContaining('unresolved legacy tag'),
    ]));
    expect(() => getApplyMutations(plan)).toThrow('Resolve every dry-run issue');
  });

  it('blocks unsupported release variants and unexpected AI publication', () => {
    const documents = fixtureDocuments();
    const ai = documents.find((document) => document._id === `drafts.${aiId}`)!;
    const plan = buildMigrationPlan([...documents, { ...ai, _id: aiId }, { ...ai, _id: `versions.release.${aiId}` }], context);

    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.stringContaining('content-release variant'), expect.stringContaining('AI article has a published variant'),
    ]));
  });

  it('keeps valid topic copy and blocks duplicate topic slugs and incomplete seed documents', () => {
    const documents = fixtureDocuments();
    const plan = buildMigrationPlan(documents, context);
    const migrated = applyFixture(plan, documents);
    const existing = migrated.find((document) => document._id === TOPICS[0]._id)!;
    const edited = migrated.map((document) => document._id === existing._id ? { ...document, description: 'Edited guidance' } : document);

    expect(buildMigrationPlan(edited, context).operations).toEqual([]);
    expect(buildMigrationPlan([...edited, { ...existing, _id: 'different-topic' }], context).issues).toContain('Duplicate topic slug architecture.');
    expect(buildMigrationPlan(documents.concat({ ...existing, displayName: '' }), context).issues).toContain(`Seed topic ${existing._id} conflicts with an existing document.`);
  });

  it('reports conflicting persisted assignments and edited migrated excerpts instead of overwriting them', () => {
    const documents = fixtureDocuments();
    const migrated = applyFixture(buildMigrationPlan(documents, context), documents);
    const id = Object.keys(POST_TOPIC_ASSIGNMENTS)[0];
    const changed = migrated.map((document) => document._id === id ? {
      ...document, primaryTopic: { _type: 'reference', _ref: 'topic-performance' }, excerpt: 'New editorial copy',
    } : document);
    const plan = buildMigrationPlan(changed, context);

    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.stringContaining('approved initial topic assignment'), expect.stringContaining('rather than overwriting'),
    ]));
    expect(plan.operations.find((operation) => operation.id === id)).toBeUndefined();
  });

  it('blocks legacy slugs without a reviewed redirect policy', () => {
    const plan = buildMigrationPlan(fixtureDocuments().concat({
      _id: 'retired-tag', _type: 'tag', _rev: 'old', slug: { current: 'unmapped-history' },
    }), context);

    expect(plan.issues).toContain('Legacy tag retired-tag has no approved historical URL destination.');
  });

  it('guards all mutated revisions and rolls back only migration-owned fields', () => {
    const documents = fixtureDocuments();
    const plan = buildMigrationPlan(documents, context);
    const migrated = applyFixture(plan, documents);
    const revisions = Object.fromEntries(migrated.map((document) => [document._id, document._rev]));
    const mutations = getApplyMutations(plan);
    const rollback = getRollbackMutations(plan, revisions);

    expect(mutations.find((mutation) => 'patch' in mutation)).toMatchObject({ patch: { ifRevisionID: expect.stringContaining('revision-') } });
    expect(rollback).toHaveLength(9);
    expect(rollback[0]).toMatchObject({ patch: {
      ifRevisionID: expect.stringContaining('applied-'), set: { excerpt: 'Original summary' }, unset: ['primaryTopic', 'keywords'],
    } });
    expect(rollback.every((mutation) => 'patch' in mutation)).toBe(true);
    expect(() => getRollbackMutations(plan, {})).toThrow('Missing applied revision');
  });

  it('detects edits and new variants since the reviewed report', () => {
    const documents = fixtureDocuments();

    expect(() => assertSnapshotUnchanged(documents, [...documents].reverse())).not.toThrow();
    expect(() => assertSnapshotUnchanged(documents, documents.map((document) => ({ ...document, _rev: 'changed' })))).toThrow('Content changed');
    expect(() => assertSnapshotUnchanged(documents, [...documents, { _id: 'drafts.new', _type: 'post', _rev: 'new' }])).toThrow('Content changed');
  });

  it('verifies that an applied transaction did not change an article body', () => {
    const documents = fixtureDocuments();
    const plan = buildMigrationPlan(documents, context);
    const migrated = applyFixture(plan, documents);
    const changed = migrated.map((document) => document._type === 'post' ? { ...document, body: [] } : document);

    expect(() => assertAppliedContent(plan, documents, changed)).toThrow('verification failed');
  });
});
