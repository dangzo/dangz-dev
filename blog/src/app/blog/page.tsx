import { Link } from '@/components';
import TagList from '@/components/TagList';

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


/**
  bg-background-light dark:bg-background-dark hover:bg-accent-light/4 hover:dark:bg-accent-dark/4
 */
const PostCard = () => {
  return (
    <>
      <li
        className="
          group
          relative overflow-hidden
          flex flex-row pb-4 p-4
          border-2 rounded-md border-border-light hover:border-primary-500/50 dark:border-border-dark dark:hover:border-primary-400/50
          transition-all duration-300  dark:bg-background-secondary-dark
          backdrop-blur-sm
          hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-primary-400/20
        "
      >
        <div
          className="
            absolute
            opacity:0 group-hover:opacity-100 blur-xl
            transition-all duration-300
            -inset-1 h-full w-full
            bg-linear-to-r from-0% via-70% to-100%
            group-hover:from-white group-hover:via-sky-50/50 group-hover:to-white group-hover:dark:from-gray-950 group-hover:dark:via-sky-900/50 group-hover:dark:to-gray-950
          "
        />
        <div className="relative">
          <p className="pt-1 text-secondary-light dark:text-secondary-dark w-48 font-bold">
            January 1, 2024
          </p>
          <div>
            <Link
              href="/post/sample-post"
              className="text-2xl font-semibold text-main-light dark:text-main-dark"
            >
              Sample Post Title
            </Link>
            <TagList className="mt-1" tags={['React', 'TypeScript']} />
            <p className="mt-4 mb-4 text text-secondary-light dark:text-secondary-dark">
              This is a brief excerpt from the sample post to give readers an idea of the content.
            </p>
            <Link href="/post/sample-post" type="accent">
              Read more →
            </Link>
          </div>
        </div>
      </li>
    </>
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
