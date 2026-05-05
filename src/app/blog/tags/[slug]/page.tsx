import type { Metadata } from 'next';
import type { Tag } from '@/types/sanity.types';
import { PostList } from '@/features/blog/components';
import { getPostList } from '@/features/blog/api/queries/posts';
import { startCase } from '@/utils/strings';
import { notFound } from 'next/navigation';

// Cache-invalidation every 60 minutes
export const revalidate = 3600;

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
  const { slug: tag } = await params;

  const posts = await getPostList();

  const filteredPosts = tag
    ? posts?.filter((post) =>
      post.tags?.some(
        (t: Tag) => t.slug?.current?.toLowerCase() === tag.toLowerCase(),
      ),
    )
    : posts;

  if (!filteredPosts?.length) {
    return notFound();
  }

  return (
    <PostList posts={filteredPosts} />
  );
};

export default TagsPage;
