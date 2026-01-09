'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

const HeaderLogo = () => {
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

  const pathnameClasses = clsx([
    'animate-typewriter inline-block',
    'text-primary-500 dark:text-primary-400 font-mono!',
  ]);
  const linkClasses = clsx([
    'hover:underline hover:underline-offset-4',
  ]);

  return (
    <h1
      className="
        hidden sm:flex text-lg w-max [&>span]:font-mono
        text-gray-900 [text-shadow:0_0_5px_rgba(150,150,150,0.3)]
        dark:text-gray-100 dark:[text-shadow:0_0_5px_rgba(255,255,255,0.3)]
      "
    >
      <span>guest&#64;dangz.dev:&nbsp;</span>
      <span className="relative inline-block" style={typewriterStyle} key={fullPath}>
        <span className={pathnameClasses}>
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
        <span className="animate-caret absolute top-0">|</span>
      </span>
    </h1>
  );
};

export default HeaderLogo;
