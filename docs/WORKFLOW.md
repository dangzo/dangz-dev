# Workflow

## File issues and describe PRs

Use the GitHub templates to state the problem or goal, bounded scope, and acceptance criteria or investigation deliverables. Keep small tasks short and remove irrelevant optional sections. See [GitHub template guidance](GITHUB_TEMPLATES.md) for browser/CLI usage, examples, and the investigation rationale. For PRs, report selected checks and their results using the guidance below; follow [AGENTS.md](../AGENTS.md) for required issue-reference and default-branch checks before creation, after creation or updates, and before merging.

## Skills and specialist agents

Repository skills are shared between Codex and Claude Code. Canonical instructions live in `.agents/skills/`; the individual folders under `.claude/skills/` are relative symlinks to them. Edit the canonical files to keep both tools aligned. Codex loads repository skills automatically and supports `$<skill-name>`; Claude Code supports `/<skill-name>`. Automatic discovery remains enabled.

| Skill | Use |
| --- | --- |
| [spec-first](../.agents/skills/spec-first/SKILL.md) | Ground implementation in relevant docs and issue criteria; update code, tests, and docs together. |
| [pr-create](../.agents/skills/pr-create/SKILL.md) | Create concise PR titles and descriptions, including drafts; aim for 100–150 words while preserving required references and validation. |
| [pr-review](../.agents/skills/pr-review/SKILL.md) | Review a PR, branch, or diff for defects, security, doc drift, and issue completion. |
| [ui-review](../.agents/skills/ui-review/SKILL.md) | Verify affected browser flows using local fixtures, accessibility checks, and relevant viewports/themes. |

The `implementer`, `reviewer`, `test-engineer`, and `product-owner` agents share their role instructions in `.agents/roles/`. The Markdown definitions in `.claude/agents/` and standalone TOML definitions in `.codex/agents/` direct each host to those roles. Both hosts inherit the parent model; no provider-specific model is pinned. Codex's reviewer additionally requests a read-only sandbox, while both reviewer definitions forbid source edits and publication regardless of runtime permissions.

