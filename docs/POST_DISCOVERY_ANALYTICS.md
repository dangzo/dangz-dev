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

Status: implementation and local validation; production collector and owner-dashboard verification remain pending. Keep #189 open until its dashboard acceptance criterion has evidence. An earlier implementation PR uses `Refs #189` and `Refs #168`, stating what remains; use `Closes #189` only after all acceptance criteria are satisfied. The broader [#168 audit](https://github.com/dangzo/dangz-dev/issues/168) remains separate.

After deployment, the owner verifies a coordinated UTC window:

1. Record deployment revision/version, hostname, UTC boundaries, browser, and fetched tracker date/hash. Record expected activations for each rendered source/placement, including paginated routes and a known selected post ID.
2. With the deployed real tracker, check ordinary clicks, nested content, Enter, and modified/new-tab activation. Require one `post_opened` request per activation, exact custom properties, and the original source pathname. Confirm one pageview per committed route and continued client navigation. Record collector HTTP statuses separately from dashboard evidence.
3. In an intercepted diagnostic context, hold and release the script after article selection within 60 seconds; require one buffered event with its original source/time. Block the tracker in a fresh context and verify navigation remains usable. Confirm search, topic navigation, and pagination do not add discovery events. Intercept production reaction POSTs if other controls are exercised.
4. Filter the Umami dashboard to the production hostname and matching UTC window. Inspect `post_opened` event data by `source`, `placement`, and `post_id`; reconcile known activation counts, unrelated traffic, and ingestion lag. Record observation time and counts/property evidence without credentials or dashboard access tokens. If a breakdown is unavailable, leave that criterion pending.

Compare source/placement activity to inform discovery control decisions, accounting for unavailable tracking and buffer limits. These are activation counts, not unique-reader conversion or completed reads. Rollback reverts discovery annotations/listener while preserving independent pageview, search, reaction, and contact analytics.
