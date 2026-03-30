import { Suspense } from 'react';
import { PostList, PostListSkeleton } from '@/components/post-list';

const TagsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList tag={slug} />
    </Suspense>
  );
};

export default TagsPage;
