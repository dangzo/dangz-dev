import Link from 'next/link';
import { DateText, Img } from '@/components/ui';
import { getPostList } from '@/features/blog/api/queries/posts';

export default async function LatestWriting() {
  let posts;

  try {
    posts = await getPostList({ pageSize: 3 });
  } catch {
    return (
      <p className="rounded-xl border border-border-light p-6 dark:border-border-dark">
        The latest articles couldn’t load. <Link href="/blog" className="underline underline-offset-4">Visit the blog</Link> or try again shortly.
      </p>
    );
  }

  const publishedPosts = posts.filter((post) => post.slug?.current);

  if (publishedPosts.length === 0) {
    return <p className="text-secondary-light dark:text-secondary-dark">New writing is on its way. Come back soon.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {publishedPosts.map((post) => (
        <article key={post._id} className="group flex flex-col overflow-hidden rounded-xl border border-border-light bg-background-main-light transition-colors hover:border-primary-500 dark:border-border-dark dark:bg-background-main-dark dark:hover:border-primary-500">
          <Link href={`/blog/${post.slug?.current}`} className="flex h-full flex-col">
            {post.image && (
              <div className="aspect-[16/9] overflow-hidden bg-background-secondary-light dark:bg-background-secondary-dark">
                <Img source={post.image} alt={post.imageAltText} width={720} height={405} sizes="(min-width: 768px) 33vw, 100vw" className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <DateText date={post.publishedAt} className="mb-3 text-xs" />
              <h3 className="font-heading text-xl font-semibold leading-snug group-hover:text-accent-light dark:group-hover:text-accent-dark">{post.title}</h3>
              {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-secondary-light dark:text-secondary-dark">{post.excerpt}</p>}
              <span className="mt-auto pt-6 text-sm font-medium text-accent-light dark:text-accent-dark">Read article <span aria-hidden="true">→</span></span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
