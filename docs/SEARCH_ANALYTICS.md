# Search analytics

Issue [#187](https://github.com/dangzo/dangz-dev/issues/187) measures opening, successful search responses, and article selection. Instrumentation preserves the existing 180 ms debounce and minimum of two trimmed characters.

| Event | Properties | Meaning |
| --- | --- | --- |
| `search_opened` | `method`: `button` or `shortcut` | One confirmed closed-to-open transition |
| `search_completed` | `query_length`, `result_count` | A successful current response with a results array, including zero results |
| `search_result_selected` | `post_id`, one-based `result_position` | An article activation before closing/navigation, from a link or keyboard selection |

Length means the trimmed query's JavaScript `.length`. Result count measures the returned array, capped by the existing API at 20; it does not estimate the total matching corpus. Aborted, superseded, failed, and malformed responses produce no completion event. There is no error event.

Result links track primary and modified primary clicks through `onClick`, and middle-button activation through `onAuxClick` (issue [#217](https://github.com/dangzo/dangz-dev/issues/217)). Middle-click emits one selection event, preserves native new-tab navigation, and leaves search open in the original tab. Right-button activation emits no selection event. Keyboard selection retains its existing tracking and navigation behavior.

## Privacy and delivery

The search helper accepts only the three event contracts and reconstructs their properties. It retains no raw query, keystrokes, result title, search API URL, or personal identifier. Search event payloads include only website, hostname, language, screen, query-free source pathname/referrer, occurrence time, event name, and the listed properties. Default tracker IDs and arbitrary metadata are excluded. The search API still receives the query to perform the search; that request is separate from analytics.

Search, article discovery, and reaction lifecycle events share `src/utils/analyticsTransport.ts`. Before tracker readiness, at most 50 events across these features are retained in memory for 60 seconds. Overflow drops the oldest event; expiry discards it. Client navigation preserves the original source path and timestamp. A full page unload loses pending events. `UmamiScript` flushes the buffer when the existing production-only lazy-loaded tracker is ready. Subsequent events also attempt a flush when the tracker is present.

Script failure clears the shared queue and disables further search, discovery, and reaction collection for that document. No tracker reload, alternative collector, persistent storage, or transport retry bypasses unavailable analytics. Each event gets at most one tracker invocation. A resolved tracker promise does not prove collector acceptance or dashboard visibility.

This reuses #184's readiness integration but does not change its per-article exposure policy.

## Command palette

Issue [#176](https://github.com/dangzo/dangz-dev/issues/176) extends the same lazy-loaded dialog with navigation to Home, the post list, and About; light/dark toggling; and résumé, email, GitHub, and LinkedIn shortcuts. Commands use compact rows prefixed with `> ` and sorted alphabetically by label. They appear immediately and filter locally using case-insensitive words and aliases such as posts, articles, CV, and resume. Post matches appear first, followed by matching commands. Post searches retain the two-character minimum and 180 ms debounce.

ArrowDown from the search input moves focus to the first visible row, and Up/Down move focus through the rows with wrapping. Typing or Backspace while a row is focused returns focus to the input and applies that edit at its saved caret or selection. Modifier shortcuts retain their native behavior. Native row focus exposes each label to screen readers; Enter activates the focused link or button. Enter from the input activates the highlighted row, or the first row when none is highlighted. While a post search is pending, including its debounce, Enter requires an explicitly highlighted command. Query changes immediately hide stale post results and reset selection. Command matches remain available if the post request fails. Tab stays inside the dialog, background elements are inert, and dismissal restores the previous focus.

`search_opened` continues to count palette openings. `search_completed` counts only returned posts, and `search_result_selected` retains the article's one-based position within post results. Theme and site-navigation commands emit neither selection nor new command events. Contact shortcuts reuse existing contact events with `placement=command_palette`; see [contact analytics](CONTACT_ANALYTICS.md). Their rendered anchors preserve native activation, targets, and downloads. Middle-click leaves the dialog open.

Other investigated actions were article-specific heading/link copying, table-of-contents navigation, and reaction shortcuts. These depend on article context and remain outside this global-command change.

## Validation and production handoff

Unit tests cover transition guards, response classification, selection order, privacy, buffering, expiry, overflow, and tracker failures. `src/tests/e2e/search.spec.ts` uses a tracker stub with the normal development fixture server; it verifies browser interactions and payload construction, not real production delivery.

After the change reaches production, record the deployed revision, production hostname, UTC start/end time, source paths, collector response statuses, and observed event/property counts:

1. With the real tracker ready, open using the button, Ctrl+K, and Meta+K where supported. Close/reopen and confirm one `search_opened` per transition.
2. Execute known nonempty and empty searches. Inspect the complete collector request body: accurate lengths/counts, no raw query or query-derived URL, and no distinct ID. A distinctive temporary query makes accidental leakage easy to detect; do not retain it in evidence.
3. Select results by mouse, ArrowDown/Enter, and Enter with no highlighted result. Confirm one selection request with the correct ID/position before navigation; test modified primary clicks and middle-click separately. Middle-click must open the selected article in a new tab while search remains open in the source tab; right-click must produce no selection request. Verify the selection payload contains no raw query text.
4. Hold the real tracker script before opening/searching/selecting; release it within 60 seconds. Confirm buffered requests keep the source path and occurrence times, including selection followed by client navigation. Repeated readiness must not duplicate them.
5. Abort the script in a fresh browser context. Search must still open, return results, close, and navigate without an application error or alternative analytics request. Separately abort collector requests and confirm there is no retry. Intercept search failures and stale responses to confirm no false completion.
6. **Owner dashboard check:** filter the same UTC window and production hostname in Umami. Verify all three event names and their properties, distinguishing ordinary traffic from the test window. Record dashboard evidence separately from browser requests. If property visibility is unavailable, leave that criterion pending rather than infer success from requests.

Use existing Umami session/funnel reporting for adoption and reader conversion without adding identifiers. Zero-result rate is zero-result completions divided by successful completions. Raw selection/completion totals describe event activity; they are not a unique-reader conversion rate because one opening can contain multiple searches. Buffer limits and unavailable tracking cause undercounting.

The implementation PR includes `Closes #187` so merging it into the repository default branch, `dev`, closes the issue. Production deployment follows `main`; network and owner dashboard verification remain explicit rollout checks, and their evidence must be recorded separately. Rollback is a revert of the search instrumentation and buffer integration, preserving the independent readiness/exposure work.
