import headerNavLinks from '@/data/headerNavLinks';
import Link from 'next/link';
import { SearchButton, ThemeSwitch } from '@/components';

const Logo = () => {
  return (
    <Link href="/">Dangz.dev</Link>
  );
};

const Navigation = () => {
  return (
    <nav>
      <ul className="flex flex-row gap-4">
        {headerNavLinks.map((link) => (
          <li key={link.title}>
            <Link
              className="
                group font-semibold transition-colors
                text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50
              "
              href={link.href}
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
      className="flex flex-row gap-4 border border-dashed px-4 py-2 rounded-md dark:border-border-dark border-border-light"
    >
      <SearchButton />
      <ThemeSwitch />
    </div>
  );
};

export const Header = () => {
  return (
    <header className="flex items-center bg-transparent backdrop-blur-sm justify-between py-8">
      <Logo />
      <div className="flex flex-row items-center gap-10">
        <Navigation />
        <ActionBtns />
      </div>
    </header>
  );
};
