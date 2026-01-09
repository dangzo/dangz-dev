'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';

const HeaderLogo = () => {
  const pathname = usePathname();
  const currentPage = `~${pathname}`;
  const typewriterStyle: CSSProperties = { '--chars': currentPage.length } as CSSProperties & { '--chars': number };

  return (
    <h1
      className="
        hidden sm:flex [&>span]:font-mono text-xl w-max
        text-gray-900 [text-shadow:0_0_5px_rgba(150,150,150,0.3)]
        dark:text-gray-100 dark:[text-shadow:0_0_5px_rgba(255,255,255,0.3)]
      "
      style={typewriterStyle}
    >
      <span>guest&#64;dangz.dev:&nbsp;</span>
      <span className="animate-typewriter text-primary-400" key={currentPage}>
        {currentPage}
      </span>
      <span className="animate-caret">|</span>
    </h1>
  );
};

export default HeaderLogo;
