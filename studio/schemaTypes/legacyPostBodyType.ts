import { defineField, defineType } from 'sanity';
import { postType } from './postType';

const body = postType.fields.find((field) => field.name === 'body');

if (!body || !('of' in body)) {
  throw new Error('The post body schema must define its Portable Text members.');
}

// Sanity names unions after their members. Keep the previous body union in the
// GraphQL schema so adding codeGroup does not remove a publicly deployed type.
export const legacyPostBodyType = defineType({
  name: 'legacyPostBody',
  title: 'Legacy post body GraphQL compatibility',
  type: 'object',
  fields: [
    defineField({
      name: 'body',
      type: 'array',
      of: body.of.filter((member) => member.type !== 'codeGroup'),
      hidden: true,
      readOnly: true,
    }),
  ],
});
