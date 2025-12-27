import { Link, TagList } from '@/components';

const PostCard = () => {
  return (
    <>
      <li
        className="
          group
          relative overflow-hidden
          pb-4 p-4
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
            bg-linear-to-r from-0% via-50% to-100%
            group-hover:from-white group-hover:via-sky-50/50 group-hover:to-white group-hover:dark:from-gray-950 group-hover:dark:via-sky-900/50 group-hover:dark:to-gray-950
          "
        />
        <div className="flex flex-row relative">
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

export default PostCard;
