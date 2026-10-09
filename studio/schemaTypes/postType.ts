import { defineArrayMember, defineField, defineType } from 'sanity';
import { codeLanguageOptions } from './codeLanguageOptions';
import { TOPICS } from '../../src/data/blogTopics';
import { PrimaryTopicInput } from '../components/PrimaryTopicInput';
import { validateKeywords, validatePrimaryTopic, validateSummary } from '../utils/topicValidation';

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  preview: {
    select: { title: 'title', subtitle: 'primaryTopic.displayName', media: 'image' },
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
    defineField({
      name: 'imageAltText',
      type: 'string',
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'In one or two concise sentences, explain what the reader will learn or be able to do. Used in listings and search; required before publishing. Maximum 300 characters.',
      validation: (rule) => rule.required().max(300).custom(validateSummary),
    }),
    defineField({
      name: 'primaryTopic',
      title: 'Primary topic',
      type: 'reference',
      to: [{ type: 'topic' }],
      description: `Choose the article's main reader benefit. Start with ${TOPICS.map((topic) => topic.displayName).join(', ')}. Manage deliberate additions in Topics; drafts can remain unclassified.`,
      options: { disableNew: true },
      components: { input: PrimaryTopicInput },
      validation: (rule) => rule.required().custom(validatePrimaryTopic),
    }),
    defineField({
      name: 'keywords',
      title: 'Search keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Optional technology names, aliases, and terms that help search find this article. These are never public topic labels. Existing legacy search terms are preserved by migration.',
      validation: (rule) => rule.custom(validateKeywords),
    }),
    defineField({
      name: 'tags',
      title: 'Legacy tags',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'tag' } }],
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        defineArrayMember(
          {
            type: 'table',
          }
        ),
        defineArrayMember({
          title: 'Block',
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
            { title: 'Caption', value: 'figcaption' },
          ],
          lists: [
            {
              title: 'Unordered List',
              value: 'bullet',
            },
            {
              title: 'Ordered List',
              value: 'number',
            },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              {
                title: 'Caption',
                value: 'caption',
                icon: () => 'CAP'
              },
              {
                title: 'Inline Code',
                value: 'inlineCode',
                icon: () => '</>',
              },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              validation: (rule) => rule.required(),
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
            {
              name: 'height',
              type: 'number',
              title: 'Height',
            },
            {
              name: 'width',
              type: 'number',
              title: 'Width',
            },
          ],
        }),
        defineArrayMember({
          type: 'code',
          options: codeLanguageOptions,
        }),
        defineArrayMember({ type: 'codeGroup' }),
      ],
    }),
  ],
});
