import { ReactNode } from 'react';
import { Heading } from '@/components/ui';
import { getNodeText } from '@/features/blog/utils/posts';

interface BlockH4Props {
  children: ReactNode;
  getHeadingId: (value: string) => string;
}

function BlockH4({ children, getHeadingId }: BlockH4Props) {
  const id = getHeadingId(getNodeText(children));

  return <Heading as="h4" id={id}>{children}</Heading>;
}

export default BlockH4;
