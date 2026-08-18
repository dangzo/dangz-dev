import { PostCard, PostCardSkeleton } from './PostCard';
import { Pagination } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';

interface PostListPagination {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

interface PostListProps {
  posts: PostWithTags[];
  pagination?: PostListPagination;
}

const postListSkeletonKeys = ['one', 'two', 'three'] as const;

export const PostList = ({ posts, pagination }: PostListProps) => {
  return (
    <>
      <ul className="space-y-6">
        {posts?.map((post, index) => (
          <li
            key={post._id}
            className="
              relative dark:bg-background-secondary-darks border-b
              px-0 py-6 my-3 sm:mb-3 md:py-4 md:mt-0 md:pr-4
            "
          >
            <PostCard key={post._id} post={post} preload={index < 2}/>
          </li>
        ))}
      </ul>

      {pagination && <Pagination {...pagination} />}
    </>
  );
};

export const PostListSkeleton = () => {
  return (
    <ul className="space-y-6">
      {postListSkeletonKeys.map((key) => (
        <li
          key={key}
          className="
            relative px-0 my-3 sm:mb-3 sm:mt-0 py-2 md:py-4 md:pr-4 duration-300 dark:bg-background-secondary-darks border-b
          "
        >
          <PostCardSkeleton />
        </li>
      ))}
    </ul>
  );
};