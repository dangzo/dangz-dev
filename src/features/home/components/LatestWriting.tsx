import Link from 'next/link';
import { getPostList } from '@/features/blog/api/queries/posts';
import WritingPreview from './WritingPreview';
import { getEditorialSummary } from '@/features/blog/utils/editorial-preview';

export default async function LatestWriting() {
  let posts;

  try {
    posts = await getPostList({ pageSize: 4 });
  } catch {
    return (
      <p className="rounded-xl border border-border-light p-6 dark:border-border-dark">
        The latest articles couldn’t load. <Link href="/blog" className="underline underline-offset-4">Visit the blog</Link> or try again shortly.
      </p>
    );
  }

  const visiblePosts = posts.filter((post) => post.slug?.current);

  if (visiblePosts.length === 0) {
    return (
      <p className="text-secondary-light dark:text-secondary-dark">New writing is on its way. Come back soon.</p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visiblePosts.map((post, index) => (
        <div key={post._id} className={index === 3 ? 'hidden min-w-0 md:grid lg:hidden' : 'grid min-w-0'}>
          <WritingPreview post={post} summary={getEditorialSummary(post)} />
        </div>
      ))}
    </div>
  );
}
