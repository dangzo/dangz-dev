import { Heading } from '@/components/ui';
import { getReactionsForPost } from '@/features/blog/api/queries/reactions';
import ReactionsClient from './ReactionsClient';

interface ReactionsProps {
  postId: string;
}

const Reactions = async ({ postId }: ReactionsProps) => {
  const reactions = await getReactionsForPost(postId);

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-14 sm:mt-20 flex flex-wrap items-center gap-3 justify-center border-t border-secondary-light/30 dark:border-secondary-dark/50 pt-8"
      aria-label="Reactions"
    >
      <Heading as="h6" className="text-lg font-semibold text-center w-full mb-4">
        How do you find this article?
      </Heading>
      
      <ReactionsClient postId={postId} reactions={reactions} />
    </div>
  );
};

export default Reactions;