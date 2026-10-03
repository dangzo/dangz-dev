import { notFound, permanentRedirect } from 'next/navigation';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { getPostList } from '@/features/blog/api/queries/posts';
import { getTotalPages, parsePageParam } from '@/features/blog/utils/pagination';
import { getTopicHref } from '@/features/blog/utils/topics';

export async function getTopicArchive(slug: string, rawPage?: string) {
  const page = rawPage === undefined ? 1 : parsePageParam(rawPage);

  if (page === null) {
    notFound();
  }

  const { topics } = await getTopicsWithCount();
  const topic = topics.find(candidate => candidate.slug.current === slug);

  if (!topic || topic.postCount === 0) {
    notFound();
  }

  const totalPages = getTotalPages(topic.postCount);

  if (page > totalPages) {
    notFound();
  }

  const basePath = getTopicHref(topic);

  if (rawPage !== undefined && page === 1) {
    permanentRedirect(basePath);
  }

  return { topic, page, totalPages, basePath };
}

export async function getTopicArchivePosts(slug: string, rawPage?: string) {
  const archive = await getTopicArchive(slug, rawPage);
  const posts = await getPostList({ topicSlug: slug, page: archive.page });

  if (!posts.length) {
    notFound();
  }

  return { ...archive, posts };
}
