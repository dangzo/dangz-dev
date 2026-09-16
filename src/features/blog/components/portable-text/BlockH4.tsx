import { ReactNode } from 'react';
import { Heading } from '@/components/ui';
import { getNodeText } from '@/features/blog/utils/posts';
import HeadingAnchor from './HeadingAnchor';

interface BlockH4Props {
  children: ReactNode;
  getHeadingId: (value: string) => string;
}

function BlockH4({ children, getHeadingId }: BlockH4Props) {
  const id = getHeadingId(getNodeText(children));

  return (
    <Heading as="h4" id={id} className="group">
      {children}
      <HeadingAnchor id={id} />
    </Heading>
  );
}

export default BlockH4;
