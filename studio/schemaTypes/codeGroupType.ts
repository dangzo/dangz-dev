import { defineArrayMember, defineField, defineType } from 'sanity';
import { codeLanguageOptions } from './codeLanguageOptions';

export function validateVariantLabel(value: unknown): true | string {
  return typeof value === 'string' && value.trim().length > 0
    ? true
    : 'Enter a meaningful tab label.';
}

export function validateSnippetCode(value: unknown): true | string {
  if (typeof value !== 'object' || value === null || !('code' in value)) {
    return 'Enter code for this variant.';
  }

  if (typeof value.code !== 'string' || !value.code.trim()) {
    return 'Enter code for this variant.';
  }

  if (!('language' in value) || typeof value.language !== 'string' || !value.language.trim()) {
    return 'Choose a syntax language.';
  }

  return true;
}

export const codeVariantType = defineType({
  name: 'codeVariant',
  title: 'Code variant',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Tab label',
      type: 'string',
      description: 'A reader-facing label, such as React. Choose highlighting separately below.',
      validation: (rule) => rule.required().custom(validateVariantLabel),
    }),
    defineField({
      name: 'snippet',
      title: 'Code and syntax language',
      type: 'code',
      options: codeLanguageOptions,
      validation: (rule) => rule.required().custom(validateSnippetCode),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'snippet.language' },
  },
});

export const codeGroupType = defineType({
  name: 'codeGroup',
  title: 'Code variants',
  type: 'object',
  fields: [
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [defineArrayMember({ type: 'codeVariant' })],
      description: 'Write each implementation and drag to reorder. The first variant is selected initially.',
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { firstLabel: 'variants.0.label' },
    prepare({ firstLabel }) {
      return { title: 'Code variants', subtitle: firstLabel || 'Add a variant' };
    },
  },
});
