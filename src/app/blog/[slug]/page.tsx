import { notFound } from 'next/navigation';
import { Img, Text } from '@/components/ui';
import { PortableText } from '@/features/blog/components';
import ReactionsClient from '@/features/blog/components/reactions/ReactionsClient';
import { getPostBySlug, getPostSlugs } from '@/features/blog/api/queries/singlePost';
import getPostMetadata from '@/features/blog/api/getPostMetadata';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({ params }: PostPageProps) {
  return getPostMetadata({ params });
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateStaticParams() {
  const posts = await getPostSlugs();
  return posts.map(({ slug }) => ({ slug: slug.current }));
}

export default async function PostPage({ params, }: Readonly<PostPageProps>) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const lqip = post.image?.asset?.metadata?.lqip;

  return (
    <article className="mx-auto min-w-0 max-w-[70ch]">
      {post.image
        ? (
          <div className="mb-5 sm:mb-6 md:mb-8 rounded-lg overflow-hidden">
            <Img
              source={post.image}
              alt={post.imageAltText}
              className="w-full h-auto object-cover"
              width={930}
              height={665}
              sizes="(min-width: 1024px) 700px, (min-width: 768px) calc(100vw - 20rem), calc(100vw - 2rem)"
              fetchPriority="high"
              blurDataURL={lqip}
              preload
            />
          </div>
        )
        : null}

      {/* Body Content */}
      {post.body && post.body.length > 0
        ? (
          <>
            <PortableText value={post.body} />
            <ReactionsClient postId={post._id} />
          </>
        )
        : <Text>No content available for this post.</Text>
      }
    </article>
  );
}
