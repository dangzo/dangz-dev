import { DateText, Heading } from '@/components/ui';
import { ReadingTimeText, TagList } from '@/components/posts';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/api/queries/posts';
import type { PostWithTags } from '@/types/Post.types';

export default async function BlogSlugHeading({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const post = await getPostBySlug(slug) as PostWithTags | null;

  if (!post) {
    return notFound();
  }

  return (
    <>
      <Heading as="h1">
        {post.title || '(Untitled)'}
      </Heading>
      
      <div className="flex flex-row items-center">
        <DateText date={post.publishedAt} className="mb-0!" />

        <span className="mx-2">&bull;</span>

        <ReadingTimeText postBody={post.body} className='mb-0!' />

        <span className="mx-2">&bull;</span>
        
        <TagList tags={post.tags} />
      </div>
    </>
  );
}
