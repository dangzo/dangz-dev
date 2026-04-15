import type { Metadata } from 'next';
import { siteName } from '@/data/siteMetadata';
import { getPostBySlug } from '@/features/blog/api/queries/posts';
import { urlFor } from '@/utils/image';

async function getPostMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | ${siteName}`,
      description: post.excerpt,
      url: `https://www.dangz.dev/blog/${slug}`,
      siteName: siteName,
      images: [
        {
          url: urlFor(post.image)?.url() || '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.imageAltText || post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${siteName}`,
      description: post.excerpt,
      images: [urlFor(post.image)?.url() || '/og-image.png'],
    },
  };
}

export default getPostMetadata;