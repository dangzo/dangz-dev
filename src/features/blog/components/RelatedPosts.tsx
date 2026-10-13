import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { Img, Link } from '@/components/ui';
import { getPostOpenedAttributes } from '@/utils/postDiscoveryAnalytics';

type RelatedPostsProps = Readonly<{
  posts: readonly PostWithTopic[];
}>;

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="mx-auto mt-8 min-w-0 max-w-[70ch] border-t border-border-light pt-16 dark:border-border-dark"
    >
      <h2
        id="related-posts-heading"
        className="font-heading text-xl font-semibold text-main-light dark:text-main-dark text-center"
      >
        What to read next
      </h2>
      <ul className="mt-2 divide-y divide-border-light dark:divide-border-dark">
        {posts.map((post) => (
          <li key={post._id} className="py-3">
            <Link
              {...getPostOpenedAttributes({ post_id: post._id, source: 'article', placement: 'title' })}
              href={`/blog/${post.slug?.current}`}
              aria-labelledby={`related-post-${post._id}`}
              className="group flex min-w-0 items-center gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-light dark:focus-visible:outline-accent-dark"
            >
              <div className="min-w-0 flex-1">
                {post.primaryTopic && (
                  <span className="text-xs text-secondary-light dark:text-secondary-dark">
                    {post.primaryTopic.displayName}
                  </span>
                )}
                <h3 id={`related-post-${post._id}`} className="font-heading text-base font-semibold leading-snug wrap-break-word group-hover:text-accent-light dark:group-hover:text-accent-dark">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-secondary-light dark:text-secondary-dark">
                    {post.excerpt}
                  </p>
                )}
              </div>
              {post.image?.asset?.url && (
                <div className="h-21 w-28 shrink-0 overflow-hidden rounded-md">
                  <Img
                    source={post.image}
                    alt={post.imageAltText || post.title}
                    aria-hidden="true"
                    width={224}
                    height={168}
                    sizes="112px"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
