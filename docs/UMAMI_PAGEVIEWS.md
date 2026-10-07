# Umami pageview correctness — issue #186

The application records pageviews for committed pathname/query changes. Umami
still loads once with `lazyOnload`, initializes its history and click handlers,
and delivers pageviews and custom events through its existing collector.
`data-auto-pageview="false"` prevents automatic initial and delayed route views;
`data-exclude-hash="true"` strips fragments from the tracker's event metadata.
Do not disable `data-auto-track`: that also removes reaction/contact click tracking.

## Counting policy

- The script wrapper captures the initial route on hydration, before its lazy
  script request. This preserves that visit if the route observer's Suspense
  boundary hydrates after navigation. Reloading creates a new visit.
- Record each subsequent committed pathname/query change once, with no dwell threshold.
  Article → Blog → article counts three views, including a briefly rendered Blog route.
- Ignore hash-only changes, same-URL observations, effect replay, repeat readiness,
  and refreshes of the current route. A cancelled transition that never commits
  a new route does not count. Returning to a previous route does count.
- Preserve query strings in pageview URLs. This retains existing pageview behavior;
  the separate search-event helper continues to exclude raw search text.
- Capture URL, title, Unix timestamp in seconds, and referrer when observing each
  visit. Never derive a queued visit's URL/referrer from the route at flush time.
- Initial loads and reloads use the browser's `document.referrer`. Subsequent client
  visits, including Back/Forward, use the previous observed route. Strip fragments
  and same-origin referrer origins; preserve external referrers supplied by the browser.
  Browser referrer policy can shorten or omit external referrers.

Before tracker readiness, retain at most 50 visits for 60 seconds in document-scoped
memory. Overflow drops the oldest visit; expiry removes it without rewriting the
referrer chain. Flush remaining visits once in observation order through
`umami.track(callback)`, preserving tracker identity/device metadata. A page unload
loses pending visits. Script failure clears the queue and stops further collection.
No polling, persistent storage, transport retry, or additional tracker is introduced.
The tracker's blocking and opt-out rules remain authoritative.

## Local validation

```sh
yarn test:unit src/utils/pageviewAnalytics.test.ts src/components/analytics/UmamiPageviews.test.tsx src/components/analytics/UmamiScript.test.tsx src/utils/searchAnalytics.test.ts src/features/blog/hooks/useBottomReactionsExposure.test.tsx src/features/blog/components/reactions/Reactions.test.tsx src/features/blog/hooks/useReactions.test.ts
yarn test:e2e:pageviews
yarn lint
yarn typecheck
yarn build
```

When using symlinked worktree dependencies, prefix browser commands with
`NEXT_TURBOPACK_ROOT=/path/to/main-checkout` as described in [WORKFLOW.md](WORKFLOW.md).

The dedicated Playwright configuration starts an isolated fixture server on port
3101. Both `E2E_FIXTURES=true` and `E2E_UMAMI_PAGEVIEWS=true` are required to mount
analytics in development; this mode uses a fictitious website ID. Ordinary E2E
suites omit this mode and keep their existing simulated/injected trackers.
The pageview suite is excluded from the ordinary Playwright configuration.
Run these suites sequentially in one checkout: both fixture servers share
`.next-e2e` output, so different ports do not prevent cache or lock collisions.

Browser tests serve the unmodified [pinned real tracker](../src/test-support/e2e/umami/README.md)
and intercept every collector request, fulfilling it with `{}`. Reaction POSTs
are intercepted too. Script readiness is gated without replacing `window.umami`.
The suite covers initial loads, reloads, external referrers, ToC/hash history,
paced client navigation, route Back/Forward, rapid native history changes through
Next's route hooks, query changes, visits before readiness, both reaction controls,
bottom exposure, search, contact, opt-out, and script blocking. The rapid test
asserts that the intermediate-to-final requests occur less than 300 ms apart,
then waits beyond the captured tracker's delay to catch extra pageviews.

These are **browser request evidence — collector intercepted**, not proof of live
collector delivery or dashboard ingestion. The pinned tracker SHA-256 is
`91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`.
To test an already running local production fixture server, set
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:<port>` when running the dedicated suite;
it then skips starting its development server. Start that server with both fixture
flags above so the website ID remains fictitious.

Local validation on 2026-10-06 used Node 24.15.0, Next 16.3.7, and Playwright
1.62.1 with Chromium. The affected unit suites passed 52 tests. All 10 pageview
browser cases passed against both the development fixture server and a local
optimized production build. The development client-link round trip recorded
the Blog and returning article requests 200 ms apart, with no extra final view.
Lint, frontend type checking, and the production build passed. This evidence
uses fictitious analytics IDs and intercepted collector responses throughout.
The existing contact, search, and bottom-exposure browser suites also passed
all 30 cases in their ordinary isolated tracker mode.

## Deployment verification and completion

Status: implementation and local regression coverage; deployed collector and
owner-dashboard validation remain pending. Do not mark [#186](https://github.com/dangzo/dangz-dev/issues/186)
complete from intercepted browser requests alone. The parent [#168 audit](https://github.com/dangzo/dangz-dev/issues/168)
has separate outstanding dashboard verification.

After deployment, coordinate a 10-minute UTC window with the dashboard owner:

1. Record deployment version, UTC boundaries, browser, deployed tracker capture
   date/SHA-256, and page-total baseline for the window. Fetch the real deployed
   script separately; the cloud script may change independently of this repo.
2. First use fresh contexts with the real script and intercepted collector.
   Record a fixed sequence: initial article, ToC jumps, reload, paced Blog/article,
   rapid Blog/article, Back/Forward, and gated readiness in a separate context.
   Require zero extra hash views and one request per observed route, with the
   expected referrer chain. Rapid navigation must show Blog followed by one final
   article view; distinguish a route that never committed from a brief committed view.
3. Repeat the fixed sequence against the real collector in a fresh context.
   Record pageview/custom-event payloads and HTTP response statuses. Intercept
   reaction mutations as described in [UMAMI_EXPOSURE.md](UMAMI_EXPOSURE.md).
   Verify both reaction placements, bottom exposure, search, and contact delivery,
   and that only one tracker script is loaded per document.
4. Have the owner filter the dashboard to the same UTC window and reconcile
   page-total deltas for the exact paths, separating unrelated traffic. Record
   totals, expected counts, dashboard observation time, and any ingestion lag.
   HTTP 200 and a resolved `track()` promise do not prove dashboard ingestion.

Append deployment evidence here before closing #186. If a PR is created before
dashboard validation, use `Refs #186` and state the remaining checks; use
`Closes #186` only when all acceptance criteria are satisfied. Target GitHub's
current default branch (currently `dev`) and retain `Refs #168` for the broader audit.

References: [Umami configuration](https://docs.umami.is/docs/tracker-configuration),
[tracker functions](https://docs.umami.is/docs/tracker-functions).
