import { ReactNode } from 'react';
import { Heading } from '@/components/ui';
import { getNodeText } from '@/features/blog/utils/posts';
import HeadingAnchor from './HeadingAnchor';

interface BlockH2Props {
  children: ReactNode;
  postId: string;
  getHeadingId: (value: string) => string;
}

function BlockH2({ children, postId, getHeadingId }: Readonly<BlockH2Props>) {
  const id = getHeadingId(getNodeText(children));

  return (
    <Heading
      as="h2"
      id={id}
      className="group border-t border-border-light dark:border-border-dark pt-8 mt-12!"
    >
      {children}
      <HeadingAnchor id={id} postId={postId} />
    </Heading>
  );
}

export default BlockH2;
