'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactionWithEmoji } from '@/features/blog/api/queries/reactions';

type ReactionsSubscriber = () => void;

const reactionsStore = new Map<string, ReactionWithEmoji[]>();
const reactionsSubscribers = new Map<string, Set<ReactionsSubscriber>>();
const reactionsCleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();
const reactionsMutationVersions = new Map<string, number>();
const reactionsFetchRequestIds = new Map<string, number>();

function getMutationVersion(postId: string): number {
  return reactionsMutationVersions.get(postId) ?? 0;
}

function markMutation(postId: string): void {
  const nextVersion = getMutationVersion(postId) + 1;
  reactionsMutationVersions.set(postId, nextVersion);
}

function createFetchRequest(postId: string): number {
  const nextRequestId = (reactionsFetchRequestIds.get(postId) ?? 0) + 1;
  reactionsFetchRequestIds.set(postId, nextRequestId);
  return nextRequestId;
}

function isLatestFetchRequest(postId: string, requestId: number): boolean {
  return reactionsFetchRequestIds.get(postId) === requestId;
}

function cancelReactionsCleanup(postId: string) {
  const cleanupTimer = reactionsCleanupTimers.get(postId);
  if (cleanupTimer === undefined) {
    return;
  }

  clearTimeout(cleanupTimer);
  reactionsCleanupTimers.delete(postId);
}

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

function broadcastReactionsMutation(postId: string, reactions: ReactionWithEmoji[]) {
  markMutation(postId);
  broadcastReactions(postId, reactions);
}

function subscribeToReactions(postId: string, subscriber: ReactionsSubscriber) {
  cancelReactionsCleanup(postId);

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
      cancelReactionsCleanup(postId);

      const cleanupTimer = setTimeout(() => {
        if (!reactionsSubscribers.has(postId)) {
          reactionsStore.delete(postId);
          reactionsMutationVersions.delete(postId);
          reactionsFetchRequestIds.delete(postId);
        }

        reactionsCleanupTimers.delete(postId);
      }, 0);

      reactionsCleanupTimers.set(postId, cleanupTimer);
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
    const requestId = createFetchRequest(postId);
    const mutationVersionAtRequest = getMutationVersion(postId);

    const loadReactions = async () => {
      try {
        const response = await fetch(`/api/reactions?postId=${encodeURIComponent(postId)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reactions.');
        }

        const payload = await response.json() as { reactions?: ReactionWithEmoji[] };
        const canApplyFetchedState = isActive
          && isLatestFetchRequest(postId, requestId)
          && getMutationVersion(postId) === mutationVersionAtRequest;

        if (canApplyFetchedState) {
          broadcastReactions(postId, payload.reactions ?? []);
        }
      } catch {
        const canApplyFallbackState = isActive
          && isLatestFetchRequest(postId, requestId)
          && getMutationVersion(postId) === mutationVersionAtRequest;

        if (canApplyFallbackState) {
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

    const currentReactions = reactionsStore.get(postId) ?? reactions;
    const currentCount = currentReactions?.find((reaction) => reaction._id === reactionId)?.count ?? 0;
    const optimisticCount = currentCount + 1;

    setPendingIds((prev) => ({ ...prev, [reactionId]: true }));
    const optimisticReactions = currentReactions?.map((reaction) => (
      reaction._id === reactionId
        ? { ...reaction, count: optimisticCount }
        : reaction
    ));

    if (optimisticReactions) {
      broadcastReactionsMutation(postId, optimisticReactions);
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
          broadcastReactionsMutation(postId, syncedReactions);
        }
      }
    } catch {
      const rolledBackReactions = (reactionsStore.get(postId) ?? reactions)?.map((reaction) => (
        reaction._id === reactionId
          ? { ...reaction, count: currentCount }
          : reaction
      ));

      if (rolledBackReactions) {
        broadcastReactionsMutation(postId, rolledBackReactions);
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