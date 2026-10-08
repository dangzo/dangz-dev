# Article sharing and reference analytics

Issue [#190](https://github.com/dangzo/dangz-dev/issues/190) measures which
sections readers deliberately share and which reference hosts invite further
reading. These events measure successful copying and click intent, respectively;
they do not establish that a link was shared or its destination was read.

| Event | Custom properties | Trigger |
| --- | --- | --- |
| `heading_link_copied` | `post_id`, `section_id` | A section heading's clipboard write resolves successfully |
| `outbound_link_clicked` | `post_id`, `destination_host`, `placement: 'article_body'` | An external HTTP(S) reference anchor is activated |

`post_id` is the CMS document ID, consistent with reactions and discovery.
`section_id` is the existing heading fragment ID, including duplicate-heading
suffixes, and matches the table of contents. Existing H2/H3/H4 copy controls
are covered; no new copy controls are added.

## Privacy and delivery

Successful copies enqueue one event through the existing bounded, in-memory
analytics transport. Source pathname and sanitized referrer are captured before
the clipboard promise is awaited. The shared queue retains at most 50 events
across features for 60 seconds, flushes on tracker readiness, and discards events
on script failure. An attempted send is terminal; application code does not
retry collector failures. Clipboard rejection or an unavailable clipboard API
emits no event and preserves existing feedback. Tracker failures never change
a successful copy's feedback.

Reference anchors are server-rendered with Umami attributes, matching the
[contact/profile convention](CONTACT_ANALYTICS.md). Umami's delegated listener
handles mouse, native Enter and nested-element activation. No extra click
listener or manual outbound tracker call is added. Reference clicks before
tracker initialization are not buffered. Existing opt-out and blocking behavior
remain authoritative for both event types.

Only external absolute or protocol-relative HTTP(S) references are marked.
Production site hosts (`dangz.dev`, `www.dangz.dev`), localhost and loopback hosts,
relative links, fragments and non-HTTP(S) schemes are excluded. Destination
properties contain the parsed hostname only, without ports, paths, queries or
fragments. External references retain native new-tab navigation and
`noopener noreferrer`.

Custom properties omit copied URLs, raw heading text, full reference URLs,
query strings and personal information. Clipboard contents still preserve the
current page URL and replace its fragment, as before. Buffered copy events use
safe source metadata; delegated outbound events inherit Umami's existing
source-page metadata, which may include source-page query strings. This change
does not sanitize pageviews or all tracker metadata.

## Local validation

```sh
yarn test:unit src/features/blog/utils/articleAnalytics.test.ts src/features/blog/components/portable-text/HeadingAnchor.test.tsx src/features/blog/components/portable-text/MarkLink.test.tsx src/utils/searchAnalytics.test.ts src/utils/reactionAnalytics.test.ts
yarn test:unit src/test-support/e2e/sanity-fixtures.test.ts
yarn test:e2e src/tests/e2e/article-analytics.spec.ts src/tests/e2e/blog-article.spec.ts src/tests/e2e/contact-analytics.spec.ts --workers=1
yarn lint
yarn typecheck
git diff --check
```

The second fixture article supplies references and additional heading variants;
the first article's visual fixture is unchanged. Browser tests use the pinned
real tracker with a fictitious website ID and intercept collector requests and
external destinations. No live analytics is sent. They verify event properties,
clipboard behavior, negative cases, delayed readiness and native navigation.

Local verification on 2026-10-07 passed: 48 selected unit tests, 38 browser
tests (including 12 article analytics scenarios), frontend lint, frontend type
checking and `git diff --check`. Independent review found no remaining defects.

This is **browser request evidence — collector intercepted**. It does not
establish live collector acceptance or dashboard ingestion. The pinned tracker
also cannot establish behavior of future cloud script versions.

## Production handoff and completion

**Deployment cutoff and live verification: pending.** Keep #190 open until
both collector and dashboard acceptance are recorded. Any implementation PR
uses `Refs #190` and identifies these remaining checks.

1. Record the deployed revision, hostname and UTC verification window. Use the
   actual production tracker in fresh browser contexts.
2. Successfully copy H2/H3/H4 links, including repeated heading text. Verify
   clipboard contents separately from analytics; each success sends one event
   with the correct CMS post ID and heading fragment. Force clipboard rejection
   and confirm no copy event or copied feedback.
3. Activate external article references by mouse, focused Enter and nested
   elements. Record event names, exact custom properties, source paths and real
   collector response status. Verify one event per activation and no outbound
   event for internal or fragment article links.
4. Check native new-tab navigation and clipboard functionality with the tracker
   loaded, blocked and opted out. A collector response does not prove navigation
   or clipboard success. Do not record destination queries or tracker cache data.
5. Ask the dashboard owner to filter the same hostname and UTC window. Confirm
   `heading_link_copied` grouping by `post_id`/`section_id` and
   `outbound_link_clicked` grouping by `post_id`/`destination_host` with
   `placement=article_body`, distinct from profile placements. Record dashboard
   observations separately from browser requests; leave unavailable views pending.
6. Record the cutoff and both evidence types here. Only after all acceptance
   criteria pass should a PR targeting the current default branch use `Closes #190`.

Sharing UI in #173 remains separate. Scroll depth, ToC clicks and ScrollToTop
are outside this scope; bottom-section exposure is not article completion.
Rollback removes the event wiring and reference attributes; historical events
remain in Umami.
