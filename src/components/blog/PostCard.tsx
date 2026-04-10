import { DateText, Text, Heading, Link, Img } from '@/components/ui';
import TagList from './TagList';
import Skeleton from 'react-loading-skeleton';
import type { PostWithTags } from '@/types/Post.types';

interface PostCardProps {
  post: PostWithTags;
  preloadImage?: boolean;
}

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

export const PostCard = ({ post, preloadImage = false }: PostCardProps) => {
  return (
    <article className="flex flex-col-reverse sm:flex-row relative sm:items-center">
      <div className="sm:w-5/7">
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
          {post.excerpt ?? 'No description available.'}
        </Text>

        <Link href={`/blog/${post.slug?.current}`} type="accent">
          Read more →
        </Link>
      </div>

      <Img
        source={post.image}
        alt={post.imageAltText}
        className="object-cover rounded-md block sm:ml-4 sm:w-38 mb-8 sm:mb-0 grow w-full"
        width={600}
        height={400}
        sizes="(min-width: 640px) 152px, 100vw"
        preload={preloadImage}
        blurDataURL={post.image?.asset?.metadata?.lqip}
      />
    </article>
  );
};
