import { client } from '@/sanity/client';
import { PostCard } from '@/components/blog/';
import { POST_LIST_QUERY } from '@/api/queries';
import type { PostWithTags } from '@/types/PostWithTags.types';

const options = { next: { revalidate: 30 } };

const PostList = async ({ tag }: { tag?: string }) => {
  const posts = await client.fetch<PostWithTags[]>(POST_LIST_QUERY(tag), {}, options);

  return (
    <section className="flex-1">
      <ul className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </ul>
    </section>
  );
};

export default PostList;
