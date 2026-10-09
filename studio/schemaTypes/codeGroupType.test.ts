import { describe, expect, it } from 'vitest';
import { codeGroupType, codeVariantType, validateSnippetCode, validateVariantLabel } from './codeGroupType';
import { legacyPostBodyType } from './legacyPostBodyType';
import { codeLanguageOptions } from './codeLanguageOptions';

describe('code variant authoring validation', () => {
  it.each([undefined, null, '', ' \n\t ', 123])('rejects missing or blank tab label %s', value => {
    expect(validateVariantLabel(value)).not.toBe(true);
  });

  it('accepts free-text labels', () => {
    expect(validateVariantLabel('  React with hooks  ')).toBe(true);
  });

  it.each([
    undefined,
    null,
    {},
    { code: '' },
    { code: ' \n\t ', language: 'bash' },
    { code: 'echo hi' },
    { code: 'echo hi', language: '  ' },
  ])('rejects incomplete snippets %s', value => {
    expect(validateSnippetCode(value)).not.toBe(true);
  });

  it('accepts a complete snippet without changing whitespace', () => {
    const snippet = { code: '  echo hi\n\n', language: 'bash' };
    expect(validateSnippetCode(snippet)).toBe(true);
    expect(snippet.code).toBe('  echo hi\n\n');
  });

  it('uses named GraphQL-compatible group and variant objects', () => {
    expect(codeGroupType.type).toBe('object');
    expect(codeVariantType.type).toBe('object');
    const variants = codeGroupType.fields.find(field => field.name === 'variants');
    expect(variants).toMatchObject({ type: 'array', of: [{ type: 'codeVariant' }] });
  });

  it('stores Bash while using the shell editor mode', () => {
    expect(codeLanguageOptions.languageAlternatives.find(option => option.title === 'Bash'))
      .toEqual({ title: 'Bash', value: 'bash', mode: 'sh' });
  });

  it('retains the original GraphQL body union without offering grouped authoring', () => {
    expect(legacyPostBodyType.fields[0]).toMatchObject({ hidden: true, readOnly: true });
    expect(legacyPostBodyType.fields[0].of.map(member => member.type).sort())
      .toEqual(['block', 'code', 'image', 'table']);
  });
});
