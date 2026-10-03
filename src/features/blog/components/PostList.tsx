import { PostCard, PostCardSkeleton } from './PostCard';
import { Pagination } from '@/components/ui';
import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { getEditorialSummary } from '@/features/blog/utils/editorial-preview';

interface PostListPagination {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

interface PostListProps {
  posts: readonly PostWithTopic[];
  pagination?: PostListPagination;
}

const postListSkeletonKeys = ['one', 'two', 'three'] as const;

export const PostList = ({ posts, pagination }: Readonly<PostListProps>) => {
  return (
    <>
      <ul className="divide-y divide-border-light dark:divide-border-dark">
        {posts?.map((post, index) => (
          <li
            key={post._id}
            className="py-6 md:py-8"
          >
            <PostCard post={post} summary={getEditorialSummary(post)} preload={index < 2} />
          </li>
        ))}
      </ul>

      {pagination && <Pagination {...pagination} />}
    </>
  );
};

export const PostListSkeleton = () => {
  return (
    <ul className="divide-y divide-border-light dark:divide-border-dark">
      {postListSkeletonKeys.map((key) => (
        <li
          key={key}
          className="py-6 md:py-8"
        >
          <PostCardSkeleton />
        </li>
      ))}
    </ul>
  );
};
