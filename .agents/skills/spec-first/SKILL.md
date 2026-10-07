---
name: spec-first
description: Ground implementation of dangz.dev features, fixes, behavior changes, and refactors in repository docs and related GitHub issue criteria; keep code, validation, and docs aligned. Use before implementation, with effort proportional to the change.
---

# Spec first

Resolve repository paths from the root of the assigned checkout. Follow [AGENTS.md](../../../AGENTS.md), including existing authorization and delegation guidance.

## Ground the change

- Read relevant sections of [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) to locate code and understand rendering/data flow. Read [WORKFLOW.md](../../../docs/WORKFLOW.md) for checks, schemas, queries, or generated files. Follow their links only for concerns in scope.
- Identify related issues from the request, branch, commits, and existing PR references; confirm candidates rather than treating arbitrary branch numbers as issue IDs. Read each issue and its comments with `gh issue view <number> --comments` when available. Do not invent an issue or require one for ordinary work.
- Compare acceptance criteria with relevant docs and current code. The user's accepted changes can supersede stale docs. Explain consequential conflicts and ask only when the existing request does not resolve them; continue independent work. If issue access fails, report it and request missing criteria only when needed to determine scope.
- Before using Next.js APIs, read the relevant version-matched guide in `node_modules/next/dist/docs/`. For a small fix, keep this investigation focused on the affected behavior.

## Fit the repository

Use the architecture's feature/shared boundaries and keep route files focused on composition. Check server/client boundaries, server-only credentials, blog parallel-slot parity, and cache/revalidation behavior when touched. Extend existing UI primitives, theme tokens, and About icons under the root guidance.

Schema changes use the workflow's generator and feature adapters; do not hand-edit Sanity artifacts or the lockfile. A source-controlled migration script is implementation code, not automatically generated output. Local type generation does not deploy GraphQL or migrate live content. Follow the topic rollout docs only when that work is in scope.

## Implement and verify

Implement the agreed behavior, including necessary regression tests and relevant documentation updates. An accepted design change already authorizes its related doc updates; do not add another confirmation or impose separate doc commits. Document material departures from previous guidance and their reason.

Select checks from the workflow's affected-behavior table. Use existing Yarn scripts and report commands, actual results, and checks that could not run. Do not repeat passing checks without a new change, failure, or unresolved concern. Keep incidental generated build-version changes out of unrelated diffs.

When a PR is requested, use the repository template. Describe concrete verification actions and expected results under Validation. Follow the root guidance for all completed/partial issue references, the current default branch, saved-description read-back, and PR labels. Do not create, commit, post, or merge merely because this skill was selected.
