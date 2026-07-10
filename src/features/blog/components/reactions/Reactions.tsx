'use client';

import { useEffect, useRef } from 'react';
import { Heading } from '@/components/ui';
import { useReactions } from '@/features/blog/hooks/useReactions';
import Skeleton from 'react-loading-skeleton';
import ScrollToTop from '@/features/blog/components/ScrollToTop';
import EmojiBtn from './EmojiBtn';

export interface ReactionsProps {
  postId: string;
}

interface UmamiWindow extends Window {
  umami?: {
    track?: (eventName: string, eventData?: Record<string, string>) => void;
  };
}

const skeletonKeys = ['one', 'two', 'three', 'four', 'five'] as const;

const ReactionsSkeleton = () => {
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

const Reactions = ({ postId }: ReactionsProps) => {
  const { reactions, pendingIds, reactToPost } = useReactions(postId);
  const reactionsSectionRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedViewportEventRef = useRef(false);

  useEffect(() => {
    hasTrackedViewportEventRef.current = false;
  }, [postId]);

  useEffect(() => {
    if (reactions === null || reactions.length === 0 || hasTrackedViewportEventRef.current) {
      return;
    }

    const element = reactionsSectionRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);

      if (!isVisible || hasTrackedViewportEventRef.current) {
        return;
      }

      hasTrackedViewportEventRef.current = true;

      const umamiWindow = window as UmamiWindow;
      umamiWindow.umami?.track?.('Post Bottom Reactions Reached', { postId });
      observer.disconnect();
    }, {
      threshold: 0.25,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [postId, reactions]);

  if (reactions === null) {
    return <ReactionsSkeleton />;
  }

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div ref={reactionsSectionRef} className="mt-14 sm:mt-20 flex flex-col items-center gap-3" aria-label="Reactions">
      <ScrollToTop />
      <div className="w-full flex flex-wrap items-center gap-3 justify-center border-t border-secondary-light/30 dark:border-secondary-dark/50 pt-8">
        <Heading as="h6" className="text-lg font-semibold text-center w-full mb-4">
          How do you find this article?
        </Heading>
        {reactions.map((reaction) => {
          if (!reaction.emoji || !reaction.name) {
            return null;
          }

          const count = reaction.count ?? 0;

          return (
            <div key={reaction._id} className="flex flex-col items-center gap-1 min-w-16 sm:min-w-20">
              <EmojiBtn
                emoji={reaction.emoji}
                name={reaction.name}
                data-umami-event={`Reaction ${reaction.name} Click`}
                onClick={() => reactToPost(reaction._id)}
                isPending={pendingIds[reaction._id] ?? false}
                size="default"
              />
              <span className="text-xs text-secondary-light dark:text-secondary-dark text-center leading-tight">
                {reaction.name}
              </span>
              <span className="text-[11px] text-secondary-light/80 dark:text-secondary-dark/80 text-center leading-tight tabular-nums">
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