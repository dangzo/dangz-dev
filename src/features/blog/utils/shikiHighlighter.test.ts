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
  it.each(['bash', 'sh'])('highlights %s with colored tokens in both themes', async language => {
    const result = await highlightCodeWithShiki('echo "$HOME"\nexit 0', language);

    expect(result.language).toBe('bash');
    for (const html of [result.html.light, result.html.dark]) {
      expect(html).not.toContain('shiki-fallback');
      expect(html).toMatch(/<span style="color:#[A-Fa-f0-9]+"/);
      expect(html).toContain('echo');
      expect(html).toContain('HOME');
    }
    expect(result.html.light).not.toBe(result.html.dark);
  });

  it.each([undefined, 'unknown-language'])('escapes HTML in plaintext fallback for %s', async language => {
    const result = await highlightCodeWithShiki('<script>alert("x" & \'y\')</script>\n\n  trailing  ', language);

    for (const html of [result.html.light, result.html.dark]) {
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&quot;x&quot; &amp; &#39;y&#39;');
      expect(html).not.toContain('<script>');
      expect(html).toContain('<span class="line">&nbsp;</span>');
      expect(html).toContain('  trailing  ');
    }
  });

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
