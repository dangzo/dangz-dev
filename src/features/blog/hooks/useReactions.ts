'use client';

import { useEffect, useState } from 'react';
import type { ReactionWithEmoji } from '@/features/blog/api/queries/reactions';

export function useReactions(postId: string) {
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

  const reactToPost = async (reactionId: string) => {
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

  return {
    reactions,
    pendingIds,
    reactToPost,
  };
}