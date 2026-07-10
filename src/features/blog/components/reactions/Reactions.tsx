'use client';

import { useState } from 'react';
import { Heading } from '@/components/ui';
import { useReactions } from '@/features/blog/hooks/useReactions';
import Skeleton from 'react-loading-skeleton';
import ScrollToTop from '@/features/blog/components/ScrollToTop';
import EmojiBtn from './EmojiBtn';

export interface ReactionsProps {
  postId: string;
  variant?: 'default' | 'compact';
}

const skeletonKeys = ['one', 'two', 'three', 'four', 'five'] as const;

const variantStyles = {
  default: {
    containerClassName: 'mt-14 sm:mt-20 flex flex-col items-center gap-3',
    reactionsClassName: 'w-full flex flex-wrap items-center gap-3 justify-center border-t border-secondary-light/30 dark:border-secondary-dark/50 pt-8',
    itemClassName: 'flex flex-col items-center gap-1 min-w-16 sm:min-w-20',
    countClassName: 'text-[11px] text-secondary-light/80 dark:text-secondary-dark/80 text-center leading-tight tabular-nums',
    labelClassName: 'text-xs text-secondary-light dark:text-secondary-dark text-center leading-tight',
    buttonSize: 'default' as const,
    showHeading: true,
    showLabel: true,
    showScrollToTop: true,
  },
  compact: {
    containerClassName: 'mt-2 ml-[-12px]',
    reactionsClassName: 'flex w-full flex-wrap items-center w-auto justify-start gap-1.5',
    itemClassName: 'flex items-center gap-1 rounded-full px-1.5 py-0.5',
    countClassName: 'text-[12px] text-secondary-light/70 dark:text-secondary-dark/70 leading-none tabular-nums',
    labelClassName: '',
    buttonSize: 'compact' as const,
    showHeading: false,
    showLabel: false,
    showScrollToTop: false,
  },
} satisfies Record<NonNullable<ReactionsProps['variant']>, {
  containerClassName: string;
  reactionsClassName: string;
  itemClassName: string;
  countClassName: string;
  labelClassName: string;
  buttonSize: 'default' | 'compact';
  showHeading: boolean;
  showLabel: boolean;
  showScrollToTop: boolean;
}>;

const ReactionsSkeleton = ({ variant = 'default' }: Pick<ReactionsProps, 'variant'>) => {
  const styles = variantStyles[variant];

  if (variant === 'compact') {
    return (
      <div
        className={styles.containerClassName}
        aria-label="Reactions loading"
      >
        <div className={styles.reactionsClassName} data-testid="reactions-skeleton">
          {skeletonKeys.map((key) => (
            <Skeleton key={key} width={32} height={22} borderRadius={9999} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-14 sm:mt-20 flex flex-col items-center gap-3"
      aria-label="Reactions loading"
    >
      <ScrollToTop />
      <div
        className="w-full flex flex-col flex-wrap items-center gap-3 justify-center border-t border-secondary-light/30 dark:border-secondary-dark/50 pt-8"
        data-testid="reactions-skeleton"
      >
        <Skeleton width={250} height={18} className="mb-4" />
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {skeletonKeys.map((key) => (
            <div key={key} className="flex flex-col items-center min-w-16 sm:min-w-20">
              <Skeleton circle width={44} height={44} className="mb-2" />
              <Skeleton width={48} height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Reactions = ({ postId, variant = 'default' }: ReactionsProps) => {
  const { reactions, pendingIds, reactToPost } = useReactions(postId);
  const [showCompactZeroCountReactions, setShowCompactZeroCountReactions] = useState(false);
  const styles = variantStyles[variant];
  const hiddenCompactReactionCount = variant === 'compact'
    ? (reactions?.filter((reaction) => {
      if (!reaction.emoji || !reaction.name) {
        return false;
      }

      return (reaction.count ?? 0) === 0;
    }).length ?? 0)
    : 0;

  if (reactions === null) {
    return <ReactionsSkeleton variant={variant} />;
  }

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.containerClassName}
      aria-label="Reactions"
    >
      {styles.showScrollToTop ? <ScrollToTop /> : null}
      <div className={styles.reactionsClassName}>
        {styles.showHeading
          ? (
            <Heading as="h6" className="text-lg font-semibold text-center w-full mb-4">
              How do you find this article?
            </Heading>
          )
          : null}

        {variant === 'compact' && hiddenCompactReactionCount > 0
          ? (
            <button
              type="button"
              className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-accent-light dark:text-accent-dark bg-accent-light/10 dark:bg-accent-dark/10 transition-colors duration-200 ease-out hover:bg-accent-light/20 dark:hover:bg-accent-dark/20"
              onClick={() => setShowCompactZeroCountReactions((prev) => !prev)}
              aria-pressed={showCompactZeroCountReactions}
              aria-label={showCompactZeroCountReactions ? 'Hide extra reactions' : 'Add reaction'}
              title={showCompactZeroCountReactions ? 'Hide extra reactions' : 'Add reaction'}
            >
              <span className="relative inline-flex items-center justify-center rounded-full px-1 py-0 leading-none">
                <span className="text-sm sm:text-xl">♡</span>
                <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-light dark:bg-accent-dark px-1 text-[9px] font-semibold leading-none text-white dark:text-main-dark">
                  +
                </span>
              </span>
              <span className={styles.countClassName}>
                {showCompactZeroCountReactions ? 'Hide' : 'Add'}
              </span>
            </button>
          )
          : null}
        {reactions.map((reaction) => {
          if (!reaction.emoji || !reaction.name) {
            return null;
          }

          const count = reaction.count ?? 0;

          if (variant === 'compact' && count === 0 && !showCompactZeroCountReactions) {
            return null;
          }

          const buttonTitle = variant === 'compact'
            ? `${reaction.name}`
            : undefined;

          return (
            <div key={reaction._id} className={styles.itemClassName}>
              <EmojiBtn
                emoji={reaction.emoji}
                name={reaction.name}
                title={buttonTitle}
                data-umami-event={`Reaction ${reaction.name} Click`}
                onClick={() => reactToPost(reaction._id)}
                isPending={pendingIds[reaction._id] ?? false}
                size={styles.buttonSize}
              />
              {styles.showLabel
                ? (
                  <span className={styles.labelClassName}>
                    {reaction.name}
                  </span>
                )
                : null}
              <span className={styles.countClassName}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reactions;