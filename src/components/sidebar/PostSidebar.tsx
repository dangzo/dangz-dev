import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/types/Post.types';
import usePostInsights from '@/hooks/usePostInsights';

interface PostSidebarProps {
  post: PostWithTags;
}

export default function PostSidebar({ post }: PostSidebarProps) {
  const { toc } = usePostInsights(post);

  return (
    <div className="space-y-12">
      <section>
        <Heading as="h3" className="mb-4 text-2xl font-semibold inline-block">
          Table of Contents
        </Heading>

        {toc.length > 0 && (
          <ul className="pl-4 list-none space-y-2.5 text-secondary-light dark:text-secondary-dark text-sm">
            {toc.map(item => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  type="primary"
                  className={item.level === 3 ? 'text-xs pl-3 block' : 'text-xs font-semibold uppercase tracking-wide'}
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
