import {
  EDITORIAL_SUMMARIES, getSearchKeywords, LEGACY_TAG_REDIRECTS, POST_TOPIC_ASSIGNMENTS, TOPICS,
} from '../../src/data/blogTopics.ts';

export type ContentDocument = Readonly<{
  _id: string;
  _type: string;
  _rev: string;
  [key: string]: unknown;
}>;

export type FieldSnapshot = Readonly<{ exists: boolean; value?: unknown }>;

export type MigrationOperation =
  | Readonly<{ kind: 'create'; id: string; after: Readonly<Record<string, unknown>> }>
  | Readonly<{
    kind: 'patch';
    id: string;
    expectedRevision: string;
    before: Readonly<Record<string, FieldSnapshot>>;
    after: Readonly<Record<string, unknown>>;
  }>;

export type MigrationPlan = Readonly<{
  version: 1;
  projectId: string;
  dataset: string;
  createdAt: string;
  issues: readonly string[];
  inventory: Readonly<{
    publishedPosts: number;
    draftPosts: number;
    topicDocuments: number;
    legacyTagDocuments: number;
    legacyUrls: number;
  }>;
  legacyRedirects: Readonly<Record<string, string>>;
  posts: readonly Readonly<{
    id: string;
    state: 'draft' | 'published';
    topicId: string | null;
    changedFields: readonly string[];
  }>[];
  operations: readonly MigrationOperation[];
}>;

export function parseDocuments(value: unknown): readonly ContentDocument[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected a document array.');
  }

  return value.map((document: unknown) => {
    if (!document || typeof document !== 'object'
      || !('_id' in document) || typeof document._id !== 'string'
      || !('_type' in document) || typeof document._type !== 'string'
      || !('_rev' in document) || typeof document._rev !== 'string') {
      throw new Error('Invalid document in the content snapshot.');
    }

    return document as ContentDocument;
  });
}

export function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function getProperty(value: unknown, key: string): unknown {
  return value && typeof value === 'object' && key in value
    ? (value as Readonly<Record<string, unknown>>)[key]
    : undefined;
}

export function equalValues(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value: unknown, index) => equalValues(value, b[index]));
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = a as Readonly<Record<string, unknown>>;
    const right = b as Readonly<Record<string, unknown>>;
    const keys = Object.keys(left);

    return keys.length === Object.keys(right).length
      && keys.every((key) => Object.hasOwn(right, key) && equalValues(left[key], right[key]));
  }

  return false;
}

function isCompleteTopic(document: ContentDocument | undefined): boolean {
  return document?._type === 'topic'
    && !/^(drafts|versions)\./.test(document._id)
    && ['displayName', 'description', 'editorialGuidance'].every((key) => getString(document[key])?.trim())
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(getString(getProperty(document.slug, 'current')) ?? '');
}

