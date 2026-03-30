import clsx from 'clsx';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'small' | 'medium' | 'large' | 'x-large';
  children?: React.ReactNode;
}

const Text = ({ size = 'medium', className, children, ...rest }: TextProps) => {
  const textClasses = clsx([
    'text-secondary-light dark:text-secondary-dark font-body',
    {
      'text-sm leading-5 mb-2': size === 'small',
      'text-base leading-6 mb-4': size === 'medium',
      'text-lg leading-7.5 mb-6': size === 'large',
      'text-xl leading-8 mb-8': size === 'x-large',
    },
  ], className);

  return <p className={textClasses} {...rest}>{children}</p>;
};

export default Text;
