import TagChip from '@/components/ui/TagChip';
import Skeleton from 'react-loading-skeleton';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import type { TopicWithCount } from '@/features/blog/types/Topic.types';

const TOP_TOPICS_COUNT = 6;

export const TopTagsSkeleton = () => {
  return (
    <>
      {Array.from({ length: TOP_TOPICS_COUNT }).map((_, index) => (
        <Skeleton key={index} width={200} height={32} />
      ))}
    </>
  );
};

export async function TopTags() {
  let topics: readonly TopicWithCount[];

  try {
    ({ topics } = await getTopicsWithCount());
  } catch {
    return (
      <p className="text-sm text-secondary-light dark:text-secondary-dark">Topics couldn’t load. Try again shortly.</p>
    );
  }

  if (!topics.some(topic => topic.postCount > 0)) {
    return (
      <p className="text-sm text-secondary-light dark:text-secondary-dark">Topics will appear as new writing is published.</p>
    );
  }

  const topTopics = topics
    .filter(topic => topic.postCount > 0)
    .sort((a, b) => (b.postCount - a.postCount) || a.displayName.localeCompare(b.displayName))
    .slice(0, TOP_TOPICS_COUNT);

  return (
    <>
      {topTopics.map(topic => (
        <div
          key={topic._id}
          className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1"
        >
          <TagChip {...topic} size="comfortable" />
          <span className="text-xs font-medium text-secondary-light dark:text-secondary-dark">
            {topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      ))}
    </>
  );
}
