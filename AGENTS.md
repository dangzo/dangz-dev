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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
