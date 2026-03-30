import { DateText, Text, Heading, Link } from '@/components/core';
import TagList from './TagList';
import Skeleton from 'react-loading-skeleton';
import type { PostWithTags } from '@/types/Post.types';

export const PostCardSkeleton = () => {
  return (
    <div className="flex flex-row relative">
      <div className="leading-6 min-w-38">
        <Skeleton width={120} height={20} />
      </div>
      <div className="flex-1">
        <Skeleton width="60%" height={30} className="mb-2" />
        <Skeleton width="40%" height={20} className="mb-2" />
        <Skeleton count={3} className="mb-2" />
        <Skeleton width={100} height={20} />
      </div>
    </div>
  );
};

export const PostCard = ({ post }: { post: PostWithTags }) => {
  return (
    <div className="flex flex-row relative">
      <div>
        <Link
          href={`/blog/${post.slug?.current}`}
          className="text-2xl font-semibold"
        >
          <Heading as="h4" className="inline-block">
            {post.title}
          </Heading>
        </Link>

        <div className="flex flex-row items-center">
          <DateText date={post.publishedAt} className="mb-0!" />
          <span className="mx-2">&bull;</span>
          <TagList tags={post.tags} />
        </div>

        <Text className="my-4">
          {post.body && post.body.length > 0
            ? post.body
              .filter((block) => block._type === 'block')
              .map((block) =>
                block.children?.map((child) => child.text).join(' '),
              )
              .join(' ')
              .slice(0, 150) + '...'
            : 'No description available.'}
        </Text>

        <Link href={`/blog/${post.slug?.current}`} type="accent">
          Read more →
        </Link>
      </div>
    </div>
  );
};
