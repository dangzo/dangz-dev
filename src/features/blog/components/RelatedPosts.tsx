import type { PostWithTopic } from '@/features/blog/types/Post.types';
import WritingPreview from './WritingPreview';

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
      className="col-span-full mt-8 min-w-0 border-t border-border-light pt-16 dark:border-border-dark"
    >
      <h2
        id="related-posts-heading"
        className="font-heading text-xl font-semibold text-main-light dark:text-main-dark text-center"
      >
        What to read next
      </h2>
      <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <li key={post._id} className={index === 3 ? 'hidden min-w-0 md:grid lg:hidden' : 'grid min-w-0'}>
            <WritingPreview post={post} summary={post.excerpt} source="article" />
          </li>
        ))}
      </ul>
    </section>
  );
}
