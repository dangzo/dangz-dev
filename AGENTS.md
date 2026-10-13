# AGENTS.md

## Read on demand

- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) when locating code or changing routing, data flow, or UI structure.
- Read [docs/WORKFLOW.md](docs/WORKFLOW.md) when running checks or changing schemas, queries, or generated files.
- Read only task-relevant sections; update guidance when documented behavior changes.

## Documentation maintenance

- Update existing docs for lasting behavior, contracts, non-obvious decisions, or operating/recovery procedures. A feature does not automatically need a new document.
- Keep task plans, local review/audit reports, approval conversations, test totals, and implementation chronology in the issue/PR or ignored task artifacts. Retain only concise, dated evidence receipts when they are needed for an ongoing operational decision.
- Add a document only for a distinct recurring need that existing docs cannot serve; explain that need in the PR and link it from the relevant guide. Avoid one file per feature or issue by default.
- Give each rule one canonical home and link to it elsewhere. Link to executable source for commands, schemas, data inventories, and test coverage instead of copying lists that drift.
- When changing behavior or completing rollout, reconcile affected guidance, remove expired checkpoints/instructions, and preserve unresolved constraints and recovery safeguards. Historical task authorization is never standing permission for later agents. Check links after moving or deleting docs.

## Skills and delegation

- Shared skills live in `.agents/skills/`; shared specialist roles live in `.agents/roles/`. See [docs/WORKFLOW.md](docs/WORKFLOW.md#skills-and-specialist-agents) for invocation and maintenance.
- Always use [pr-create](.agents/skills/pr-create/SKILL.md) when creating a PR, including drafts and PR creation within a larger task, or drafting or rewriting its description.
- Delegate to `implementer`, `reviewer`, `test-engineer`, or `product-owner` when independent work or context isolation justifies the overhead. Handle small tasks directly; implementation includes necessary tests and docs without requiring an agent pipeline.
- Give each agent the assigned checkout, goal, acceptance criteria, relevant context, existing authorization, and file ownership. Avoid concurrent edits to the same files. The parent integrates results and verifies the complete task.
- Reuse existing worktrees before creating one. New worktrees belong under `<main-checkout>/git-worktrees/<branch>`. Never switch branches or stash another agent's work; remove only worktrees created for the task after checking for uncommitted work.
- Honor existing authorization for requested local reviews, related doc updates, and explicitly requested external actions. Ask only for unresolved consequential choices or actions outside that authorization. A review request authorizes a report; fixes, posting, and merging need their own task scope.

## Rules

- Write readable, strict TypeScript; prefer `Readonly<T>`, especially for props. Avoid `any`; explain necessary uses.
- Use single quotes in JS/TS, double quotes in JSX/HTML attributes, two-space indentation, and semicolons.
- Use braces and multiline return statements; separate logical blocks with blank lines.
- Refactor unclear code before commenting; comment non-obvious reasoning.
- Use functional components. Default to server components; use client components for state, effects, event handlers, or browser APIs.
- Split components for readability; colocate private helpers and extract shared or architecturally public components.
- Prefer Tailwind utilities over CSS modules and inline styles; reuse existing UI primitives and theme tokens.
- Reuse About icons from `public/icons/`; ask the developer for an SVG before adding a new icon.
- Before creating any PR, including drafts and CLI-generated PRs, identify related issues from the task, branch, commits, and existing links; read each issue's acceptance criteria. Include `Closes #<number>` for every completed issue, or `Refs #<number>` for partial/related work with what remains. With no related issues, write `None`; do not invent or create an issue to fill the section.
- Submit only after checking every completed issue's closing reference and the repository's current default-branch target. An explicit request for another target takes precedence; explain that its merge will not automatically close issues. Immediately after creation or updates, read back the saved description and base and correct references; repeat before merging. Templates and custom bodies do not replace these checks.
- PRs that change only `.md` files and do not affect live production behavior must have `skip-ci` to skip CI validation jobs and `skip-review` to skip automatic CodeRabbit reviews. Check the full PR diff, including whether Markdown is consumed by the production site or build, before applying these labels. Add both labels when creating the PR and verify them afterward. Reassess after every update and remove both labels if non-Markdown files or production-affecting changes are added. The label gate still runs; see [README.md](README.md#pr-labels).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
