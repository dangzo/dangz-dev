# Analytics delivery and verification

Feature contracts: [pageviews](UMAMI_PAGEVIEWS.md), [bottom exposure](UMAMI_EXPOSURE.md), [reactions](REACTION_ANALYTICS.md), [search/palette](SEARCH_ANALYTICS.md), [discovery](POST_DISCOVERY_ANALYTICS.md), [contact/résumé](CONTACT_ANALYTICS.md), and [article copying/references](ARTICLE_ANALYTICS.md).

## Delivery boundaries

The production-only Umami script uses `lazyOnload`; `UmamiScript` announces readiness. Analytics must never block navigation, search, copying, downloads, or reactions. Blocking and Umami opt-out remain authoritative; there are no alternate collectors, persistent storage, polling, or application transport retries.

| Path | Retention and metadata |
| --- | --- |
| Search, discovery, heading copies, reaction lifecycle | [Shared transport](../src/utils/analyticsTransport.ts): at most 50 events across features for 60 seconds; overflow drops the oldest. Capture time when enqueuing each event; preserve its source pathname and sanitized referrer through client navigation. Async copies/submissions retain their initiating source context. Readiness flushes once; each event gets at most one tracker invocation. Full document unload loses pending events; script failure clears them and disables collection for the document. |
| Pageviews | Separate document-scoped 50-visit/60-second queue; preserve query-bearing URLs, referrer chain and tracker identity/device metadata. See [counting policy](UMAMI_PAGEVIEWS.md). |
| Bottom exposure | One retained qualifying observation per mounted post visit; leaving the pathname or unmounting discards it. It does not use the shared queue. |
| Contact and article-reference anchors | Umami's delegated listener; clicks before readiness are unbuffered. Native link/download behavior remains authoritative. |

Shared buffered payloads retain only website, hostname, language, screen, sanitized source pathname/referrer, occurrence time, event name and allowlisted custom data. Exclude query strings, fragments, tracker identifiers, arbitrary metadata, raw queries, copied/full destination URLs, email addresses, error messages and personal information. Pageviews preserve query strings, and delegated events inherit Umami source-page metadata that may contain them; the buffered-event privacy policy does not sanitize all tracker metadata.

Queue limits, unloads and blocking cause undercounting and can lose one half of an attempt/outcome pair. A resolved `track()` promise is not a delivery acknowledgement: the tracker can catch transport failures internally. Event activity is not a unique-reader conversion rate. Contact/download/discovery/reference events measure intent; bottom exposure does not establish completed reading.

Ordinary navigation, topics and pagination already have destination pageviews. ToC/About fragments intentionally add none. Scroll depth, code copying, compact disclosure, theme/menu toggles and ScrollToTop remain uninstrumented without a reporting decision.

## Verification

Select affected checks from [WORKFLOW](WORKFLOW.md#validate-the-affected-behavior) and the feature contract. Stubbed tracker tests prove interactions/payload construction. Tests using the [pinned real tracker](../src/test-support/e2e/umami/README.md) with a fictitious website ID and intercepted collector prove browser requests for that captured version. Neither establishes live collection or dashboard ingestion.

For production checks, record deployed revision/version, hostname, UTC window, actual deployed tracker capture date/hash, tested paths and expected event/property counts. Production follows its deployed release, not necessarily the repository default branch. Use fresh contexts and register interception of **every reaction POST before navigation**, including blocked-analytics scenarios. Return simulated success/failure responses locally; simulated successes are not production persistence evidence. A failed/lost real API response may still follow a persisted increment.

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

Use explicit failure responses for failure scenarios; keep GETs available for normal count reads.

Use the real deployed tracker. For timing diagnostics, gate its script request rather than replacing `window.umami`; navigate with `waitUntil: 'domcontentloaded'` to avoid waiting on the gate. Intercept collector requests and label results **browser request evidence — collector intercepted**. Exercise readiness delays, client navigation, repeated activation, script/collector blocking and opt-out alongside each feature's semantics. Check navigation, clipboard contents and PDF downloads independently from analytics.

Send live analytics only in an owner-coordinated window. Use headed Chromium with its default user agent and inspect collector response shapes: HTTP 200 can carry `{"beep":"boop"}` when bot filtering discards headless traffic. Normal tracker-cache issuance and absence of bot-filter/disabled markers supplied acceptance evidence for the dated checks below; the cloud implementation can change. Inspect response classification in memory without logging cache tokens, session values, credentials or raw bodies. Preserve bot filtering.

Record collector responses and owner-dashboard observations separately. Ask the owner to filter the same hostname/UTC window and confirm event counts and expected property breakdowns; distinguish unrelated traffic and note unavailable views or ingestion lag. A status code or pageview is not proof of custom-event storage. Closed issues alone do not establish deployed acceptance.

## Dated evidence receipts

These receipts preserve existing documentation evidence, not a fresh production audit. Detailed retired ledgers and matrices remain recoverable in Git history.

- **2026-10-07 discovery:** release [#213](https://github.com/dangzo/dangz-dev/pull/213), revision `531bcb354770debc35dfc0b4a47c29744bb5882a`, version `26.98.1007`. Headed live responses and owner-confirmed source/placement counts are summarized in [discovery](POST_DISCOVERY_ANALYTICS.md#production-receipt--2026-10-07); evidence [#214](https://github.com/dangzo/dangz-dev/pull/214). The initial headless HTTP-200 run was insufficient; its unclassified responses cannot be retrospectively treated as stored events.
- **2026-10-08 reactions/exposure:** same release/revision; headed Chromium 151 and the actual tracker matching the [fixture hash](../src/test-support/e2e/umami/README.md). Live window `15:04:52.902–15:05:05.198 UTC`, owner filter `15:04:00–15:06:00 UTC`, hostname `dangz.dev`. All **33 custom events** received normal HTTP-200 collector responses: **16 attempts, 10 successes, six failures, one bottom exposure**. Each placement had eight attempts/five successes/three failures. All 16 reaction POSTs were intercepted; the initial pageview was intercepted too. HTTP, network and invalid-count failures were exercised, with no page errors or live reaction writes. Post ID `ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4`, reaction ID `783c1d5e-c4ea-4702-ae4f-3cd4b25a80b2`; exposure carried the same post ID. At `15:07:12 UTC`, the owner confirmed stored totals, both placements and expected properties. No direct dashboard query/screenshot or exact ingestion delay was captured. Evidence originated in retired `UMAMI_AUDIT.md`, [#168](https://github.com/dangzo/dangz-dev/issues/168) / [#191](https://github.com/dangzo/dangz-dev/pull/191).
- The retired audit also reported October 7 pageview and article-copy/reference verification in separate local task documents, without publishing their receipts there. This cleanup does not independently establish those checks or full production contact/search grouping. Search middle-click was subsequently implemented under [#217](https://github.com/dangzo/dangz-dev/issues/217); its historical gap is not a current behavior contract.

Legacy reaction click labels, bottom-exposure names/properties and contact names are mapped in their contracts. Compare across an identified deployment cutoff; do not rewrite history or intentionally emit old and replacement names together. The original audit's HTTP-only October 5 observations were not storage evidence.
