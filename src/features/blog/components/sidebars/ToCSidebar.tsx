import clsx from 'clsx';
import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import usePostInsights from '@/features/blog/hooks/usePostInsights';
import SidebarMobileToggle from './SidebarMobileToggle';

interface ToCSidebarProps {
  post: PostWithTags;
}

export default function ToCSidebar({ post }: ToCSidebarProps) {
  const { extractTocFromBody } = usePostInsights();
  const toc = extractTocFromBody(post.body);

  return (
    <div className="space-y-12 sm:sticky sm:top-12">
      <section>
        <SidebarMobileToggle
          showLabel="Show Table of Contents"
          hideLabel="Hide Table of Contents"
          contentId="post-toc-content"
        >
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
        </SidebarMobileToggle>
      </section>

      <section>
        <Link href="/blog" type="accent">
          ← Back to all posts
        </Link>
      </section>
    </div>
  );
}
