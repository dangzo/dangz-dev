'use client';

import { useEffect, useState } from 'react';
import { Heading } from '@/components/ui';
import type { ReactionWithEmoji } from '@/features/blog/api/queries/reactions';
import EmojiBtn from './EmojiBtn';

interface ReactionsClientProps {
  postId: string;
}

const ReactionsClient = ({ postId }: ReactionsClientProps) => {
  const [reactions, setReactions] = useState<ReactionWithEmoji[] | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isActive = true;

    const loadReactions = async () => {
      try {
        const response = await fetch(`/api/reactions?postId=${encodeURIComponent(postId)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reactions.');
        }

        const payload = await response.json() as { reactions?: ReactionWithEmoji[] };
        if (isActive) {
          setReactions(payload.reactions ?? []);
        }
      } catch {
        if (isActive) {
          setReactions([]);
        }
      }
    };

    loadReactions();

    return () => {
      isActive = false;
    };
  }, [postId]);

  const handleReactionClick = async (reactionId: string) => {
    if (pendingIds[reactionId]) {
      return;
    }

    const currentCount = reactions?.find((reaction) => reaction._id === reactionId)?.count ?? 0;
    const optimisticCount = currentCount + 1;

    setPendingIds((prev) => ({ ...prev, [reactionId]: true }));
    setReactions((prev) => prev?.map((reaction) => (
      reaction._id === reactionId
        ? { ...reaction, count: optimisticCount }
        : reaction
    )) ?? prev);

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          reactionId,
          currentCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction count.');
      }

      const payload = await response.json() as { count?: number };
      if (typeof payload.count === 'number') {
        setReactions((prev) => prev?.map((reaction) => (
          reaction._id === reactionId
            ? { ...reaction, count: payload.count as number }
            : reaction
        )) ?? prev);
      }
    } catch {
      setReactions((prev) => prev?.map((reaction) => (
        reaction._id === reactionId
          ? { ...reaction, count: currentCount }
          : reaction
      )) ?? prev);
    } finally {
      setPendingIds((prev) => ({ ...prev, [reactionId]: false }));
    }
  };

  if (reactions === null) {
    return null;
  }

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

        const count = reaction.count ?? 0;

        return (
          <div key={reaction._id} className="flex flex-col items-center gap-0 min-w-16 sm:min-w-20">
            <EmojiBtn
              emoji={reaction.emoji}
              name={reaction.name}
              onClick={() => handleReactionClick(reaction._id)}
              isPending={Boolean(pendingIds[reaction._id])}
            />
            <span className="text-xs text-secondary-light dark:text-secondary-dark text-center leading-tight">
              {reaction.name}
            </span>
            <span className="text-[11px] text-secondary-light/80 dark:text-secondary-dark/80 text-center leading-tight tabular-nums">
              {count} {count === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ReactionsClient;