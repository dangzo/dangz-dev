# Dependency security

## Issue #170 inventory

Reviewed on 2026-10-04: 33 open Dependabot alerts in `yarn.lock`, all for transitive npm dependencies. The updates below remove vulnerable versions for 30 alerts. GitHub closure must be verified after the fixes reach the default branch, `dev`; local version verification does not close alerts.

| Dependency | Alerts | Dependency path | Updated version |
| --- | --- | --- | --- |
| `adm-zip` | #166, #174, #188–#192 | Sanity CLI → workbench CLI → module-federation DTS plugin; runtime CLI | 0.6.1 |
| `undici` | #175, #179–#187 | Sanity CLI → workbench CLI → module-federation DTS plugin | 7.29.1; existing patched 7.30.0 and 8.x branches retained |
| `js-yaml` | #14, #111, #117, #157, #173 | Sanity CLI → `@vercel/frameworks`; Lighthouse CI utils | 3.15.2; existing patched 4.x branch retained |
| `brace-expansion` | #198 | ESLint tooling → minimatch | 1.1.21; existing patched 5.0.12 branch retained |
| `markdown-it` | #56, #178 | Sanity GraphiQL plugin → GraphiQL React | 14.3.1 |
| `linkify-it` | #110, #124 | GraphiQL React → markdown-it | 5.0.2 |
| `tmp` | #47, #50 | Lighthouse CI; inquirer → external-editor | 0.2.7 |
| `uuid` | #49 | Lighthouse CI; Sanity CLI → typeid-js | 11.1.1; existing patched 14.x branch retained |

The source inventory is [Dependabot alerts](https://github.com/dangzo/dangz-dev/security/dependabot), tracked by [issue #170](https://github.com/dangzo/dangz-dev/issues/170). Alert #166 has no first-patched-version metadata, but 0.6.1 is outside its affected range (`>= 0.5.9, <= 0.6.0`).

## Resolution policy

Root `package.json` resolutions override upstream pins without upgrading unrelated direct dependencies. Yarn's incompatible-resolution warnings are expected for these intentional overrides. Remove an override when every introducing parent supports a patched version naturally.

The GraphiQL plugin pins a markdown-it 12.x consumer, so its documentation renderer needs smoke testing against 14.3.1. The `tmp` consumers use the retained temporary-file APIs. UUID 11.1.1 supplies both CommonJS and ESM exports, retaining Lighthouse's `require('uuid').v4()` and typeid-js's UUID APIs; forcing the ESM-only latest major globally would also change unrelated consumers.

## Unresolved alerts and mitigations

### braces: #203

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects every published version through 3.0.3. No patched npm release was available at review time.

Introduced by Next.js ESLint tooling through fast-glob/micromatch, and by Sanity code generation through chokidar and globby. The repository supplies its lint and code-generation file patterns; application source does not directly invoke braces or accept visitor-provided glob patterns. This limits exposure but does not fix the installed package. Treat external changes to tool configuration as code requiring review, and do not pass untrusted patterns to these tools.

Follow-up: [issue #180](https://github.com/dangzo/dangz-dev/issues/180) tracks a published patched release or replacement of the affected glob dependency paths. Keep [alert #203](https://github.com/dangzo/dangz-dev/security/dependabot/203) open until its vulnerable version is removed.

### extract-zip: #161 and #168

[GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) and [GHSA-7pqw-9j4j-h8q3](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3) affect extract-zip through 2.0.1, which remained the latest npm release at review time.

Introduced only by Lighthouse CI → Lighthouse → puppeteer-core → `@puppeteer/browsers`. The application does not use it to process uploaded archives. Lighthouse collection launches an installed Chrome executable; the repository does not configure a Puppeteer download script. Use `CHROME_PATH` or `--collect.chromePath` to select an installed trusted browser. Do not invoke the transitive browser installer with arbitrary archives, mirrors, or download URLs. These constraints reduce exposure but leave the vulnerable dependency installed.

Follow-up: [issue #181](https://github.com/dangzo/dangz-dev/issues/181) tracks a compatible Lighthouse/Puppeteer upgrade whose browser downloader no longer depends on extract-zip, or an upstream patched release when available. Keep [alert #161](https://github.com/dangzo/dangz-dev/security/dependabot/161) and [alert #168](https://github.com/dangzo/dangz-dev/security/dependabot/168) open until the vulnerable package is removed.

## Verification and rollout

- Install with Node 24.15 and Yarn 1.22.22 using `yarn install --frozen-lockfile`.
- Inspect resolved versions, including nested packages in both workspaces; every patched package must be outside all corresponding advisory ranges.
- Run `yarn ci:lint`, `yarn ci:typecheck`, `yarn test:unit`, `yarn test:e2e`, and `yarn ci:build`. Review existing desktop/mobile visual coverage and smoke-test Studio/GraphiQL plus the overridden UUID/temp-file consumers.
- Run mobile and desktop Lighthouse checks with an installed Chrome executable. Report unavailable checks or failures separately from successful dependency-version verification.
- For the #170 remediation described here, the PR targets `dev` and includes `Closes #170`. After that merge, refresh the alert inventory, confirm closure for the 30 addressed alerts, and retain the three exceptions with follow-up tracking. Future dependency work follows its own issue criteria and the current default-branch checks in [AGENTS.md](../AGENTS.md).

Local validation on 2026-10-04: all 292 unit tests and 64 browser tests (including desktop/mobile visual baselines) passed, frontend and Studio type checks passed, and both standard production builds passed. Lint passed with generated `playwright-report/**` and `test-results/**` excluded; the unmodified lint command also scanned pre-existing report bundles. Mobile and desktop Lighthouse assertions passed on all four configured URLs, three runs per URL, using installed Chrome and local report storage.

A clean frozen installation verified every installed copy of the eight fixable packages across both workspaces. It also removed stale Sanity client 7 files under SDK 3.7, which requires client 8; the stale files had caused missing get-it exports in local Studio bundling. Lint, types, unit/browser tests, production builds, the fully bundled Studio build, and UUID/typeid/temp-file/GraphiQL MarkdownContent smoke checks passed after this reset. No workspace hoisting or application compatibility changes were needed.

The fresh Studio development server rendered its project-connection/CORS screen in Chromium without runtime errors. Authenticated content editing was not exercised because the temporary local origin was not registered; no remote project configuration was changed.
