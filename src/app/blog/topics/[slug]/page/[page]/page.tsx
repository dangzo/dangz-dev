import type { Metadata } from 'next';
import { PostList } from '@/features/blog/components';
import { getTopicArchive, getTopicArchivePosts } from '../../../_archive';

type TopicPageProps = Readonly<{ params: Promise<{ slug: string; page: string }> }>;

export const revalidate = 3600;

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug, page: rawPage } = await params;
  const { topic, page, basePath } = await getTopicArchive(slug, rawPage);

  return {
    title: `${topic.displayName} — Page ${page}`,
    description: topic.description,
    alternates: { canonical: `${basePath}/page/${page}` },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}

export default async function TopicPagedPage({ params }: TopicPageProps) {
  const { slug, page: rawPage } = await params;
  const { posts, page, totalPages, basePath } = await getTopicArchivePosts(slug, rawPage);

  return (
    <PostList posts={posts} pagination={{ currentPage: page, totalPages, basePath }} />
  );
}
