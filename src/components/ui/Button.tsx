import clsx from 'clsx';
import NextLink from 'next/link';
import React from 'react';

export type ButtonType = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  type?: ButtonType;
  size?: ButtonSize;
  to?: string;
  download?: boolean | string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  children: React.ReactNode;
}

const Button = ({
  type = 'primary',
  size = 'medium',
  to,
  onClick,
  download,
  target,
  rel,
  children,
  className,
  ...rest
}: ButtonProps) => {
  const classNames = clsx([
    'cursor-pointer inline-block text-center transition-all duration-300 font-semibold',
    
    // Size styles
    { 'px-4 py-2 text-xs': size === 'small' },
    { 'px-6 py-2.5 text-sm': size === 'medium' },
    { 'px-8 py-3 text-md': size === 'large' },
    
    // Type styles
    {
      'rounded-lg border-2 border-gray-400 text-gray-500 hover:text-main-light hover:border-main-light dark:border-gray-400 dark:hover:border-primary-400 dark:hover:text-primary-400':
        type === 'ghost'
    },
    {
      'bg-primary-600 text-white rounded-lg hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-400/50':
        type === 'primary'
    },
    {
      'text-white rounded-md bg-gray-800/80 hover:bg-background-secondary-dark dark:text-main-dark dark:bg-slate-800/80 dark:hover:bg-slate-600/60':
        type === 'secondary'
    },
    className,
  ]);

  const isInternalRoute = Boolean(to?.startsWith('/')) && !download;

  if (to && isInternalRoute) {
    return (
      <NextLink className={classNames} href={to} {...rest}>
        {children}
      </NextLink>
    );
  }

  if (to) {
    const resolvedRel = rel ?? (target === '_blank' || !isInternalRoute ? 'noopener noreferrer' : undefined);

    return (
      <NextLink
        className={classNames}
        href={to}
        download={download}
        target={target ?? (!isInternalRoute ? '_blank' : undefined)}
        rel={resolvedRel}
        {...rest}
      >
        {children}
      </NextLink>
    );
  }

  return (
    <button
      className={classNames}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
