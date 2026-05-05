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
      import('react-syntax-highlighter/dist/esm/styles/prism/night-owl').then(
        (mod) => setStyle(mod.default)
      );
    } else {
      import('react-syntax-highlighter/dist/esm/styles/prism/one-light').then(
        (mod) => setStyle(mod.default)
      );
    }
  }, [theme]);

  return (
    <div style={{
      padding: '1em',
      marginBottom: '2em',
      border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e5e7eb',
      borderRadius: '0.5em',
    }}>
      <SyntaxHighlighter
        showLineNumbers={true}
        showInlineLineNumbers={true}
        language={normalizedLanguage}
        style={style}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;