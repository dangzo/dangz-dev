import clsx from "clsx";

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
      'text-xl leading-7.5 mb-6': size === 'large',
    },
  ], className);

  return <p className={textClasses} {...rest}>{children}</p>;
};

export default Text;
