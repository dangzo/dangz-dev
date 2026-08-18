import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { getTagsWithCount } from '@/features/blog/api/queries/tags';
import { getTotalPages, parsePageParam } from '@/features/blog/utils/pagination';
import { startCase } from '@/utils/strings';
import { notFound, redirect } from 'next/navigation';

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string, page: string }> },
): Promise<Metadata> {
  const { slug, page } = await params;

  return {
    title: `Tag: ${startCase(slug)} — Page ${page}`,
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

const TagsPagedPage = async ({ params }: { params: Promise<{ slug: string, page: string }> }) => {
  const { slug: tag, page: rawPage } = await params;
  const page = parsePageParam(rawPage);

  if (page === null) {
    return notFound();
  }

  if (page === 1) {
    redirect(`/blog/tags/${tag}`);
  }

  const [posts, { tagCount }] = await Promise.all([
    getPostList({ page, tagSlug: tag }),
    getTagsWithCount(),
  ]);

  const totalPages = getTotalPages(tagCount(tag));

  if (page > totalPages || !posts?.length) {
    return notFound();
  }

  return (
    <PostList posts={posts} pagination={{ currentPage: page, totalPages, basePath: `/blog/tags/${tag}` }} />
  );
};

export default TagsPagedPage;
