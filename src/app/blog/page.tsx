import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostList, PostListSkeleton } from '@/components/posts';
import { getPostList } from '@/api/queries/posts';

export default async function BlogPage() {
  const posts = await getPostList();

  if (!posts || posts.length === 0) {
    return notFound();
  }

  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList posts={posts} />
    </Suspense>
  );
}
