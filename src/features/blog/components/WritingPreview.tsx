import Link from 'next/link';
import { getPostOpenedAttributes, type PostOpenSource } from '@/utils/postDiscoveryAnalytics';
import { DateText, Img, TagChip } from '@/components/ui';
import type { PostWithTopic } from '@/features/blog/types/Post.types';

type WritingPreviewProps = Readonly<{
  post: PostWithTopic;
  summary?: string;
  source: Extract<PostOpenSource, 'home' | 'article'>;
}>;

export default function WritingPreview({ post, summary, source }: WritingPreviewProps) {
  const href = post.slug?.current ? `/blog/${post.slug.current}` : null;
  const image = post.image?.asset?.url
    ? (
      <Img
        source={post.image}
        alt={post.imageAltText}
        width={720}
        height={405}
        sizes="(min-width: 1200px) 368px, (min-width: 1024px) calc((100vw - 6rem) / 3), (min-width: 768px) calc((100vw - 4.5rem) / 2), (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
        className="h-full w-full object-cover"
        loading="lazy"
        blurDataURL={post.image.asset.metadata?.lqip}
      />
    )
    : null;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-light bg-background-main-light dark:border-border-dark dark:bg-background-main-dark">
      {image && (
        <div className="aspect-video w-full shrink-0 overflow-hidden bg-background-secondary-light dark:bg-background-secondary-dark">
          {href
            ? (
              <Link href={href} aria-label={`Open article: ${post.title}`} className="block h-full w-full focus-visible:-outline-offset-2">
                {image}
              </Link>
            )
            : image}
        </div>
      )}

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-6 pt-6 md:px-5 md:pt-5">
        {post.primaryTopic && <TagChip {...post.primaryTopic} size="comfortable" />}
        <DateText date={post.publishedAt} className="mb-0! text-xs" />
      </div>

      <h3 className="mt-4 min-w-0 px-6 font-heading text-xl font-semibold leading-snug wrap-break-word md:px-5">
        {href
          ? (
            <Link
              {...getPostOpenedAttributes({ post_id: post._id, source, placement: 'title' })}
              href={href}
              className="rounded-sm hover:text-accent-light dark:hover:text-accent-dark"
            >
              {post.title}
            </Link>
          )
          : post.title}
      </h3>

      {summary && (
        <p className="mt-3 px-6 text-sm leading-6 text-secondary-light dark:text-secondary-dark md:px-5">
          {summary}
        </p>
      )}

      {href && (
        <div className="mt-auto px-6 pt-5 pb-6 md:px-5 md:pb-5">
          <Link
            {...getPostOpenedAttributes({ post_id: post._id, source, placement: 'cta' })}
            href={href}
            aria-label={`Read article: ${post.title}`}
            className="inline-block rounded-sm py-1 text-sm font-medium text-accent-light hover:underline dark:text-accent-dark"
          >
            Read article <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </article>
  );
}

export function WritingPreviewSkeleton() {
  return (
    <div role="status" aria-label="Loading the latest writing" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {['first', 'second', 'third', 'fourth'].map((key, index) => (
        <div key={key} aria-hidden="true" className={`${index === 3 ? 'hidden md:flex lg:hidden' : 'flex'} flex-col overflow-hidden rounded-xl border border-border-light dark:border-border-dark`}>
          <div className="aspect-video w-full bg-background-secondary-light dark:bg-background-secondary-dark" />
          <div className="space-y-3 p-6 md:p-5">
            <div className="h-5 w-24 rounded bg-background-secondary-light dark:bg-background-secondary-dark" />
            <div className="h-14 rounded bg-background-secondary-light dark:bg-background-secondary-dark" />
          </div>
          <div className="mx-6 mb-6 h-18 rounded bg-background-secondary-light dark:bg-background-secondary-dark md:mx-5 md:mb-5" />
        </div>
      ))}
    </div>
  );
}
