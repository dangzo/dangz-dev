'use client';

import { useSyncExternalStore, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import nginx from 'react-syntax-highlighter/dist/esm/languages/prism/nginx';

type SyntaxStyle = { [key: string]: CSSProperties };

export interface CodeBlockProps {
  value: {
    code: string
    language: string
  }
}

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('xml', markup);
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('docker', docker);
SyntaxHighlighter.registerLanguage('nginx', nginx);

const languageAliases: Record<string, string> = {
  vue2: 'vue',
  vue3: 'vue',
  'vue-sfc': 'vue',
  sfc: 'vue',
};

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';
const getServerSnapshot = () => 'light';

const CodeBlock = ({ value }: CodeBlockProps) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [style, setStyle] = useState<SyntaxStyle | undefined>(undefined);
  const [isCopied, setIsCopied] = useState(false);
  const { code, language } = value;
  const rawLanguage = language?.toLowerCase() || 'plaintext';
  const normalizedLanguage = languageAliases[rawLanguage] || rawLanguage;
  const highlighterLanguage = normalizedLanguage === 'vue' ? 'markup' : normalizedLanguage;

  useEffect(() => {
    if (theme === 'dark') {
      import('react-syntax-highlighter/dist/esm/styles/prism/coldark-dark').then(
        (mod) => setStyle(mod.default)
      );
    } else {
      import('react-syntax-highlighter/dist/esm/styles/prism/one-light').then(
        (mod) => setStyle(mod.default)
      );
    }
  }, [theme]);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsCopied(false);
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const isDark = theme === 'dark';
  const buttonClasses = `
    absolute right-8 top-[2.6em] z-20
    rounded-[0.35em] border px-[0.55em] py-[0.35em] text-[0.72em]
    leading-none opacity-0 pointer-events-none
    cursor-pointer
    transition-opacity duration-200
    group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto
    ${isDark ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-300 bg-white text-gray-600'}
  `;

  return (
    <div className={`group relative mb-8 rounded-lg border p-4 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className={buttonClasses}
      >
        {isCopied ? 'Copied' : 'Copy'}
      </button>
      {normalizedLanguage && normalizedLanguage !== 'plaintext' && (
        <span
          className={`absolute right-[1.3em] top-[0.1em] z-10 select-none text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {normalizedLanguage}
        </span>
      )}
      <SyntaxHighlighter
        showLineNumbers={true}
        showInlineLineNumbers={true}
        language={highlighterLanguage}
        style={style}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;