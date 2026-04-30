'use client';

import { useSyncExternalStore, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';

type SyntaxStyle = { [key: string]: CSSProperties };

export interface CodeBlockProps {
  value: {
    code: string
    language: string
  }
}

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', typescript);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);

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
  const { code, language } = value;
  const normalizedLanguage = language?.toLowerCase() || 'plaintext';

  useEffect(() => {
    if (theme === 'dark') {
      import('react-syntax-highlighter/dist/esm/styles/hljs/night-owl').then(
        (mod) => setStyle(mod.default)
      );
    } else {
      import('react-syntax-highlighter/dist/esm/styles/hljs/docco').then(
        (mod) => setStyle(mod.default)
      );
    }
  }, [theme]);

  return (
    <SyntaxHighlighter
      showLineNumbers={true}
      showInlineLineNumbers={true}
      language={normalizedLanguage}
      style={style}
      customStyle={{
        padding: '1em',
        marginBottom: '2em',
        border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e5e7eb',
        borderRadius: '0.5em',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;