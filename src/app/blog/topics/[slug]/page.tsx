import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { getTopicArchive, getTopicArchivePosts } from '../_archive';

type TopicPageProps = Readonly<{ params: Promise<{ slug: string }> }>;

export const revalidate = 3600;

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [{ topic, basePath }, { topics: publishedTopics }] = await Promise.all([
    getTopicArchive(slug),
    getTopicsWithCount({ publishedOnly: true }),
  ]);
  const isPublished = publishedTopics.some(topic => topic.slug.current === slug && topic.postCount > 0);

  return {
    title: topic.displayName,
    description: topic.description,
    alternates: { canonical: basePath },
    robots: { index: isPublished, follow: true, googleBot: { index: isPublished, follow: true } },
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateStaticParams() {
  const { topics } = await getTopicsWithCount({ publishedOnly: true });

  return topics.filter(topic => topic.postCount > 0).map(topic => ({ slug: topic.slug.current }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const { posts, page, totalPages, basePath } = await getTopicArchivePosts(slug);

  return (
    <PostList posts={posts} pagination={{ currentPage: page, totalPages, basePath }} />
  );
}
