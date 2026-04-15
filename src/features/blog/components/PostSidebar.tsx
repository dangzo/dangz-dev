import clsx from 'clsx';
import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import usePostInsights from '@/features/blog/hooks/usePostInsights';

interface PostSidebarProps {
  post: PostWithTags;
}

export default function PostSidebar({ post }: PostSidebarProps) {
  const { extractTocFromBody } = usePostInsights();
  const toc = extractTocFromBody(post.body);

  return (
    <div className="space-y-12 hidden sm:block sm:sticky sm:top-12">
      <section>
        <Heading as="h3" className="mb-1! text-2xl font-semibold inline-block">
          Table of Contents
        </Heading>

        {toc.length > 0 && (
          <ul className="pl-4 list-none">
            {toc.map(item => (
              <li
                key={item.id}
                className={clsx('mb-1', {
                  'mt-3': item.level === 2,
                  'mt-1': item.level === 3,
                })}
              >
                <Link
                  href={`#${item.id}`}
                  type="primary"
                  className={clsx('block', {
                    'font-semibold tracking-wide text-base text-main-light dark:text-main-dark': item.level === 2,
                    'pl-4 text-sm! font-medium text-accent-light/90 dark:text-accent-dark/90 border-l border-accent-light/25 dark:border-accent-dark/25': item.level === 3,
                  })}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {toc.length === 0 && (
          <Text size="small" className="mb-0">
            --
          </Text>
        )}
      </section>

      <section>
        <Link href="/blog" type="accent">
          ← Back to all posts
        </Link>
      </section>
    </div>
  );
}
