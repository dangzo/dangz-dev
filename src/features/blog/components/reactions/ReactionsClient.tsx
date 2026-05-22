'use client';

import { useMemo, useState } from 'react';
import type { ReactionWithEmoji } from '@/features/blog/api/queries/reactions';
import EmojiBtn from './EmojiBtn';

interface ReactionsClientProps {
  postId: string;
  reactions: ReactionWithEmoji[];
}

const ReactionsClient = ({ postId, reactions }: ReactionsClientProps) => {
  const initialCounts = useMemo(
    () => Object.fromEntries(reactions.map((reaction) => [reaction._id, reaction.count ?? 0])),
    [reactions],
  );
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});

  const handleReactionClick = async (reactionId: string) => {
    if (pendingIds[reactionId]) {
      return;
    }

    const currentCount = counts[reactionId] ?? 0;
    const optimisticCount = currentCount + 1;

    setPendingIds((prev) => ({ ...prev, [reactionId]: true }));
    setCounts((prev) => ({ ...prev, [reactionId]: optimisticCount }));

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
        setCounts((prev) => ({ ...prev, [reactionId]: payload.count as number }));
      }
    } catch {
      setCounts((prev) => ({ ...prev, [reactionId]: currentCount }));
    } finally {
      setPendingIds((prev) => ({ ...prev, [reactionId]: false }));
    }
  };

  return (
    <>
      {reactions.map((reaction) => {
        if (!reaction.emoji || !reaction.name) {
          return null;
        }

        const count = counts[reaction._id] ?? 0;

        return (
          <div key={reaction._id} className="flex flex-col items-center gap-0 min-w-16 sm:min-w-20">
            <EmojiBtn
              emoji={reaction.emoji}
              name={reaction.name}
              onClick={() => handleReactionClick(reaction._id)}
              disabled={Boolean(pendingIds[reaction._id])}
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
    </>
  );
};

export default ReactionsClient;