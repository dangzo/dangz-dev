import clsx from 'clsx';
import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/types/Post.types';
import usePostInsights from '@/hooks/usePostInsights';

interface PostSidebarProps {
  post: PostWithTags;
}

export default function PostSidebar({ post }: PostSidebarProps) {
  const { extractTocFromBody } = usePostInsights();
  const toc = extractTocFromBody(post.body);

  return (
    <div className="space-y-12 hidden sm:block">
      <section>
        <Heading as="h3" className="mb-1! text-2xl font-semibold inline-block">
          Table of Contents
        </Heading>

        {toc.length > 0 && (
          <ul className="pl-4 list-none text-secondary-light dark:text-secondary-dark text-sm">
            {toc.map(item => (
              <li
                key={item.id}
                className={clsx({
                  'mt-3 mb-1': item.level < 3,
                })}
              >
                <Link
                  href={`#${item.id}`}
                  type="primary"
                  className={item.level === 3 ? 'text-sm! pl-4 block' : 'font-semibold tracking-wide'}
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
