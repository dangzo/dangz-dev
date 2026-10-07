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

Status: implementation, local validation, and deployed browser/collector verification passed; owner-dashboard verification remains pending. Keep #189 open until its dashboard acceptance criterion has evidence. The implementation PR [#208](https://github.com/dangzo/dangz-dev/pull/208) uses `Refs #189` and `Refs #168`, stating what remains; use `Closes #189` only after all acceptance criteria are satisfied. The broader [#168 audit](https://github.com/dangzo/dangz-dev/issues/168) remains separate.

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

### Live collector evidence

The bounded live matrix ran during **22:29:00.116–22:29:21.324 UTC** (23:29 in Atlantic/Canary). Playwright forwarded each collector request once without transport retries and fulfilled the browser with the actual collector response. All **11 `post_opened` requests and 22 pageviews received HTTP 200**. Each activation retained the same document and produced one discovery event and one destination pageview. No page errors or reaction POST attempts occurred.

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

### Owner dashboard evidence — pending

Filter the production hostname `dangz.dev`, event `post_opened`, and the live UTC window above. If the dashboard supports only minute precision, use **22:29:00–22:30:00 UTC** and account for unrelated traffic. Confirm totals and property visibility by `source`, `placement`, and `post_id` against both tables. Record the dashboard observation time, timezone, filters, counts, and any ingestion lag or additional traffic. HTTP 200 establishes collector response evidence, not dashboard ingestion. Keep #189 open until this owner-assisted check is recorded.

Sanitized request ledgers, inventory, scripts, and the initial harness probes are retained locally under ignored `.tmp/189-production-verification/` in the verification checkout. They contain event names, source paths, selected post IDs, occurrence/request times, and response statuses; tracker cache values and credentials were not recorded. These are local evidence artifacts, not portable repository test commands. For reproduction in a fresh checkout, follow the owner procedure above and the existing integration spec as the interaction reference.
