# AGENTS.md

## Read on demand

- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) when locating code or changing routing, data flow, or UI structure.
- Read [docs/WORKFLOW.md](docs/WORKFLOW.md) when running checks or changing schemas, queries, or generated files.
- Read only task-relevant sections; update guidance when documented behavior changes.

## Rules

- Write readable, strict TypeScript; prefer `Readonly<T>`, especially for props. Avoid `any`; explain necessary uses.
- Use single quotes in JS/TS, double quotes in JSX/HTML attributes, two-space indentation, and semicolons.
- Use braces and multiline return statements; separate logical blocks with blank lines.
- Refactor unclear code before commenting; comment non-obvious reasoning.
- Use functional components. Default to server components; use client components for state, effects, event handlers, or browser APIs.
- Split components for readability; colocate private helpers and extract shared or architecturally public components.
- Prefer Tailwind utilities over CSS modules and inline styles; reuse existing UI primitives and theme tokens.
- Reuse About icons from `public/icons/`; ask the developer for an SVG before adding a new icon.
- Before creating any PR (including drafts and CLI-generated PRs), identify related GitHub issues from the task, branch, commits, and existing issue links. Read each related issue's acceptance criteria to determine whether the PR completes it.
- Include `Closes #<issue-number>` in the PR description for every completed issue so merging into the repository's default branch automatically closes it. Use `Refs #<issue-number>` only for related or partially completed issues that should remain open, and state what remains. If there are no related issues, write `None` in the Related issues section; do not invent an issue number or create an issue solely to fill this section.
- Treat issue references as a required PR creation check: do not submit the PR until the prepared description includes every completed issue's closing reference and the target is the repository's current default branch. An explicit user request to target another branch takes precedence; explain that closing references will not automatically close issues on that merge.
- Immediately after creating or updating a PR, read back its saved description and base branch and correct missing or incorrect issue references. Repeat this check before merging. Supplying a custom body or using a template does not replace these checks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
