import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { getTagsWithCount } from '@/features/blog/api/queries/tags';
import { getTotalPages, parsePageParam } from '@/features/blog/utils/pagination';
import { notFound, redirect } from 'next/navigation';

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata(
  { params }: { params: Promise<{ page: string }> },
): Promise<Metadata> {
  const { page } = await params;

  return {
    title: `Blog — Page ${page}`,
    alternates: {
      canonical: `/blog/page/${page}`,
    },
  };
}

async function BlogPagedPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: rawPage } = await params;
  const page = parsePageParam(rawPage);

  if (page === null) {
    return notFound();
  }

  if (page === 1) {
    redirect('/blog');
  }

  const [posts, { tagCount }] = await Promise.all([
    getPostList({ page }),
    getTagsWithCount(),
  ]);

  const totalPages = getTotalPages(tagCount());

  if (page > totalPages || !posts?.length) {
    return notFound();
  }

  return (
    <PostList posts={posts} pagination={{ currentPage: page, totalPages, basePath: '/blog' }} />
  );
}

export default BlogPagedPage;
