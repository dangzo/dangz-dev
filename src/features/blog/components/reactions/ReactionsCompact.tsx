'use client';

import { useState } from 'react';
import { useReactions } from '@/features/blog/hooks/useReactions';
import Skeleton from 'react-loading-skeleton';
import EmojiBtn from './EmojiBtn';

export interface ReactionsCompactProps {
  postId: string;
}

const skeletonKeys = ['one', 'two', 'three', 'four', 'five'] as const;
const compactCountClassName = 'text-[12px] text-secondary-light/70 dark:text-secondary-dark/70 leading-none tabular-nums';

const ReactionsCompactSkeleton = () => {
  return (
    <div aria-label="Reactions loading">
      <div className="flex w-full flex-wrap items-center justify-start gap-1.5" data-testid="reactions-skeleton">
        {skeletonKeys.map((key) => (
          <Skeleton key={key} width={32} height={22} borderRadius={9999} />
        ))}
      </div>
    </div>
  );
};

interface AddReactionButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const AddReactionButton = ({ isExpanded, onToggle }: Readonly<AddReactionButtonProps>) => {
  const actionLabel = isExpanded ? 'Hide extra reactions' : 'Add reaction';

  return (
    <button
      type="button"
      className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-accent-light dark:text-accent-dark bg-accent-light/10 dark:bg-accent-dark/10 transition-colors duration-200 ease-out hover:bg-accent-light/20 dark:hover:bg-accent-dark/20"
      onClick={onToggle}
      aria-pressed={isExpanded}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <span className="relative inline-flex items-center justify-center rounded-full px-1 py-0 leading-none">
        <span className="text-sm sm:text-xl">♡</span>
        <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-light dark:bg-accent-dark px-1 text-[9px] font-semibold leading-none text-white dark:text-main-dark">
          +
        </span>
      </span>
      <span className={compactCountClassName}>
        {isExpanded ? 'Hide' : 'Add'}
      </span>
    </button>
  );
};

const ReactionsCompact = ({ postId }: Readonly<ReactionsCompactProps>) => {
  const { reactions, pendingIds, reactToPost } = useReactions(postId);
  const [showZeroCountReactions, setShowZeroCountReactions] = useState(false);

  if (reactions === null) {
    return <ReactionsCompactSkeleton />;
  }

  if (reactions.length === 0) {
    return null;
  }

  const hiddenReactionCount = reactions.filter((reaction) => {
    if (!reaction.emoji || !reaction.name) {
      return false;
    }

    return (reaction.count ?? 0) === 0;
  }).length;

  return (
    <div aria-label="Reactions">
      <div className="flex w-full flex-wrap items-center justify-start gap-1.5">
        {hiddenReactionCount > 0
          ? (
            <AddReactionButton
              isExpanded={showZeroCountReactions}
              onToggle={() => setShowZeroCountReactions((prev) => !prev)}
            />
          )
          : null}

        {reactions.map((reaction) => {
          if (!reaction.emoji || !reaction.name) {
            return null;
          }

          const count = reaction.count ?? 0;
          const isZeroCountReaction = count === 0;
          const isZeroCountHidden = isZeroCountReaction && !showZeroCountReactions;
          const visibilityClasses = isZeroCountReaction
            ? [
              'overflow-hidden transition-[opacity,max-width,margin,padding] duration-200 ease-out',
              isZeroCountHidden
                ? 'absolute -z-10 opacity-0 max-w-0 max-h-0 pointer-events-none !px-0 !py-0 !mx-0'
                : 'relative opacity-100 max-w-24 sm:max-w-28',
            ].join(' ')
            : '';

          return (
            <div
              key={reaction._id}
              className={[
                'flex items-center gap-1 rounded-full px-1.5 py-0.5',
                visibilityClasses,
              ].join(' ')}
              aria-hidden={isZeroCountHidden}
            >
              <EmojiBtn
                emoji={reaction.emoji}
                name={reaction.name}
                title={reaction.name}
                data-umami-event={`Reaction ${reaction.name} Click`}
                onClick={() => reactToPost(reaction._id)}
                isPending={pendingIds[reaction._id] ?? false}
                size="compact"
                disabled={isZeroCountHidden}
                tabIndex={isZeroCountHidden ? -1 : undefined}
              />
              <span className={compactCountClassName}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReactionsCompact;
