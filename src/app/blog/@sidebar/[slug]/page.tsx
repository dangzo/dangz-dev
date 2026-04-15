
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/features/blog/api/queries/posts';
import { PostSidebar } from '@/features/blog/components';
import type { PostWithTags } from '@/features/blog/types/Post.types';

export default async function BlogPostSidebar({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const post = await getPostBySlug(slug) as PostWithTags | null;

  if (!post) {
    return notFound();
  }

  return <PostSidebar post={post} />;
}
