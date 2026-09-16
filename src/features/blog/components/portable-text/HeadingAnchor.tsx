'use client';

import { useEffect, useState } from 'react';

interface HeadingAnchorProps {
  id: string;
}

function HeadingAnchor({ id }: Readonly<HeadingAnchorProps>) {
  const [isCopied, setIsCopied] = useState(false);

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
    const url = new URL(window.location.href);
    url.hash = id;

    try {
      await navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const label = isCopied ? 'Link copied' : 'Copy link to this section';

  const classNameS = `
    ml-2 inline-flex size-6 translate-y-0.5 items-center justify-center rounded
    opacity-0 pointer-events-none transition-opacity cursor-pointer z-index-10 position-relative
    text-secondary-light hover:text-primary-600
    focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500
    group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto
    [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto dark:text-secondary-dark dark:hover:text-primary-400
  `;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleCopy}
      className={classNameS}
    >
      {isCopied
        ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
            <path d="m5 12 4 4L19 6" />
          </svg>
        )
        : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
            <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
            <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
          </svg>
        )}
    </button>
  );
}

export default HeadingAnchor;
