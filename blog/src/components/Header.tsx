import headerNavLinks from '@/data/headerNavLinks';
import { Link } from '@/components/ui';
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
              className="hover:text-primary-500 dark:hover:text-primary-400 m-1 font-medium text-gray-900 dark:text-gray-100"
              href={link.href}
            >
              {link.title}
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
