# Reaction submission analytics — #185

Reaction controls emit stable submission lifecycle events instead of the legacy `Reaction {name} Click` labels. Both compact and bottom controls use the initiating request to report outcomes; shared count subscribers emit no events.

| Event | Trigger | Properties |
| --- | --- | --- |
| `reaction_attempted` | The synchronous, per-control pending guard accepts a POST | `post_id`, `reaction_id`, `placement` |
| `reaction_submission_succeeded` | HTTP OK and a finite, nonnegative integer count, including zero | Same properties |
| `reaction_submission_failed` | HTTP, network, malformed JSON, or invalid-count failure | Same properties |

Placement is `compact` or `bottom`. Mouse, Enter, Space, and nested emoji activation use the same submission path. Ignored same-control activations produce no POST or analytics. Different reactions and placements can submit independently. There are no failure reasons, error messages, reaction names, or personal identifiers in event data.

## Optimistic updates and concurrency

Each post/reaction has a shared overlapping-submission group with a starting count, pending/successful totals, and the highest authoritative response count. While pending, the displayed count is the greater of the authoritative count and the starting count plus pending and successful local increments. Failed submissions remove their own optimistic increment; they never restore an unrelated request's starting snapshot. Once all requests settle, the highest authoritative response wins, or the starting count is restored if all failed.

Sanity still receives an atomic increment. A missing or invalid increment-result count fails the API response instead of fabricating `currentCount + 1`. HTTP request and successful response shapes are unchanged. This reconciliation assumes increment-only counts; administrative resets and cross-tab synchronization are outside its scope.

In-flight state survives unmount until settlement. The initiating submission keeps its original post, reaction, placement, source pathname, and sanitized referrer even if navigation or component props change. Stale GET responses cannot overwrite pending mutations. Once no subscribers or submissions remain, the shared state is cleaned up.

A failed or lost response can follow a persisted increment. The failure event reports the observed submission outcome, not proof that the database was unchanged. A later normal fetch can reconcile that uncertainty. Simulated API successes are not production persistence evidence.

## Delivery and privacy

Search, article discovery, and reaction events share the existing in-memory transport: at most 50 events for 60 seconds across these features, dropping the oldest on overflow. Readiness flushes the queue; repeated readiness does not resend events. Each event preserves its individual occurrence time and originating context across client navigation. Full document unload loses pending events.

Payload construction retains only website, hostname, language, screen, sanitized source pathname/referrer, occurrence time, event name, and allowlisted event data. Query strings, fragments, tracker identifiers, arbitrary metadata, and raw errors are excluded.

Analytics never blocks a mutation. Script failure discards the queue and disables collection for the document. Tracker throws/rejections are contained; each event gets at most one tracker invocation. There are no transport retries, persistent storage, alternate collectors, or opt-out bypasses. Queue limits and blocking can lose events or only one half of an attempt/outcome pair, so observed totals need not match perfectly.

`reaction_submission_succeeded` means a valid API response. A resolved tracker promise does not establish collector acceptance or dashboard visibility.

## Validation and rollout

```sh
yarn test:unit src/features/blog/hooks/useReactions.test.ts src/features/blog/hooks/useReactions.lifecycle.test.ts src/features/blog/components/reactions/Reactions.test.tsx src/features/blog/components/reactions/EmojiBtn.test.tsx src/features/blog/api/queries/reactions.test.ts src/utils/reactionAnalytics.test.ts src/utils/searchAnalytics.test.ts src/components/analytics/UmamiScript.test.tsx src/features/blog/hooks/useBottomReactionsExposure.test.tsx
yarn test:e2e src/tests/e2e/reaction-submissions.spec.ts src/tests/e2e/search.spec.ts src/tests/e2e/bottom-reactions-exposure.spec.ts --workers=1
yarn lint
yarn typecheck
```

Development browser tests use fixtures and a simulated tracker. They verify interactions, counts, and constructed payloads; they do not establish production script loading, collector acceptance, dashboard ingestion, or persistence.

After deployment, confirm deployment identity and record hostname, revision, UTC window, tested article path/post ID, event/property counts, collector request bodies, and response statuses. Following [the production interception guidance](UMAMI_EXPOSURE.md#production-browser-evidence), intercept every reaction POST before navigation. Exercise both placements and activation methods, pending clicks, overlapping success/failure, invalid responses, held tracker readiness, blocked script/collector, and Umami opt-out. Keep the real tracker for collector verification; label intercepted collector responses separately.

Obtain owner dashboard observations for the same hostname and UTC window, checking all three event names and their properties. Record dashboard evidence separately from browser collector evidence. Neither proves production reaction persistence when POSTs were simulated. These production checks remain pending until the updated deployment is available.

Historical reporting must keep `Reaction {name} Click` as a click metric before rollout and the new events as submission metrics afterward. Do not combine them into a continuous success total. Record the deployment timestamp; legacy and replacement names are never intentionally emitted together. Related audit #168 remains separate.

Rollback reverts the lifecycle instrumentation, shared transport extraction, concurrency reconciliation, and strict mutation count handling together. Preserve the independent search contracts and bottom-exposure readiness integration.
