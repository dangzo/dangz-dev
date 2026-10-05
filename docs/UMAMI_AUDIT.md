# Umami event audit — issue #168

Both reaction placements deliver click events to Umami's collector when the tracker is ready. Mouse, Enter, Space, and clicks on the nested emoji all produced HTTP 200 responses. Those events also count ignored clicks during pending requests and failed submissions, so they cannot measure successful reactions.

The audit confirmed a lost bottom-section event before tracker initialization, hash navigation counted as pageviews, and duplicate final-route pageviews during rapid client navigation. Search, Home contact intent, discovery placement, heading-link copying, and article outbound clicks have instrumentation gaps.

**Status: investigation and recommendations recorded; dashboard verification remains pending.** HTTP 200 verifies the collector response, not dashboard ingestion. Every reaction POST was intercepted, so production persistence was deliberately not tested. Keep [#168](https://github.com/dangzo/dangz-dev/issues/168) open until dashboard evidence is added.

## Evidence and limits

- Source: `origin/dev` at `73801d1fad3e1bc429261683d3a44d0c2d42e6b8`; audit branch `docs/168-umami-audit`. GitHub reports `dev` as its default branch; the local `origin/HEAD` pointer to `main` is stale.
- Browser: Playwright 1.61.1, headless Chromium, fresh contexts, desktop viewport 1280 × 900. The preliminary Blog probe used 1280 × 720. Mobile and other browsers were not tested.
- Live deployment: `https://dangz.dev`, footer version `v26.80.1004`. The deployment commit was not independently identified; source and deployed behavior are reported separately.
- Tracker: `https://cloud.umami.is/script.js`, SHA-256 `91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`, fetched on 2026-10-05. Collector: `https://gateway.umami.is/api/send`.
- Main live matrix: **2026-10-05 19:03:34–19:04:38 UTC**. Additional live coverage: **19:06:04–19:06:29 UTC**. Isolated diagnostics: **19:07:53–19:08:07 UTC**, with the collector intercepted.
- Main and coverage runs captured **51 HTTP 200 collector responses**: 22 pageviews, 16 `Reaction Like Click`, four `Post Bottom Reactions Reached`, and one of each of the nine contact/résumé labels. Three additional collector requests were deliberately aborted. The preliminary probe added one Blog pageview outside these totals.
- Sixteen reaction POSTs in the main matrix and two in isolated diagnostics were fulfilled locally. Successful responses returned `{ count: currentCount + 1 }`; failure responses returned HTTP 500. No reaction POST was forwarded to production.
- Contact link default actions were prevented while allowing the real tracker listener to observe activation. These tests prove event delivery, not email sending, outbound destination loading, or PDF download completion.
- One React hydration warning (`#418`) appeared in the navigation/inventory run. The controls rendered and the recorded events completed; the cause was not investigated. Other runs recorded no page errors.

The primary article was `/blog/vue-vapor-mode-how-vue-is-rewriting-its-rendering-engine`, post ID `ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4`. Its tested `Like` reaction ID was `783c1d5e-c4ea-4702-ae4f-3cd4b25a80b2`. Other CMS reaction labels rendered as `Wow`, `Not sure`, `Insightful`, and `Awesome!`; their click delivery was not individually exercised. The second article was `/blog/a-practical-guide-to-web-accessibility-in-react-and-vue-a11y`.

Local, ignored artifacts are under `.tmp/umami-audit/`: `probe.mjs`, `audit.mjs`, the fetched tracker, and `results.json`, `coverage-results.json`, and `diagnostics-results.json`. The committed report contains sanitized findings; browser tokens, tracker cache values, dashboard access URLs, and credentials are excluded.

### Reaction and tracker matrix

All times below are UTC on 2026-10-05. “Reaction requests” means intercepted POSTs, never persisted reactions.

| Scenario | UTC window | Observed analytics | Reaction requests / outcome |
| --- | --- | --- | --- |
| Compact mouse on emoji, Enter, Space | 19:03:39–19:03:42 | One click event per activation; each HTTP 200 | Three simulated successes |
| Compact three clicks while request pending | 19:03:42–19:03:46 | Three click events; each HTTP 200 | One simulated success; two clicks ignored by hook |
| Compact click after completion | 19:03:46–19:03:47 | One click event; HTTP 200 | One simulated success |
| Compact failed submission | 19:03:47–19:03:48 | One click event; HTTP 200; no success/failure event | One simulated HTTP 500; displayed count rolled back |
| Bottom mouse on emoji, Enter, Space | 19:03:48–19:03:52 | One click event per activation; each HTTP 200; one bottom-reached event | Three simulated successes |
| Bottom three clicks while request pending | 19:03:52–19:03:56 | Three click events; each HTTP 200 | One simulated success; two clicks ignored by hook |
| Bottom click after completion | 19:03:56–19:03:57 | One click event; HTTP 200 | One simulated success |
| Bottom failed submission | 19:03:57–19:03:58 | One click event; HTTP 200; no success/failure event | One simulated HTTP 500; displayed count rolled back |
| Re-enter bottom in same mounted article | 19:03:58–19:04:00 | No additional bottom-reached event | None |
| Reach bottom before held tracker loads | 19:04:02–19:04:03 | No event; `window.umami` absent | None |
| Click compact before tracker loads | 19:04:03–19:04:04 | No click event | One simulated success |
| Release tracker and re-enter bottom | 19:04:04–19:04:05 | Initial pageview only; lost events not replayed | None |
| Tracker script blocked, both placements clicked | 19:04:07–19:04:10 | No analytics; no page errors | Two simulated successes |
| Collector unavailable, bottom enter/re-enter | 19:04:12–19:04:15 | One aborted reach request; no retry on re-entry | None |
| Collector unavailable, reaction click | 19:04:15–19:04:16 | One aborted click request; no page error | One simulated success |
| Same reaction clicked across both placements while pending | 19:08:00–19:08:03 | Two click requests, collector intercepted | Two simulated successes; pending state is local to each hook instance |

For each placement in the main matrix, eight click events corresponded to six intercepted POSTs, including one failed POST. The event properties were `{}`; only the automatically collected article URL identified the content. Placement and explicit post/reaction IDs were absent. The reach event included `{ postId }`.

### Navigation, engagement, and discovery

| Interaction | Observation | Reporting consequence |
| --- | --- | --- |
| Article → Blog → another article; browser Back | Pageviews delivered with HTTP 200 | Ordinary client navigation works with the tracker loaded |
| Bottom reached on second article and later revisiting first article | New reach events delivered with the correct post ID | Deduplication is per mounted article visit, not per visitor or session |
| Heading link copied by keyboard | Clipboard contained the expected article URL and heading fragment; no analytics event | Deliberate sharing intent is unmeasured |
| Table-of-contents jump | HTTP 200 pageview for `#2-using-vapor-mode` at 19:06:08.992 | Heading navigation fragments article traffic and inflates pageviews |
| Rapid Home → Blog → original article | Two HTTP 200 pageviews for the original article at 19:06:26.949 and 19:06:27.018; no intervening Blog pageview | Fast route transitions can inflate the final route and omit intermediate attribution |
| Rapid navigation reproduced with collector intercepted | Two final-article requests at 19:07:56.330 and 19:07:56.413 | Repeatable tracker timing behavior, not a duplicate React event handler |
| Same transitions with a one-second pause on Blog | One Blog request and one article request | Timing distinguishes the duplicate case |
| Topic selection and pagination Next | HTTP 200 pageviews for `/blog/topics/accessibility` and `/blog/page/2` | Archive consumption already has pageview coverage |
| Search opened by mouse and Ctrl+K | No event | Search adoption is unmeasured |
| Completed search with four results; successful empty search | No event in either case | Search effectiveness and zero-result rate are unmeasured |
| Search selection by keyboard and mouse | Destination pageview only; mouse diagnostic collector intercepted | Pageviews do not identify search as the selection mechanism |
| Home article selection | Destination pageview only | Source page is available, but title versus CTA placement is unmeasured |
| Home “Say hello” | No custom event; no pageview | A prominent contact action is missing from the contact funnel |
| Accessibility article outbound reference | No custom event; rendered external anchors have no event attributes | Reference engagement is unmeasured; pending route pageviews in the diagnostic window were not outbound events |

The served tracker schedules pageviews using a 300 ms timer and constructs the payload from the current URL when that timer runs. Multiple rapid route changes can therefore report the last URL twice. This explanation is based on inspection of the fetched tracker plus the paced/rapid comparison; it is not a claim about every Umami version.

## Existing event inventory

All named events also carry Umami's default URL, hostname, title, referrer, language, and screen properties. “No custom properties” means an empty event-data object. **Dashboard visibility is unverified for every row.**

| Existing event | Trigger / source | Custom properties | Reporting purpose | Verified delivery |
| --- | --- | --- | --- | --- |
| Automatic pageview | Production root-layout tracker; initial load and client history changes | No event-specific properties | Page popularity, archive consumption, source pages | HTTP 200 for Home, About, Blog, articles, topics, pagination, and Back; hash/rapid-navigation problems above |
| `Reaction {name} Click` | Actual emoji button in compact and bottom controls | None | Reaction click interest by name and article URL | `Like`: HTTP 200 in both placements, mouse/Enter/Space/repeated/failed cases; other names rendered only |
| `Post Bottom Reactions Reached` | Bottom observer; configured threshold 0.25 | `postId` | Exposure to the bottom reaction section | HTTP 200 on both tested articles when ready; lost before tracker readiness |
| `Footer Email Click` | Footer mail icon anchor | None | Footer contact intent | HTTP 200 at 19:04:34–19:04:35 |
| `Footer GitHub Click` | Footer GitHub icon anchor | None | Profile exploration | HTTP 200 at 19:04:35–19:04:36 |
| `Footer LinkedIn Click` | Footer LinkedIn icon anchor | None | Professional profile/contact intent | HTTP 200 at 19:04:36–19:04:37 |
| `About Download Resume Click` | About intro résumé CTA | None | Résumé interest from the intro | HTTP 200 at 19:04:28–19:04:29; download completion untested |
| `About Connect LinkedIn Click` | About intro LinkedIn CTA | None | Professional contact intent from the intro | HTTP 200 at 19:04:29–19:04:30 |
| `Download Resume Click` | About journey résumé CTA | None | Résumé interest from the journey section | HTTP 200 at 19:04:30–19:04:31; download completion untested |
| `About Email Click` | About contact-section email CTA | None | Email contact intent | HTTP 200 at 19:04:31–19:04:32 |
| `About LinkedIn Click` | About contact-section LinkedIn CTA | None | Professional contact intent | HTTP 200 at 19:04:32–19:04:33 |
| `About GitHub Click` | About contact-section GitHub CTA | None | Profile exploration | HTTP 200 at 19:04:33–19:04:34 |

Source entry points: [root tracker](../src/app/layout.tsx), [bottom reactions](../src/features/blog/components/reactions/Reactions.tsx), [compact reactions](../src/features/blog/components/reactions/ReactionsCompact.tsx), [emoji button](../src/features/blog/components/reactions/EmojiBtn.tsx), [reaction hook](../src/features/blog/hooks/useReactions.ts), and [server mutation](../src/features/blog/api/queries/reactions.ts). The hook performs optimistic updates and rollback; the server mutation writes to Sanity's production dataset. Neither path currently sends a submission-outcome event.

## Prioritized recommendations

Use stable `lower_snake_case` names and a small property set. Event names describe one action; placement and reaction names belong in properties. Umami limits event names to 50 characters and supports both attributes and explicit calls; see [event tracking](https://docs.umami.is/docs/track-events) and [tracker functions](https://docs.umami.is/docs/tracker-functions).

Preserve historic labels in reporting notes when switching names; do not emit both legacy and replacement events for the same action. Trackers remain best-effort: blocked analytics must not prevent reactions, search, navigation, or copying. A resolved `umami.track()` promise is not a delivery acknowledgement: the fetched tracker catches fetch failures internally.

| Priority | Reporting question / decision | Proposed event and trigger | Minimal custom properties | Validation |
| --- | --- | --- | --- | --- |
| High | How many visits expose the bottom controls? Decide whether placement limits engagement. | `post_bottom_reactions_reached`, once per mounted post visit after the section has met the visibility threshold and a tracker is available | `post_id` | Hold script until after visibility, then release; exactly one request for the original post; no stale event after navigation; repeat entry sends none |
| High | Which placement produces accepted submissions and successful responses? Distinguish engagement from failed/ignored clicks. | `reaction_attempted` after the pending guard accepts a POST; `reaction_submission_succeeded` after an OK response with a valid count; `reaction_submission_failed` for HTTP/network/invalid-response failures | `post_id`, `reaction_id`, `placement` (`compact`/`bottom`) | Mouse/Enter/Space; ignored pending clicks emit no attempt; each dispatched POST has one attempt and one outcome; failure rollback; both placements do not double-report shared state updates |
| High | Are article popularity and discovery funnels trustworthy? Correct pageview inflation before comparing conversion. | Correct existing automatic pageviews: suppress hash-only pageviews and duplicate final-route events from rapid navigation | No new custom event | ToC/hash change emits no pageview; paced and rapid client transitions, reload and Back retain accurate route views; verify URLs/referrers and dashboard totals |
| Medium | Do readers use search and find articles? Decide whether to improve indexing, result relevance, or entry visibility. | `search_opened` on closed→open; `search_completed` for a successful current, debounced response (including zero results); `search_result_selected` before mouse or keyboard navigation | Open: `method` (`button`/`shortcut`); completion: `query_length`, `result_count`; selection: `post_id`, `result_position` (one-based) | Aborted/stale/failed searches are not counted as successful empty results; mouse and router-driven Enter emit exactly one selection; payloads contain no raw search text |
| Medium | Which contact and résumé placements attract intent? Decide which CTAs to retain or move. | `contact_clicked` on email/LinkedIn activation; `resume_download_clicked` on résumé activation; `outbound_link_clicked` on GitHub/profile activation | Contact: `channel`, `placement`; résumé: `placement`; outbound: `destination_host`, `placement` | Cover Home, About intro/journey/contact, and footer; exactly one event per activation, no legacy double-send; validate real browser download behavior separately |
| Medium | Which article entry points are effective beyond the source page? Decide whether titles, “Read more”, and reaction summaries aid discovery. | `post_opened` when a Home/listing card title, CTA, or reaction-summary link is activated | `post_id`, `source` (`home`/`blog`/`topic`), `placement` (`title`/`cta`/`reaction_summary`) | Validate all rendered link placements, keyboard activation, modified/new-tab clicks, and unchanged client navigation; do not also count search selection as `post_opened` |
| Low | Which sections are worth sharing and which references invite further reading? Inform editorial improvements. | `heading_link_copied` after clipboard write succeeds; `outbound_link_clicked` on article external HTTP(S) reference activation | Copy: `post_id`, `section_id`; article outbound: `post_id`, `destination_host`, `placement` = `article_body` | Clipboard success versus rejection; external reference versus internal/fragment link; nested-element and keyboard clicks; no full destination URL, query string, or heading text |

Explicit search selection tracking must cover [keyboard navigation](../src/hooks/useSearchKeyboardNavigation.ts), which uses `router.push` without clicking the result anchor. Adding only a result-link attribute would miss that path. Likewise, avoid blindly adding Umami attributes to internal Next links: the fetched tracker captures clicks and performs its own location navigation for same-tab tracked anchors. Discovery tracking should preserve Next's navigation and modified-click behavior.

For pageviews, evaluate `data-exclude-hash="true"` first. Address the independently reproduced rapid-navigation problem through the tracker integration or an upstream correction; avoid adding manual pageviews while automatic pageviews are still enabled. Relevant options are documented in [tracker configuration](https://docs.umami.is/docs/tracker-configuration). The installed Next.js Script guide confirms `lazyOnload` waits for idle time after resources load and that load callbacks require a client component; moving the script earlier alone does not establish reliable event delivery.

### Coverage already sufficient or of limited value

- Ordinary Home/Blog/About navigation, topic archives, pagination, and article views already have useful destination pageviews. Add source/placement events only where the property answers a specific discovery question.
- Keep bottom reach as a viewport-exposure proxy, not “article read”, completion, or unique-reader count. A scroll/jump to the section is enough to trigger it.
- Do not add events for every scroll threshold, theme switch, mobile-menu toggle, compact reaction expansion, or ScrollToTop without a concrete reporting decision.
- Do not send keystrokes, raw search queries, copied URLs, email addresses, full outbound URLs, arbitrary error messages, or personal identifiers. Query length and result count support the initial search audit without identifying the searched topic.
- Existing résumé and contact clicks have value but measure intent. Do not label them completed downloads, sent email, or successful contact.

## Reproduce and finish verification

### Browser setup

The normal `yarn test:e2e` configuration starts a development fixture server; Umami is absent because the production-only root-layout condition is false. It cannot establish live collector or dashboard delivery. Use a standalone Playwright browser against `https://dangz.dev`, with a fresh context and the interception below registered **before** creating/navigating pages:

```ts
await context.route('**/api/reactions*', async (route) => {
  const request = route.request();

  if (request.method() === 'POST') {
    const body = request.postDataJSON() as Readonly<{ currentCount: number }>;

    await route.fulfill({ json: { count: body.currentCount + 1 } });
    return;
  }

  await route.continue();
});
```

Record collector request event name, URL, custom properties, UTC time, and response status; omit response cache values and request cache headers. Use `{ status: 500, json: { error: 'Audit simulated failure' } }` for failure scenarios and hold a response for two seconds for pending clicks. The local harness uses Playwright from the main checkout via `createRequire`, so the worktree does not need a dependency installation. From this worktree, the retained local commands are:

```sh
node .tmp/umami-audit/probe.mjs
node .tmp/umami-audit/audit.mjs
node .tmp/umami-audit/audit.mjs coverage
node .tmp/umami-audit/audit.mjs diagnostics
```

These ignored scripts are local evidence artifacts, not repository commands available in a fresh checkout. For portable reproduction, follow the interception snippet and scenarios below. Live matrix reruns add analytics events; record their windows separately. Diagnostics fulfill the collector with `{}` and establish browser request behavior only.

### Reproduction scenarios

1. Open the primary article, wait for both `[aria-label="Reactions"]` sections and `window.umami`. Target the first visible `button[data-umami-event]` in each section. Click its nested emoji, then focus it and press Enter and Space. Compare collector events to intercepted POSTs.
2. Delay the simulated POST for two seconds and click the same button three times while pending. Repeat after completion, then with HTTP 500. Verify count rollback and that existing click events are still sent on failure.
3. Hold `https://cloud.umami.is/script.js` behind a promise. Reach the bottom section and allow the observer to run while `window.umami` is absent. Click compact once, release the script, then re-enter the bottom section. Neither missed event is replayed.
4. Separately abort the script and collector. Check that reactions remain usable and no analytics failure becomes a page error. With the collector aborted, bottom re-entry does not retry the event.
5. Navigate between articles through Blog and use browser Back. Reach the bottom again after revisiting an article; a new mounted visit emits another reach event.
6. Copy a heading link and click a ToC link. Confirm clipboard success produces no custom event and the hash jump produces an extra pageview.
7. Navigate from an article to Blog and immediately click the same article, then repeat with a one-second pause on Blog. Compare rapid duplicate final URLs with the paced Blog/article pair. Intercept the collector when repeating this diagnostic.
8. Open search with the button and shortcut; execute successful nonempty and empty searches; select a result using mouse and ArrowDown/Enter. Review missing custom events independently from the destination pageview.
9. Select a topic, paginate, open an article from Home, click Home contact, and activate all nine existing About/footer event controls. Prevent mail-client/external navigation while testing event delivery. Check article-body external anchors separately from profile links.

### Dashboard handoff

A read-only Umami Share URL has been requested but not supplied. The shared view must include Events, and Realtime/Properties where available; see [Share URL configuration](https://docs.umami.is/docs/enable-share-url). Never interpret access restrictions or the wrong date filter as proof that collection failed.

When access is supplied, select the 2026-10-05 UTC windows above, the production hostname, and the tested article URLs. Verify `Reaction Like Click` and `Post Bottom Reactions Reached`, then the nine contact/résumé names. Inspect the reach `postId` property and the empty custom reaction properties if the view permits it. Account for normal traffic rather than assuming aggregate counts belong exclusively to this audit. If the share view cannot identify the historical events precisely, run a small coordinated new window with reaction writes intercepted and record the new evidence.

Add dashboard observations, filters, and timestamps to this report. If Properties is not available in the shared view, preserve its network-verified status and obtain owner-assisted confirmation for dashboard property visibility. Production reaction persistence remains unverified under the selected audit mode; simulated successes must not be described as database writes.

## Follow-up issues and acceptance

| Priority | Follow-up | Purpose |
| --- | --- | --- |
| High | [#184](https://github.com/dangzo/dangz-dev/issues/184) | Preserve bottom-section observations until tracker readiness |
| High | [#185](https://github.com/dangzo/dangz-dev/issues/185) | Distinguish reaction attempts/outcomes with post and placement identity |
| High | [#186](https://github.com/dangzo/dangz-dev/issues/186) | Correct hash and rapid-navigation pageview inflation |
| Medium | [#187](https://github.com/dangzo/dangz-dev/issues/187) | Measure search adoption and conversion without query text |
| Medium | [#188](https://github.com/dangzo/dangz-dev/issues/188) | Unify contact/résumé events and cover Home CTAs |
| Medium | [#189](https://github.com/dangzo/dangz-dev/issues/189) | Attribute article discovery to source and control placement |
| Low | [#190](https://github.com/dangzo/dangz-dev/issues/190) | Measure successful heading copying and article reference clicks |

| #168 criterion | Status |
| --- | --- |
| Both reaction controls reach Umami; failures documented | Collector responses verified; dashboard confirmation pending |
| Clicks versus successful persistence distinguished | Complete distinction; success/failure responses simulated, production persistence unverified |
| Load timing, navigation, duplicates, unavailable tracker assessed | Complete for the desktop Chromium scenarios above |
| Existing coverage, gaps, and limited-value events inventoried | Complete |
| Prioritized questions, triggers, properties, validation specified | Complete |
| Follow-up issues filed | Complete: #184–#190 |

This change is documentation only. Validate source references, relative links, event names, evidence totals, and whitespace; application regression tests are not required. No instrumentation, routes, public APIs, CMS schemas, or generated files change.
