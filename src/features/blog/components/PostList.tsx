import { notFound } from 'next/navigation';
import { PostCard, PostCardSkeleton } from './PostCard';
import type { Tag } from '@/types/sanity.types';
import { getPostList } from '@/features/blog/api/queries/posts';

interface PostListProps {
  tag?: string;
}

export const PostList = async ({ tag }: PostListProps) => {
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
    <ul className="space-y-6">
      {filteredPosts?.map((post, index) => (
        <li
          key={post._id}
          className="
            relative dark:bg-background-secondary-darks border-b
            px-0 py-6 my-3 sm:mb-3 md:py-4 md:mt-0 md:px-4
          "
        >
          <PostCard key={post._id} post={post} preload={index < 2}/>
        </li>
      ))}
    </ul>
  );
};

export const PostListSkeleton = () => {
  return (
    <ul className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <li
          key={index}
          className="
            relative px-0 my-3 sm:mb-3 sm:mt-0 py-2 md:py-4 md:px-4 duration-300 dark:bg-background-secondary-darks border-b
          "
        >
          <PostCardSkeleton />
        </li>
      ))}
    </ul>
  );
};