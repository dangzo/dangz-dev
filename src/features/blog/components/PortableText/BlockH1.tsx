import { ReactNode } from 'react';
import { Heading } from '@/components/ui';
import { getNodeText } from '@/features/blog/utils/posts';

interface BlockH1Props {
  children: ReactNode;
  getHeadingId: (value: string) => string;
}

function BlockH1({ children, getHeadingId }: BlockH1Props) {
  const id = getHeadingId(getNodeText(children));

  return <Heading as="h1" id={id}>{children}</Heading>;
}

export default BlockH1;