import { Heading, Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import usePostInsights from '@/features/blog/hooks/usePostInsights';
import SidebarMobileToggle from './SidebarMobileToggle';
import ToCNav from './ToCNav';

interface ToCSidebarProps {
  post: PostWithTags;
}

function ToCHeader({ sectionCount }: { sectionCount: number }) {
  return (
    <>
      <Heading as="h3" className="mb-1! text-lg font-semibold">
        On this page
      </Heading>

      {sectionCount > 0 && (
        <Text size="x-small" className="mb-0! uppercase tracking-wider">
          {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
        </Text>
      )}
    </>
  );
}

export default function ToCSidebar({ post }: Readonly<ToCSidebarProps>) {
  const { extractTocFromBody } = usePostInsights();
  const toc = extractTocFromBody(post.body);

  return (
    <div className="space-y-4 sm:sticky sm:top-12 sm:max-h-[calc(100dvh-4rem)] sm:space-y-6 sm:overflow-y-auto sm:pr-2">
      <section className="rounded-xl border border-border-light bg-background-secondary-light p-3 dark:border-border-dark dark:bg-background-secondary-dark md:p-5">
        <SidebarMobileToggle
          showLabel="Show Table of Contents"
          hideLabel="Hide Table of Contents"
          contentId="post-toc-content"
          header={<ToCHeader sectionCount={toc.length} />}
        >
          {toc.length > 0 && <ToCNav items={toc} />}

          {toc.length === 0 && (
            <Text size="small" className="mb-0! italic">
              No sections in this post.
            </Text>
          )}
        </SidebarMobileToggle>
      </section>

      <Link
        href="/blog"
        type="accent"
        size="small"
        className="inline-flex w-full items-center justify-center rounded-lg border border-border-light px-4 py-3 md:w-auto md:justify-start md:border-0 md:px-0 md:py-0 md:pl-1 dark:border-border-dark"
      >
        ← Back to all posts
      </Link>
    </div>
  );
}