export function buildMigrationPlan(
  documents: readonly ContentDocument[],
  context: Readonly<{ projectId: string; dataset: string; createdAt: string }>,
): MigrationPlan {
  const byId = new Map(documents.map((document) => [document._id, document]));
  const issues: string[] = [];
  const operations: MigrationOperation[] = [];
  const posts: MigrationPlan['posts'][number][] = [];
  const topics = documents.filter((document) => document._type === 'topic');
  const tags = documents.filter((document) => document._type === 'tag');
  const postDocuments = documents.filter((document) => document._type === 'post');
  const legacyRedirects: Record<string, string> = {};
  const topicSlugs = new Map<string, string>();

  for (const document of [...topics, ...postDocuments, ...tags]) {
    if (document._id.startsWith('versions.')) {
      issues.push(`Resolve content-release variant ${document._id} before migration.`);
    }
  }

  for (const topic of topics) {
    const slug = getString(getProperty(topic.slug, 'current'));
    const baseId = topic._id.replace(/^drafts\./, '');

    if (slug && topicSlugs.has(slug) && topicSlugs.get(slug) !== baseId) {
      issues.push(`Duplicate topic slug ${slug}.`);
    }

    if (slug) {
      topicSlugs.set(slug, baseId);
    }

    const published = byId.get(baseId);

    if (published && topic._id !== baseId && !equalValues(topic.slug, published.slug)) {
      issues.push(`Draft topic ${topic._id} changes a published slug.`);
    }
  }

  for (const topic of TOPICS) {
    const existing = byId.get(topic._id);
    const draft = byId.get(`drafts.${topic._id}`);

    if (existing) {
      if (!isCompleteTopic(existing) || getProperty(existing.slug, 'current') !== topic.slug.current) {
        issues.push(`Seed topic ${topic._id} conflicts with an existing document.`);
      }
    } else if (draft || (topicSlugs.has(topic.slug.current) && topicSlugs.get(topic.slug.current) !== topic._id)) {
      issues.push(`Seed topic ${topic._id} conflicts with an existing draft or slug.`);
    } else {
      operations.push({ kind: 'create', id: topic._id, after: {
        ...topic, _type: 'topic', slug: { _type: 'slug', ...topic.slug },
      } });
    }
  }

  for (const [slug, destination] of Object.entries(LEGACY_TAG_REDIRECTS)) {
    legacyRedirects[slug] = destination ? `/blog/topics/${destination}` : '/blog';
  }

  for (const tag of tags) {
    const slug = getString(getProperty(tag.slug, 'current'));

    if (!slug || !Object.hasOwn(legacyRedirects, slug)) {
      issues.push(`Legacy tag ${tag._id} has no approved historical URL destination.`);
    }
  }

  for (const id of Object.keys(POST_TOPIC_ASSIGNMENTS)) {
    if (!byId.has(id) && !byId.has(`drafts.${id}`)) {
      issues.push(`Expected article ${id} is missing from the inventory.`);
    }
  }

  const aiId = 'cecb1ab3-1182-4de2-9955-703b1d0a87cd';

  if (byId.has(aiId)) {
    issues.push('The AI article has a published variant; review its publication state before migration.');
  }

  for (const post of postDocuments) {
    if (post._id.startsWith('versions.')) {
      continue;
    }

    const baseId = post._id.replace(/^drafts\./, '');
    const assignedSlug = Object.hasOwn(POST_TOPIC_ASSIGNMENTS, baseId) ? POST_TOPIC_ASSIGNMENTS[baseId] : undefined;
    const expectedTopic = TOPICS.find((topic) => topic.slug.current === assignedSlug);
    const existingRef = getString(getProperty(post.primaryTopic, '_ref'));
    const topicId = existingRef ?? expectedTopic?._id ?? null;
    const seeded = TOPICS.some((topic) => topic._id === topicId && !byId.has(topicId) && !byId.has(`drafts.${topicId}`));
    const after: Record<string, unknown> = {};

    if (!topicId || (existingRef && (!isCompleteTopic(byId.get(existingRef))
      || getProperty(post.primaryTopic, '_weak') || getProperty(post.primaryTopic, '_type') !== 'reference'))) {
      issues.push(`Post ${post._id} needs an approved valid primary-topic assignment.`);
    } else if (expectedTopic && existingRef && existingRef !== expectedTopic._id) {
      issues.push(`Post ${post._id} conflicts with its approved initial topic assignment.`);
    } else if (!existingRef && seeded) {
      after.primaryTopic = { _type: 'reference', _ref: topicId };
    } else if (!existingRef && isCompleteTopic(byId.get(topicId))) {
      after.primaryTopic = { _type: 'reference', _ref: topicId };
    }

    if (post.primaryTopic != null && !existingRef) {
      issues.push(`Post ${post._id} has a malformed primary-topic value.`);
    }

    const legacyTags: { name?: string; slug?: { current?: string } }[] = [];

    if (post.tags != null && !Array.isArray(post.tags)) {
      issues.push(`Post ${post._id} has malformed legacy tags.`);
    }

    for (const reference of Array.isArray(post.tags) ? post.tags : []) {
      const id = getString(getProperty(reference, '_ref'));
      const tag = id ? byId.get(id) : undefined;

      if (!tag || tag._type !== 'tag') {
        issues.push(`Post ${post._id} has an unresolved legacy tag reference.`);
      } else {
        legacyTags.push({
          name: getString(tag.name) ?? undefined,
          slug: { current: getString(getProperty(tag.slug, 'current')) ?? undefined },
        });
      }
    }

    const existingKeywords = post.keywords;

    if (existingKeywords != null && (!Array.isArray(existingKeywords)
      || !existingKeywords.every((value: unknown) => typeof value === 'string'))) {
      issues.push(`Post ${post._id} has malformed search keywords.`);
    } else {
      const keywords = getSearchKeywords({
        _id: post._id, keywords: existingKeywords as readonly string[] | null | undefined, tags: legacyTags,
      });

      if (!equalValues(post.keywords, keywords)) {
        after.keywords = keywords;
      }
    }

    const summary = Object.hasOwn(EDITORIAL_SUMMARIES, baseId) ? EDITORIAL_SUMMARIES[baseId] : undefined;

    if (summary && post.excerpt !== summary) {
      if (existingRef && Array.isArray(existingKeywords)) {
        issues.push(`Classified post ${post._id} has a different excerpt; review editorial changes rather than overwriting them.`);
      } else {
        after.excerpt = summary;
      }
    }

    const effectiveExcerpt = getString(after.excerpt ?? post.excerpt);

    if (!post._id.startsWith('drafts.') && (!effectiveExcerpt?.trim() || effectiveExcerpt.length > 300)) {
      issues.push(`Published post ${post._id} needs a nonblank excerpt within 300 characters.`);
    }

    const fields = Object.keys(after);

    if (fields.length) {
      operations.push({
        kind: 'patch', id: post._id, expectedRevision: post._rev, after,
        before: Object.fromEntries(fields.map((field) => [field, Object.hasOwn(post, field)
          ? { exists: true, value: post[field] }
          : { exists: false }])),
      });
    }

    posts.push({ id: post._id, state: post._id.startsWith('drafts.') ? 'draft' : 'published', topicId, changedFields: fields });
  }

  return {
    version: 1, ...context, issues,
    inventory: {
      publishedPosts: posts.filter((post) => post.state === 'published').length,
      draftPosts: posts.filter((post) => post.state === 'draft').length,
      topicDocuments: topics.length, legacyTagDocuments: tags.length,
      legacyUrls: Object.keys(legacyRedirects).length,
    },
    legacyRedirects, posts, operations,
  };
}

