import { Link, Heading } from '@/components/ui';
import { TAGS_WITH_COUNT_QUERY } from '@/api/queries';
import { client } from '@/sanity/client';
import type { TagWithCount } from '@/types/TagWithCount.types';

async function TagsSidebar() {
  const tags = await client.fetch<TagWithCount[]>(TAGS_WITH_COUNT_QUERY);

  return (
    <aside
      className="
        p-4 mb-8 w-full max-w-[256px]
        rounded-md border-2 border-border-light dark:border-border-dark
        bg-background-secondary-light dark:bg-background-secondary-dark
      "
    >
      <Heading as="h4" className="mb-4 text-2xl font-semibold">All tags</Heading>
      <ul className="pl-4 list-none space-y-2.5 text-secondary-light dark:text-secondary-dark text-sm">
        {tags.map(tag => (
          <li key={tag._id}>
            <Link
              className="text-xs font-semibold tracking-wide uppercase"
              type="primary"
              href={`/blog/tags/${tag.slug}`}>{tag.name?.toUpperCase()} ({tag.postCount})
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TagsSidebar;
