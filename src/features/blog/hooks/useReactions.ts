'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactionWithEmoji } from '@/features/blog/api/queries/reactions';
import { captureReactionContext, trackReactionEvent, type ReactionPlacement } from '@/utils/reactionAnalytics';

type ReactionsSubscriber = () => void;

const reactionsStore = new Map<string, ReactionWithEmoji[]>();
const reactionsSubscribers = new Map<string, Set<ReactionsSubscriber>>();
const reactionsCleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();
const reactionsMutationVersions = new Map<string, number>();
const reactionsFetchRequestIds = new Map<string, number>();

interface ReactionBatch {
  readonly startingCount: number;
  pending: number;
  succeeded: number;
  confirmedCount?: number;
}

const reactionBatches = new Map<string, Map<string, ReactionBatch>>();

function hasPendingMutations(postId: string): boolean {
  return (reactionBatches.get(postId)?.size ?? 0) > 0;
}

function scheduleReactionsCleanup(postId: string) {
  cancelReactionsCleanup(postId);

  if (reactionsSubscribers.has(postId) || hasPendingMutations(postId)) {
    return;
  }

  reactionsCleanupTimers.set(postId, setTimeout(() => {
    if (!reactionsSubscribers.has(postId) && !hasPendingMutations(postId)) {
      reactionsStore.delete(postId);
      reactionsMutationVersions.delete(postId);
      reactionsFetchRequestIds.delete(postId);
      reactionBatches.delete(postId);
    }

    reactionsCleanupTimers.delete(postId);
  }, 0));
}

function startReaction(postId: string, reactionId: string, currentCount: number): ReactionBatch {
  const batches = reactionBatches.get(postId) ?? new Map<string, ReactionBatch>();
  const batch = batches.get(reactionId) ?? { startingCount: currentCount, pending: 0, succeeded: 0 };
  batch.pending += 1;
  batches.set(reactionId, batch);
  reactionBatches.set(postId, batches);
  publishReactionCount(postId, reactionId, batch);
  return batch;
}

function publishReactionCount(postId: string, reactionId: string, batch: ReactionBatch) {
  // Responses can arrive out of order and may already include another pending increment.
  const count = batch.pending > 0
    ? Math.max(batch.confirmedCount ?? batch.startingCount, batch.startingCount + batch.succeeded + batch.pending)
    : batch.confirmedCount ?? batch.startingCount;
  const reactions = reactionsStore.get(postId);
  markMutation(postId);

  if (reactions) {
    broadcastReactions(postId, reactions.map((reaction) => {
      return reaction._id === reactionId ? { ...reaction, count } : reaction;
    }));
  }
}

function settleReaction(postId: string, reactionId: string, batch: ReactionBatch, count?: number) {
  batch.pending -= 1;

  if (count !== undefined) {
    batch.succeeded += 1;
    batch.confirmedCount = Math.max(batch.confirmedCount ?? count, count);
  }

  publishReactionCount(postId, reactionId, batch);

  if (batch.pending === 0) {
    const batches = reactionBatches.get(postId);
    batches?.delete(reactionId);

    if (batches?.size === 0) {
      reactionBatches.delete(postId);
    }

    scheduleReactionsCleanup(postId);
  }
}

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
      scheduleReactionsCleanup(postId);
    }
  };
}

export function useReactions(postId: string, placement: ReactionPlacement) {
  const reactions = useSyncExternalStore(
    (onStoreChange) => subscribeToReactions(postId, onStoreChange),
    () => reactionsStore.get(postId) ?? null,
    () => reactionsStore.get(postId) ?? null,
  );
  const pendingRequests = useRef(new Set<string>());
  const mounted = useRef(false);
  const [pendingByPost, setPendingByPost] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

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
          && !hasPendingMutations(postId)
          && isLatestFetchRequest(postId, requestId)
          && getMutationVersion(postId) === mutationVersionAtRequest;

        if (canApplyFetchedState) {
          broadcastReactions(postId, payload.reactions ?? []);
        }
      } catch {
        const canApplyFallbackState = isActive
          && !hasPendingMutations(postId)
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
    const requestKey = JSON.stringify([postId, reactionId]);
    if (pendingRequests.current.has(requestKey)) {
      return;
    }

    pendingRequests.current.add(requestKey);
    const currentCount = reactionsStore.get(postId)?.find((reaction) => reaction._id === reactionId)?.count ?? 0;
    const context = captureReactionContext();
    const eventData = { post_id: postId, reaction_id: reactionId, placement };
    const batch = startReaction(postId, reactionId, currentCount);
    setPendingByPost((prev) => ({ ...prev, [postId]: { ...prev[postId], [reactionId]: true } }));

    let confirmedCount: number | undefined;

    trackReactionEvent({ name: 'reaction_attempted', ...eventData }, context);

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, reactionId, currentCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction count.');
      }

      const payload: unknown = await response.json();
      if (typeof payload !== 'object' || payload === null || !('count' in payload)
        || typeof payload.count !== 'number' || !Number.isFinite(payload.count)
        || !Number.isInteger(payload.count) || payload.count < 0) {
        throw new Error('Invalid reaction count response.');
      }

      confirmedCount = payload.count;
      trackReactionEvent({ name: 'reaction_submission_succeeded', ...eventData }, context);
    } catch {
      trackReactionEvent({ name: 'reaction_submission_failed', ...eventData }, context);
    } finally {
      settleReaction(postId, reactionId, batch, confirmedCount);
      pendingRequests.current.delete(requestKey);

      if (mounted.current) {
        setPendingByPost((prev) => ({ ...prev, [postId]: { ...prev[postId], [reactionId]: false } }));
      }
    }
  };

  return {
    reactions,
    pendingIds: pendingByPost[postId] ?? {},
    reactToPost,
  };
}
