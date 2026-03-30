import { Link, Heading } from '@/components/core';
import { getTagsWithCount } from '@/api/queries/tags';

async function TagsSidebar({ activeSlug }: { activeSlug?: string }) {
  const { tags, tagCount } = await getTagsWithCount();

  return (
    <>
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
    </>
  );
};

export default TagsSidebar;
