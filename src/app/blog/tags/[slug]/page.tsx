import { notFound, permanentRedirect } from 'next/navigation';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { resolveLegacyTagRedirect } from '@/features/blog/utils/topics';

export default async function LegacyTagPage({ params }: Readonly<{ params: Promise<{ slug: string; page?: string }> }>) {
  const { slug, page } = await params;
  const { topics, totalPostCount } = await getTopicsWithCount({ publishedOnly: true });
  const counts = { ...Object.fromEntries(topics.map(topic => [topic.slug.current, topic.postCount])), all: totalPostCount };
  const destination = resolveLegacyTagRedirect(slug, page, counts);

  if (!destination) {
    notFound();
  }

  permanentRedirect(destination);
}
