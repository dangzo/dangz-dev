'use client';

import { useSyncExternalStore } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl, docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface CodeBlockProps {
  value: {
    code: string
    language: string
  }
}

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';
const getServerSnapshot = () => 'light';

const CodeBlock = ({ value }: CodeBlockProps) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { code, language } = value;
  return (
    <SyntaxHighlighter
      showLineNumbers={true}
      showInlineLineNumbers={true}
      language={language}
      style={theme === 'dark' ? nightOwl :docco}
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