import { Link, Text } from '@/components/ui';
import type { PostWithTags } from '@/features/blog/types/Post.types';
import usePostInsights from '@/features/blog/hooks/usePostInsights';
import SidebarHeader from './SidebarHeader';
import SidebarMobileToggle from './SidebarMobileToggle';
import SidebarPanel from './SidebarPanel';
import ToCNav from './ToCNav';

interface ToCSidebarProps {
  post: PostWithTags;
}

export default function ToCSidebar({ post }: Readonly<ToCSidebarProps>) {
  const { extractTocFromBody } = usePostInsights();
  const toc = extractTocFromBody(post.body);

  return (
    <SidebarPanel
      sticky
      footer={(
        <Link
          href="/blog"
          type="accent"
          size="small"
          className="inline-flex w-full items-center justify-center rounded-lg border border-border-light px-4 py-3 md:w-auto md:justify-start md:border-0 md:px-0 md:py-0 md:pl-1 dark:border-border-dark"
        >
          ← Back to all posts
        </Link>
      )}
    >
      <SidebarMobileToggle
        showLabel="Show Table of Contents"
        hideLabel="Hide Table of Contents"
        contentId="post-toc-content"
        header={(
          <SidebarHeader
            title="On this page"
            count={toc.length}
            singular="section"
            plural="sections"
          />
        )}
      >
        {toc.length > 0 && <ToCNav items={toc} />}

        {toc.length === 0 && (
          <Text size="small" className="mb-0! italic">
            No sections in this post.
          </Text>
        )}
      </SidebarMobileToggle>
    </SidebarPanel>
  );
}
