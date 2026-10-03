# Workflow

## Run locally

- Use Node and Yarn versions declared in the root `package.json`; keep the single `yarn.lock`.
- Install both workspaces with `yarn install --frozen-lockfile` from the root.
- Run the site with `yarn dev`; run Studio with `yarn workspace studio dev`.
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

- Keep unit tests beside source as `*.test.ts(x)` or `*.spec.ts(x)`. Vitest uses jsdom and `src/tests/unit/setup.ts`; it excludes E2E specs.
- Let Playwright start its isolated fixture server on port 3100 with `.next-e2e` output. Extend `src/test-support/e2e/sanity-fixtures.ts` when changing GraphQL operations used by browser tests. The fixture API is enabled only with `E2E_FIXTURES=true`; the topic fixtures exercise primary-model GraphQL fields by default.
- When a worktree uses a symlink to dependencies in the main checkout and Turbopack rejects the worktree boundary, prefix either topic E2E command with `NEXT_TURBOPACK_ROOT=/path/to/main-checkout`. This optional development setting does not change production configuration.
- Update intentional visual baselines with `yarn test:e2e:visual:update` after reviewing changes; commit the PNGs under `src/tests/e2e/__screenshots__/`.
- Use `yarn lint:changed` for staged JS/TS only; it does not check unstaged edits. The pre-push hook type-checks the frontend and lints committed changes relative to upstream.
- Account for Studio's type-check exclusions: `sanity.config.ts` and `sanity.cli.ts` are excluded in `studio/tsconfig.json`.

## Handle generated files

- Edit schemas in `studio/schemaTypes/`, then run `yarn generate-types`. It extracts `studio/schema.json` and moves generated types to `src/types/sanity.types.ts`; review both artifacts and adapt affected queries and feature types.
- Regenerate Sanity artifacts rather than editing them manually. Local type generation does not deploy the remote GraphQL schema; use the existing deployment scripts when deployment is part of the requested task.
- Topic-model rollout is coordinated with separate Studio/schema and content migration work. Deploy the additive GraphQL schema and verify the repeatable migration before setting `SANITY_TOPIC_MODEL=primary`; the frontend defaults to the legacy query mode until that cutover. See [BLOG_TOPICS.md](BLOG_TOPICS.md) for the field contract, assignment inventory, migration order, and rollback conditions. Frontend route changes do not imply remote schema or content migration.
- Let `scripts/generate-build-version.mjs` generate `src/data/buildVersion.ts` through `predev` and `prebuild`; keep incidental version changes out of unrelated diffs.
- Preserve the Next.js-managed block in `AGENTS.md` verbatim; the installed generator checks its exact content.

Consult relevant [README.md](../README.md) sections for full setup, CI, Lighthouse, PR labels, and deployment details; use `package.json` and configs as the executable source of truth.
