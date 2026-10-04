import 'server-only';
import { EDITORIAL_SUMMARIES } from '@/data/blogTopics';
import type { PostWithTopic } from '@/features/blog/types/Post.types';

export { EDITORIAL_SUMMARIES } from '@/data/blogTopics';

export function getEditorialSummary(post: Readonly<Pick<PostWithTopic, '_id' | 'excerpt'>>) {
  if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_EDITORIAL_PREVIEW !== 'true') {
    return post.excerpt;
  }

  const documentId = post._id.replace(/^drafts\./, '');

  return EDITORIAL_SUMMARIES[documentId] ?? post.excerpt;
}
