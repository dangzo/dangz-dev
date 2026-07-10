'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactionWithEmoji } from '@/features/blog/api/queries/reactions';

type ReactionsSubscriber = () => void;

const reactionsStore = new Map<string, ReactionWithEmoji[]>();
const reactionsSubscribers = new Map<string, Set<ReactionsSubscriber>>();

function broadcastReactions(postId: string, reactions: ReactionWithEmoji[]) {
  reactionsStore.set(postId, reactions);

  const subscribers = reactionsSubscribers.get(postId);
  if (!subscribers) {
    return;
  }

  subscribers.forEach((subscriber) => {
    subscriber();
  });
}

function subscribeToReactions(postId: string, subscriber: ReactionsSubscriber) {
  const subscribers = reactionsSubscribers.get(postId) ?? new Set<ReactionsSubscriber>();
  subscribers.add(subscriber);
  reactionsSubscribers.set(postId, subscribers);

  return () => {
    const currentSubscribers = reactionsSubscribers.get(postId);
    if (!currentSubscribers) {
      return;
    }

    currentSubscribers.delete(subscriber);
    if (currentSubscribers.size === 0) {
      reactionsSubscribers.delete(postId);
    }
  };
}

export function useReactions(postId: string) {
  const reactions = useSyncExternalStore(
    (onStoreChange) => subscribeToReactions(postId, onStoreChange),
    () => reactionsStore.get(postId) ?? null,
    () => reactionsStore.get(postId) ?? null,
  );
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
          broadcastReactions(postId, payload.reactions ?? []);
        }
      } catch {
        if (isActive) {
          if (!reactionsStore.has(postId)) {
            broadcastReactions(postId, []);
          }
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
    const optimisticReactions = reactions?.map((reaction) => (
      reaction._id === reactionId
        ? { ...reaction, count: optimisticCount }
        : reaction
    ));

    if (optimisticReactions) {
      broadcastReactions(postId, optimisticReactions);
    }

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
        const syncedReactions = (reactionsStore.get(postId) ?? reactions)?.map((reaction) => (
          reaction._id === reactionId
            ? { ...reaction, count: payload.count as number }
            : reaction
        ));

        if (syncedReactions) {
          broadcastReactions(postId, syncedReactions);
        }
      }
    } catch {
      const rolledBackReactions = (reactionsStore.get(postId) ?? reactions)?.map((reaction) => (
        reaction._id === reactionId
          ? { ...reaction, count: currentCount }
          : reaction
      ));

      if (rolledBackReactions) {
        broadcastReactions(postId, rolledBackReactions);
      }
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