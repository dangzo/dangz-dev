import { Heading, Text, PostCard } from '@/components';

const TagsSidebar = () => {
  return (
    <aside
      className="
        p-4 mb-8 w-full max-w-[256px]
        rounded-md border-2 border-border-light dark:border-border-dark
        bg-background-secondary-light dark:bg-background-secondary-dark
      "
    >
      <Heading as="h4" className="mb-4 text-2xl font-semibold">All tags</Heading>
      <ul className="list-disc list-inside space-y-2 text-secondary-light dark:text-secondary-dark text-sm">
        <li><Text size="small" className="inline">React (8)</Text></li>
        <li><Text size="small" className="inline">TypeScript (3)</Text></li>
        <li><Text size="small" className="inline">UX/IX (2)</Text></li>
        <li><Text size="small" className="inline">Frontend (5)</Text></li>
      </ul>
    </aside>
  );
}

const PostList = () => {
  return (
    <section className="flex-1">
      <ul className="space-y-6">
        {/* Map through posts and render them here */}
        <PostCard />
        <PostCard />
        {/* More posts... */}
      </ul>
    </section>
  );
}

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
