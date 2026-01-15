import { DateText, Text, Heading, Link } from '@/components/ui';
import { TagList } from '@/components';
import type { PostWithTags } from '@/types/PostWithTags.types';

const PostCard = ({ post }: { post: PostWithTags }) => {
  return (
    <>
      <li className="relative pb-4 p-4 duration-300  dark:bg-background-secondary-darks">
        <div className="flex flex-row relative">
          <Text className="leading-8 min-w-40 font-bold">
            <DateText date={post.publishedAt} />
          </Text>
          <div>
            <Link
              href={`/blog/${post.slug?.current}`}
              className="text-2xl font-semibold"
            >
              <Heading as="h4" className="inline-block">{post.title}</Heading>
            </Link>

            <TagList className="mt-1" tags={post.tags} />

            <Text className="my-4">
              {post.bodyRaw && post.bodyRaw.length > 0
                ? post.bodyRaw
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
