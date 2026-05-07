import type { Metadata } from 'next';
import type { Tag } from '@/types/sanity.types';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { startCase } from '@/utils/strings';
import { notFound } from 'next/navigation';
import { getTagsWithCount } from '@/features/blog/api/queries/tags';

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Tag: ${startCase(slug)}`,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateStaticParams() {
  const { tags } = await getTagsWithCount();
  return (tags ?? [])
    .map(({ slug }) => ({ slug: slug?.current }))
    .filter((p): p is { slug: string } => p.slug !== undefined);
}

const TagsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: tag } = await params;

  const posts = await getPostList();

  const filteredPosts = tag
    ? posts?.filter((post) =>
      post.tags?.some(
        (t: Tag) => t.slug?.current?.toLowerCase() === tag.toLowerCase(),
      ),
    )
    : posts;

  if (!filteredPosts?.length) {
    return notFound();
  }

  return (
    <PostList posts={filteredPosts} />
  );
};

export default TagsPage;
