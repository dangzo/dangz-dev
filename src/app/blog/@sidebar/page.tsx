import { TopicNavigation } from '@/features/blog/components';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';

export default async function BlogSidebar() {
  const { topics, totalPostCount } = await getTopicsWithCount();

  return (
    <TopicNavigation topics={topics} totalPostCount={totalPostCount} />
  );
}
