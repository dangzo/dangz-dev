'use client';

import { useCallback, type ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export type ButtonType = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> {
  type?: ButtonType;
  size?: ButtonSize;
  to?: string;
  onClick?: () => void;
  children: ReactNode;
}

const Button = ({ type = 'primary', size = 'medium', to, onClick, children }: ButtonProps) => {
  const router = useRouter();

  const classNames = clsx([
    'cursor-pointer inline-block text-center transition-all duration-300 font-semibold',
    // Size styles
    { 'px-4 py-2 text-xs': size === 'small' },
    { 'px-6 py-2.5 text-sm': size === 'medium' },
    { 'px-8 py-3 text-md': size === 'large' },
    // Type styles
    {
      'rounded-lg border-2 border-slate-500 text-slate-300 hover:border-primary-400 hover:text-primary-400':
        type === 'ghost'
    },
    {
      'bg-linear-to-r from-primary-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/50':
        type === 'primary'
    },
    {
      'bg-linear-to-r from-primary-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/50':
        type === 'secondary'
    },
  ]);

  const handleOnClick = useCallback(() => {
    if (to) {
      router.push(to);
    }
    if (onClick) {
      onClick();
    }
  }, [to, onClick, router]);

  return (
    <button
      className={classNames}
      onClick={handleOnClick}
    >
      {children}
    </button>
  );
}

export default Button;