export type Mutation = Readonly<Record<string, unknown>>;

export function getApplyMutations(plan: MigrationPlan): readonly Mutation[] {
  if (plan.issues.length) {
    throw new Error('Resolve every dry-run issue before applying the migration.');
  }

  return plan.operations.map((operation) => operation.kind === 'create'
    ? { create: operation.after }
    : { patch: { id: operation.id, ifRevisionID: operation.expectedRevision, set: operation.after } });
}

export function getRollbackMutations(
  plan: MigrationPlan,
  revisions: Readonly<Record<string, string>>,
): readonly Mutation[] {
  return plan.operations.filter((operation) => operation.kind === 'patch').map((operation) => {
    if (!revisions[operation.id]) {
      throw new Error(`Missing applied revision for ${operation.id}.`);
    }

    const set = Object.fromEntries(Object.entries(operation.before)
      .filter(([, snapshot]) => snapshot.exists)
      .map(([field, snapshot]) => [field, snapshot.value]));
    const unset = Object.entries(operation.before).filter(([, snapshot]) => !snapshot.exists).map(([field]) => field);

    return { patch: { id: operation.id, ifRevisionID: revisions[operation.id], set, unset } };
  });
}

export function assertSnapshotUnchanged(
  backup: readonly ContentDocument[],
  current: readonly ContentDocument[],
): void {
  const relevant = (documents: readonly ContentDocument[]) => documents
    .filter((document) => ['post', 'topic', 'tag'].includes(document._type))
    .map((document) => ({ _id: document._id, _rev: document._rev }))
    .sort((a, b) => a._id.localeCompare(b._id));

  if (!equalValues(relevant(backup), relevant(current))) {
    throw new Error('Content changed since the reviewed report. Generate and review a new dry run.');
  }
}

export function assertAppliedContent(
  plan: MigrationPlan,
  backup: readonly ContentDocument[],
  current: readonly ContentDocument[],
): void {
  const before = new Map(backup.map((document) => [document._id, document]));
  const after = new Map(current.map((document) => [document._id, document]));
  const content = (value: Readonly<Record<string, unknown>>, created: boolean) => Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['_rev', '_updatedAt', ...(created ? ['_createdAt'] : [])].includes(key)));

  for (const operation of plan.operations) {
    const expected = operation.kind === 'create' ? operation.after : { ...before.get(operation.id), ...operation.after };
    const actual = after.get(operation.id);

    if (!actual || !equalValues(content(expected, operation.kind === 'create'), content(actual, operation.kind === 'create'))) {
      throw new Error(`Post-migration verification failed for ${operation.id}. Preserve the report and receipt for recovery.`);
    }
  }
}

export function assertRolledBackContent(
  plan: MigrationPlan,
  backup: readonly ContentDocument[],
  current: readonly ContentDocument[],
): void {
  const originals = new Map(backup.map((document) => [document._id, document]));
  const documents = new Map(current.map((document) => [document._id, document]));
  const content = (document: ContentDocument) => Object.fromEntries(Object.entries(document)
    .filter(([key]) => !['_rev', '_updatedAt'].includes(key)));

  for (const operation of plan.operations) {
    if (operation.kind !== 'patch') {
      continue;
    }

    const original = originals.get(operation.id);
    const currentDocument = documents.get(operation.id);

    if (!original || !currentDocument || !equalValues(content(original), content(currentDocument))) {
      throw new Error(`Rollback verification failed for ${operation.id}. Preserve the transaction records.`);
    }
  }
}
