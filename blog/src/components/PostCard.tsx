import { Text, Link, TagList } from '@/components';

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
            bg-linear-to-r from-0% via-30% to-180%
            group-hover:from-white group-hover:via-primary-50/80 group-hover:to-white group-hover:dark:from-gray-950 group-hover:dark:via-primary-900/40 group-hover:dark:to-gray-950
          "
        />
        <div className="flex flex-row relative">
          <Text className="leading-8 w-48 font-bold">
            January 1, 2024
          </Text>
          <div>
            <Link
              href="/post/sample-post"
              className="text-2xl font-semibold"
            >
              Sample Post Title
            </Link>
            <TagList className="mt-1" tags={['React', 'TypeScript']} />
            <Text className="my-4">
              This is a brief excerpt from the sample post to give readers an idea of the content.
            </Text>
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
