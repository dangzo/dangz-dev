'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

type SyntaxStyle = { [key: string]: CSSProperties };

export interface CodeBlockProps {
  value: {
    code: string
    language: string
  }
}

const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});

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
      language={language}
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