Ask for a named specialist directly, or let the main agent delegate independent work when the benefit justifies it. For example: “Have reviewer review this branch” or “Have product-owner draft an investigation issue.” Small implementation tasks include necessary tests without a mandatory agent pipeline. Follow [AGENTS.md](../AGENTS.md#skills-and-delegation) for ownership, existing authorization, and worktree placement.

These instructions adapt the generic Claude Code export: local reviews and accepted doc updates use existing authorization; checks run according to impact rather than three times by default; architecture findings use this repository's boundaries; dependency and documentation changes are reviewed for actual behavior; review-only tasks return reports. Issue and PR drafting uses the existing GitHub templates. Skills do not themselves authorize posting, deployment, or merging.

To validate changes, check skill frontmatter, parse agent YAML/TOML, resolve role links and symlinks, and run `git diff --check`. Verify discovery in both hosts after changing definitions; restart a session if its skill or agent list is stale. Application tests are unnecessary for instructions-only changes. Shared definitions are tracked, while personal Claude settings remain ignored.

## Run locally

- Use Node and Yarn versions declared in the root `package.json`; keep the single `yarn.lock`.
- Install both workspaces with `yarn install --frozen-lockfile` from the root.
- Run the site with `yarn dev`; run Studio with `yarn workspace studio dev`.
- For the #158 local review, `LOCAL_EDITORIAL_PREVIEW=true yarn dev` uses proposed article summaries on Home and blog listings in development only. Omit the switch to use CMS excerpts. See [HOME_REVIEW.md](HOME_REVIEW.md) for the checkpoint and worktree restart command.
- Configure local `.env` and `studio/.env` as needed. Keep `SANITY_API_READ_ONLY_TOKEN` (draft preview), `SANITY_API_WRITE_TOKEN` (reactions), and `SANITY_REVALIDATE_SECRET` (webhook verification) server-side. Read Studio variable names from its config and CLI files.

## Validate the affected behavior

Run commands from the repository root. Select checks by the change; report failures and checks you could not run.

| Change | Checks |
| --- | --- |
| Frontend TypeScript | `yarn lint`, `yarn typecheck`; run affected unit tests |
| Component, hook, utility | `yarn test:unit src/path/to/file.test.tsx` (use the actual test path) |
| Routing or browser interaction | `yarn test:e2e src/tests/e2e/<name>.spec.ts` |
| Blog topic routes and publication split | `yarn test:e2e src/tests/e2e/topics.spec.ts`; to check fixture draft preview behavior, `E2E_PREVIEW_DRAFTS=true yarn test:e2e src/tests/e2e/topics.spec.ts` |
| Layout or visual styling | Run affected browser specs; inspect affected pages at desktop and mobile widths in light and dark themes, using screenshots when useful |
| Studio schema or code | `yarn lint-studio`, `yarn typecheck-studio`; regenerate types for schema changes |
| Build or dependency configuration | `yarn ci:build`; add relevant lint, type, and test checks |
| Documentation only | Check links, command names, and consistency with source; skip application tests |

- Keep unit tests beside source as `*.test.ts(x)` or `*.spec.ts(x)`. Vitest includes frontend, Studio, and migration tests, uses jsdom and `src/tests/unit/setup.ts`, and excludes E2E specs. Migration tests select the Node environment; React is deduplicated across the workspaces for Studio component tests.
- Article image viewer checks use `yarn test:e2e src/tests/e2e/article-image-viewer.spec.ts` with the `fixture-post-5` cover and landscape/portrait inline images. Browser image responses are intercepted for deterministic sizing and loading/error checks. Inspect the viewer in both themes at desktop/mobile sizes when changing its styling; component tests cover isolation cleanup and original-image URL construction.
- Reaction lifecycle and concurrency checks are listed in [REACTION_ANALYTICS.md](REACTION_ANALYTICS.md); include search and bottom-exposure regressions when changing their shared transport.
- Analytics timing changes need separate production browser and dashboard evidence; development fixture tests simulate tracker readiness. Follow [UMAMI_EXPOSURE.md](UMAMI_EXPOSURE.md) for bottom-reaction checks and intercept production reaction POSTs.
- Pageview integration tests use `yarn test:e2e:pageviews`, a separate fixture server on port 3101 with an intercepted real tracker. Both fixture flags enable the actual integration with a fictitious website ID; normal browser suites omit it. CI and `yarn ci:test` run this suite after ordinary E2E tests. Follow [UMAMI_PAGEVIEWS.md](UMAMI_PAGEVIEWS.md) for counting policy and deployed collector/dashboard checks.
- Article discovery real-tracker tests run with `yarn test:e2e:pageviews` alongside pageview regressions; ordinary E2E excludes that spec. See [POST_DISCOVERY_ANALYTICS.md](POST_DISCOVERY_ANALYTICS.md) for activation coverage and the owner dashboard handoff.
- Contact analytics browser tests inject a pinned real tracker and intercept its collector; no live analytics is sent. Follow [CONTACT_ANALYTICS.md](CONTACT_ANALYTICS.md) for separate delivery, download, and owner dashboard checks.
- Let Playwright start its isolated fixture server on port 3100 with `.next-e2e` output. Extend `src/test-support/e2e/sanity-fixtures.ts` when changing GraphQL operations used by browser tests. The fixture API is enabled only with `E2E_FIXTURES=true`; the topic fixtures exercise primary-model GraphQL fields by default.
- When a worktree uses a symlink to dependencies in the main checkout and Turbopack rejects the worktree boundary, prefix either topic E2E command with `NEXT_TURBOPACK_ROOT=/path/to/main-checkout`. This optional development setting does not change production configuration.
- Automated pixel comparisons and committed screenshot baselines are not used. Keep functional and targeted layout assertions; add regression coverage for concrete defects. Failure screenshots and first-retry traces remain enabled for debugging.
- Use `yarn lint:changed` for staged JS/TS only; it does not check unstaged edits. The pre-push hook type-checks the frontend and lints committed changes relative to upstream.
- Studio type checking includes `sanity.config.ts`, `sanity.cli.ts`, schemas, components, and tests.

## Handle generated files

- Edit schemas in `studio/schemaTypes/`, then run `yarn generate-types`. It extracts `studio/schema.json` with `--force` and moves generated types to `src/types/sanity.types.ts`; review both artifacts and adapt affected queries and feature types.
- Regenerate Sanity artifacts rather than editing them manually. Local type generation does not deploy the remote GraphQL schema; use the existing deployment scripts when deployment is part of the requested task.
- Topic-model rollout is coordinated with separate Studio/schema and content migration work. Deploy the additive GraphQL schema and verify the repeatable migration before setting `SANITY_TOPIC_MODEL=primary`; the frontend defaults to the legacy query mode until that cutover. See [BLOG_TOPICS.md](BLOG_TOPICS.md) for the field contract, assignment inventory, migration order, and rollback conditions. Frontend route changes do not imply remote schema or content migration.
- Run `yarn migrate:topics --dry-run` for a read-only backed-up report. Migration artifacts contain private drafts and stay under ignored `.tmp/`. See [STUDIO_TOPICS.md](STUDIO_TOPICS.md) for authoring, exact report review, separate live application, GraphQL/webhook deployment, and guarded rollback. Keep the temporary editorial preview until migrated excerpts are verified.
- Let `scripts/generate-build-version.mjs` generate `src/data/buildVersion.ts` through `predev` and `prebuild`; keep incidental version changes out of unrelated diffs.
- Preserve the Next.js-managed block in `AGENTS.md` verbatim; the installed generator checks its exact content.

Consult relevant [README.md](../README.md) sections for full setup, CI, Lighthouse, PR labels, and deployment details; use `package.json` and configs as the executable source of truth.
