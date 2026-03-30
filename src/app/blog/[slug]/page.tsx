import { notFound } from 'next/navigation';
import { Img, Text } from '@/components/ui';
import { PortableText } from '@/components/posts';
import { getPostBySlug } from '@/api/queries/posts';

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
        ? <PortableText value={post.body} />
        : <Text>No content available for this post.</Text>
      }
    </article>
  );
}
