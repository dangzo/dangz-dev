 'use client';

import { useState } from 'react';
import Link from 'next/link';
import headerNavLinks from '@/data/headerNavLinks';
import SearchButton from './SearchButton';
import ThemeSwitch from './ThemeSwitch';
import Prompt from './Prompt';

type NavigationProps = {
  onNavigate?: () => void;
  className?: string;
};

const Navigation = ({ onNavigate, className = '' }: NavigationProps) => {
  return (
    <nav className={className}>
      <ul className="flex flex-col md:flex-row gap-4">
        {headerNavLinks.map((link) => (
          <li key={link.title}>
            <Link
              className="
                group font-semibold transition-colors
                text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50
              "
              href={link.href}
              onClick={onNavigate}
            >
              <span className="relative z-10">
                {link.title}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-500 transition-all duration-200 ease-out group-hover:w-full dark:bg-primary-400"/>
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
      className="flex flex-row gap-2 md:gap-4 border border-dashed px-2 py-1.5 md:px-4 md:py-2 rounded-md dark:border-border-dark border-border-light"
    >
      <SearchButton />
      <ThemeSwitch />
    </div>
  );
};

const HamburgerMenu = ({ isMenuOpen, toggleMenu }: { isMenuOpen: boolean; toggleMenu: () => void }) => {
  return (
    <button
      type="button"
      aria-label="Toggle navigation menu"
      aria-expanded={isMenuOpen}
      aria-controls="mobile-nav-menu"
      onClick={toggleMenu}
      className="md:hidden rounded-md border border-dashed px-3 py-2 dark:border-border-dark border-border-light text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
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
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className="bg-transparent backdrop-blur-sm py-4 mb-4 sm:mb-0 sm:py-8"
    >
      <div className="flex w-full flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-4">
        <Prompt />

        <div className="flex w-full md:w-auto justify-between items-center gap-3">
          <div className="hidden md:block">
            <Navigation />
          </div>

          <ActionBtns />

          <HamburgerMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
      </div>

      <div
        id="mobile-nav-menu"
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