import { DateText, Text, Heading, Link, Img } from '@/components/ui';
import TagList from './TagList';
import Skeleton from 'react-loading-skeleton';
import usePostInsights from '@/hooks/usePostInsights';
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
  const { getPostExcerpt } = usePostInsights();

  return (
    <article className="flex flex-col-reverse sm:flex-row relative sm:items-center">
      <div>
        <Link
          href={`/blog/${post.slug?.current}`}
          className="text-2xl font-semibold"
        >
          <Heading as="h3" className="inline-block">
            {post.title}
          </Heading>
        </Link>

        <div className="flex flex-col">
          <DateText date={post.publishedAt} />
          <TagList tags={post.tags} />
        </div>

        <Text className="my-4">
          {getPostExcerpt(post.body) ?? 'No description available.'}
        </Text>

        <Link href={`/blog/${post.slug?.current}`} type="accent">
          Read more →
        </Link>
      </div>

      <Img
        source={post.image}
        alt={post.imageAltText}
        className="object-cover rounded-md block sm:ml-4 sm:w-38 md:h-24 w-20 h-16 mb-2 sm:mb-0"
        width={150}
        height={96}
      />
    </article>
  );
};
