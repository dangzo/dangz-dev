import { PortableText as SanityPortableText } from 'next-sanity';
import { PortableTextBlock } from 'sanity';
import { createHeadingIdFactory, getNodeText } from '@/utils/posts';
import { Heading, Text } from '@/components/ui';

interface PortableTextProps {
  value: PortableTextBlock[];
}

export default function PortableText({ value }: PortableTextProps) {
  const getHeadingId = createHeadingIdFactory();

  const portableTextComponents = {
    block: {
      h2: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h2" id={id} className="scroll-mt-24">{children}</Heading>;
      },
      h3: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h3" id={id} className="scroll-mt-24">{children}</Heading>;
      },
      normal: ({ children }: { children?: React.ReactNode }) => <Text>{children}</Text>,
    },
  };

  return (
    <div className="prose dark:prose-invert max-w-none font-body">
      <SanityPortableText value={value} components={portableTextComponents} />
    </div>
  );
}