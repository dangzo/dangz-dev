import { notFound } from 'next/navigation';
import { Img, Text } from '@/components/ui';
import { PortableText } from '@/components/blog';
import { getPostBySlug } from '@/api/queries/posts';
import getPostMetadata from '@/api/getPostMetadata';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function Metadata({ params }: PostPageProps) {
  return getPostMetadata({ params });
}

export default async function PostPage({
  params,
}: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <div className="mb-5 sm:mb-6 md:mb-8 rounded-lg overflow-hidden">
        <Img
          source={post.image}
          alt={post.imageAltText}
          className="w-full h-auto object-cover"
          width={700}
          height={400}
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
