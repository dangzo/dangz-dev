import { Link, Heading } from '@/components/ui';
import type { Tag } from '@/types/sanity.types';
import SidebarMobileToggle from './SidebarMobileToggle';

interface TagsSidebarProps {
  activeSlug?: string;
  tags?: Tag[];
  tagCount?: (slug?: string) => number;
}

async function TagsSidebar({ activeSlug, tags, tagCount }: Readonly<TagsSidebarProps>) {
  const tagsWithPostCount = tags?.map(tag => ({
    ...tag,
    postCount: tagCount?.(tag.slug?.current) ?? 0,
  }));

  const sortedTagsWithCount = tagsWithPostCount
    ?.filter(tag => tag.postCount > 0)
    ?.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

  return (
    <SidebarMobileToggle
      showLabel="Show All tags"
      hideLabel="Hide All tags"
      contentId="tags-sidebar-content"
    >
      <Link href="/blog" isActive={activeSlug === undefined}>
        <Heading as="h3" className="mb-4 text-2xl font-semibold inline-block">
          All tags
        </Heading>
      </Link>

      <ul className="pl-4 list-none space-y-2 sm:space-y-3 text-secondary-light dark:text-secondary-dark">
        {sortedTagsWithCount?.map(tag => (
          <li key={tag._id}>
            <Link
              className="font-semibold tracking-wide uppercase text-sm!"
              type="primary"
              isActive={activeSlug === tag.slug?.current}
              href={`/blog/tags/${tag.slug?.current}`}>{tag.name?.toUpperCase()} ({tag.postCount})
            </Link>
          </li>
        ))}
      </ul>
    </SidebarMobileToggle>
  );
};

export default TagsSidebar;
