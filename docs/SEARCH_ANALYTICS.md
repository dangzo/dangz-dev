# Search analytics

Issue [#187](https://github.com/dangzo/dangz-dev/issues/187) measures opening, successful search responses, and article selection. Instrumentation preserves the existing 180 ms debounce and minimum of two trimmed characters.

| Event | Properties | Meaning |
| --- | --- | --- |
| `search_opened` | `method`: `button` or `shortcut` | One confirmed closed-to-open transition |
| `search_completed` | `query_length`, `result_count` | A successful current response with a results array, including zero results |
| `search_result_selected` | `post_id`, one-based `result_position` | An article activation before closing/navigation, from a link or keyboard selection |

Length means the trimmed query's JavaScript `.length`. Result count measures the returned array, capped by the existing API at 20; it does not estimate the total matching corpus. Aborted, superseded, failed, and malformed responses produce no completion event. There is no error event.

## Privacy and delivery

The search helper accepts only the three event contracts and reconstructs their properties. It retains no raw query, keystrokes, result title, search API URL, or personal identifier. Search event payloads include only website, hostname, language, screen, query-free source pathname/referrer, occurrence time, event name, and the listed properties. Default tracker IDs and arbitrary metadata are excluded. The search API still receives the query to perform the search; that request is separate from analytics.

Before tracker readiness, at most 50 events are retained in memory for 60 seconds. Overflow drops the oldest event; expiry discards it. Client navigation preserves the original source path and timestamp. A full page unload loses pending events. `UmamiScript` flushes the buffer when the existing production-only lazy-loaded tracker is ready. Subsequent events also attempt a flush when the tracker is present.

Script failure clears pending events and disables further search collection for that document. No tracker reload, alternative collector, persistent storage, or transport retry bypasses unavailable analytics. Each event gets at most one tracker invocation. A resolved tracker promise does not prove collector acceptance or dashboard visibility.

This reuses #184's readiness integration but does not change its per-article exposure policy. #176's command-palette enhancements remain separate.

## Validation and production handoff

Unit tests cover transition guards, response classification, selection order, privacy, buffering, expiry, overflow, and tracker failures. `src/tests/e2e/search.spec.ts` uses a tracker stub with the normal development fixture server; it verifies browser interactions and payload construction, not real production delivery.

After the change reaches production, record the deployed revision, production hostname, UTC start/end time, source paths, collector response statuses, and observed event/property counts:

1. With the real tracker ready, open using the button, Ctrl+K, and Meta+K where supported. Close/reopen and confirm one `search_opened` per transition.
2. Execute known nonempty and empty searches. Inspect the complete collector request body: accurate lengths/counts, no raw query or query-derived URL, and no distinct ID. A distinctive temporary query makes accidental leakage easy to detect; do not retain it in evidence.
3. Select results by mouse, ArrowDown/Enter, and Enter with no highlighted result. Confirm one selection request with the correct ID/position before navigation; test modified clicks separately.
4. Hold the real tracker script before opening/searching/selecting; release it within 60 seconds. Confirm buffered requests keep the source path and occurrence times, including selection followed by client navigation. Repeated readiness must not duplicate them.
5. Abort the script in a fresh browser context. Search must still open, return results, close, and navigate without an application error or alternative analytics request. Separately abort collector requests and confirm there is no retry. Intercept search failures and stale responses to confirm no false completion.
6. **Owner dashboard check:** filter the same UTC window and production hostname in Umami. Verify all three event names and their properties, distinguishing ordinary traffic from the test window. Record dashboard evidence separately from browser requests. If property visibility is unavailable, leave that criterion pending rather than infer success from requests.

Use existing Umami session/funnel reporting for adoption and reader conversion without adding identifiers. Zero-result rate is zero-result completions divided by successful completions. Raw selection/completion totals describe event activity; they are not a unique-reader conversion rate because one opening can contain multiple searches. Buffer limits and unavailable tracking cause undercounting.

The implementation PR includes `Closes #187` so merging it into the repository default branch, `dev`, closes the issue. Production deployment follows `main`; network and owner dashboard verification remain explicit rollout checks, and their evidence must be recorded separately. Rollback is a revert of the search instrumentation and buffer integration, preserving the independent readiness/exposure work.
