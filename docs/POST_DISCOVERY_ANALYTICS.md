# Article discovery analytics

`post_opened` measures activation intent, including new tabs, not destination loading or completed reading.

| Property | Values |
| --- | --- |
| `post_id` | Selected Sanity post ID |
| `source` | `home`, `blog`, `topic`, `article` |
| `placement` | `title`, `cta`, `reaction_summary` |

Home renders title/reading CTA links. Blog/topic cards add reaction-summary links for positive emoji counts; pagination retains the source. Article next-read rows use `source=article`, `placement=title`, selected destination ID and no separate CTA/summary. Ranking/fallback live in [relatedPosts](../src/features/blog/utils/relatedPosts.ts); recommendation reads stay published-only. Contextual body links, images, topic/pagination controls and search are excluded. Search uses `search_result_selected`.

## Navigation and delivery

Server anchors receive typed `data-post-opened-*` attributes. One root listener resolves nested content for primary click/middle `auxclick`, validates metadata and enqueues before Next navigation. Native Enter follows click; cleanup prevents duplicate listeners on replay/remount. Never prevent default/propagation, wait for delivery or initiate navigation from analytics.

Do not add `data-umami-event` to internal Next links: the pinned tracker cancels ordinary attributed clicks and performs its own location navigation. Independent discovery attributes preserve Next links, prefetching and native keyboard/modified/new-tab behavior.

The helper reconstructs only the listed properties and uses the [shared buffer](ANALYTICS.md#delivery-boundaries), retaining activation source context through navigation. Discovery emits no pageview or automatic-pageview setting change.

## Validation

Units: postDiscoveryAnalytics, PostDiscoveryAnalytics, WritingPreview, PostCard, PostList. Run `yarn test:e2e:pageviews` for post-discovery/pageview integration; ordinary Home/Blog/topic/search specs cover affected UI. Run suites sequentially because they share `.next-e2e`; [WORKFLOW](WORKFLOW.md) covers worktree overrides.

The pinned real-tracker suite intercepts collectors with a fictitious ID. It covers source/placement inventory, pagination, nested content, Enter/modified/middle clicks, readiness delays, document identity/pageviews, exclusions, blocking/opt-out. Units cover malformed metadata, modifiers/non-navigation buttons, listener cleanup, privacy, expiry/failure.

For production, follow [shared verification](ANALYTICS.md#verification) with exact anchor metadata, native navigation and owner source/placement/post-ID grouping. Totals are not unique-reader conversion. Rollback removes annotations/listener while preserving other analytics.

## Production receipt — 2026-10-07

Release [#213](https://github.com/dangzo/dangz-dev/pull/213), revision `531bcb354770debc35dfc0b4a47c29744bb5882a`, version `26.98.1007`, hostname `dangz.dev`. Headed Chromium 151 with the actual tracker matching the [fixture hash](../src/test-support/e2e/umami/README.md) produced normal live responses for 11 matrix events plus a Blog-title probe. The owner confirmed **12 stored events**, `home=2`, `blog=7`, `topic=3`; `title=5`, `cta=4`, `reaction_summary=3`, and visible post IDs, for `22:35:00–22:36:00 UTC`. Confirmation was recorded at `22:39:21 UTC`; exact dashboard observation time/ingestion delay and independent per-post dashboard totals were not captured. Browser checks preserved client navigation with no page errors/reaction POSTs. Evidence: [#214](https://github.com/dangzo/dangz-dev/pull/214), issue [#189](https://github.com/dangzo/dangz-dev/issues/189).

Initial headless HTTP-200 responses did not prove storage; a later probe returned the bot-filter marker, leading to [headed-browser response classification](ANALYTICS.md#verification). Production topic pagination was absent and only fixture-tested. This receipt predates `source=article`: local intercepted coverage does **not** establish live collector/dashboard acceptance for that source. Detailed earlier ledgers remain in Git history.
