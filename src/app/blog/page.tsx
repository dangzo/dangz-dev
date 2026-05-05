import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Blog',
};

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

async function BlogPage() {
  const posts = await getPostList();

  if (!posts?.length) {
    return notFound();
  }

  return (
    <PostList posts={posts} />
  );
}

export default BlogPage;
