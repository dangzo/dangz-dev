import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import { extractTocFromBody } from '@/features/blog/hooks/usePostInsights';
import SidebarMobileToggle from './SidebarMobileToggle';
import ToCNav from './ToCNav';

interface ToCSidebarProps {
  post: PostWithTags;
}

export default function ToCSidebar({ post }: Readonly<ToCSidebarProps>) {
  const toc = extractTocFromBody(post.body);

  if (toc.length === 0) {
    return null;
  }

  return (
    <div data-article-toc className="space-y-4 xl:sticky xl:top-12 xl:space-y-6">
      <section className="rounded-xl border border-border-light bg-background-secondary-light p-3 dark:border-border-dark dark:bg-background-secondary-dark xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:dark:bg-transparent">
        <SidebarMobileToggle
          showLabel="Show Table of Contents"
          hideLabel="Hide Table of Contents"
          contentId="post-toc-content"
          desktopBreakpoint="xl"
          closeOnEscape
          header={(
            <>
              <Heading as="h2" className="mb-1! text-base! leading-6!">
                Contents
              </Heading>
              <Text size="x-small" className="mb-0! uppercase tracking-wider">
                {toc.length} {toc.length === 1 ? 'section' : 'sections'}
              </Text>
            </>
          )}
        >
          <ToCNav items={toc} />
        </SidebarMobileToggle>
      </section>

      <Link href="/blog" type="accent" size="small" className="inline-flex">
        ← Back to all posts
      </Link>
    </div>
  );
}
