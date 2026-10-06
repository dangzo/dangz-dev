import { captureAnalyticsContext, enqueueAnalyticsEvent, type AnalyticsContext } from './analyticsTransport';

export type ReactionPlacement = 'compact' | 'bottom';

type ReactionEvent = Readonly<{
  name: 'reaction_attempted' | 'reaction_submission_succeeded' | 'reaction_submission_failed';
  post_id: string;
  reaction_id: string;
  placement: ReactionPlacement;
}>;

export const captureReactionContext = captureAnalyticsContext;

export function trackReactionEvent(event: ReactionEvent, context: AnalyticsContext) {
  enqueueAnalyticsEvent(event.name, {
    post_id: event.post_id,
    reaction_id: event.reaction_id,
    placement: event.placement,
  }, context);
}
