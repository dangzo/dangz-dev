import { PortableText } from 'next-sanity';
import { POSTS_BY_SLUG_QUERY } from '@/api/queries';
import { query } from '@/api/apollo-client';
import { notFound } from 'next/navigation';
import { Img, Text } from '@/components/core';

import type { PostWithTags } from '@/types/Post.types';

async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  const { data } = await query<{ allPost: PostWithTags[] }>({ query: POSTS_BY_SLUG_QUERY({ slug }) });
  const post = data?.allPost?.[0];

  if (!post) {
    return notFound();
  }

  return post;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto p-4">
      <div className="mb-8 rounded-lg overflow-hidden">
        <Img
          source={post.image}
          alt={post.imageAltText}
          className="w-full h-auto object-cover"
          width={700}
          height={350}
        />
      </div>

      {/* Body Content */}
      {post.body && post.body.length > 0 ? (
        <div className="prose dark:prose-invert max-w-none">
          <PortableText value={post.body} />
        </div>
      ) : (
        <Text>
          No content available for this post.
        </Text>
      )}
    </article>
  );
}
