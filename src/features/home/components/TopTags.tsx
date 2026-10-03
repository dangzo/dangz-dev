import TagChip from '@/components/ui/TagChip';
import Skeleton from 'react-loading-skeleton';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';

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
  const { topics } = await getTopicsWithCount();
  const topTopics = topics
    .filter(topic => topic.postCount > 0)
    .sort((a, b) => (b.postCount - a.postCount) || a.displayName.localeCompare(b.displayName))
    .slice(0, TOP_TOPICS_COUNT);

  return (
    <>
      {topTopics.map(topic => (
        <div
          key={topic._id}
          className="flex items-center gap-2 rounded-full border border-border-light/60 dark:border-border-dark/60 bg-background-secondary-light/60 dark:bg-background-secondary-dark/60 px-3 py-1.5 shadow-sm shadow-black/5 dark:shadow-black/30"
        >
          <TagChip {...topic} />
          <span className="text-xs font-medium text-secondary-light dark:text-secondary-dark">
            {topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      ))}
    </>
  );
}
