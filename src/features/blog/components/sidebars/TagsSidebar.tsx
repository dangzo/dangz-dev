import type { TopicWithCount } from '@/features/blog/types/Topic.types';
import { getTopicHref } from '@/features/blog/utils/topics';
import SidebarHeader from './SidebarHeader';
import SidebarMobileToggle from './SidebarMobileToggle';
import SidebarNav from './SidebarNav';
import SidebarNavItem from './SidebarNavItem';
import SidebarPanel from './SidebarPanel';

type TopicsSidebarProps = Readonly<{
  activeSlug?: string;
  topics: readonly TopicWithCount[];
  totalPostCount: number;
}>;

export default function TagsSidebar({ activeSlug, topics, totalPostCount }: TopicsSidebarProps) {
  const visibleTopics = topics
    .filter(topic => topic.postCount > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const hasActiveTopic = Boolean(activeSlug);

  return (
    <SidebarPanel>
      <SidebarMobileToggle
        showLabel="Show all topics"
        hideLabel="Hide all topics"
        contentId="topics-sidebar-content"
        defaultOpen={hasActiveTopic}
        header={(
          <SidebarHeader title="All topics" count={visibleTopics.length} singular="topic" plural="topics" />
        )}
      >
        <SidebarNav label="Topics">
          <SidebarNavItem href="/blog" isActive={!hasActiveTopic} activeMode="always" className="font-semibold uppercase tracking-wide">
            All posts ({totalPostCount})
          </SidebarNavItem>

          {visibleTopics.map(topic => (
            <SidebarNavItem
              key={topic._id}
              href={getTopicHref(topic)}
              isActive={activeSlug === topic.slug.current}
              activeMode="always"
              className="font-semibold uppercase tracking-wide"
            >
              {topic.displayName.toUpperCase()} ({topic.postCount})
            </SidebarNavItem>
          ))}
        </SidebarNav>
      </SidebarMobileToggle>
    </SidebarPanel>
  );
}
