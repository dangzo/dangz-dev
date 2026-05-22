import { defineField, defineType } from 'sanity';

export const postReactionCountType = defineType({
  name: 'postReactionCount',
  title: 'Post Reaction Count',
  type: 'document',
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reaction',
      title: 'Reaction',
      type: 'reference',
      to: [{ type: 'reaction' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'count',
      title: 'Count',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: {
      postTitle: 'post.title',
      reactionName: 'reaction.name',
      count: 'count',
    },
    prepare({ postTitle, reactionName, count }) {
      return {
        title: `${reactionName || 'Reaction'}: ${count ?? 0}`,
        subtitle: postTitle || 'Unknown post',
      };
    },
  },
});