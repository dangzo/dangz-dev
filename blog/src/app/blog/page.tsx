import { PostCard } from '@/components';

const TagsSidebar = () => {
  return (
    <aside
      className="
        p-4 mb-8 w-full max-w-[256px]
        rounded-md border-2 border-border-light dark:border-border-dark
        bg-background-secondary-light dark:bg-background-secondary-dark
      "
    >
      <h2 className="mb-4 text-2xl font-semibold">All tags</h2>
      <ul className="list-disc list-inside space-y-2 text-secondary-light dark:text-secondary-dark text-sm">
        <li>React (8)</li>
        <li>TypeScript (3)</li>
        <li>UX/IX (2)</li>
        <li>Frontend (5)</li>
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
      <h1 className="text-6xl font-bold mb-8">
        All Posts
      </h1>
      <p className="text-secondary-light dark:text-secondary-dark mb-12 text-lg">
        Brief description of what I'm writing about in my blog
      </p>

      <div className="flex flex-row my-10 gap-10">
        <TagsSidebar />
        <PostList />
      </div>
    </article>
  );
}
