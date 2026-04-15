import TagChip from '@/components/ui/TagChip';
import Skeleton from 'react-loading-skeleton';
import { getTagsWithCount } from '@/features/blog/api/queries/tags';

const TOP_TAGS_COUNT = 7;

const TopTagsSkeleton = () => {
  return (
    <>
      <Skeleton width={120} height={32} />
      <Skeleton width={120} height={32} />
      <Skeleton width={120} height={32} />
    </>
  );
};

async function TopTags() {
  const { tags, tagCount } = await getTagsWithCount();

  const tagsWithCount = tags?.map(tag => ({
    ...tag,
    postCount: tagCount(tag.slug?.current),
  }));

  const topTags = tagsWithCount
    ?.sort((a, b) => (b.postCount - a.postCount) || (a.name ?? '').localeCompare(b.name ?? ''))
    ?.filter(tag => tag.postCount > 0)
    ?.slice(0, TOP_TAGS_COUNT);

  if (!topTags || topTags.length === 0) {
    return (
      <>
        <TopTagsSkeleton />
      </>
    );
  }

  return (
    <>
      {topTags.map(tag => (
        <div
          key={tag._id}
          className="
            flex items-center gap-2 rounded-full border border-border-light/60 dark:border-border-dark/60
            bg-background-secondary-light/60 dark:bg-background-secondary-dark/60
            px-3 py-1.5 shadow-sm shadow-black/5 dark:shadow-black/30
          "
        >
          <TagChip {...tag} />
          <span className="text-xs font-medium text-secondary-light dark:text-secondary-dark">
            {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      ))}
    </>
  );
}

export default TopTags;