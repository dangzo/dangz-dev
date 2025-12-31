import { Heading, Text } from '@/components/ui';
import { TagsSidebar } from '@/components/blog';

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
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
        {children}
      </div>
    </article>
  );
}
