import type { Metadata } from 'next'
import { baseMetadata, siteName } from '@/data/siteMetadata';
import { getPostBySlug } from '@/api/queries/posts';
import usePostInsights from '@/hooks/usePostInsights';
import useSanityImageUrl from '@/hooks/useSanityImageUrl';

function useDynamicMetadata() {
  async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
  ): Promise<Metadata> {
    const { urlFor } = useSanityImageUrl();
    const { slug } = await params;
    
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: 'Post not found',
      };
    }

    const { getPostExcerpt } = usePostInsights();
    const postDescription = getPostExcerpt(post.body);

    return {
      title: post.title,
      description: postDescription,
      openGraph: {
        title: post.title,
        description: postDescription,
        url: `https://www.dangz.dev/blog/${slug}`,
        siteName: siteName,
        images: [
          {
            url: urlFor(post.image).url() || '/og-image.png',
            width: 1200,
            height: 630,
            alt: post.imageAltText || post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} - ${baseMetadata.title}`,
        description: postDescription,
        images: [urlFor(post.image).url() || '/og-image.png'],
      },
    };
  }

  return {
    generateMetadata,
  }
}

export default useDynamicMetadata;