# Bottom reaction exposure

Retain the first qualifying viewport observation until tracker readiness, then attempt `post_bottom_reactions_reached` with `{ post_id: <Sanity post ID> }` once per mounted post visit. It replaces `Post Bottom Reactions Reached`/`postId`; account for that cutoff in historical reporting.

The hook listens for `umami:ready` and checks an already-loaded tracker. Count updates retain pending exposure. Leaving the captured pathname/unmounting drops it; hash navigation stays within the visit. There is no shared queue, polling, persistence or retry. Exposure is not reading completion. See [delivery/evidence boundaries](ANALYTICS.md).

## Validation

Unit coverage: UmamiScript, useBottomReactionsExposure, Reactions and useReactions. Browser: `yarn test:e2e src/tests/e2e/bottom-reactions-exposure.spec.ts`. Real intersection observation/simulated readiness proves fixture behavior, not live delivery.

For production, follow [shared verification](ANALYTICS.md#verification), intercepting every reaction POST before navigation. Gate the real script; target `page.getByLabel('Article content').getByLabel('Reactions', { exact: true })` because compact controls share the label elsewhere. Allow intersection observation before releasing readiness.

| Scenario | Expected |
| --- | --- |
| Reach while held; scroll away/vote; release within visit | One original-post exposure without re-entry |
| Re-enter after dispatch | No extra exposure |
| Qualify A; navigate/qualify B before readiness; release | Only B exposure |
| Leave A; release on Blog; revisit/qualify A | No stale Blog event; new mounted A visit may emit |
| Block script or opt out | No request; simulated voting remains usable |
| Abort collector; re-enter/vote | One exposure attempt, no retry/error or blocked voting |

Check event/post ID separately from pageviews. [#184](https://github.com/dangzo/dangz-dev/issues/184) is closed; normal collector responses and owner-confirmed stored exposure are in the [October 8 receipt](ANALYTICS.md#dated-evidence-receipts).
