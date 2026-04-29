import { DateText, Heading } from '@/components/ui';
import { ReadingTimeText, TagList } from '@/features/blog/components';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/features/blog/api/queries/posts';
import type { PostWithTags } from '@/features/blog/types/Post.types';

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
      <Heading as="h1" className="text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6">
        {post.title || '(Untitled)'}
      </Heading>
      
      <div className="flex flex-wrap flex-col sm:flex-row sm:items-center gap-x-1 gap-y-1 text-sm md:text-base">
        <div className="flex flex-row items-center gap-x-1">
          <DateText date={post.publishedAt} className="sm:mb-0!" />
          <span className="mx-2 mb-2 sm:mb-0">&bull;</span>
          <ReadingTimeText postBody={post.body} className='sm:mb-0!' />
        </div>

        <span className="hidden sm:inline mx-2">&bull;</span>
        
        <TagList tags={post.tags} />
      </div>
    </>
  );
}
