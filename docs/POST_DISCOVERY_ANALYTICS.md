# Article discovery analytics

Issue [#189](https://github.com/dangzo/dangz-dev/issues/189) measures which article entry points help readers discover content. `post_opened` records link activation intent, including new-tab activation; it does not prove the destination loaded or the article was read.

| Property | Values / meaning |
| --- | --- |
| `post_id` | Selected Sanity post ID |
| `source` | `home`, `blog`, or `topic` |
| `placement` | `title`, `cta`, or `reaction_summary` |

Home currently renders title and reading CTA links. Blog and topic cards additionally render reaction-summary links when positive counts with emoji are available. Paginated Blog and topic listings retain their respective sources. Images, topic navigation, pagination controls, and search results are not discovery targets. Search retains its separate `search_result_selected` event.

## Navigation and delivery

Server-rendered anchors receive typed `data-post-opened-*` attributes. One root client component captures primary `click` and middle-button `auxclick` events, resolves nested content to the anchor, validates metadata, and enqueues the event before Next handles navigation. Native Enter activation follows the click path. The listener never prevents default actions, stops propagation, waits for delivery, or initiates navigation. Cleanup prevents duplicate listeners during effect replay and remounts.

Do not add `data-umami-event` to these internal links: the pinned real tracker cancels ordinary attributed anchor clicks and performs its own location navigation. The discovery attributes are deliberately independent of that automatic handler. Existing Next links, styling, prefetching, and keyboard/new-tab behavior remain authoritative.

Discovery, search, and reaction lifecycle events share `src/utils/analyticsTransport.ts`. The helper reconstructs only the three properties above. The transport captures the source pathname, query-free referrer, and timestamp at activation, and excludes default tracker IDs and arbitrary metadata. Before readiness it retains at most 50 events across these features for 60 seconds; oldest events are dropped on overflow. Client navigation retains the source metadata, while full document unload loses buffered events. Script failure clears the queue and stops collection. There is no persistence, polling, retry, or alternative collector; tracker opt-out remains authoritative. Each queued event receives at most one tracker invocation, which does not guarantee delivery.

Pageviews remain the responsibility of the existing route observer. Discovery never emits a pageview or changes the tracker's automatic-pageview settings.

## Local validation

```sh
yarn test:unit src/utils/postDiscoveryAnalytics.test.ts src/components/analytics/PostDiscoveryAnalytics.test.tsx src/features/home/components/WritingPreview.test.tsx src/features/blog/components/PostCard.test.tsx src/features/blog/components/PostList.test.tsx src/utils/searchAnalytics.test.ts src/utils/reactionAnalytics.test.ts src/components/analytics/UmamiScript.test.tsx
yarn test:e2e:pageviews
yarn test:e2e src/tests/e2e/home.spec.ts src/tests/e2e/blog.spec.ts src/tests/e2e/topics.spec.ts src/tests/e2e/search.spec.ts
yarn lint
yarn typecheck
```

The dedicated integration suite includes `post-discovery.spec.ts` alongside pageview regressions. It uses the existing fictitious website ID, unmodified pinned real tracker, and intercepted collector. It covers every rendered source/placement, paginated listings, nested content, Enter, Control/new-tab and middle-click, delayed readiness, client navigation/document identity, pageview counts, excluded search/topic/pagination controls, script blocking, and opt-out. Unit tests additionally cover Meta/Shift/Alt modifiers, non-navigation buttons, malformed marks, listener cleanup, privacy, expiry, and tracker failures.

Run dedicated and ordinary browser suites sequentially because they share `.next-e2e`. For worktree dependencies, use `NEXT_TURBOPACK_ROOT=/path/to/main-checkout` as described in [WORKFLOW.md](WORKFLOW.md).

Local validation on 2026-10-07 used Node 24.15.0 and Chromium. The eight selected unit suites passed all 46 tests. `yarn test:e2e:pageviews` passed all 30 cases (20 discovery and 10 existing pageview regressions). The selected Home/Blog/topic/search suites passed all 29 cases using `--workers=2`. Browser commands used the documented `NEXT_TURBOPACK_ROOT` override for symlinked worktree dependencies. Lint, frontend type checking, documentation link checks, and `git diff --check` passed.

The dedicated suite establishes **browser request evidence — collector intercepted**, not deployed collector delivery or dashboard ingestion. Ordinary search regressions use the existing simulated tracker. No live analytics or reaction mutations were sent.

## Owner verification and completion

Status: implementation, local validation, deployed browser/collector verification, and owner-dashboard verification passed. The owner confirmed the headed test window's source/placement counts and visible post-ID breakdowns on 2026-10-07. The evidence PR [#214](https://github.com/dangzo/dangz-dev/pull/214) uses `Closes #189` against the repository default branch `dev`. The implementation PR [#208](https://github.com/dangzo/dangz-dev/pull/208) correctly retained `Refs #189` while rollout evidence was pending. The broader [#168 audit](https://github.com/dangzo/dangz-dev/issues/168) remains separate.

After deployment, the owner verifies a coordinated UTC window:

1. Record deployment revision/version, hostname, UTC boundaries, browser, and fetched tracker date/hash. Record expected activations for each rendered source/placement, including paginated routes and a known selected post ID.
2. With the deployed real tracker, check ordinary clicks, nested content, Enter, and modified/new-tab activation. Require one `post_opened` request per activation, exact custom properties, and the original source pathname. Confirm one pageview per committed route and continued client navigation. Record collector HTTP statuses separately from dashboard evidence.
3. In an intercepted diagnostic context, hold and release the script after article selection within 60 seconds; require one buffered event with its original source/time. Block the tracker in a fresh context and verify navigation remains usable. Confirm search, topic navigation, and pagination do not add discovery events. Intercept production reaction POSTs if other controls are exercised.
4. Filter the Umami dashboard to the production hostname and matching UTC window. Inspect `post_opened` event data by `source`, `placement`, and `post_id`; reconcile known activation counts, unrelated traffic, and ingestion lag. Record observation time and counts/property evidence without credentials or dashboard access tokens. If a breakdown is unavailable, leave that criterion pending.

Compare source/placement activity to inform discovery control decisions, accounting for unavailable tracking and buffer limits. These are activation counts, not unique-reader conversion or completed reads. Rollback reverts discovery annotations/listener while preserving independent pageview, search, reaction, and contact analytics.

## Production verification — 2026-10-07

The production release [#213](https://github.com/dangzo/dangz-dev/pull/213) includes discovery implementation #208. Verification used `https://dangz.dev`, production merge revision `531bcb354770debc35dfc0b4a47c29744bb5882a`, footer version `26.98.1007`, Node 24.15.0, and Chromium 151.0.7922.34 on Linux. The actual cloud tracker was fetched during the probes, without replacing `window.umami`; its SHA-256 remained `91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`, matching the pinned integration fixture. Inventory capture began at 22:25:42 UTC.

### Browser diagnostics — collector intercepted

The final 22 scenarios passed during 22:26:55.716–22:28:53.392 UTC:

- Eleven source/placement cases covered Home title/CTA and Blog, paginated Blog, and Architecture topic title/CTA/reaction-summary links. Each activation sent exactly one correctly attributed request with only `post_id`, `source`, and `placement`, retained the source pathname/time, and preserved the original document through Next navigation. Nested headings, spans, and reaction-summary content were exercised.
- Enter, Ctrl-click, middle-click, and Shift-click retained their intended navigation. New-tab/window probes foregrounded the destination before checking its lazy-loaded tracker. Each ready-navigation case produced exactly one source and one destination pageview, with one tracker request per document.
- Delayed readiness flushed one original-source event without duplicates. Blocked script and opt-out produced no analytics while navigation remained usable. Aborted collector requests did not trigger application retries or navigation failures.
- Topic and pagination navigation produced destination pageviews without discovery events. Mouse and keyboard search selection each emitted its separate search event, with no `post_opened` event. Images remained unlinked across all nine inventoried routes.

There are currently no paginated topic archives in the published corpus. That branch remains covered by the existing fixture integration tests; production topic pagination is not claimed as exercised. Two initial probe issues were corrected in the harness: foregrounding a background tab before awaiting lazy tracker readiness, and restricting opt-out initialization to the production origin rather than opaque subframes. No application changes were needed. Final scenarios reported no page errors or reaction POST attempts, and all diagnostic collector requests were intercepted.

### Initial headless HTTP response evidence

The initial matrix ran during **22:29:00.116–22:29:21.324 UTC** (23:29 in Atlantic/Canary). Playwright forwarded each collector request once without transport retries and fulfilled the browser with the actual collector response. All **11 `post_opened` requests and 22 pageviews received HTTP 200**. Each activation retained the same document and produced one discovery event and one destination pageview. No page errors or reaction POST attempts occurred. Response bodies were not classified in this initial run, so these status codes do not establish collection. The owner subsequently reported that `post_opened` was absent from the unfiltered Last 24h event list.

A follow-up headless probe at **22:34:24.800–22:34:26.980 UTC** reproduced the discrepancy: the discovery request and both pageviews returned HTTP 200 with `{"beep":"boop"}`, no cache token, and no disabled flag. The request used the production website ID `546ca232-1b93-4b09-862d-8aebf53123d0` and hostname `dangz.dev`. [Umami's collector source](https://github.com/umami-software/umami/blob/master/src/app/api/send/route.ts) returns this marker when its user-agent bot check discards a request. The probe's user agent contained `HeadlessChrome`. This explains why status-only evidence was insufficient and strongly indicates the original headless run was also discarded; its response bodies were not retained, so individual original responses cannot be retrospectively classified. Do not expect the original 11 requests to appear in the dashboard.

### Headed live collector verification

Verification was repeated with an actual headed Chromium browser, using its default user agent and leaving Umami bot filtering enabled. A single Blog-title probe at **22:35:08.068–22:35:10.254 UTC** returned normal collection responses for one discovery event and two pageviews: HTTP 200, a cache token present, and neither bot-filter nor disabled markers. Only those response-shape booleans were retained; token and session values were not logged.

The full headed matrix then passed during **22:35:34.226–22:35:57.019 UTC**: **11 discovery requests and 22 pageviews**, all HTTP 200 with normal collection response shapes. The harness now rejects bot-filtered or disabled responses and requires a cache token before marking live collection checks passed. Each activation retained the original document, reported exact selected-anchor properties and source metadata, and produced one destination pageview. There were no page errors or reaction POST attempts. The fetched tracker hash was unchanged. Dashboard ingestion remains a separate owner check.

The matrix's request counts and selected post IDs are:

| Source path | `source` | Title | CTA | Reaction summary | Total |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | `home` | 1 | 1 | 0 | 2 |
| `/blog` | `blog` | 1 | 1 | 1 | 3 |
| `/blog/page/2` | `blog` | 1 | 1 | 1 | 3 |
| `/blog/topics/architecture` | `topic` | 1 | 1 | 1 | 3 |
| Total | | 4 | 4 | 3 | 11 |

Expected source totals are `home=2`, `blog=6`, and `topic=3`. The selected post IDs provide a second reconciliation:

| `post_id` | Selected article | Expected events |
| --- | --- | ---: |
| `cecb1ab3-1182-4de2-9955-703b1d0a87cd` | `/blog/software-engineering-in-the-era-of-ai` | 5 |
| `27dd202f-fbfa-4549-b8a1-a9926769bfa6` | `/blog/three-layered-architecture-for-front-end` | 3 |
| `56a36c36-3097-43b2-8244-d5179515a692` | `/blog/monolith-monorepo-or-multi-repo-choosing-the-right-codebase-architecture` | 2 |
| `a3db5c8d-71ec-4480-b59f-2771fa7aa0a7` | `/blog/how-to-structure-a-react-app-in-2026` | 1 |

The topic reaction-summary selection belongs to a different post from its title/CTA selections because the first topic article has no rendered summary. Each request was checked against the activated anchor's own metadata.

### Owner dashboard evidence — verified

The owner reported a Last 24h event list containing bottom exposure, reaction, contact, search-opening, and legacy labels, but no `post_opened`, after the initial headless run. That observation is recorded as a failed dashboard reconciliation for the original run, not a production instrumentation defect. After the headed rerun, the owner confirmed that `post_opened` appeared, then explicitly confirmed all requested source/placement breakdowns matched and `post_id` values were visible. This owner-assisted confirmation was recorded at **2026-10-07 22:39:21 UTC**; the dashboard's exact observation timestamp was not independently captured.

The confirmed dashboard check used the requested `dangz.dev` / `post_opened` test window **22:35:00–22:36:00 UTC** (23:35–23:36 Atlantic/Canary), including the additional Blog-title probe: **12 test events**, `home=2`, `blog=7`, `topic=3`, and `title=5`, `cta=4`, `reaction_summary=3`. Post-ID visibility was confirmed; the per-post count table above remains browser-request evidence rather than an independently supplied dashboard count table. No exact ingestion delay was measured. Normal collector responses and owner dashboard confirmation are separate evidence; together with the production interaction checks, this completes #189's acceptance criteria.

Sanitized request ledgers, inventory, scripts, and the initial harness probes are retained locally under ignored `.tmp/189-production-verification/` in the verification checkout. They contain event names, source paths, selected post IDs, occurrence/request times, response statuses, and safe response-shape markers; tracker cache values, session values, and credentials were not recorded. These are local evidence artifacts, not portable repository test commands. For reproduction in a fresh checkout, follow the owner procedure above and the existing integration spec as the interaction reference. Use a headed browser for collector/dashboard checks and inspect safe response markers, rather than relying on HTTP status alone.
