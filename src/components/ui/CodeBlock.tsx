'use client';

import { useSyncExternalStore, useState, useEffect } from 'react';

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

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';
const getServerSnapshot = () => 'light';

const CodeBlock = ({ value }: CodeBlockProps) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCopied, setIsCopied] = useState(false);
  const { code, language, highlightedHtml } = value;
  const htmlContent = theme === 'dark' ? highlightedHtml.dark : highlightedHtml.light;

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
      {language && language !== 'plaintext' && (
        <span
          className={`absolute right-[1.3em] top-[0.1em] z-10 select-none text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {language}
        </span>
      )}
      <div
        data-testid="syntax-highlighter"
        className="code-block-shiki"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      <style jsx global>{`
          .code-block-shiki .shiki {
            margin: 0;
            overflow-x: auto;
            border-radius: 0.5rem;
            padding: 1rem;
            font-size: 0.9rem;
            line-height: 1.65;
          }

          .code-block-shiki .shiki code {
            counter-reset: line;
            display: block;
            white-space: normal;
          }

          .code-block-shiki .shiki code .line {
            display: block;
            min-height: 1.5em;
            padding-left: 3rem;
            position: relative;
            white-space: pre;
          }

          .code-block-shiki .shiki code .line::before {
            color: rgb(148 163 184 / 0.85);
            content: counter(line);
            counter-increment: line;
            font-size: 0.78em;
            left: 0;
            position: absolute;
            text-align: right;
            width: 2.1rem;
          }
        `}</style>
    </div>
  );
};

export default CodeBlock;