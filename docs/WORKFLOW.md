# Workflow

## File issues and describe PRs

Use the [GitHub templates](GITHUB_TEMPLATES.md) for a problem/goal, bounded scope, and observable acceptance criteria. Report selected checks and actual results; [AGENTS](../AGENTS.md) owns issue-reference, default-branch, read-back, and label requirements.

## Skills and specialist agents

Canonical skills live in `.agents/skills/`; `.claude/skills/` contains relative symlinks. Edit shared sources. Codex supports `$<skill-name>` and Claude Code `/<skill-name>`; discovery is automatic.

| Skill | Use |
| --- | --- |
| [spec-first](../.agents/skills/spec-first/SKILL.md) | Ground implementation in docs, source, and issue criteria |
| [pr-create](../.agents/skills/pr-create/SKILL.md) | Write concise PR titles/descriptions |
| [pr-review](../.agents/skills/pr-review/SKILL.md) | Review defects, security, doc alignment, and issue completion |
| [ui-review](../.agents/skills/ui-review/SKILL.md) | Verify affected browser flows |

Shared `implementer`, `reviewer`, `test-engineer`, and `product-owner` roles live in `.agents/roles/`. `.claude/agents/` Markdown and `.codex/agents/` TOML are host adapters; both inherit the parent model. Reviewers return findings without editing or publishing; Codex additionally requests a read-only sandbox. Delegate under [AGENTS](../AGENTS.md#skills-and-delegation) when independent work justifies it.

For definition changes, check frontmatter, YAML/TOML, links/symlinks, and `git diff --check`. Verify discovery in both hosts; restart stale sessions. Personal Claude settings remain ignored. Application tests are unnecessary for instruction-only changes.

## Run locally

- Use Node/Yarn from root `package.json`; install both workspaces with `yarn install --frozen-lockfile` and keep the single lockfile.
- Run the site with `yarn dev`, Studio with `yarn workspace studio dev`. Configure root `.env` and `studio/.env`; read Studio variable names from config/CLI files. Keep `SANITY_API_READ_ONLY_TOKEN` (preview), `SANITY_API_WRITE_TOKEN` (reactions), and `SANITY_REVALIDATE_SECRET` (webhook) server-side.
- `LOCAL_EDITORIAL_PREVIEW=true yarn dev` overrides known Home/listing summaries from `src/data/blogTopics.ts` in development only. Omit it to compare CMS excerpts. Remove the helper only after migrated CMS excerpts are verified; production and search continue using CMS copy.

## Validate the affected behavior

Run from the repository root; select checks by impact and report failures/unavailable checks.

| Change | Checks |
| --- | --- |
| Frontend TypeScript | `yarn lint`, `yarn typecheck`, affected unit tests |
| Component/hook/utility | `yarn test:unit <actual-test-path>` |
| Routing/browser interaction | `yarn test:e2e src/tests/e2e/<name>.spec.ts` |
| Layout/styles | Affected browser specs; inspect desktop/mobile in both themes |
| Studio schema/code | `yarn lint-studio`, `yarn typecheck-studio`; regenerate schema artifacts when changed |
| Build/dependencies | `yarn ci:build`, relevant lint/type/test checks |
| Documentation/instructions | Check links, commands, source consistency, `git diff --check`; skip application tests |
| Release automation | `yarn test:unit scripts/release-pr.test.ts`, `yarn typecheck`; validate workflow YAML |

### Focused browser suites

| Concern | Spec or contract |
| --- | --- |
| Topics, drafts, publication split | `topics.spec.ts`; repeat with `E2E_PREVIEW_DRAFTS=true` |
| Next-read recommendations | `related-posts.spec.ts`; repeat with `E2E_PREVIEW_DRAFTS=true`; metadata operation is `AllRelatedPosts` |
| Image viewer | `article-image-viewer.spec.ts`; fixture-post-5 cover/landscape/portrait images, intercepted image responses |
| Code variants | `code-variants.spec.ts`; fixture-post-6; [CODE_VARIANTS](CODE_VARIANTS.md) |
| Search/palette | `search.spec.ts`; [SEARCH_ANALYTICS](SEARCH_ANALYTICS.md) |
| Reactions/exposure | `reaction-submissions.spec.ts`, `bottom-reactions-exposure.spec.ts`; [REACTION_ANALYTICS](REACTION_ANALYTICS.md) |
| Contact/article events | `contact-analytics.spec.ts`, `article-analytics.spec.ts`; [ANALYTICS](ANALYTICS.md) |
| Real-tracker pageviews/discovery | `yarn test:e2e:pageviews`; [UMAMI_PAGEVIEWS](UMAMI_PAGEVIEWS.md) |

Spec filenames above live under `src/tests/e2e/`. Timing/integration fixtures do not establish deployed collector acceptance or owner-dashboard visibility; use [analytics verification](ANALYTICS.md).

### Fixtures and test boundaries

- Unit tests are colocated `*.test.ts(x)`/`*.spec.ts(x)`. Vitest includes frontend, Studio, and scripts, excludes E2E, and uses jsdom with `src/tests/unit/setup.ts`; migration tests select Node. React is deduplicated for Studio tests. Studio type checks include config, CLI, schemas, components, and tests.
- Let Playwright start its fixture server on port 3100 with `.next-e2e`; extend `src/test-support/e2e/sanity-fixtures.ts` for changed GraphQL operations. The fixture API requires `E2E_FIXTURES=true`; topic fixtures use primary-model fields by default.
- Pageview/discovery tests use a separate config/server on port 3101, fictitious analytics ID, pinned real tracker, and intercepted collector. Both `E2E_FIXTURES=true` and `E2E_UMAMI_PAGEVIEWS=true` enable the integration. Ordinary E2E excludes these specs. CI and `yarn ci:test` run both suites sequentially: servers in one checkout share `.next-e2e` regardless of port.
- If shared dependency symlinks cause Turbopack boundary errors, prefix development/browser commands with `NEXT_TURBOPACK_ROOT=/path/to/main-checkout`. This does not change production config.
- Use functional and targeted layout assertions for regressions. Pixel baselines are not maintained; failure screenshots and first-retry traces aid debugging.
- `yarn lint:changed` checks staged JS/TS only. The pre-push hook type-checks frontend and lints committed changes relative to upstream.

## Handle generated files

- Edit `studio/schemaTypes/`, then run `yarn generate-types`. Review generated `studio/schema.json` and `src/types/sanity.types.ts` together and adapt consumers. Regenerate rather than hand-edit; local generation does not deploy remote GraphQL.
- Topic rollout separates frontend compatibility, additive GraphQL schema, backed-up migration, webhook, Studio, and primary-mode cutover. Follow [BLOG_TOPICS](BLOG_TOPICS.md) and [STUDIO_TOPICS](STUDIO_TOPICS.md). `yarn migrate:topics --dry-run` uses read-only access; private artifacts stay under ignored `.tmp/`. Keep legacy fields/redirect destinations during rollback.
- `predev`/`prebuild` generate `src/data/buildVersion.ts`; keep incidental changes out of unrelated diffs.
- Preserve the Next.js-managed block in `AGENTS.md` verbatim; its generator checks exact content.

## Release from GitHub

Use **Actions → Create release PR → Run workflow** on `dev`, review the `dev → main` PR, and merge after required checks pass. [RELEASES](RELEASES.md) covers authentication and rollout; the workflow never merges automatically. [README](../README.md#pr-labels) owns CI/merge-label behavior.
