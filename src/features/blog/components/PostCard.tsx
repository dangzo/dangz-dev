import { DateText, Text, Heading, Link, Img } from '@/components/ui';
import TagList from './TagList';
import Skeleton from 'react-loading-skeleton';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import ReactionsSummary from './reactions/ReactionsSummary';

interface PostCardProps {
  post: PostWithTags;
  preload: boolean;
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

export const PostCard = ({ post, preload }: PostCardProps) => {
  const hasVisibleReactions = (post.reactions?.some((reaction) => (reaction.count ?? 0) > 0 && reaction.emoji) ?? false);
  const postHref = `/blog/${post.slug?.current}`;

  return (
    <article className="flex flex-col-reverse md:flex-row relative md:items-center">
      <div className="md:w-5/7">
        <Link
          href={postHref}
          className="text-2xl font-semibold"
        >
          <Heading as="h3" className="inline-block">
            {post.title}
          </Heading>
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-x-1 mb-1">
            <DateText date={post.publishedAt} className="mb-0!" />
            {hasVisibleReactions
              ? <span className="mx-2 mb-0">&bull;</span>
              : null}
            <ReactionsSummary reactions={post.reactions} href={postHref} />
          </div>
          {post.tags && <TagList tags={post.tags} />}
        </div>

        <Text className="my-4">
          {post.excerpt ? `${post.excerpt}...` : 'No description available.'}
        </Text>

        <Link href={postHref} type="accent">
          Read more →
        </Link>
      </div>

      {/* priority=true on first two cards adds a <link rel="preload"> in <head>; lazy load the rest */}
      <Img
        source={post.image}
        alt={post.imageAltText}
        className="object-cover rounded-md block md:ml-4 md:w-38 mb-8 md:mb-0 grow w-full h-auto"
        width={930}
        height={665}
        sizes="(min-width: 768px) 152px, 100vw"
        preload={preload}
        loading={preload ? undefined : 'lazy'}
        blurDataURL={post.image?.asset?.metadata?.lqip}
      />
    </article>
  );
};
