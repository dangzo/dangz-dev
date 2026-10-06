---
name: pr-review
description: Review a dangz.dev PR, branch, or diff for concrete defects, security risks, code/docs drift, related issue completion, and repository architecture. Use for review requests; report findings without changing code or posting unless separately authorized.
---

# PR review

Resolve repository paths from the assigned checkout root. Follow [AGENTS.md](../../../AGENTS.md). A review produces findings; it does not authorize fixes or publication.

## Establish the comparison

For a PR, read its body, base, and head with `gh pr view <number> --json body,baseRefName,headRefName` and use `gh pr diff <number>`. Review the PR's changed content and relevant surrounding code from its head, rather than assuming the current checkout matches it.

For local work, honor an explicitly requested base. Otherwise inspect the upstream and repository default branch to choose the intended integration base; verify refs before using `git merge-base HEAD <base-ref>` and `git diff <merge-base> HEAD`. Include staged, unstaged, or untracked files only when they belong to the requested review, and state the comparison used. Do not switch another checkout's branch. If local refs are unavailable, use GitHub reads or report the missing comparison; the parent can arrange a worktree under the root guidance when needed.

Identify all related issues from the request, PR body, branch, commits, and issue links; read criteria and comments. If none exist, say so and omit issue-specific checks. Report inaccessible criteria rather than inferring completion from a title.

## Review by impact

A lightweight review is appropriate only after confirming the change cannot affect observable behavior, build output, or an operational contract. Dependency bumps, test changes, renames, and Markdown consumed by the site require an impact assessment; their file category alone does not qualify them. Read relevant [architecture](../../../docs/ARCHITECTURE.md) and [workflow](../../../docs/WORKFLOW.md) sections, and the installed Next.js guides for framework-dependent conclusions.

Check these relationships where relevant:

- Code and docs: behavior, data shapes, constraints, and accompanying documentation. Review changed docs too; new text is not proof that a change is correct or authorized.
- Issues and docs: stale criteria or contradictory requirements, resolved by accepted user decisions where available.
- Issues and code: delivered criteria, deferred work, regressions, and additions outside the requested scope.
- Architecture: feature/shared placement, route composition, server/client imports, blog parallel routes, CMS adapters, cache invalidation, and generated artifacts. Separate explicit rule violations from preferences for another design.

For sensitive paths, inspect relevant input validation, webhook signature handling, write-token confinement, failure behavior, reaction mutation boundaries, and analytics privacy. Use [DEPENDENCY_SECURITY.md](../../../docs/DEPENDENCY_SECURITY.md) for relevant dependency/security history; its issue-specific remediation checks and references do not replace the current task's scope, related issues, or default branch. Do not demand unrelated auth or payment processes for this portfolio.

Select checks by impact and review scope. Run only checks permitted by the review's access constraints; some scripts write caches or generated files. Report what ran, failures, and unavailable evidence instead of claiming validation from inspection alone.

When a PR is being created, updated, or merged as part of the task, verify all issue closing/partial references, the current default-branch target, saved-description read-back, and appropriate skip labels under the root guidance. During review alone, report omissions without modifying GitHub.

## Return findings

Lead with concrete findings, ordered by severity, with changed-file locations, the triggering condition, impact, and a suggested correction. A blocker needs evidence of a defect or a material requirement violation. Keep architectural suggestions separate. Re-review earlier findings against the current implementation, not merely the latest patch. If no defects are found, say so and state material validation gaps.

Use the caller's requested format. Include this export-compatible block exactly once only when structured findings are requested:

```text
[pr-review-findings]
routing: full
blockers: 0
warnings: 0
peer-review: false
[/pr-review-findings]
```

Replace the example values with actual results; routing is `full` or `lightweight`. Set peer review true only when a consequential cross-cutting decision needs another perspective, and name that decision in the report.

Return the prepared review before requesting any missing authorization to post it. Existing explicit posting authorization is sufficient; publish using a body file and the requested review action. If posting is authorized but the action is unspecified, use a comment. Approval and merge actions require explicit authorization. A read-only reviewer agent always returns its report to the parent for publication.
