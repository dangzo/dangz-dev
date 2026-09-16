import { ReactNode } from 'react';
import { PortableTextBlock } from 'sanity';
import { Heading } from '@/components/ui';
import { getNodeText } from '@/features/blog/utils/posts';
import clsx from 'clsx';
import HeadingAnchor from './HeadingAnchor';

interface BlockH3Props {
  children: ReactNode;
  getHeadingId: (value: string) => string;
  value?: {
    _key?: string;
    style?: string;
  };
  blocks: PortableTextBlock[];
}

function BlockH3({ children, getHeadingId, value: block, blocks }: Readonly<BlockH3Props>) {
  const id = getHeadingId(getNodeText(children));
  const blockIndex = block?._key ? blocks.findIndex((item) => item._key === block._key) : -1;
  const previousBlock = blockIndex > 0 ? blocks[blockIndex - 1] : undefined;
  const isDirectlyBelowH2 = previousBlock?.style === 'h2';

  return (
    <Heading
      as="h3"
      id={id}
      className={clsx({
        'group': true,
        'pt-2': isDirectlyBelowH2,
      })}
    >
      {children}
      <HeadingAnchor id={id} />
    </Heading>
  );
}

export default BlockH3;
