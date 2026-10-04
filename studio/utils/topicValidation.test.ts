import { describe, expect, it, vi } from 'vitest';
import type { ValidationContext } from 'sanity';
import { validateKeywords, validatePrimaryTopic, validateSummary, validateTopicSlug } from './topicValidation';

function validationContext(result: unknown) {
  const fetch = vi.fn().mockResolvedValue(result);
  const withConfig = vi.fn().mockReturnValue({ fetch });
  const getClient = vi.fn().mockReturnValue({ withConfig });
  // Validators use only this client surface; the remaining Studio context is irrelevant here.
  const context = { getClient, document: { _id: 'drafts.topic-example' } } as unknown as ValidationContext;

  return { context, fetch, withConfig };
}

describe('post publication validation', () => {
  it('requires a nonblank, focused summary within the existing limit', () => {
    expect(validateSummary(undefined)).not.toBe(true);
    expect(validateSummary(' \n ')).not.toBe(true);
    expect(validateSummary('x'.repeat(301))).not.toBe(true);
    expect(validateSummary('Learn how to choose application boundaries.')).toBe(true);
    expect(validateSummary('x'.repeat(300))).toBe(true);
  });

  it('requires a strong published topic while allowing the incomplete value to remain in a draft', async () => {
    const { context, fetch } = validationContext({ unique: true, topic: { displayName: 'Example', description: 'Description', editorialGuidance: 'Guidance', slug: 'example' } });

    expect(await validatePrimaryTopic(undefined, context)).not.toBe(true);
    expect(await validatePrimaryTopic({ _type: 'reference', _ref: 'drafts.topic-new' }, context)).not.toBe(true);
    expect(await validatePrimaryTopic({ _type: 'reference', _ref: 'topic-new', _weak: true }, context)).not.toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    expect(await validatePrimaryTopic({ _type: 'reference', _ref: 'topic-example' }, context)).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('editorialGuidance'), { topicId: 'topic-example' });
  });

  it('blocks unresolved topics and fails closed when validation cannot reach Sanity', async () => {
    const { context, fetch } = validationContext({ unique: false, topic: null });
    const reference = { _type: 'reference' as const, _ref: 'topic-example' };

    expect(await validatePrimaryTopic(reference, context)).not.toBe(true);
    fetch.mockResolvedValue({ unique: true, topic: { displayName: 'Example', description: 'Description', editorialGuidance: 'Guidance', slug: 'Bad slug' } });
    expect(await validatePrimaryTopic(reference, context)).not.toBe(true);
    fetch.mockResolvedValue({ unique: true, topic: { displayName: 'Example', description: '  ', editorialGuidance: 'Guidance', slug: 'example' } });
    expect(await validatePrimaryTopic(reference, context)).not.toBe(true);
    fetch.mockRejectedValue(new Error('Offline'));
    expect(await validatePrimaryTopic(reference, context)).toContain('Could not verify');
  });

  it('keeps search keywords optional but distinct and nonblank', () => {
    expect(validateKeywords(undefined)).toBe(true);
    expect(validateKeywords(['React', 'WebSocket'])).toBe(true);
    expect(validateKeywords(['React', ' react '])).not.toBe(true);
    expect(validateKeywords([' '])).not.toBe(true);
    expect(validateKeywords([3])).not.toBe(true);
  });
});

describe('permanent topic slugs', () => {
  it('validates URL format and accepts the current document’s own draft/published slug', async () => {
    const { context, fetch, withConfig } = validationContext({ publishedSlug: 'example', collisions: 0 });

    expect(await validateTopicSlug({ _type: 'slug', current: 'example' }, context)).toBe(true);
    expect(withConfig).toHaveBeenCalledWith({ perspective: 'raw', useCdn: false });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('!sanity::versionOf($id)'), { id: 'topic-example', slug: 'example' });
    expect(await validateTopicSlug({ _type: 'slug', current: 'Bad URL' }, context)).not.toBe(true);
    expect(await validateTopicSlug(undefined, context)).not.toBe(true);
  });

  it('blocks duplicate slugs and changes to a published slug', async () => {
    const duplicate = validationContext({ publishedSlug: null, collisions: 1 });
    const published = validationContext({ publishedSlug: 'original', collisions: 0 });

    expect(await validateTopicSlug({ _type: 'slug', current: 'duplicate' }, duplicate.context)).toContain('already uses');
    expect(await validateTopicSlug({ _type: 'slug', current: 'renamed' }, published.context)).toContain('permanent');
  });
});
