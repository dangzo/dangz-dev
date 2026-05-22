import type { ComponentProps } from 'react';
import { PortableText as SanityPortableText } from 'next-sanity';
import { PortableTextBlock } from 'sanity';
import { createHeadingIdFactory } from '@/features/blog/utils/posts';
import {
  BlockH1,
  BlockH2,
  BlockH3,
  BlockH4,
  BlockNormal,
  ListBullet,
  ListNumber,
  ListItemBullet,
  ListItemNumber,
  MarkInlineCode,
  MarkLink,
  TypeImage,
  TypeCode,
  TypeTable,  
} from '@/features/blog/components/portable-text';

interface PortableTextProps {
  value: PortableTextBlock[];
}

type PortableTextComponents = NonNullable<ComponentProps<typeof SanityPortableText>['components']>;

export default async function PortableText({ value }: PortableTextProps) {
  const blocks = value;
  const getHeadingId = createHeadingIdFactory();

  const portableTextComponents: PortableTextComponents = {
    block: {
      h1: ({ children }) => <BlockH1 getHeadingId={getHeadingId}>{children}</BlockH1>,
      h2: ({ children }) => <BlockH2 getHeadingId={getHeadingId}>{children}</BlockH2>,
      h3: ({ children, value: block }) => <BlockH3 getHeadingId={getHeadingId} value={block} blocks={blocks}>{children}</BlockH3>,
      h4: ({ children }) => <BlockH4 getHeadingId={getHeadingId}>{children}</BlockH4>,
      normal: ({ children }) => <BlockNormal>{children}</BlockNormal>,
    },

    list: {
      bullet: ({ children }) => <ListBullet>{children}</ListBullet>,
      number: ({ children }) => <ListNumber>{children}</ListNumber>,
    },

    listItem: {
      bullet: ({ children }) => <ListItemBullet>{children}</ListItemBullet>,
      number: ({ children }) => <ListItemNumber>{children}</ListItemNumber>,
    },

    marks: {
      link: ({ children, value }) => <MarkLink value={value}>{children}</MarkLink>,
      inlineCode: ({ children }) => <MarkInlineCode>{children}</MarkInlineCode>,
    },

    types: {
      image: ({ value }) => <TypeImage value={value as Parameters<typeof TypeImage>[0]['value']} />,
      code: ({ value }) => <TypeCode value={value as Parameters<typeof TypeCode>[0]['value']} />,
      table: ({ value }) => <TypeTable value={value as Parameters<typeof TypeTable>[0]['value']} />,
    },
  };

  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none font-body wrap-break-words">
      <SanityPortableText value={value} components={portableTextComponents} />
    </div>
  );
}