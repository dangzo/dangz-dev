import { Suspense } from 'react';
import { PostList, PostListSkeleton } from '@/components/post-list';

export default async function BlogPage() {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList />
    </Suspense>
  );
}
