# Bottom reaction exposure — #184

The bottom reaction section retains its first qualifying viewport observation until the production Umami script is ready. It then attempts `post_bottom_reactions_reached` with `{ post_id: <Sanity post ID> }` once per mounted post visit. The legacy `Post Bottom Reactions Reached` event and `postId` property are replaced, not emitted alongside the new event; reporting across the rollout must account for both names.

The production-only tracker still uses `lazyOnload`. A client script wrapper emits the internal `umami:ready` notification from Next's `onReady`; the exposure hook also checks for an already loaded tracker. Reaction-count updates do not clear pending exposure. Leaving the captured pathname or unmounting drops it, while hash navigation stays within the visit. There is no polling, persistent queue, alternate collector, or transport retry. Umami's existing blocking and opt-out behavior remains authoritative.

An application dispatch attempt is not server acceptance. The served tracker can resolve its promise after catching a transport error. Browser requests, collector responses, and dashboard visibility must be reported separately.

## Local regression coverage

```sh
yarn test:unit src/components/analytics/UmamiScript.test.tsx src/features/blog/hooks/useBottomReactionsExposure.test.tsx src/features/blog/components/reactions/Reactions.test.tsx src/features/blog/hooks/useReactions.test.ts
yarn test:e2e src/tests/e2e/bottom-reactions-exposure.spec.ts
yarn lint
yarn typecheck
```

The browser suite uses real intersection observation, deterministic article/reaction fixtures, and a simulated tracker readiness signal. It tests delayed readiness after scrolling away and voting, client navigation between mounted post visits, and reaction usability without analytics. It does **not** establish production script loading, collector responses, or dashboard ingestion. The standard fixture server runs in development, where the real tracker is absent.

## Production browser evidence

Run against the updated production deployment. Confirm its deployment identity before starting; do not assume the repository default branch is the production branch. Use fresh browser contexts and record UTC windows, article paths/post IDs, event names/properties, request URLs, response statuses, and page errors. Never record tracker cache headers or response cache values.

Register interception before opening a page:

```ts
await context.route('**/api/reactions*', async (route) => {
  if (route.request().method() === 'POST') {
    const body = route.request().postDataJSON() as Readonly<{ currentCount: number }>;
    await route.fulfill({ json: { count: body.currentCount + 1 } });
    return;
  }

  await route.continue();
});
```

Every reaction POST must be intercepted, including blocked-analytics checks. This tests controls and simulated responses without writing production reactions.

For timing diagnostics, intercept `https://gateway.umami.is/api/send` and fulfill with `{}` while recording request payloads. Label these **browser request evidence — collector intercepted**. Use the real collector only in the coordinated owner-assisted validation window, and separately record response status.

Hold the real script with a gate rather than replacing its contents or assigning `window.umami`:

```ts
let releaseTracker: () => void = () => {};
const trackerGate = new Promise<void>((resolve) => {
  releaseTracker = resolve;
});
await context.route('https://cloud.umami.is/script.js', async (route) => {
  await trackerGate;
  await route.continue();
});
```

Navigate with `waitUntil: 'domcontentloaded'` so the held resource cannot stall the scenario. Target `page.getByLabel('Article content').getByLabel('Reactions', { exact: true })`; compact reactions share the same label elsewhere. Allow intersection observation to run before releasing the gate.

| Scenario | Expected browser evidence |
| --- | --- |
| Reach the bottom with the script held, scroll away, release the gate | Exactly one `post_bottom_reactions_reached` request with the original `post_id` and article URL, without another viewport entry |
| Re-enter the section repeatedly after dispatch | No additional bottom exposure request |
| Reach post A while held, navigate through Blog to post B, qualify B, then release | No A exposure; exactly one B exposure with B's ID and URL |
| Leave A before readiness, release on Blog, return to A and qualify | No stale A event on Blog; the new mounted A visit may emit independently |
| Abort the script, then vote and re-enter | No bottom exposure request or page error; the intercepted vote succeeds |
| Set `localStorage['umami.disabled'] = '1'` before navigation with the real tracker | No collector request; reactions still work; the application does not bypass the opt-out |
| Abort the collector, enter and re-enter the bottom, then vote | One attempted bottom request without application retries; no page error; reactions still work |

Capture actual requests and responses rather than interpreting the return value from `track()`. A normal pageview is not evidence of the custom event.

## Dashboard evidence and completion

Coordinate a small live window with the dashboard owner. Supply the UTC window, production hostname, tested article URL, and expected `post_id`. The owner must confirm `post_bottom_reactions_reached` in Events/Realtime and the matching property where available. Record the filters and observations separately from browser evidence; an unavailable property view needs owner-assisted confirmation.

Production request validation and dashboard confirmation remain pending until the updated deployment is tested. Use `Refs #184` for a partial PR; use `Closes #184` only once all acceptance criteria are satisfied and confirm that the PR targets the repository's current default branch (`dev` at implementation time).
