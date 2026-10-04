import type { Reference, SlugValue, ValidationContext } from 'sanity';

export const STUDIO_API_VERSION = '2025-02-19';

export function validateSummary(value: string | undefined): true | string {
  if (!value?.trim()) {
    return 'Write one or two sentences explaining what the reader will learn.';
  }

  return value.length <= 300 || 'Keep the summary within 300 characters.';
}

export function validateKeywords(value: readonly unknown[] | undefined): true | string {
  const seen = new Set<string>();

  for (const keyword of value ?? []) {
    if (typeof keyword !== 'string') {
      return 'Search keywords must be text.';
    }

    const normalized = keyword.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return 'Use distinct, nonblank search keywords.';
    }

    seen.add(normalized);
  }

  return true;
}

export async function validatePrimaryTopic(
  value: Reference | undefined,
  context: ValidationContext,
): Promise<true | string> {
  if (!value?._ref || value._weak || /^(drafts|versions)\./.test(value._ref)) {
    return 'Select one published primary topic before publishing.';
  }

  try {
    const result = await context.getClient({ apiVersion: STUDIO_API_VERSION })
      .withConfig({ perspective: 'published', useCdn: false })
      .fetch<Readonly<{
        unique: boolean;
        topic: Readonly<{
          displayName?: string;
          description?: string;
          editorialGuidance?: string;
          slug?: string;
        }> | null;
      }>>(`{
        "unique": count(*[
          _type == "topic" && slug.current == *[_id == $topicId][0].slug.current
        ]) == 1,
        "topic": *[_type == "topic" && _id == $topicId][0]{
          displayName, description, editorialGuidance, "slug": slug.current
        }
      }`, { topicId: value._ref });

    const topic = result.topic;
    const complete = topic
      && [topic.displayName, topic.description, topic.editorialGuidance]
        .every((field) => typeof field === 'string' && field.trim().length > 0);

    return (result.unique && complete && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic?.slug ?? ''))
      || 'Choose a published topic with a unique valid slug and its name, description, and editorial guidance complete.';
  } catch {
    return 'Could not verify the primary topic. Try again before publishing.';
  }
}

export async function validateTopicSlug(
  value: SlugValue | undefined,
  context: ValidationContext,
): Promise<true | string> {
  const slug = value?.current;

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Use a lowercase URL slug with words separated by hyphens.';
  }

  const id = context.document?._id.replace(/^drafts\./, '');

  if (!id) {
    return 'Save the topic before checking its slug.';
  }

  try {
    const result = await context.getClient({ apiVersion: STUDIO_API_VERSION })
      .withConfig({ perspective: 'raw', useCdn: false })
      .fetch<Readonly<{ publishedSlug: string | null; collisions: number }>>(`{
        "publishedSlug": *[_id == $id][0].slug.current,
        "collisions": count(*[_type == "topic" && slug.current == $slug && !sanity::versionOf($id)])
      }`, { id, slug });

    if (result.publishedSlug && result.publishedSlug !== slug) {
      return 'Published topic slugs are permanent. Change the display name instead.';
    }

    return result.collisions === 0 || 'Another topic already uses this slug.';
  } catch {
    return 'Could not verify the topic slug. Try again before publishing.';
  }
}
