import { Suspense } from 'react';
import { PostList, PostListSkeleton } from '@/components/post-list';
import { getPostList } from '@/api/queries/posts';
import { notFound } from 'next/navigation';

const TagsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const posts = await getPostList();

  if (!posts || posts.length === 0) {
    return notFound();
  }
  
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList tag={slug} posts={posts} />
    </Suspense>
  );
};

export default TagsPage;
