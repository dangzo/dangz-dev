# Umami event audit — issue #168

The original audit identified reaction click overcounting, lost bottom exposure before tracker readiness, pageview attribution defects, and valuable search/contact/discovery/article measurement gaps. Follow-ups #184–#190 are now closed and their instrumentation is present. The refreshed inventory and production diagnostics below describe the current deployment separately from the historical findings.

**Current status: browser diagnostics and normal live collector responses passed on 2026-10-08; owner-dashboard verification remains pending.** The audit remains open until both reaction placements and their properties are reconciled with stored events. A new, confirmed search middle-click gap is tracked in [#217](https://github.com/dangzo/dangz-dev/issues/217).

Every reaction POST is intercepted throughout this audit. Successful API responses are simulated; production persistence is untested. A failure response is not proof that a real mutation would leave the database unchanged. Neither HTTP 200 nor a resolved tracker promise proves ingestion.

## Historical findings — 2026-10-05

The original headless Chromium run recorded HTTP 200 collector responses for both reaction placements, including mouse, Enter, Space, and nested emoji activation. These responses do **not** establish event storage. Later headed-browser verification for [#189](POST_DISCOVERY_ANALYTICS.md#production-verification--2026-10-07) demonstrated that Umami can return HTTP 200 with `{"beep":"boop"}` while discarding headless traffic. The original run did not retain response-shape classification, so its individual requests cannot retrospectively be classified. Its dashboard visibility remains unverified; the refreshed window below supplies independent current evidence.

Historical click events counted ignored pending clicks and failed submissions. They measured activation, not successful reactions. The historical inventory and recommendations below refer to that deployment, not the replacement event contracts now in production.

## Evidence and limits

- Source: `origin/dev` at `73801d1fad3e1bc429261683d3a44d0c2d42e6b8`; audit branch `docs/168-umami-audit`. GitHub reports `dev` as its default branch; the local `origin/HEAD` pointer to `main` is stale.
- Browser: installed Playwright 1.62.1, headless Chromium, fresh contexts, desktop viewport 1280 × 900. The preliminary Blog probe used 1280 × 720. Mobile and other browsers were not tested.
- Live deployment: `https://dangz.dev`, footer version `v26.80.1004`. The deployment commit was not independently identified; source and deployed behavior are reported separately.
- Tracker: `https://cloud.umami.is/script.js`, SHA-256 `91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`, fetched on 2026-10-05. Collector: `https://gateway.umami.is/api/send`.
- Main live matrix: **2026-10-05 19:03:34–19:04:38 UTC**. Additional live coverage: **19:06:04–19:06:29 UTC**. Isolated diagnostics: **19:07:53–19:08:07 UTC**, with the collector intercepted.
- Main and coverage runs captured **51 HTTP 200 collector responses**: 22 pageviews, 16 `Reaction Like Click`, four `Post Bottom Reactions Reached`, and one of each of the nine contact/résumé labels. Three additional collector requests were deliberately aborted. The preliminary probe added one Blog pageview outside these totals.
- Sixteen reaction POSTs in the main matrix and two in isolated diagnostics were fulfilled locally. Successful responses returned `{ count: currentCount + 1 }`; failure responses returned HTTP 500. No reaction POST was forwarded to production.
- Contact link default actions were prevented while allowing the real tracker listener to observe activation. These tests establish request/response behavior, not event storage, email sending, outbound destination loading, or PDF download completion.
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

## Historical event inventory

All named events also carry Umami's default URL, hostname, title, referrer, language, and screen properties. “No custom properties” means an empty event-data object. **Dashboard visibility is unverified for every row.**

| Historical event | Trigger / source | Custom properties | Reporting purpose | Browser response evidence |
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

Source entry points: [root tracker](../src/app/layout.tsx), [bottom reactions](../src/features/blog/components/reactions/Reactions.tsx), [compact reactions](../src/features/blog/components/reactions/ReactionsCompact.tsx), [emoji button](../src/features/blog/components/reactions/EmojiBtn.tsx), [reaction hook](../src/features/blog/hooks/useReactions.ts), and [server mutation](../src/features/blog/api/queries/reactions.ts). The hook performs optimistic updates and rollback; the server mutation writes to Sanity's production dataset. At the historical deployment, neither path sent a submission-outcome event.

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

## Historical reproduction procedure

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

### Historical dashboard handoff

At the original audit, a read-only Umami Share URL had been requested but not supplied. Completion now uses the owner's selected assisted dashboard check rather than requiring a Share URL. Never interpret access restrictions or the wrong date filter as proof that collection failed.

When access is supplied, select the 2026-10-05 UTC windows above, the production hostname, and the tested article URLs. Verify `Reaction Like Click` and `Post Bottom Reactions Reached`, then the nine contact/résumé names. Inspect the reach `postId` property and the empty custom reaction properties if the view permits it. Account for normal traffic rather than assuming aggregate counts belong exclusively to this audit. If the share view cannot identify the historical events precisely, run a small coordinated new window with reaction writes intercepted and record the new evidence.

Add dashboard observations, filters, and timestamps to this report. If Properties is not available in the shared view, preserve its network-verified status and obtain owner-assisted confirmation for dashboard property visibility. Production reaction persistence remains unverified under the selected audit mode; simulated successes must not be described as database writes.

## Original follow-up issues and historical acceptance

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
| Both reaction controls reach Umami; failures documented | HTTP responses observed; response classification and dashboard confirmation unavailable for the historical run |
| Clicks versus successful persistence distinguished | Complete distinction; success/failure responses simulated, production persistence unverified |
| Load timing, navigation, duplicates, unavailable tracker assessed | Complete for the desktop Chromium scenarios above |
| Existing coverage, gaps, and limited-value events inventoried | Complete |
| Prioritized questions, triggers, properties, validation specified | Complete |
| Follow-up issues filed | Complete: #184–#190 |

This change is documentation only. Validate source references, relative links, event names, evidence totals, and whitespace; application regression tests are not required. No instrumentation, routes, public APIs, CMS schemas, or generated files change.

## Current event inventory — 2026-10-08

Inventory reviewed against `dev` at `1853110` and the documented feature contracts. Production remains `v26.98.1007`, release [#213](https://github.com/dangzo/dangz-dev/pull/213), revision `531bcb354770debc35dfc0b4a47c29744bb5882a`. GitHub deployment `6922269665` reports successful Production deployment at **2026-10-07 22:20:46 UTC**. These identify the deployed release separately from newer source changes.

| Event | Current trigger and properties | Reporting purpose | Evidence available at this audit |
| --- | --- | --- | --- |
| Pageview | Each committed pathname/query visit; fragments ignored; captured URL/referrer retained before readiness | Popularity and navigation through pages, topics, pagination | Real-tracker regressions in [pageview guide](UMAMI_PAGEVIEWS.md); October 7 owner-assisted verification recorded in the separate local #186 worktree, not yet published on `dev` |
| `reaction_attempted` | One accepted POST dispatch; `post_id`, `reaction_id`, `placement=compact` or `bottom` | Accepted engagement attempts by content/control | Current production diagnostics and normal live collector responses verified; owner-dashboard check pending |
| `reaction_submission_succeeded` | HTTP OK and a valid finite, nonnegative integer count; same properties | Observed successful API responses | Simulated successful responses and normal live collector responses verified; real persistence remains untested and dashboard storage pending |
| `reaction_submission_failed` | HTTP/network/invalid-response failure; same properties, no error text | Observed failures and engagement friction | All three failure classes exercised at both placements in intercepted and live collector matrices; owner-dashboard check pending |
| `post_bottom_reactions_reached` | First qualifying intersection per mounted post visit, retained until readiness; `post_id` | Exposure to bottom controls, not completed reading | Timing/navigation/blocking diagnostics passed; one live normal collector response verified; owner-dashboard check pending |
| `search_opened` | Confirmed closed-to-open transition; `method=button` or `shortcut` | Search adoption | Production button-opening request observed with collector intercepted; broader fixture coverage in [search guide](SEARCH_ANALYTICS.md); stored-event verification remains separate |
| `search_completed` | Successful current debounced response, including zero results; `query_length`, `result_count` | Search usefulness and zero-result rate | Current nonempty response request observed with collector intercepted; stale/aborted/failed/empty cases have documented fixture coverage; stored-event verification remains separate |
| `search_result_selected` | Primary/modified link activation or router-driven keyboard selection; `post_id`, one-based `result_position` | Article discovery through search | Documented fixture coverage; production middle-click opens a tab but emits no selection event, tracked in #217 |
| `post_opened` | Home/Blog/topic rendered title, CTA or reaction-summary activation; `post_id`, `source`, `placement` | Discovery effectiveness by entry point | [#189 production evidence](POST_DISCOVERY_ANALYTICS.md#production-verification--2026-10-07) includes normal headed collector responses and owner-confirmed counts/property breakdowns; current diagnostic navigation also produced the expected request |
| `contact_clicked` | Email/LinkedIn activation; `channel`, `placement` | Contact intent by channel/control | All covered placements and local real-tracker evidence documented in [contact guide](CONTACT_ANALYTICS.md); current full production grouping is not claimed |
| `resume_download_clicked` | About intro/journey résumé activation; `placement` | Résumé download intent | Real-tracker request and independent PDF-download fixture coverage documented in contact guide; production download/storage verification remains separate |
| `outbound_link_clicked` | GitHub profiles: `destination_host`, `placement`; article HTTP(S) references additionally include `post_id`, `placement=article_body` | Profile/reference interest without full destination URLs | Profile evidence in contact guide; October 7 article-reference stored counts/properties recorded in the separate local #190 worktree, not yet published on `dev` |
| `heading_link_copied` | Successful H2/H3/H4 clipboard write; `post_id`, `section_id` | Deliberate section-sharing intent | Success/rejection fixture coverage in [article guide](ARTICLE_ANALYTICS.md); October 7 stored event/property evidence recorded in the separate local #190 worktree, not yet published on `dev` |

The local #186 and #190 documents contain existing uncommitted verification work owned by their respective tasks. This audit read them without editing, committing, or claiming their publication. Portable acceptance evidence for this audit is recorded here; ordinary issue state is not substituted for collector/dashboard evidence.

The original High/Medium/Low priorities and reporting questions remain the rationale for the completed implementations. All seven original follow-ups are closed; that status is distinct from independently verified production delivery. The bounded additional gap is [#217](https://github.com/dangzo/dangz-dev/issues/217), which retains the existing search event contract and asks for middle-button selection coverage, accurate position, native new-tab behavior, no right-click event, and payload privacy.

Ordinary navigation, topic archives and pagination need no extra custom events beyond destination pageviews. ToC/About fragment navigation intentionally adds no pageview. Scroll depth, code copying, compact disclosure, theme/menu toggles and ScrollToTop remain uninstrumented without an established reporting decision. Bottom exposure does not imply reading completion. Contact/résumé events measure intent, not completed actions.

Search/discovery/heading-copy/reaction lifecycle use the shared 50-event, 60-second memory buffer; pageviews have a separate bounded queue. Script failure clears pending events, full document unload loses them, and there are no application transport retries. Bottom exposure is scoped to the mounted post visit. Contact and article-reference attributes are intentionally unbuffered before tracker readiness. These are undercounting limits, not evidence that an event was stored. Follow-up recommendations must not introduce raw search text, copied URLs, full outbound URLs, email addresses, error messages, or personal identifiers.

## Refreshed production diagnostics — 2026-10-08

Headed Chromium 151 used its default `Chrome/151.0.0.0` user agent, viewport **1280 × 900**, actual production pages and the actual fetched tracker. Every fetched tracker matched SHA-256 `91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`. The diagnostic window was **13:29:22.957–13:30:04.813 UTC** (**14:29:22–14:30:05 Atlantic/Canary**). All analytics requests were intercepted/fulfilled or deliberately aborted; **23 reaction POSTs** were intercepted. No diagnostic analytics or reaction writes reached their live collectors.

All seven scenarios passed, with **zero page errors** and **52 observed collector attempts** across pageviews/custom events. These totals describe browser request evidence, not stored events.

| Scenario | Observed result |
| --- | --- |
| Reaction matrix | Each placement: eight attempts, five simulated successes, three failures; one bottom exposure across repeated entry. Mouse/nested emoji, Enter, Space, same-control pending repeats, HTTP/network/invalid-count failures, and concurrent compact/bottom submissions exercised. Each accepted POST has one attempt and one outcome with exactly `post_id`, `reaction_id`, `placement`; ignored pending clicks dispatch neither POST nor analytics |
| Held readiness | Reach bottom, scroll back and submit compact while the real script is held. Before release: no requests. Release within retention: one original-post exposure plus one compact attempt/success; no re-entry required |
| Held navigation | Qualify post A before readiness, navigate to Blog, release script: no stale exposure. Open post B and qualify: exactly one B exposure with ID `51ab3708-b5ff-4ecf-a933-8afeef408b7e` |
| Blocked script | Both simulated submissions remain usable; no collector attempts or page errors |
| Opt-out | Real tracker honors `umami.disabled`; both simulated submissions remain usable, with no collector attempts |
| Aborted collector | Exactly two reaction attempts/two simulated outcomes/one exposure, each attempted once; no application retry, page error or blocked submission |
| Search middle-click | Search opens and completes; result opens in a new tab but no `search_result_selected` request. Confirmed gap filed as #217 |

The reaction matrix used post `ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4` and Like reaction `783c1d5e-c4ea-4702-ae4f-3cd4b25a80b2`. The assertions compare each initiating placement's event counts with intercepted dispatch counts. They do not equate shared count updates with additional submissions or claim production database persistence. Existing unit/fixture checks cover additional reconciliation and privacy cases; this documentation refresh did not rerun application suites.

Sanitized ledgers and the temporary harness are retained under ignored `.tmp/168-verification/` in the audit worktree. Run `node .tmp/168-verification/audit.cjs` there for intercepted diagnostics, or add `--live` only during an owner-coordinated window. The harness uses the main checkout's installed Playwright, does not install dependencies, and closes its browser. These are local artifacts, not commands available in a fresh clone. A portable rerun uses the current feature-guide scenarios, headed Chromium, pre-navigation reaction interception, and safe response classification without logging tracker cache/session values.

## Coordinated collector and owner-dashboard verification

The owner confirmed readiness before the live matrix. Headed Chromium used its default Chrome user agent and the same actual tracker/deployment identified above. The browser ran during **2026-10-08 15:04:52.902–15:05:05.198 UTC** (**16:04:52–16:05:06 Atlantic/Canary**). The owner reconciliation filter is **15:04:00–15:06:00 UTC**, equivalent to **16:04:00–16:06:00 Atlantic/Canary**, on hostname `dangz.dev`.

Exactly **33 intended custom events** were forwarded once to the real collector. Every response was **HTTP 200**, with ordinary tracker-cache issuance and no bot-filter or disabled marker. Classification inspected responses in memory; cache values, session identifiers and raw response bodies were not retained. The initial pageview was intercepted, making 34 total browser collector attempts. No unrelated analytics were forwarded. All **16 reaction POSTs** were intercepted and simulated; failures covered HTTP 500, network abort and invalid count at each placement. Failure count rollback was asserted against each control's pre-submit count. The matrix passed with zero page errors and no live reaction writes.

| Event | Compact | Bottom | Total live collector responses |
| --- | ---: | ---: | ---: |
| `reaction_attempted` | 8 | 8 | 16 |
| `reaction_submission_succeeded` | 5 | 5 | 10 |
| `reaction_submission_failed` | 3 | 3 | 6 |
| `post_bottom_reactions_reached` | — | 1 | 1 |

All reaction events carry post ID `ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4`, reaction ID `783c1d5e-c4ea-4702-ae4f-3cd4b25a80b2`, and their initiating placement. Exposure carries only the same `post_id` as custom data. Ignored same-control pending activations emitted nothing; cross-placement requests emitted independent attempt/outcome pairs. Re-entering the bottom section did not add exposure. The sanitized evidence is `.tmp/168-verification/live-report.json`.

**Owner-dashboard evidence: pending.** The owner has been supplied the exact window, expected counts and property values. They must independently confirm stored counts and post/reaction/placement breakdowns, identifying any unrelated traffic or ingestion lag. Normal collector responses support acceptance but do not substitute for that stored-event check. No dashboard credentials or Share URL are needed for the selected owner-assisted method.

## Current #168 acceptance

| Criterion | Current status |
| --- | --- |
| Both reaction controls reach Umami; failures documented | Intercepted production diagnostics and all 33 normal live collector responses passed; owner-dashboard evidence pending |
| Click tracking versus successful persistence distinguished | Complete: attempts/outcomes defined; simulated API successes are not persisted reactions |
| Timing, client navigation, duplicates, unavailable tracker assessed | Complete for the documented Chromium scope; historical pageview defects have follow-ups and current regression contracts |
| Inventory identifies coverage, gaps and limited-value events | Complete: historical and current inventories, evidence limits, adequate pageviews and confirmed #217 gap |
| Prioritized recommendations give question, trigger, properties and validation | Complete: original recommendations retained, implementation status and bounded new gap documented |
| Follow-up issues capture fixes/additions | Complete: #184–#190 and #217 |

Use `Refs #168` until the pending live/dashboard row is verified. Only then change the PR to `Closes #168` against the current default branch `dev`. The audit does not need to implement #217 or complete every feature's separate rollout checks to deliver its investigation and recommendations.
