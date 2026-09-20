'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import headerNavLinks from '@/data/headerNavLinks';
import SearchButton from './SearchButton';
import ThemeSwitch from './ThemeSwitch';
import Prompt from './Prompt';

type NavigationProps = {
  onNavigate?: () => void;
  className?: string;
};

const Navigation = ({ onNavigate, className = '' }: Readonly<NavigationProps>) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className={className}>
      <ul className="flex flex-col md:flex-row gap-4">
        {headerNavLinks.map((link) => (
          <li key={link.title}>
            <Link
              className="
                group font-semibold transition-colors
                text-main-light hover:text-gray-900 dark:text-main-dark dark:hover:text-white
              "
              href={link.href}
              aria-current={(link.href === '/' ? pathname === '/' : pathname === link.href || pathname.startsWith(`${link.href}/`)) ? 'page' : undefined}
              onClick={onNavigate}
            >
              <span className="relative z-10">
                {link.title}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-500 transition-all duration-200 ease-out group-hover:w-full group-aria-[current=page]:w-full dark:bg-primary-400"/>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const ActionBtns = () => {
  return (
    <div
      className="flex items-center"
    >
      <SearchButton />
      <ThemeSwitch />
    </div>
  );
};

const HamburgerMenu = ({ isMenuOpen, toggleMenu }: {
  isMenuOpen: boolean; toggleMenu: () => void,
}) => {
  return (
    <button
      type="button"
      aria-label="Toggle navigation menu"
      aria-expanded={isMenuOpen}
      aria-controls="mobile-nav-menu"
      onClick={toggleMenu}
      className="flex h-11 w-11 items-center justify-center rounded-md text-gray-700 transition-colors hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400 md:hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        {isMenuOpen
          ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          )
          : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
      </svg>
    </button>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className="border-b border-border-light bg-transparent py-4 dark:border-border-dark sm:mb-0 sm:py-6"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <Link href="/" className="shrink-0 font-mono font-bold text-accent-light dark:text-accent-dark md:hidden">dangz.dev</Link>
        <div className="hidden min-w-0 flex-1 overflow-x-auto py-1 md:block">
          <Prompt />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-5">
          <Navigation className="hidden md:block" />

          <div className="flex items-center rounded-lg border border-border-light px-1 dark:border-border-dark">
            <ActionBtns />
            <HamburgerMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
      </div>

      <div
        id="mobile-nav-menu"
        inert={!isMenuOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closeMenu();
            document.querySelector<HTMLButtonElement>('[aria-controls="mobile-nav-menu"]')?.focus();
          }
        }}
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${isMenuOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}
      >
        <Navigation
          onNavigate={closeMenu}
          className="border border-dashed rounded-md p-4 dark:border-border-dark border-border-light"
        />
      </div>
    </header>
  );
};

export default Header;
