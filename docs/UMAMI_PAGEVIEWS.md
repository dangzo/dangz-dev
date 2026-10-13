# Umami pageview correctness

The observer records committed pathname/query changes. Umami loads once with `lazyOnload`, retaining history/click handlers and collector. `data-auto-pageview="false"` prevents automatic initial/delayed views; `data-exclude-hash="true"` strips fragments. Do not disable `data-auto-track`: it removes delegated click tracking too.

## Counting policy

- Capture the initial route on hydration before the lazy script request, even if the observer's Suspense boundary hydrates after navigation. Reload creates a new visit.
- Count subsequent committed pathname/query changes once, without a dwell threshold. Article → Blog → article counts three, even for brief Blog visits. Cancelled uncommitted transitions do not count.
- Ignore hash-only changes, same-URL observations, effect replay, repeat readiness and current-route refreshes. Returning to a previous route counts.
- Preserve pageview queries; buffered custom events separately sanitize them.
- Capture URL, title, Unix seconds timestamp and referrer on observation, never at flush.
- Initial/reloaded visits use `document.referrer`. Client visits, including Back/Forward, use the previous observed route. Strip fragments/same-origin referrer origins; preserve browser-supplied external referrers, which browser policy can shorten/omit.

The separate document-scoped queue retains 50 visits for 60 seconds, dropping oldest/expired visits without rewriting the referrer chain. Flush in order through `umami.track(callback)`, preserving tracker identity/device metadata. Unload loses pending visits; script failure clears/stops collection. [Shared delivery constraints](ANALYTICS.md#delivery-boundaries) apply.

## Validation

Units: pageviewAnalytics, UmamiPageviews, UmamiScript; add search/reaction/exposure regressions for readiness changes. Run `yarn test:e2e:pageviews` for pageview/discovery integration.

The dedicated configuration starts port 3101 with `E2E_FIXTURES=true` and `E2E_UMAMI_PAGEVIEWS=true` to mount analytics in development with a fictitious website ID. Ordinary suites omit this mode/exclude pageview-discovery specs. Run suites sequentially: both share `.next-e2e`, so ports cannot prevent collisions. [WORKFLOW](WORKFLOW.md) covers worktree overrides.

Tests serve the [pinned tracker](../src/test-support/e2e/umami/README.md), intercept collector/reaction POSTs and gate readiness without replacing `window.umami`. Coverage includes reload/external referrer, hash/ToC, paced/rapid navigation, Back/Forward, native history/query changes, pre-readiness visits, blocking/opt-out and custom-event compatibility. The rapid case requires intermediate/final requests less than 300 ms apart, then waits beyond the captured tracker's delay for duplicates.

Set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:<port>` to reuse a local production fixture server started with both flags to retain the fictitious ID. Intercepted fixture evidence is not live storage evidence.

Follow [production verification](ANALYTICS.md#verification): fixed initial/hash/reload/paced/rapid/Back/Forward/gated sequences, captured referrers, one tracker per document, custom-event compatibility and owner path-total reconciliation. Distinguish uncommitted routes from briefly committed visits. [#186](https://github.com/dangzo/dangz-dev/issues/186) is closed; the [dated receipt](ANALYTICS.md#dated-evidence-receipts) records the retired audit's separate-task evidence limits.
