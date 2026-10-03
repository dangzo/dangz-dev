import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { getTotalPages } from '@/features/blog/utils/pagination';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Blog',
  alternates: {
    canonical: '/blog',
  },
};

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

async function BlogPage() {
  const posts = await getPostList({ page: 1 });

  if (!posts?.length) {
    return notFound();
  }

  const { totalPostCount } = await getTopicsWithCount();
  const totalPages = getTotalPages(totalPostCount);

  return (
    <PostList posts={posts} pagination={{ currentPage: 1, totalPages, basePath: '/blog' }} />
  );
}

export default BlogPage;
