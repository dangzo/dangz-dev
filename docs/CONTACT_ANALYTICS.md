# Contact, profile and résumé analytics

Events measure activation intent, not email sent, profile engagement or download completion.

| Event | Custom properties | Controls |
| --- | --- | --- |
| `contact_clicked` | `channel=email` or `linkedin`; `placement` | Home email; About intro LinkedIn; About contact email/LinkedIn; footer/palette email/LinkedIn |
| `resume_download_clicked` | `placement` | About intro/journey and palette |
| `outbound_link_clicked` | `destination_host=github.com`; `placement` | Home, About contact, footer and palette GitHub |

Placements are `home`, `about_intro`, `about_journey`, `about_contact`, `footer`, `command_palette`. The page/footer inventory has 11 controls (two Home, six About, three footer), plus four palette commands. Footer placement stays `footer` on every route. LinkedIn emits only `contact_clicked`. [Article references](ARTICLE_ANALYTICS.md) reuse outbound events with `placement=article_body` and `post_id`.

The server-safe `contactAnalytics` helper allowlists attributes on the actual anchor, including icon anchors; nested SVGs/spans carry no marker. Umami's delegated mouse/native Enter listener requires no application listener/manual call. Clicks before readiness are unbuffered. Preserve href, target, rel and download behavior. Custom data omits email addresses, full URLs, queries, link text and personal data; automatic source metadata can contain queries. See [delivery/privacy](ANALYTICS.md#delivery-boundaries).

## Historical names

Never intentionally emit legacy/replacement names together. Historical data is not rewritten; Home has no legacy baseline. Compare using an identified deployed cutoff, not issue closure.

| Legacy label | Replacement properties |
| --- | --- |
| `About Download Resume Click` | `resume_download_clicked`, `placement=about_intro` |
| `Download Resume Click` | `resume_download_clicked`, `placement=about_journey` |
| `About Connect LinkedIn Click` | `contact_clicked`, `channel=linkedin`, `placement=about_intro` |
| `About Email Click` | `contact_clicked`, `channel=email`, `placement=about_contact` |
| `About LinkedIn Click` | `contact_clicked`, `channel=linkedin`, `placement=about_contact` |
| `About GitHub Click` | `outbound_link_clicked`, `destination_host=github.com`, `placement=about_contact` |
| `Footer Email Click` | `contact_clicked`, `channel=email`, `placement=footer` |
| `Footer LinkedIn Click` | `contact_clicked`, `channel=linkedin`, `placement=footer` |
| `Footer GitHub Click` | `outbound_link_clicked`, `destination_host=github.com`, `placement=footer` |

## Validation

Run `yarn test:e2e src/tests/e2e/contact-analytics.spec.ts src/tests/e2e/about.spec.ts --workers=1`; affected units are beside Icon, SocialIcons, contactAnalytics and Button. The contact suite uses full Chromium's new headless mode, the pinned tracker and intercepted collector with automatic pageviews disabled. Suppress destination actions separately for delivery checks; independently check same-tab/popup/Ctrl-click/Shift-click and PDF downloads with tracking ready, absent and opted out.

For production, follow [shared verification](ANALYTICS.md#verification): every page/footer/palette control, nested content and Enter, one replacement event/no legacy duplicate. Independently verify mailto/profile behavior and valid résumé PDFs/filenames. Dashboard grouping uses placement/channel/host. [#188](https://github.com/dangzo/dangz-dev/issues/188) is closed; full production grouping/cutoff is not independently established by this cleanup. Rollback reverts attributes and the Icon analytics prop.
