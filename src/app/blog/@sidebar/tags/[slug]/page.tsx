import { getTagsWithCount } from '@/api/queries/tags';
import { TagsSidebar } from '@/components/sidebar';

export default async function BlogSidebar({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;
  const { tags, tagCount } = await getTagsWithCount();
  
  return <TagsSidebar activeSlug={slug} tags={tags} tagCount={tagCount} />;
}
