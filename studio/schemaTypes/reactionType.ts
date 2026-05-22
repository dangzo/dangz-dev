import { defineField, defineType } from 'sanity';

export const reactionType = defineType({
  name: 'reaction',
  title: 'Reaction',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      description: 'Single emoji displayed for this reaction (e.g. 👍, ❤️, 🔥).',
      validation: (rule) => rule.required().min(1).max(2),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      emoji: 'emoji',
    },
    prepare({ title, emoji }) {
      return {
        title,
        subtitle: emoji,
      };
    },
  },
});
