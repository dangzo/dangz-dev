import { DateText, Heading } from '@/components/core';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/api/queries/posts';
import type { Post } from '@/types/sanity.types';

export default async function BlogSlugHeading({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const post = await getPostBySlug(slug) as Post | null;

  if (!post) {
    return notFound();
  }

  return (
    <>
      <Heading as="h1">
        {post.title || '(Untitled)'}
      </Heading>
      <DateText date={post.publishedAt || ''} />
    </>
  );
}
