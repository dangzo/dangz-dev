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
      h1: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h1" id={id}>{children}</Heading>;
      },

      h2: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h2" id={id}>{children}</Heading>;
      },

      h3: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h3" id={id}>{children}</Heading>;
      },

      h4: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <Heading as="h4" id={id}>{children}</Heading>;
      },

      normal: ({ children }: { children?: React.ReactNode }) => <Text>{children}</Text>,
    },

    list: {
      bullet: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-disc ml-4 sm:mt-6! sm:mb-10!">{children}</ul>
      ),
      number: ({ children }: { children?: React.ReactNode }) => (
        <ol className="list-decimal ml-4 sm:mt-6! sm:mb-10!">{children}</ol>
      ),
    },

    listItem: {
      bullet: ({ children }: { children?: React.ReactNode }) => (
        <li className="mb-1 sm:mb-2"><Text>{children}</Text></li>
      ),
      number: ({ children }: { children?: React.ReactNode }) => (
        <li className="mb-1 sm:mb-2"><Text>{children}</Text></li>
      ),
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
            className="mx-auto my-6 rounded-md object-cover"
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