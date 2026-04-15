import { getTagsWithCount } from '@/features/blog/api/queries/tags';
import { TagsSidebar } from '@/features/blog/components';

export default async function BlogSidebar({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;
  const { tags, tagCount } = await getTagsWithCount();
  
  return <TagsSidebar activeSlug={slug} tags={tags} tagCount={tagCount} />;
}
