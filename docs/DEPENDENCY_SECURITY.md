# Dependency security

The constraints below were recorded during the 2026-10-04 review in [issue #170](https://github.com/dangzo/dangz-dev/issues/170). They are dated assumptions, not a fresh vulnerability assessment. Consult [Dependabot alerts](https://github.com/dangzo/dangz-dev/security/dependabot) and the follow-up issues for current status before dependency work.

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

## Verify dependency changes

Use the manifest's Node/Yarn versions and a frozen installation. Inspect every resolved copy across both workspaces against current advisory ranges, then select checks from [WORKFLOW.md](WORKFLOW.md#validate-the-affected-behavior). Smoke-test affected overridden consumers, including Studio/GraphiQL and UUID/temp-file APIs. Lighthouse uses an installed trusted Chrome executable. Local version verification does not close GitHub alerts; confirm their status after fixes reach the default branch and retain unresolved follow-up tracking.
