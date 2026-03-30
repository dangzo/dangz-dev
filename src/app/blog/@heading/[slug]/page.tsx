import { DateText, Heading } from '@/components/core';
import { POSTS_BY_SLUG_QUERY } from '@/api/queries';
import { query } from '@/api/apollo-client';
import { notFound } from 'next/navigation';
import type { Post } from '@/types/sanity.types';

export default async function BlogSlugHeading({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const { data } = await query<{ allPost: Post[] }>({ query: POSTS_BY_SLUG_QUERY({ slug }) });
  const post = data?.allPost?.[0];

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
