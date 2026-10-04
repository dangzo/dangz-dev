import { defineField, defineType } from 'sanity';

export const tagType = defineType({
  name: 'tag',
  title: 'Legacy tag',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
  ],
});
