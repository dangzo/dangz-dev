import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PostList, PostListSkeleton } from '@/features/blog/components';
import { startCase } from '@/utils/strings';

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Tag: ${startCase(slug)}`,
  };
}

const TagsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList tag={slug} />
    </Suspense>
  );
};

export default TagsPage;
