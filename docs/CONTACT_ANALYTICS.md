# Contact, profile, and résumé analytics

Issue [#188](https://github.com/dangzo/dangz-dev/issues/188) compares click intent
across Home, About, and footer placements. It does not measure email sent,
contact completed, profile engagement, or download completion.

| Event | Custom properties | Placements |
| --- | --- | --- |
| `contact_clicked` | `channel`: `email` or `linkedin`; `placement` | Home email; About intro LinkedIn; About contact email/LinkedIn; footer email/LinkedIn |
| `resume_download_clicked` | `placement` | About intro and journey |
| `outbound_link_clicked` | `destination_host`: `github.com`; `placement` | Home, About contact, footer |

Placement values are exactly `home`, `about_intro`, `about_journey`,
`about_contact`, and `footer`. There are 11 distinct controls: two Home,
six About, and three shared footer controls. The footer retains `footer`
placement on every page; Umami's source-page metadata identifies the page.
LinkedIn emits only `contact_clicked`, never a second outbound event.

## Historical naming break

The labels below are replaced rather than emitted alongside the new names.
Home “Say hello” and “Explore my GitHub” gain their first custom events.

| Legacy label | Replacement | Custom properties |
| --- | --- | --- |
| `About Download Resume Click` | `resume_download_clicked` | `placement=about_intro` |
| `Download Resume Click` | `resume_download_clicked` | `placement=about_journey` |
| `About Connect LinkedIn Click` | `contact_clicked` | `channel=linkedin`, `placement=about_intro` |
| `About Email Click` | `contact_clicked` | `channel=email`, `placement=about_contact` |
| `About LinkedIn Click` | `contact_clicked` | `channel=linkedin`, `placement=about_contact` |
| `About GitHub Click` | `outbound_link_clicked` | `destination_host=github.com`, `placement=about_contact` |
| `Footer Email Click` | `contact_clicked` | `channel=email`, `placement=footer` |
| `Footer LinkedIn Click` | `contact_clicked` | `channel=linkedin`, `placement=footer` |
| `Footer GitHub Click` | `outbound_link_clicked` | `destination_host=github.com`, `placement=footer` |

**Deployment cutoff: pending.** Record the deployed revision and UTC rollout
time here after publication. Compare old and new names across that cutoff;
historical data is not rewritten. Home has no corresponding legacy baseline.

## Privacy and delivery

The server-safe `contactAnalytics` helper accepts a readonly event contract and
constructs only the listed attributes. The attributes belong to the actual
anchor, including footer icons; nested SVGs and spans carry no event marker.
Umami's delegated listener handles mouse and native Enter activation. No manual
tracker call or additional click listener is added by the application.

Custom properties omit email addresses, full outbound URLs, query strings,
link text, and personal information. Existing Umami source-page metadata,
including source URLs and referrers, remains unchanged and can contain query
strings. This change does not sanitize automatic metadata or pageviews.

The production-only `lazyOnload` strategy remains. Clicks before tracker
initialization are not buffered. Blocked scripts and Umami opt-out produce no
event; collector failure is best-effort without an application retry. Preserve
each link's existing target, mailto href, rel, and download behavior.

## Local validation

```sh
yarn test:unit src/components/icons/Icon.test.tsx src/components/layout/footer/SocialIcons.test.tsx src/features/about/components/contactAnalytics.test.tsx src/components/ui/Button.test.tsx
yarn test:e2e src/tests/e2e/contact-analytics.spec.ts src/tests/e2e/about.spec.ts --workers=1
yarn lint
yarn typecheck
```

The regular fixture server runs in development without the production tracker.
The contact suite uses full Chromium's new headless mode for native modified
clicks (the existing CI browser installation includes it). It explicitly loads
a pinned real tracker fixture and intercepts all collector requests, disabling
automatic pageviews. This verifies one event
per mouse/Enter activation, exact properties, nested-element activation, and
the rendered inventory. Delivery tests suppress destination actions separately
from native same-tab, popup, Ctrl-click, Shift-click, and PDF download checks.
Downloads are tested with the tracker ready, absent, and opted out.

Local verification on 2026-10-06 passed: 14 affected unit tests, 26 selected
browser tests, frontend lint, and frontend type checking.

This is **browser request evidence — collector intercepted**. It establishes
neither live collector acceptance nor dashboard ingestion. The pinned tracker
also cannot establish the behavior of a future cloud script version.

## Production handoff and completion

Live collector responses, dashboard grouping, and the deployment cutoff remain
pending until the updated deployment is available.

1. Confirm deployed revision and hostname; record the UTC start/end window.
   Use the actual production tracker with fresh browser contexts.
2. Activate all 11 controls by mouse and focused Enter. Include Home nested
   spans and footer SVG paths. Record event name, source path, custom properties,
   and collector response status. Confirm exactly one new event and no legacy
   event per activation, with no sensitive destination data in custom properties.
3. Test Home same-tab, Ctrl/Cmd-click, and Shift-click navigation, existing
   profile new tabs, and mailto activation separately. Verify both résumé placements download a
   valid PDF with the expected filename; collector HTTP 200 alone cannot prove
   a download. Also verify usable links/downloads when analytics is blocked or
   opted out. Do not record email addresses, tokens, or tracker cache values.
4. Ask the dashboard owner to filter the same UTC window and production hostname.
   Confirm the three event names and property grouping by placement, contact
   channel, and destination host. Record those observations separately from
   browser requests; leave unavailable property views pending.
5. Record the rollout cutoff and evidence here. Use `Refs #188` while live
   acceptance is pending. After all criteria pass, use `Closes #188` in a PR
   targeting the repository's confirmed default branch (`dev` at implementation).

Rollback is a revert of these attributes and the Icon analytics prop. Historical
events remain available under their original names.
