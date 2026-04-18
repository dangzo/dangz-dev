import type { ComponentProps } from 'react';
import { PortableText as SanityPortableText } from 'next-sanity';
import { PortableTextBlock } from 'sanity';
import { createHeadingIdFactory, getNodeText } from '@/features/blog/utils/posts';
import { Heading, Text, Img, type ImgProps } from '@/components/ui';
import CodeBlock, { type CodeBlockProps } from '@/components/ui/CodeBlock';

interface PortableTextProps {
  value: PortableTextBlock[];
}

type PortableTextComponents = NonNullable<ComponentProps<typeof SanityPortableText>['components']>;

export default function PortableText({ value }: PortableTextProps) {
  const blocks = value;
  const getHeadingId = createHeadingIdFactory();

  const portableTextComponents: PortableTextComponents = {
    block: {
      h1: ({ children }) => {
        const id = getHeadingId(getNodeText(children));
        return (
          <Heading as="h1" id={id}>{children}</Heading>
        );
      },

      h2: ({ children }) => {
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
      },

      h3: ({ children, value: block }) => {
        const id = getHeadingId(getNodeText(children));
        const blockIndex = block?._key ? blocks.findIndex((item) => item._key === block._key) : -1;
        const previousBlock = blockIndex > 0 ? blocks[blockIndex - 1] : undefined;
        const isDirectlyBelowH2 = previousBlock?.style === 'h2';

        return (
          <Heading
            as="h3"
            id={id}
            className={isDirectlyBelowH2 ? 'pt-2' : 'border-t border-border-light dark:border-border-dark pt-6'}
          >
            {children}
          </Heading>
        );
      },

      h4: ({ children }) => {
        const id = getHeadingId(getNodeText(children));
        return (
          <Heading
            as="h4"
            id={id}
          >
            {children}
          </Heading>
        );
      },

      normal: ({ children }) => <Text>{children}</Text>,
    },

    list: {
      bullet: ({ children }) => (
        <ul className="list-disc ml-4 sm:mt-6! sm:mb-10!">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal ml-4 sm:mt-6! sm:mb-10!">{children}</ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => (
        <li><Text className="mt-0! mb-2! sm:mb-4!">{children}</Text></li>
      ),
      number: ({ children }) => (
        <li><Text className="mt-0! mb-2! sm:mb-4!">{children}</Text></li>
      ),
    },

    marks: {
      inlineCode: ({ children }) => (
        <code
          className="
            rounded px-1 py-0.5 text-[0.8em]!
            bg-accent-light/10 dark:bg-neutral-100/10
          "
        >
          {children}
        </code>
      ),
    },

    types: {
      image: ({ value }) => {
        const imageValue = value as ImgProps['source'] & {
          alt?: string;
          width?: number;
          height?: number;
        };

        if (!imageValue) {
          return null;
        }

        return (
          <Img
            source={imageValue}
            alt={imageValue.alt || ' '}
            width={imageValue.width || 500}
            height={imageValue.height || 500}
            className="mx-auto my-6 rounded-md object-cover"
          />
        );
      },

      code: ({ value }) => {
        return <CodeBlock value={value as CodeBlockProps['value']} />;
      },
    },
  };

  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none font-body wrap-break-words">
      <SanityPortableText value={value} components={portableTextComponents} />
    </div>
  );
}