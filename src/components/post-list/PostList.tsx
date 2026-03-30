import { notFound } from 'next/navigation';
import { PostCard, PostCardSkeleton } from './PostCard';
import { getPostList } from '@/api/queries/posts';
import type { Tag } from '@/types/sanity.types';

export const PostListSkeleton = () => {
  return (
    <ul className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="relative pb-4 p-4">
          <PostCardSkeleton />
        </li>
      ))}
    </ul>
  );
};

export const PostList = async ({ tag }: { tag?: string }) => {
  const posts = await getPostList();

  if (!posts || posts.length === 0) {
    return notFound();
  }

  const filteredPosts = tag
    ? posts.filter((post) =>
        post.tags?.some(
          (t: Tag) => t.slug?.current?.toLowerCase() === tag.toLowerCase(),
        ),
      )
    : posts;

  if (tag && filteredPosts?.length === 0) {
    return notFound();
  }

  return (
    <ul className="space-y-6">
      {filteredPosts?.map((post) => (
        <li
          key={post._id}
          className="relative pb-4 p-4 duration-300  dark:bg-background-secondary-darks"
        >
          <PostCard key={post._id} post={post} />
        </li>
      ))}
    </ul>
  );
};
