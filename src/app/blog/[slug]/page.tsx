import { notFound } from 'next/navigation';
import { Img, Text } from '@/components/ui';
import { PortableText } from '@/features/blog/components';
import { getPostBySlug, getPostSlugs } from '@/features/blog/api/queries/posts';
import getPostMetadata from '@/features/blog/api/getPostMetadata';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({ params }: PostPageProps) {
  return getPostMetadata({ params });
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateStaticParams() {
  const posts = await getPostSlugs();
  return posts.map(({ slug }) => ({ slug: slug.current }));
}

export default async function PostPage({
  params,
}: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const lqip = post.image?.asset?.metadata?.lqip;

  return (
    <article className="max-w-3xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <div className="mb-5 sm:mb-6 md:mb-8 rounded-lg overflow-hidden">
        <Img
          source={post.image}
          alt={post.imageAltText}
          className="w-full h-auto object-cover"
          width={700}
          height={400}
          fetchPriority="high"
          blurDataURL={lqip}
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
