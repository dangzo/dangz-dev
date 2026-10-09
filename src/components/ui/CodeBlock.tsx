'use client';

import TabbedCodeBlock from './TabbedCodeBlock';

export interface CodeBlockProps {
  value: {
    code: string;
    language: string;
    highlightedHtml: {
      light: string;
      dark: string;
    };
  };
}

export default function CodeBlock({ value }: Readonly<CodeBlockProps>) {
  return (
    <TabbedCodeBlock variants={[{ key: 'snippet', label: value.language || 'plaintext', value }]} />
  );
}
