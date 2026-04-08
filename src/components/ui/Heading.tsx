'use client';

import clsx from 'clsx';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

const Heading = ({ as: Tag = 'h1', children, className, ...rest }: HeadingProps) => {
  const headingClasses = clsx([
    'font-heading text-main-light dark:text-main-dark',
    {
      'text-3xl md:text-4xl lg:text-5xl font-bold mb-4': Tag === 'h1',
      'text-2xl md:text-3xl lg:text-4xl font-semibold mb-6': Tag === 'h2',
      'text-xl md:text-2xl font-semibold mb-3': Tag === 'h3',
      'text-lg md:text-xl font-semibold mb-3': Tag === 'h4',
      'text-base md:text-lg font-semibold mb-2': Tag === 'h5',
      'text-sm md:text-base font-semibold mb-1': Tag === 'h6',
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
