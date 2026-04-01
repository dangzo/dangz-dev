import clsx from 'clsx';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
  children?: React.ReactNode;
}

const Text = ({ size = 'medium', className, children, ...rest }: TextProps) => {
  const textClasses = clsx([
    'text-secondary-light dark:text-secondary-dark font-body',
    {
      'text-xs md:text-xs leading-4 md:leading-4 mb-1': size === 'x-small',
      'text-sm md:text-sm leading-5 md:leading-5 mb-2': size === 'small',
      'text-sm md:text-base leading-6 md:leading-6 mb-3 md:mb-4': size === 'medium',
      'text-base md:text-lg leading-6 md:leading-7.5 mb-4 md:mb-6': size === 'large',
      'text-lg md:text-xl lg:text-2xl leading-7 md:leading-8 mb-5 md:mb-8': size === 'x-large',
    },
  ], className);

  return <p className={textClasses} {...rest}>{children}</p>;
};

export default Text;
