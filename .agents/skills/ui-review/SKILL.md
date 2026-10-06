---
name: ui-review
description: Check affected dangz.dev UI flows in a browser for functional, visual, accessibility, console, and network problems. Use for UI QA, click-through requests, or browser verification of an implemented change. Reuse fixture-backed Playwright; durable test authoring is separate.
---

# UI review

Resolve repository paths from the assigned checkout root. Follow [AGENTS.md](../../../AGENTS.md), [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md), and the relevant [workflow](../../../docs/WORKFLOW.md) sections. A requested local browser review needs no extra start confirmation.

## Scope the evidence

Derive affected routes and flows from the request, diff, issue criteria, and PR validation steps. State the selected coverage and expected results briefly; do not require a whole-site tour. Include keyboard operation and accessible names for changed controls, desktop/mobile layouts for responsive changes, and both themes for styling changes. Include negative, loading, and empty states where the changed behavior makes them relevant.

A review-only request returns findings. If repair or implementation validation is also authorized, fix in-scope defects and rerun the affected flow. Do not expand repairs to unrelated sibling components or update visual baselines just to make a failure pass.

## Use the local infrastructure

- Inspect `playwright.config.ts` and relevant existing specs before selecting execution. `yarn test:e2e <actual-spec-path>` manages its own fixture server on port 3100 with `.next-e2e` output and does not reuse an existing server. Avoid competing runs on that port.
- For interactive browser inspection, use available browser tools; do not require particular MCP tool names. Verify an existing server's checkout and fixture/live-data mode before reusing it. Otherwise start a task-owned server from the repository's Yarn script and stop it when finished.
- Prefer isolated fixtures for local flows. All fixture servers in one checkout share `.next-e2e`; changing ports does not avoid output/lock collisions. Reuse a verified fixture server when appropriate, or use a separate checkout under the root worktree rules. Do not start another fixture server or automated suite in the same checkout while one is running.
- To start a standalone fixture server after checking checkout/output ownership, choose a free local port and set `E2E_FIXTURES=true`, `E2E_FIXTURES_URL=http://127.0.0.1:<port>/api/e2e/sanity`, `SANITY_API_READ_ONLY_TOKEN=''`, and `SANITY_TOPIC_MODEL=primary` for `yarn dev -p <port>`. Draft-preview checks use `SANITY_API_READ_ONLY_TOKEN=fixture-preview`; automated suites use `E2E_PREVIEW_DRAFTS=true` instead. Follow the workflow's worktree/Turbopack advice if relevant.
- If interactive tooling is unavailable, use the installed Playwright runner and existing affected specs. A task-owned temporary spec may fill a manual coverage gap; keep it clearly temporary, use existing fixtures/configuration, and remove only that spec afterward. Do not install a browser service or add permanent tests silently. Report unavailable browser dependencies or coverage gaps.

## Exercise the changed behavior

Use roles and accessible names to locate controls. Wait for observable settled results instead of arbitrary sleeps. Inspect DOM/accessibility state for interactions; capture screenshots when assessing layout or styling. Match configured desktop/mobile viewports for visual comparisons.

For local mutations, verify the read-back and optimistic rollback on failure; cancellation should preserve prior state. For layout defects, record the viewport/theme and useful measurements. Investigate console errors and failed requests in context: expected negative-path responses are not automatically defects. Compare with baseline behavior only when needed to classify a finding as pre-existing.

Local fixture checks do not prove production analytics delivery or owner dashboard results. Read the relevant contact/search/exposure analytics guide before those checks. Intercept production reaction POSTs and analytics collectors as documented; do not create real reactions or send live telemetry as a side effect of review. Ask only when required access or a consequential choice is missing.

Stop after three failed attempts at the same browser step and report the obstacle. Rerun only affected flows after a fix. For intentional visual changes, inspect desktop/mobile and theme differences before any explicitly authorized baseline update.

## Report and clean up

Report pass/fail/unavailable for each selected flow with evidence, confirmed defects, suggestions, pre-existing issues, and coverage gaps. Preserve useful screenshots/traces in ignored task artifacts for the user to inspect; report their paths. Stop only servers/processes started for this review and remove only task-owned temporary specs. Keep incidental build-version output out of the final change.

Posting the report is a separate external action. Prepare it first, then use existing explicit posting authorization or ask for missing authorization. A delegated reviewer returns the report to the parent rather than posting it.
