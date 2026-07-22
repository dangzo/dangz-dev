import type { Tag } from '@/types/sanity.types';
import SidebarHeader from './SidebarHeader';
import SidebarMobileToggle from './SidebarMobileToggle';
import SidebarNav from './SidebarNav';
import SidebarNavItem from './SidebarNavItem';
import SidebarPanel from './SidebarPanel';

interface TagsSidebarProps {
  activeSlug?: string;
  tags?: Tag[];
  tagCount?: (slug?: string) => number;
}

export default function TagsSidebar({ activeSlug, tags, tagCount }: Readonly<TagsSidebarProps>) {
  const tagsWithPostCount = tags?.map(tag => ({
    ...tag,
    postCount: tagCount?.(tag.slug?.current) ?? 0,
  }));

  const sortedTagsWithCount = tagsWithPostCount
    ?.filter(tag => tag.postCount > 0)
    ?.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    ?? [];

  const hasActiveTag = Boolean(activeSlug);
  const totalPostCount = tagCount?.() ?? 0;

  return (
    <SidebarPanel>
      <SidebarMobileToggle
        showLabel="Show all tags"
        hideLabel="Hide all tags"
        contentId="tags-sidebar-content"
        defaultOpen={hasActiveTag}
        header={(
          <SidebarHeader
            title="All tags"
            count={sortedTagsWithCount.length}
            singular="tag"
            plural="tags"
          />
        )}
      >
        <SidebarNav label="Tags">
          <SidebarNavItem
            href="/blog"
            isActive={!hasActiveTag}
            activeMode="always"
            className="font-semibold uppercase tracking-wide"
          >
            All posts ({totalPostCount})
          </SidebarNavItem>

          {sortedTagsWithCount.map(tag => (
            <SidebarNavItem
              key={tag._id}
              href={`/blog/tags/${tag.slug?.current}`}
              isActive={activeSlug === tag.slug?.current}
              activeMode="always"
              className="font-semibold uppercase tracking-wide"
            >
              {tag.name?.toUpperCase()} ({tag.postCount})
            </SidebarNavItem>
          ))}
        </SidebarNav>
      </SidebarMobileToggle>
    </SidebarPanel>
  );
}
