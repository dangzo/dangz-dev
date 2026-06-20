'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import styles from './Prompt.module.css';
import Link from 'next/link';

const Prompt = () => {
  const pathname = usePathname();
  const fullPath = `~${pathname}`;
  const segments = pathname.split('/').filter(Boolean);
  const charCount = segments.length === 0 ? 1 : fullPath.length;
  const caretDelaySeconds = Math.min(charCount * 0.02, 0.8);

  const typewriterStyle: CSSProperties = {
    '--chars': charCount,
    '--caret-delay': `${caretDelaySeconds}s`
  } as CSSProperties & { '--chars': number; '--caret-delay': string };

  const buildHref = useCallback((index: number) => {
    if (index === -1) {
      return '/';
    }

    return '/' + segments.slice(0, index + 1).join('/');
  }, [segments]);

  const pathnameClasses = 'relative inline-flex text-primary-500 dark:text-primary-400 font-mono';
  const linkClasses = 'hover:underline hover:underline-offset-4 hover:text-accent-dark';

  return (
    <p
      className="
        hidden mb:block
        relative top-0
        sm:flex w-max [&>span]:font-mono font-semibold
        text-sm md:text-md mt-0
        [text-shadow:0_0_5px_rgba(150,150,150,0.3)]
        dark:[text-shadow:0_0_5px_rgba(255,255,255,0.3)]
      "
    >
      <span className="hidden sm:inline-block">guest&#64;dangz.dev:&nbsp;</span>
      <span className={pathnameClasses} style={typewriterStyle} key={fullPath}>
        <span className={`inline-block ${styles['animate-typewriter']}`}>
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
        <span className={`ml-1 align-middle ${styles['animate-caret']}`}>|</span>
      </span>
    </p>
  );
};

export default Prompt;
