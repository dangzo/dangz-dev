import { Heading, Text } from '@/components/ui';
import { TagsSidebar, PostList } from '@/components/blog';

export default async function BlogPage() {
  return (
    <article>
      <Heading as="h1" className="text-6xl font-bold mb-8">
        All Posts
      </Heading>
      <Text className="mb-12" size="large">
        Brief description of what I'm writing about in my blog
      </Text>

      <div className="flex flex-row my-10 gap-10">
        <TagsSidebar />
        <PostList />
      </div>
    </article>
  );
}
