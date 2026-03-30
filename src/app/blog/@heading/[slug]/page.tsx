import { DateText, Text, Heading } from '@/components/core';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/api/queries/posts';
import { estimateReadingTimeMinutes } from '@/lib/postToc';
import type { PostWithTags } from '@/types/Post.types';
import TagList from '@/components/post-list/TagList';

export default async function BlogSlugHeading({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const post = await getPostBySlug(slug) as PostWithTags | null;

  if (!post) {
    return notFound();
  }

  const readingTimeMinutes = estimateReadingTimeMinutes(post.body as never[] | undefined);
  
  return (
    <>
      <Heading as="h1">
        {post.title || '(Untitled)'}
      </Heading>
      
      <div className="flex flex-row items-center">
        <DateText date={post.publishedAt} className="mb-0!" />

        <span className="mx-2">&bull;</span>

        <Text size="small" className="italic mb-0!">
          {readingTimeMinutes} min read
        </Text>

        <span className="mx-2">&bull;</span>
        
        <TagList tags={post.tags} />
      </div>
    </>
  );
}
