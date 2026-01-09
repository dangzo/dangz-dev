import { Link, Heading } from '@/components/ui';
import { TAGS_WITH_COUNT_QUERY } from '@/api/queries';
import { query } from '@/api/apollo-client';
import type { TagWithCount } from '@/types/TagWithCount.types';
import type { PostTags } from '@/types/PostTags.types';

async function TagsSidebar({ activeSlug }: { activeSlug?: string }) {
  const { data } = await query<{ allTag: TagWithCount[], allPost: PostTags[] }>({ query: TAGS_WITH_COUNT_QUERY });
  const { allTag: tags, allPost: postTags } = data ?? {};

  const tagCount = (slug?: string) => {
    return postTags?.filter(pt => pt?.tags?.some(t => t.slug?.current === slug)).length ?? 0;
  };

  return (
    <aside className="p-4 pt-8 mb-8 w-full min-h-72 max-w-[256px] border-border-light border-r">
      <Link href="/blog" isActive={activeSlug === undefined}>
        <Heading as="h4" className="mb-4 text-2xl font-semibold inline-block">
          All tags
        </Heading>
      </Link>

      <ul className="pl-4 list-none space-y-2.5 text-secondary-light dark:text-secondary-dark text-sm">
        {tags?.map(tag => (
          <li key={tag._id}>
            <Link
              className="text-xs font-semibold tracking-wide uppercase"
              type="primary"
              isActive={activeSlug === tag.slug?.current}
              href={`/blog/tags/${tag.slug?.current}`}>{tag.name?.toUpperCase()} ({tagCount(tag.slug?.current)})
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TagsSidebar;
