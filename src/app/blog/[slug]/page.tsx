import { PortableText } from 'next-sanity';
import { notFound } from 'next/navigation';
import { Img, Text } from '@/components/core';
import { getPostBySlug } from '@/api/queries/posts';
import { createHeadingIdFactory, getNodeText } from '@/lib/postToc';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const getHeadingId = createHeadingIdFactory();

  const portableTextComponents = {
    block: {
      h2: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <h2 id={id} className="scroll-mt-24">{children}</h2>;
      },
      h3: ({ children }: { children?: React.ReactNode }) => {
        const id = getHeadingId(getNodeText(children));
        return <h3 id={id} className="scroll-mt-24">{children}</h3>;
      },
    },
  };

  return (
    <article className="max-w-3xl mx-auto p-4">
      <div className="mb-8 rounded-lg overflow-hidden">
        <Img
          source={post.image}
          alt={post.imageAltText}
          className="w-full h-auto object-cover"
          width={700}
          height={350}
        />
      </div>

      {/* Body Content */}
      {post.body && post.body.length > 0
        ? (
          <div className="prose dark:prose-invert max-w-none font-body">
            <PortableText value={post.body} components={portableTextComponents} />
          </div>
        )
        : (
          <Text>
          No content available for this post.
          </Text>
        )}
    </article>
  );
}
