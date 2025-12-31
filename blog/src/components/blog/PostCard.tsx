import { TagList } from '@/components';
import { Text, Link } from '@/components/ui';
import type { PostWithTags } from '@/types/PostWithTags.types';

const PostCard = ({ post }: { post: PostWithTags }) => {
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
          <Text className="leading-8 min-w-40 font-bold">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
              : '--'}
          </Text>
          <div>
            <Link
              href={`/blog/${post.slug?.current}`}
              className="text-2xl font-semibold"
            >
              {post.title}
            </Link>

            <TagList className="mt-1" tags={post.tags} />

            <Text className="my-4">
              {post.body && post.body.length > 0
                ? post.body
                  .filter((block) => block._type === 'block')
                  .map((block) => block.children?.map((child) => child.text).join(' '))
                  .join(' ')
                  .slice(0, 150) + '...'
                : 'No description available.'}
            </Text>

            <Link href={`/blog/${post.slug?.current}`} type="accent">
              Read more →
            </Link>
          </div>
        </div>
      </li>
    </>
  );
};

export default PostCard;
