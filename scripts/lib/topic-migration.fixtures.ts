import { POST_TOPIC_ASSIGNMENTS } from '../../src/data/blogTopics';
import type { ContentDocument, MigrationPlan } from './topic-migration';

const aiId = 'cecb1ab3-1182-4de2-9955-703b1d0a87cd';

export function fixtureDocuments(): ContentDocument[] {
  return [
    { _id: 'react-tag', _type: 'tag', _rev: 'tag-revision', name: 'React', slug: { current: 'react' } },
    ...Object.keys(POST_TOPIC_ASSIGNMENTS).map((id) => ({
      _id: id === aiId ? `drafts.${id}` : id,
      _type: 'post', _rev: `revision-${id}`, _createdAt: '2026-01-01T00:00:00Z',
      title: 'Existing title', slug: { _type: 'slug', current: `existing-${id}` },
      body: [{ _key: 'block-key', _type: 'block', children: [{ _key: 'span-key', text: 'Private body' }] }],
      image: { asset: { _ref: 'image-reference', _type: 'reference' } },
      tags: [{ _type: 'reference', _key: 'tag-key', _ref: 'react-tag' }],
      excerpt: id === aiId ? 'Unpublished summary' : 'Original summary',
    })),
  ];
}

export function applyFixture(plan: MigrationPlan, documents: readonly ContentDocument[]): ContentDocument[] {
  const result = new Map(documents.map((document) => [document._id, document]));

  for (const operation of plan.operations) {
    const before = operation.kind === 'patch' ? result.get(operation.id) : {};
    result.set(operation.id, {
      ...before, ...operation.after, _id: operation.id, _type: operation.kind === 'create' ? 'topic' : 'post',
      _rev: `applied-${operation.id}`, _updatedAt: '2026-10-04T00:00:01.000Z',
    });
  }

  return [...result.values()];
}
