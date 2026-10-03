import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { TagsSidebar } from '@/features/blog/components';

export default async function TopicSidebar({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const { topics, totalPostCount } = await getTopicsWithCount();

  return (
    <TagsSidebar activeSlug={slug} topics={topics} totalPostCount={totalPostCount} />
  );
}
