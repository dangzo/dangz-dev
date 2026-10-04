import { Heading } from '@/components/ui';
import { BlogTagline } from '@/features/blog/components';
import { getTopicArchive } from '@/app/blog/topics/_archive';

export default async function TopicHeading({ params }: Readonly<{ params: Promise<{ slug: string; page?: string }> }>) {
  const { slug, page } = await params;
  const { topic } = await getTopicArchive(slug, page);

  return (
    <>
      <Heading as="h1">{topic.displayName}</Heading>
      <BlogTagline description={topic.description} />
      <p className="text-sm text-secondary-light dark:text-secondary-dark">
        {topic.postCount} {topic.postCount === 1 ? 'article' : 'articles'}
      </p>
    </>
  );
}
