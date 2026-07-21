import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import usePostInsights from '@/features/blog/hooks/usePostInsights';
import SidebarMobileToggle from './SidebarMobileToggle';
import ToCNav from './ToCNav';

interface ToCSidebarProps {
  post: PostWithTags;
}

export default function ToCSidebar({ post }: Readonly<ToCSidebarProps>) {
  const { extractTocFromBody } = usePostInsights();
  const toc = extractTocFromBody(post.body);

  return (
    <div className="space-y-6 sm:sticky sm:top-12 sm:max-h-[calc(100dvh-4rem)] sm:overflow-y-auto sm:pr-2">
      <section className="rounded-xl border border-border-light bg-background-secondary-light p-4 dark:border-border-dark dark:bg-background-secondary-dark sm:p-5">
        <SidebarMobileToggle
          showLabel="Show Table of Contents"
          hideLabel="Hide Table of Contents"
          contentId="post-toc-content"
        >
          <header className="mb-4 border-b border-border-light pb-4 dark:border-border-dark">
            <Heading as="h3" className="mb-1! text-lg font-semibold">
              On this page
            </Heading>

            {toc.length > 0 && (
              <Text size="x-small" className="mb-0! uppercase tracking-wider">
                {toc.length} {toc.length === 1 ? 'section' : 'sections'}
              </Text>
            )}
          </header>

          {toc.length > 0 && <ToCNav items={toc} />}

          {toc.length === 0 && (
            <Text size="small" className="mb-0! italic">
              No sections in this post.
            </Text>
          )}
        </SidebarMobileToggle>
      </section>

      <Link href="/blog" type="accent" size="small" className="inline-flex items-center gap-1 pl-1">
        ← Back to all posts
      </Link>
    </div>
  );
}
