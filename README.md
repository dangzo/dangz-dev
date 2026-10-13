# dangz-dev

Daniele Gazzelloni's portfolio and frontend engineering blog: [dangz.dev](https://dangz.dev/).
The root `blog` package runs Next.js, React, and TypeScript; the `studio/` Yarn workspace manages Sanity content.

## Getting started

Use the Node version required by [package.json](package.json) and its declared Yarn version. Install both workspaces from the root with the single lockfile:

```bash
git clone https://github.com/dangzo/dangz-dev.git
cd dangz-dev
yarn install --frozen-lockfile
```

Configure root `.env` and `studio/.env` for your Sanity project. Read variable names from the application clients and Studio config/CLI files. Keep tokens and the webhook signing secret server-side; see [WORKFLOW](docs/WORKFLOW.md#run-locally).

```bash
yarn dev                    # site: http://localhost:3000
yarn workspace studio dev   # Studio: http://localhost:3333
```

Run each server in its own terminal. [ARCHITECTURE](docs/ARCHITECTURE.md) maps source and data flow; [WORKFLOW](docs/WORKFLOW.md) covers checks, fixtures, generated files, and agent tooling. [Package scripts](package.json) are the command inventory.

## Validation

Select checks by impact using [WORKFLOW](docs/WORKFLOW.md#validate-the-affected-behavior):

```bash
yarn ci:lint       # frontend and Studio
yarn ci:typecheck  # includes Studio config and CLI files
yarn test:unit     # frontend, Studio, and scripts; excludes browser specs
yarn test:e2e      # ordinary fixture-backed browser flows
yarn test:e2e:pageviews # real-tracker pageview/discovery integration
yarn ci:build      # frontend and Studio production builds
```

Vitest uses jsdom by default; migration tests select Node. Playwright starts isolated fixture servers; ordinary and pageview suites must run sequentially in one checkout because they share `.next-e2e`. Browser tests use functional and targeted layout assertions, with failure screenshots and first-retry traces. Pixel baselines are not maintained.

`yarn ci:test` runs unit, ordinary browser, and pageview suites. `yarn ci` adds lint, types, both Lighthouse presets, and builds. `yarn lint:changed` checks staged JS/TS only; the pre-push hook type-checks the frontend and lints committed changes relative to upstream.

## CI/CD pipeline

[PR Checks](.github/workflows/pr-quality-and-build.yml) runs on opened, updated, reopened, ready-for-review, labeled, and unlabeled PR events. The label gate runs first; dependency setup enables parallel lint, unit/browser tests, type checks, and builds. Mobile and desktop Lighthouse audits reuse the production build on separate runners.

Required checks are `Lint`, `Test (Unit)`, `Test (E2E)`, `Type Check`, `Build`, and `Lighthouse`. Each Lighthouse preset checks four URLs three times. Local `yarn lhci:mobile` and `yarn lhci:desktop` build their own server; CI reuses its build artifact. Dependency jobs share exact lockfile-based caches, with frozen installs on misses.

### PR labels

| Label | Effect |
| --- | --- |
| `automerge` | Authorizes Kodiak to merge once branch protection requirements are satisfied |
| `skip-ci` | Skips every validation job after the label gate |
| `skip-review` | Skips automatic CodeRabbit reviews |
| `dependencies` | Classifies dependency updates and skips automatic CodeRabbit reviews |
| `skip-lighthouse` | Skips both Lighthouse audits and their summary; other checks still run |

PRs containing only non-production `.md` changes must receive `skip-ci` and `skip-review` at creation. Check the full diff and whether Markdown is consumed by the site/build. Reassess after updates and remove both labels if code or production-affecting changes are added. See [AGENTS](AGENTS.md) for issue-reference and saved-PR checks.

Every label change starts a new PR Checks run. Changes to either CI skip label cancel the current run; other labels queue a run without cancellation. The gate always runs so unrelated labels cannot replace failures with skipped checks. Removing the CI skip labels restores validation; `skip-ci` takes precedence over `skip-lighthouse`. Skip labels do not authorize merging. Avoid `[skip ci]` commit messages: required checks stay pending.

Dependabot applies `skip-lighthouse`, without automatic merge authorization. Remove it to request performance checks. Add `automerge` only when ready; removing it withdraws Kodiak authorization before merge. [.kodiak.toml](.kodiak.toml) uses defaults and requires the installed app and target-branch protection.

### CodeRabbit reviews

[.coderabbit.yaml](.coderabbit.yaml) enables assertive automatic and incremental reviews. PRs labeled `skip-review` or `dependencies` are excluded. Other eligibility and pause behavior use CodeRabbit defaults; draft PRs are normally skipped. Chat replies require an explicit mention.

| PR comment | Action |
| --- | --- |
| `@coderabbitai review` | Review new changes |
| `@coderabbitai full review` | Request a complete review |
| `@coderabbitai configuration` | Show effective settings and their sources |

Use the configuration command to diagnose organization/workspace overrides. See [review commands](https://docs.coderabbit.ai/reference/review-commands) and [automatic review controls](https://docs.coderabbit.ai/configuration/auto-review).

### Issue and PR templates

Choose a bug, feature/change, or investigation/maintenance template from the [issue chooser](https://github.com/dangzo/dangz-dev/issues/new/choose); blank issues remain available. The [PR template](.github/pull_request_template.md) prompts for the result, changes, issue references, validation, and relevant rollout risks. See [template usage](docs/GITHUB_TEMPLATES.md).

## AI agent guidance

[AGENTS.md](AGENTS.md) contains shared coding/process rules; `CLAUDE.md` points to it. Read architecture/workflow and feature references only when relevant. Shared skills and specialist roles live under `.agents/`, with Claude/Codex host adapters; see [WORKFLOW](docs/WORKFLOW.md#skills-and-specialist-agents).

For documentation changes, follow [documentation maintenance](AGENTS.md#documentation-maintenance): extend existing guides for lasting knowledge and keep task history in issues/PRs. New files need a distinct recurring purpose.

## Deployment

Merges to `main` deploy production on Vercel. Release `dev` through **Actions → Create release PR → Run workflow**, review its `dev → main` PR, and merge after required checks pass. [RELEASES](docs/RELEASES.md) covers authentication, merge method, and rollout. Studio and GraphQL deployments are separate; local type generation does not deploy either.

The footer build version is `YY.Push.MMDD`: UTC year, commit count since January 1, and UTC month/day. [generate-build-version.mjs](scripts/generate-build-version.mjs) produces [buildVersion.ts](src/data/buildVersion.ts) during `predev`/`prebuild`; no environment variable is needed. Keep incidental generated changes out of unrelated work.

## License

This project is personal and not licensed for reuse. Bundled third-party fonts and test assets retain their own licenses.
