import { Suspense } from 'react';
import { PostList, PostListSkeleton } from '@/components/blog';

export default async function BlogPage() {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList />
    </Suspense>
  );
}
