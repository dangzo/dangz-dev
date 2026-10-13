# Reaction submission analytics

Compact and bottom controls report the initiating request's lifecycle. Shared count subscribers emit no events.

| Event | Trigger | Properties |
| --- | --- | --- |
| `reaction_attempted` | Synchronous per-control pending guard accepts a POST | `post_id`, `reaction_id`, `placement=compact` or `bottom` |
| `reaction_submission_succeeded` | HTTP OK with a finite, nonnegative integer count, including zero | Same |
| `reaction_submission_failed` | HTTP/network/malformed JSON/invalid-count failure | Same |

Mouse, Enter, Space and nested emoji activation use one path. Ignored same-control activations produce no POST/event. Different reactions/placements submit independently. Payloads contain no failure reason, error text, reaction name or personal identifier.

## Optimistic updates and concurrency

Each post/reaction shares an overlapping-submission group with starting count, pending/successful totals and highest authoritative response count. While pending, display the greater of the authoritative count and starting count plus pending/successful local increments. Failure removes its own increment, never another request's starting snapshot. After settlement, highest authoritative count wins, or starting count returns if all failed.

Sanity receives an atomic increment. Invalid/missing result counts fail the API rather than fabricating `currentCount + 1`; request and successful-response shapes remain unchanged. Reconciliation assumes increment-only counts; administrative resets/cross-tab synchronization are outside scope.

In-flight state survives unmount until settlement. Each initiating request retains post/reaction/placement/source context across navigation/prop changes. Stale GETs cannot overwrite pending mutations. Remove shared state once no subscribers/submissions remain.

A failed/lost response can follow a persisted increment. Failure describes the observed response, not an unchanged database; later fetches reconcile uncertainty. Simulated successes do not prove persistence. Valid API responses/resolved tracker promises also do not establish collector/dashboard acceptance. Use the [shared buffered transport](ANALYTICS.md#delivery-boundaries).

## Validation and reporting

Unit coverage is beside useReactions (including lifecycle), Reactions, EmojiBtn, reaction queries and reactionAnalytics. Browser: `yarn test:e2e src/tests/e2e/reaction-submissions.spec.ts`; add search/exposure regressions when shared transport/readiness changes. Development fixtures use simulated trackers.

Follow [production verification](ANALYTICS.md#verification) with every POST intercepted: both placements, pending repeats, overlapping submissions, valid/invalid responses, readiness delays, blocking and opt-out. The [October 8 receipt](ANALYTICS.md#dated-evidence-receipts) preserves normal live collector responses/owner-confirmed properties for [#185](https://github.com/dangzo/dangz-dev/issues/185), excluding production persistence.

Legacy `Reaction {name} Click` measured clicks; replacements measure submissions. Do not combine into continuous success totals or emit both families together. Rollback reverts instrumentation, transport extraction, reconciliation and strict count handling together, preserving independent search/exposure contracts.
