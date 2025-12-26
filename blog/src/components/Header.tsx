import headerNavLinks from '@/data/headerNavLinks';
import Link from 'next/link'
import ThemeSwitch from './ThemeSwitch';

const Logo = () => {
  return (
    <div>
      <a href="/">Dangz.dev</a>
    </div>
  );
}

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
}

const ActionBtns = () => {
  return (
    <div className="flex flex-row gap-4">
      <button>Seach</button>
      <ThemeSwitch />
    </div>
  );
}

export const Header = () => {
  return (
    <header className="border border-e-red-400 flex items-center bg-transparent backdrop-blur-sm justify-between py-8">
      <Logo />
      <div className="flex flex-row items-center gap-6">
        <Navigation />
        <ActionBtns />
      </div>
    </header>
  );
}
