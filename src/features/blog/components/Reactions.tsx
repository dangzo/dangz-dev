import { Emoji, Heading } from '@/components/ui';
import { getReactions } from '@/features/blog/api/queries/reactions';

const Reactions = async () => {
  const reactions = await getReactions();

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="mt-14 sm:mt-20 flex flex-wrap items-center gap-3 justify-center" aria-label="Reactions">
      <Heading as="h6" className="text-lg font-semibold text-center w-full mb-4">
        How do you find this article?
      </Heading>
      
      {reactions.map((reaction) => {
        if (!reaction.emoji || !reaction.name) {
          return null;
        }

        return (
          <div key={reaction._id} className="flex flex-col items-center gap-2 min-w-16">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-secondary-light/50 px-3 py-1 text-xl transition-colors hover:bg-secondary-light/10 dark:border-secondary-dark/40 dark:hover:bg-secondary-dark/20 cursor-pointer"
              aria-label={reaction.name}
            >
              <Emoji emoji={reaction.emoji} label={reaction.name} />
            </button>
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