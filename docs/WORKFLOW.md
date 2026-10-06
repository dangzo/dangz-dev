# Workflow

## File issues and describe PRs

Use the GitHub templates to state the problem or goal, bounded scope, and acceptance criteria or investigation deliverables. Keep small tasks short and remove irrelevant optional sections. See [GitHub template guidance](GITHUB_TEMPLATES.md) for browser/CLI usage, examples, and the investigation rationale. For PRs, report selected checks and their results using the guidance below; follow [AGENTS.md](../AGENTS.md) for closing references and the default-branch check before merging.

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
| Layout or visual styling | `yarn test:e2e:visual`; review desktop and mobile image diffs |
| Studio schema or code | `yarn lint-studio`, `yarn typecheck-studio`; regenerate types for schema changes |
| Build or dependency configuration | `yarn ci:build`; add relevant lint, type, and test checks |
| Documentation only | Check links, command names, and consistency with source; skip application tests |

- Keep unit tests beside source as `*.test.ts(x)` or `*.spec.ts(x)`. Vitest includes frontend, Studio, and migration tests, uses jsdom and `src/tests/unit/setup.ts`, and excludes E2E specs. Migration tests select the Node environment; React is deduplicated across the workspaces for Studio component tests.
- Analytics timing changes need separate production browser and dashboard evidence; development fixture tests simulate tracker readiness. Follow [UMAMI_EXPOSURE.md](UMAMI_EXPOSURE.md) for bottom-reaction checks and intercept production reaction POSTs.
- Contact analytics browser tests inject a pinned real tracker and intercept its collector; no live analytics is sent. Follow [CONTACT_ANALYTICS.md](CONTACT_ANALYTICS.md) for separate delivery, download, and owner dashboard checks.
- Let Playwright start its isolated fixture server on port 3100 with `.next-e2e` output. Extend `src/test-support/e2e/sanity-fixtures.ts` when changing GraphQL operations used by browser tests. The fixture API is enabled only with `E2E_FIXTURES=true`; the topic fixtures exercise primary-model GraphQL fields by default.
- When a worktree uses a symlink to dependencies in the main checkout and Turbopack rejects the worktree boundary, prefix either topic E2E command with `NEXT_TURBOPACK_ROOT=/path/to/main-checkout`. This optional development setting does not change production configuration.
- Update intentional visual baselines with `yarn test:e2e:visual:update` after reviewing changes; commit the PNGs under `src/tests/e2e/__screenshots__/`.
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
