import clsx from 'clsx';
import { Link } from '@/components/ui';
import type { LinkProps } from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

export type SidebarNavActiveMode = 'always' | 'desktop';

interface SidebarNavItemProps extends Omit<LinkProps, 'className' | 'children'> {
  children: React.ReactNode;
  isActive?: boolean;
  /** `always` shows active styles on all breakpoints; `desktop` only from md+ */
  activeMode?: SidebarNavActiveMode;
  indent?: boolean;
  className?: string;
}

const baseClasses =
  'block rounded-r-md border-l-2 py-2.5 pl-4 -ml-0.5 text-sm leading-snug transition-colors duration-200 active:bg-primary-50/70 md:py-1.5 md:pl-3 dark:active:bg-primary-950/40';

const inactiveClasses =
  'border-transparent text-secondary-light hover:border-primary-300/60 hover:text-main-light dark:text-secondary-dark dark:hover:border-primary-600/60 dark:hover:text-main-dark';

const activeAlwaysClasses =
  'border-primary-500 bg-primary-50/50 font-semibold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400';

const activeDesktopClasses =
  'border-transparent text-secondary-light dark:text-secondary-dark md:border-primary-500 md:bg-primary-50/50 md:font-semibold md:text-primary-600 md:dark:bg-primary-950/30 md:dark:text-primary-400';

function sidebarNavItemClasses({
  isActive = false,
  activeMode = 'always',
  className,
}: {
  isActive?: boolean;
  activeMode?: SidebarNavActiveMode;
  className?: string;
}) {
  return clsx(
    baseClasses,
    {
      [activeAlwaysClasses]: isActive && activeMode === 'always',
      [activeDesktopClasses]: isActive && activeMode === 'desktop',
      [inactiveClasses]: !isActive,
    },
    className,
  );
}

export default function SidebarNavItem({
  children,
  href,
  isActive = false,
  activeMode = 'always',
  indent = false,
  className,
  onClick,
  ...rest
}: SidebarNavItemProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const hrefString = typeof href === 'string' ? href : '';
  const ariaCurrent = isActive
    ? (hrefString.startsWith('#') ? 'location' : 'page')
    : undefined;

  return (
    <li
      className={clsx({
        'pl-4 md:pl-3': indent,
      })}
    >
      <Link
        href={href}
        type="secondary"
        size="small"
        aria-current={ariaCurrent}
        onClick={onClick}
        className={sidebarNavItemClasses({ isActive, activeMode, className })}
        {...rest}
      >
        {children}
      </Link>
    </li>
  );
}
