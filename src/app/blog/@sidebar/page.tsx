import { TagsSidebar } from '@/features/blog/components';
import { getTagsWithCount } from '@/features/blog/api/queries/tags';

export default async function BlogSidebar() {
  const { tags, tagCount } = await getTagsWithCount();

  return <TagsSidebar tags={tags} tagCount={tagCount} />;
}
