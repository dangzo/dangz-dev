import { PortableText as SanityPortableText } from 'next-sanity';
import { PortableTextBlock } from 'sanity';
import { createHeadingIdFactory, getNodeText } from '@/utils/posts';
import { Heading, Text, Img, type ImgProps } from '@/components/ui';
import CodeBlock, { type CodeBlockProps } from '../ui/CodeBlock';

interface PortableTextProps {
  value: PortableTextBlock[];
}

export default function PortableText({ value }: PortableTextProps) {
  const getHeadingId = createHeadingIdFactory();

  const portableTextComponents = {
    block: {
      h2: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h2" id={id}>{children}</Heading>;
      },

      h3: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h3" id={id}>{children}</Heading>;
      },

      normal: ({ children }: { children?: React.ReactNode }) => <Text>{children}</Text>,
    },
    types: {
      image: ({ value }: { value: ImgProps }) => {
        if (!value) {
          return null;
        }

        return (
          <Img
            source={value}
            alt={value.alt || ' '}
            width={value.width || 500}
            height={value.height || 500}
          />
        );
      },

      code: ({ value }: { value: CodeBlockProps['value'] }) => {
        return <CodeBlock value={value} />;
      },
    },
  };

  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none font-body wrap-break-words">
      <SanityPortableText value={value} components={portableTextComponents} />
    </div>
  );
}