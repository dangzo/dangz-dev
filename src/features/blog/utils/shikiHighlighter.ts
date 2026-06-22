import { codeToHtml } from 'shiki';

const languageAliases: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  vue2: 'vue',
  vue3: 'vue',
  'vue-sfc': 'vue',
  sfc: 'vue',
};

const plaintextFallback = 'plaintext';

export interface HighlightedCodeHtml {
  light: string;
  dark: string;
}

export interface HighlightCodeResult {
  language: string;
  html: HighlightedCodeHtml;
}

export function normalizeCodeLanguage(language?: string): string {
  const rawLanguage = language?.toLowerCase().trim() || plaintextFallback;
  return languageAliases[rawLanguage] || rawLanguage;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildFallbackHtml(code: string, isDark: boolean): string {
  const escapedCode = escapeHtml(code);
  const lines = escapedCode.split('\n');
  const renderedLines = lines.map(line => {
    return `<span class="line">${line || '&nbsp;'}</span>`;
  }).join('\n');

  const styles = isDark
    ? 'background-color:#0f172a;color:#e2e8f0'
    : 'background-color:#f8fafc;color:#1e293b';

  return `<pre class="shiki shiki-fallback" style="${styles}" tabindex="0"><code>${renderedLines}</code></pre>`;
}

export async function highlightCodeWithShiki(code: string, language?: string): Promise<HighlightCodeResult> {
  const normalizedLanguage = normalizeCodeLanguage(language);

  if (normalizedLanguage === plaintextFallback) {
    return {
      language: normalizedLanguage,
      html: {
        light: buildFallbackHtml(code, false),
        dark: buildFallbackHtml(code, true),
      },
    };
  }

  try {
    const [light, dark] = await Promise.all([
      codeToHtml(code, {
        lang: normalizedLanguage,
        theme: 'night-owl-light',
      }),
      codeToHtml(code, {
        lang: normalizedLanguage,
        theme: 'night-owl',
      }),
    ]);

    return {
      language: normalizedLanguage,
      html: {
        light,
        dark,
      },
    };
  } catch {
    return {
      language: plaintextFallback,
      html: {
        light: buildFallbackHtml(code, false),
        dark: buildFallbackHtml(code, true),
      },
    };
  }
}