# Search and command palette

Search analytics preserves the 180 ms debounce and minimum two trimmed characters.

| Event | Properties | Meaning |
| --- | --- | --- |
| `search_opened` | `method=button` or `shortcut` | One confirmed closed-to-open transition |
| `search_completed` | `query_length`, `result_count` | Successful current response with results array, including zero |
| `search_result_selected` | `post_id`, one-based `result_position` | Article activation before closing/navigation, by link or keyboard |

Length is trimmed query JavaScript `.length`; result count is the returned array (API cap 20), not total matching corpus. Aborted/superseded/failed/malformed responses emit no completion or error event. The helper reconstructs only listed properties; analytics contains no raw query, keystroke, result title, search API URL or personal identifier. The API still receives the query separately. Use the [shared buffered transport/privacy policy](ANALYTICS.md#delivery-boundaries).

Links track primary/modified primary through `onClick`, middle-button through `onAuxClick` ([#217](https://github.com/dangzo/dangz-dev/issues/217)). Middle-click emits one selection, preserves new-tab navigation and leaves the source palette open; right-click emits none. Router-driven keyboard selection must track independently of anchor clicks.

## Command palette

The lazy-loaded dialog offers Home, post list, About, light/dark toggling, résumé, email, GitHub and LinkedIn. Commands appear immediately, sorted alphabetically with `> ` prefixes, and filter locally by case-insensitive words/aliases (posts, articles, CV, resume). Post matches come first; their two-character/debounce rules still apply.

ArrowDown from input focuses the first visible row; Up/Down wrap. Typing/Backspace from a row restores input focus and applies the edit at saved caret/selection; modifier shortcuts stay native. Native row focus exposes labels to screen readers. Enter activates the focused row; from input it activates the highlighted row or first row if none. While a post search/debounce is pending, Enter requires an explicitly highlighted command. Query changes hide stale posts/reset selection immediately; commands remain available after post-request failure. Tab is trapped, background inert, and dismissal restores previous focus.

Openings count `search_opened`; completion counts only posts; article selection positions are within post results. Theme/site navigation emit no selection or new command event. Contact commands reuse [contact events](CONTACT_ANALYTICS.md) with `placement=command_palette` and native anchors/targets/downloads. Middle-click leaves the dialog open.

## Validation and reporting

Unit coverage tests transitions, response classification, keyboard/pending selection, privacy and shared transport failure/retention. Run `yarn test:e2e src/tests/e2e/search.spec.ts`; its development tracker stub proves interactions/payloads, not live delivery.

Follow [production verification](ANALYTICS.md#verification): button/Ctrl+K/Meta+K transitions, nonempty/zero results, mouse/keyboard/modified/middle selection, no right-click event, no query leakage, delayed readiness across navigation, failed/stale responses and blocking/opt-out. Check all three event/property groups separately in the owner dashboard. The [dated evidence limits](ANALYTICS.md#dated-evidence-receipts) do not claim complete production grouping merely from closed [#187](https://github.com/dangzo/dangz-dev/issues/187).

Zero-result rate is zero-result completions / successful completions. One opening can contain multiple searches: raw selection/completion ratios are activity, not unique-reader conversion. Use existing Umami session/funnel reporting without new identifiers. Rollback removes search instrumentation/buffer integration while preserving independent readiness/exposure.
