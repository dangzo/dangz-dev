import { DateText, Link, Img, TagChip } from '@/components/ui';
import Skeleton from 'react-loading-skeleton';
import type { PostWithTopic } from '@/features/blog/types/Post.types';
import ReactionsSummary from './reactions/ReactionsSummary';
import clsx from 'clsx';
import { getPostOpenedAttributes, type PostOpenSource } from '@/utils/postDiscoveryAnalytics';

type PostCardProps = Readonly<{
  post: PostWithTopic;
  source: Exclude<PostOpenSource, 'home'>;
  preload: boolean;
  summary?: string;
}>;

const imageClasses = 'aspect-video w-full overflow-hidden rounded-md md:col-start-2 md:row-start-1 md:w-64 md:self-start lg:w-80';

export const PostCardSkeleton = () => {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_256px] md:gap-x-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className={imageClasses}>
        <Skeleton height="100%" />
      </div>
      <div className="min-w-0 md:col-start-1 md:row-start-1">
        <Skeleton width={120} height={24} />
        <Skeleton height={56} className="mt-3" />
        <Skeleton count={2} className="mt-3" />
        <Skeleton width={100} height={20} className="mt-3" />
      </div>
    </div>
  );
};

export const PostCard = ({ post, preload, source, summary = post.excerpt }: PostCardProps) => {
  const postHref = `/blog/${post.slug?.current}`;
  const hasImage = Boolean(post.image?.asset?.url);

  return (
    <article className={clsx(
      'grid min-w-0 gap-5 md:gap-x-8',
      hasImage ? 'md:grid-cols-[minmax(0,1fr)_256px] lg:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1',
    )}>
      {hasImage && (
        <div className={imageClasses}>
          <Img
            source={post.image}
            alt={post.imageAltText}
            className="h-full w-full object-cover"
            width={960}
            height={540}
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 256px, calc(100vw - 32px)"
            preload={preload}
            loading={preload ? undefined : 'lazy'}
            blurDataURL={post.image?.asset?.metadata?.lqip}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-3 md:col-start-1 md:row-start-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          {post.primaryTopic && <TagChip {...post.primaryTopic} size="comfortable" />}
          <DateText date={post.publishedAt} className="mb-0! text-xs" />
        </div>

        <Link
          {...getPostOpenedAttributes({ post_id: post._id, source, placement: 'title' })}
          href={postHref}
          className="min-w-0 rounded-sm hover:text-accent-light dark:hover:text-accent-dark"
        >
          <h3 className="font-heading text-xl font-semibold leading-snug wrap-break-word md:text-2xl">
            {post.title}
          </h3>
        </Link>

        {summary && (
          <p className="text-sm leading-6 text-secondary-light dark:text-secondary-dark md:text-base">
            {summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            {...getPostOpenedAttributes({ post_id: post._id, source, placement: 'cta' })}
            href={postHref}
            type="accent"
            className="py-1 text-sm"
          >
            Read more <span aria-hidden="true">→</span>
          </Link>
          <ReactionsSummary postId={post._id} source={source} reactions={post.reactions} href={postHref} />
        </div>
      </div>
    </article>
  );
};
