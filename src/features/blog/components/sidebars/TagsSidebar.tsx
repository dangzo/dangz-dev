import { Heading, Link, Text } from '@/components/ui';
import type { Tag } from '@/types/sanity.types';
import SidebarMobileToggle from './SidebarMobileToggle';

interface TagsSidebarProps {
  activeSlug?: string;
  tags?: Tag[];
  tagCount?: (slug?: string) => number;
}

function TagsHeader({ tagCount }: { tagCount: number }) {
  return (
    <>
      <Heading as="h3" className="mb-1! text-lg font-semibold">
        All tags
      </Heading>

      {tagCount > 0 && (
        <Text size="x-small" className="mb-0! uppercase tracking-wider">
          {tagCount} {tagCount === 1 ? 'tag' : 'tags'}
        </Text>
      )}
    </>
  );
}

export default function TagsSidebar({ activeSlug, tags, tagCount }: Readonly<TagsSidebarProps>) {
  const tagsWithPostCount = tags?.map(tag => ({
    ...tag,
    postCount: tagCount?.(tag.slug?.current) ?? 0,
  }));

  const sortedTagsWithCount = tagsWithPostCount
    ?.filter(tag => tag.postCount > 0)
    ?.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

  return (
    <section className="rounded-xl border border-border-light bg-background-secondary-light p-3 dark:border-border-dark dark:bg-background-secondary-dark md:p-5">
      <SidebarMobileToggle
        showLabel="Show All Tags"
        hideLabel="Hide All Tags"
        contentId="tags-sidebar-content"
        header={<TagsHeader tagCount={sortedTagsWithCount?.length ?? 0} />}
      >
        <Link href="/blog" isActive={activeSlug === undefined}>
          <Heading as="h3" className="mb-4 inline-block text-2xl font-semibold">
            All tags
          </Heading>
        </Link>

        <ul className="list-none space-y-2 pl-4 text-secondary-light dark:text-secondary-dark sm:space-y-3">
          {sortedTagsWithCount?.map(tag => (
            <li key={tag._id}>
              <Link
                className="text-sm! font-semibold uppercase tracking-wide"
                type="primary"
                isActive={activeSlug === tag.slug?.current}
                href={`/blog/tags/${tag.slug?.current}`}
              >
                {tag.name?.toUpperCase()} ({tag.postCount})
              </Link>
            </li>
          ))}
        </ul>
      </SidebarMobileToggle>
    </section>
  );
}
