import { ReactNode } from 'react';
import { Heading } from '@/components/ui';
import { getNodeText } from '@/features/blog/utils/posts';

interface BlockH2Props {
  children: ReactNode;
  getHeadingId: (value: string) => string;
}

function BlockH2({ children, getHeadingId }: BlockH2Props) {
  const id = getHeadingId(getNodeText(children));

  return (
    <Heading
      as="h2"
      id={id}
      className="border-t border-border-light dark:border-border-dark pt-8 mt-12!"
    >
      {children}
    </Heading>
  );
}

export default BlockH2;
