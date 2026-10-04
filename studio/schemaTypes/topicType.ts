import { defineField, defineType } from 'sanity';
import { TopicSlugInput } from '../components/TopicSlugInput';
import { validateTopicSlug } from '../utils/topicValidation';

export const topicType = defineType({
  name: 'topic',
  title: 'Topic',
  type: 'document',
  description: 'Add a topic only when concrete writing establishes a distinct reader need. Classify by the main reader benefit, rather than every technology mentioned.',
  fields: [
    defineField({
      name: 'displayName',
      title: 'Display name',
      type: 'string',
      description: 'Add a topic only when concrete writing establishes a distinct reader need. Avoid near-duplicates and technology categories.',
      validation: (rule) => rule.required().custom((value) => Boolean(value?.trim()) || 'Enter a reader-facing topic name.'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'The permanent topic URL. Choose it carefully before publishing; display names can change later.',
      options: { source: 'displayName' },
      components: { input: TopicSlugInput },
      validation: (rule) => rule.required().custom(validateTopicSlug),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      description: 'A short reader-facing explanation of what these articles help with.',
      validation: (rule) => rule.required().max(300).custom((value) => Boolean(value?.trim()) || 'Describe the reader benefit.'),
    }),
    defineField({
      name: 'editorialGuidance',
      title: 'Editorial guidance',
      type: 'text',
      rows: 3,
      description: 'Explain what belongs here and how this topic differs from neighboring topics. This guides authors rather than public browsing.',
      validation: (rule) => rule.required().custom((value) => Boolean(value?.trim()) || 'Explain when authors should choose this topic.'),
    }),
  ],
  preview: {
    select: { title: 'displayName', subtitle: 'description' },
  },
});
