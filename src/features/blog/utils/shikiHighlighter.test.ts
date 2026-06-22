import { highlightCodeWithShiki, normalizeCodeLanguage } from './shikiHighlighter';

describe('normalizeCodeLanguage', () => {
  it.each([
    { input: 'JS', expected: 'javascript' },
    { input: 'ts', expected: 'typescript' },
    { input: 'sh', expected: 'bash' },
    { input: 'Vue3', expected: 'vue' },
    { input: 'vue-sfc', expected: 'vue' },
    { input: '', expected: 'plaintext' },
    { input: undefined, expected: 'plaintext' },
  ])('normalizes $input to $expected', ({ input, expected }) => {
    expect(normalizeCodeLanguage(input)).toBe(expected);
  });
});

describe('highlightCodeWithShiki', () => {
  it('returns highlighted html for supported languages', async () => {
    const result = await highlightCodeWithShiki('const x = 1;', 'typescript');

    expect(result.language).toBe('typescript');
    expect(result.html.light).toContain('<pre class="shiki');
    expect(result.html.dark).toContain('<pre class="shiki');
  });

  it('falls back to plaintext html for unknown languages', async () => {
    const result = await highlightCodeWithShiki('<tag/>', 'unknown-language');

    expect(result.language).toBe('plaintext');
    expect(result.html.light).toContain('shiki-fallback');
    expect(result.html.light).toContain('&lt;tag/&gt;');
    expect(result.html.dark).toContain('shiki-fallback');
  });
});