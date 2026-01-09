'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import Link from 'next/link';

const Prompt = () => {
  const pathname = usePathname();
  const fullPath = `~${pathname}`;
  const segments = pathname.split('/').filter(Boolean);

  const typewriterStyle: CSSProperties = {
    '--chars': segments.length === 0 ? 1 : fullPath.length
  } as CSSProperties & { '--chars': number };

  const buildHref = useCallback((index: number) => {
    if (index === -1) return '/';
    return '/' + segments.slice(0, index + 1).join('/');
  }, [segments]);

  const pathnameClasses = 'relative inline-flex text-primary-500 dark:text-primary-400 font-mono';
  const linkClasses = 'hover:underline hover:underline-offset-4 hover:text-accent-dark';

  return (
    <h1
      className="
        relative top-0.5 xl:top-0
        hidden sm:flex w-max [&>span]:font-mono font-semibold
        text-sm md:text-md mt-4 md:mt-0
        [text-shadow:0_0_5px_rgba(150,150,150,0.3)]
        dark:[text-shadow:0_0_5px_rgba(255,255,255,0.3)]
      "
    >
      <span>guest&#64;dangz.dev:&nbsp;</span>
      <span className={pathnameClasses} style={typewriterStyle} key={fullPath}>
        <span className='animate-typewriter inline-block'>
          <Link href="/" className={linkClasses}>
            ~
          </Link>
          {segments.length > 0 ? '/' : ''}
          {segments.map((segment, index) => (
            <span key={index}>
              <Link href={buildHref(index)} className={linkClasses}>
                {segment}
              </Link>
              {index < segments.length - 1 ? '/' : ''}
            </span>
          ))}
        </span>
        <span className="animate-caret ml-1 align-middle">|</span>
      </span>
    </h1>
  );
};

export default Prompt;
