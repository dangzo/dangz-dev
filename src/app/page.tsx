import TagChip from '@/components/ui/TagChip';
import { Text, Button, Heading } from '@/components/ui';
import { getTagsWithCount } from '@/api/queries/tags';

export default async function HomePage() {
  const { tags, tagCount } = await getTagsWithCount();

  const tagsWithCount = tags?.map(tag => ({
    ...tag,
    postCount: tagCount(tag.slug?.current),
  }));

  const topTags = tagsWithCount
    ?.sort((a, b) => (b.postCount - a.postCount) || (a.name ?? '').localeCompare(b.name ?? ''))
    ?.filter(tag => tag.postCount > 0)
    ?.slice(0, 5);

  return (
    <article>
      <div className="flex justify-center flex-col items-center text-center gap-4 md:gap-6 mt-[calc(8vh)] md:mt-[calc(18vh)] mb-10 md:mb-20 px-4">
        <Heading as="h1" className="text-4xl md:text-5xl lg:text-7xl">
          Hi, I'm Daniele
        </Heading>
        <Text className="max-w-xl" size="large">
          This is where I document my journey on software engineering,
          share insights and write about things I enjoy.
        </Text>

        <Button to="/blog" type="primary" size="large">
          Let's dive in
        </Button>

        <div className="flex flex-row items-center gap-2 md:gap-3 mt-6 md:mt-10 flex-wrap justify-center">
          {topTags && topTags.length > 0
            ? (
              topTags.map(tag => (
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
              ))
            )
            : (
              <Text size="small" className="text-secondary-light dark:text-secondary-dark">
                No tags yet.
              </Text>
            )}
        </div>
      </div>
    </article>
  );
}
