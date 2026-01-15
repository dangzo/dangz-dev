import { notFound } from 'next/navigation';
import { query } from '@/api/apollo-client';
import { PostCard } from '@/components/blog/';
import { POST_LIST_QUERY } from '@/api/queries';
import type { Tag } from '@/types/sanity.types';
import type { PostWithTags } from '@/types/Post.types';

const PostList = async ({ tag }: { tag?: string }) => {
  const { data } = await query<{ allPost: PostWithTags[] }>({ query: POST_LIST_QUERY({ limit: 12, offset: 0 }) });
  const posts = data?.allPost;

  if (!posts || posts.length === 0) {
    return notFound();
  }

  const filteredPosts = tag
    ? posts.filter((post) =>
      post.tags?.some(
        (t: Tag) => t.slug?.current?.toLowerCase() === tag.toLowerCase()
      )
    )
    : posts;

  if (tag && filteredPosts?.length === 0) {
    return notFound();
  }

  return (
    <ul className="space-y-6">
      {filteredPosts?.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </ul>
  );
};

export default PostList;
