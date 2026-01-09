import { Text, Button, Heading } from '@/components/ui';
import TagChip from '@/components/ui/TagChip';
import { TAGS_WITH_COUNT_QUERY } from '@/api/queries';
import { query } from '@/api/apollo-client';
import type { TagWithCount } from '@/types/TagWithCount.types';
import type { PostTags } from '@/types/PostTags.types';

export default async function HomePage() {
  const { data } = await query<{ allTag: TagWithCount[]; allPost: PostTags[] }>({ query: TAGS_WITH_COUNT_QUERY });

  const tags = data?.allTag ?? [];
  const posts = data?.allPost ?? [];

  const tagsWithCount = tags.map(tag => ({
    ...tag,
    postCount: posts.filter(pt => pt?.tags?.some(t => t.slug?.current === tag.slug?.current)).length,
  }));

  const topTags = tagsWithCount
    .sort((a, b) => (b.postCount - a.postCount) || (a.name ?? '').localeCompare(b.name ?? ''))
    .slice(0, 5);

  return (
    <article>
      <div className="flex justify-center flex-col items-center text-center gap-6 mt-[calc(20vh)] mb-20 px-4">
        <Heading as="h1" className="text-7xl">
          Hi, I'm Daniele
        </Heading>
        <Text className="max-w-xl text-xl text-gray-600 dark:text-gray-300">
          This is where I document my journey on software engineering, share insights and write about things I enjoy.
        </Text>

        <div>
          <Button to="/blog" type="primary" size="large">
            Let's dive in
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3 mt-10">
          <div className="flex flex-wrap justify-center gap-3">
            {topTags.length > 0 ? (
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
            ) : (
              <Text className="text-sm text-secondary-light dark:text-secondary-dark">
                No tags yet.
              </Text>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
