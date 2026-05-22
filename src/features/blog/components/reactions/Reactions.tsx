import { Heading } from '@/components/ui';
import { getReactions } from '@/features/blog/api/queries/reactions';
import EmojiBtn from './EmojiBtn';

const Reactions = async () => {
  const reactions = await getReactions();

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
      
      {reactions.map((reaction) => {
        if (!reaction.emoji || !reaction.name) {
          return null;
        }

        return (
          <div key={reaction._id} className="flex flex-col items-center gap-0 min-w-16 sm:min-w-20">
            <EmojiBtn emoji={reaction.emoji} name={reaction.name} />
            <span className="text-xs text-secondary-light dark:text-secondary-dark text-center leading-tight">
              {reaction.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Reactions;