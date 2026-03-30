import { TagsSidebar } from '@/components/sidebar';
import { getTagsWithCount } from '@/api/queries/tags';

export default async function BlogSidebar() {
  const { tags, tagCount } = await getTagsWithCount();

  return <TagsSidebar tags={tags} tagCount={tagCount} />;
}
