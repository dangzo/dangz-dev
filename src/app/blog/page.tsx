import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PostList, PostListSkeleton } from '@/components/blog';

export const metadata: Metadata = {
  title: 'Blog',
};

export default function BlogPage() {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList />
    </Suspense>
  );
}
