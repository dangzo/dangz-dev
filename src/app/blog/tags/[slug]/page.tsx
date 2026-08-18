import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { getTotalPages } from '@/features/blog/utils/pagination';
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

  const [posts, { tagCount }] = await Promise.all([
    getPostList({ page: 1, tagSlug: tag }),
    getTagsWithCount(),
  ]);

  if (!posts?.length) {
    return notFound();
  }

  const totalPages = getTotalPages(tagCount(tag));

  return (
    <PostList posts={posts} pagination={{ currentPage: 1, totalPages, basePath: `/blog/tags/${tag}` }} />
  );
};

export default TagsPage;
