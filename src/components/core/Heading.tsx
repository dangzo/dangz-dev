import clsx from 'clsx';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

const Heading = async ({ as: Tag = 'h1', children, className, ...rest }: HeadingProps) => {
  const headingClasses = clsx([
    'font-heading',
    {
      'text-5xl font-bold mb-4': Tag === 'h1',
      'text-4xl font-semibold mb-6': Tag === 'h2',
      'text-3xl font-semibold mb-4': Tag === 'h3',
      'text-2xl font-semibold mb-3': Tag === 'h4',
      'text-xl font-semibold mb-2': Tag === 'h5',
      'text-md font-semibold mb-1': Tag === 'h6',
    },
    className,
  ]);

  return (
    <Tag className={headingClasses} {...rest}>
      {children}
    </Tag>
  );
};

export default Heading;
