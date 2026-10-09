'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { CodeBlockProps } from './CodeBlock';
import CodeSnippet from './CodeSnippet';

export type CodeBlockVariant = Readonly<{
  key: string;
  label: string;
  value: CodeBlockProps['value'];
}>;

export default function TabbedCodeBlock({ variants }: Readonly<{
  variants: readonly CodeBlockVariant[];
}>) {
  const id = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = activeIndex < variants.length ? activeIndex : 0;

  if (!variants.length) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;

    switch (event.key) {
    case 'ArrowRight':
      nextIndex = (index + 1) % variants.length;
      break;
    case 'ArrowLeft':
      nextIndex = (index - 1 + variants.length) % variants.length;
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = variants.length - 1;
      break;
    default:
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    tabs.current[nextIndex]?.focus();
    tabs.current[nextIndex]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  return (
    <div className="not-prose mb-8 min-w-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800" data-code-group="">
      <div role="tablist" aria-label="Code variants" className="flex max-w-full overflow-x-auto border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        {variants.map((variant, index) => (
          <button
            key={variant.key}
            ref={(element) => { tabs.current[index] = element; }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={selectedIndex === index}
            tabIndex={selectedIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`shrink-0 cursor-pointer border-b-2 px-3 py-1.5 text-xs leading-4 font-medium transition-colors first:ml-auto focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 ${selectedIndex === index ? 'border-primary-500 text-gray-900 dark:text-gray-100' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}
          >
            {variants.length === 1 ? variant.value.language || 'plaintext' : variant.label}
          </button>
        ))}
      </div>
      {variants.map((variant, index) => (
        <div
          key={variant.key}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selectedIndex !== index}
          tabIndex={0}
          className="min-w-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
        >
          {selectedIndex === index && <CodeSnippet key={variant.key} value={variant.value} />}
        </div>
      ))}
    </div>
  );
}
