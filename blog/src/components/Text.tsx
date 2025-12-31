import clsx from 'clsx';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Text = ({ size = 'medium', className, children, ...rest }: TextProps) => {
  const textClasses = clsx([
    'text-secondary-light dark:text-secondary-dark',
    {
      'text-sm leading-5 mb-2': size === 'small',
      'text-base leading-6 mb-4': size === 'medium',
      'text-lg leading-7.5 mb-6': size === 'large',
    },
    roboto.className,
  ], className);

  return <p className={textClasses} {...rest}>{children}</p>;
};

export default Text;
