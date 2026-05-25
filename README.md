# dangz-dev

A personal blog and portfolio site built with **Next.js**, **TypeScript**, and **Sanity CMS**.

🔗 **Live URL:** [https://dangz.dev/](https://dangz.dev/)

---

## Overview

This project serves as a personal web presence for publishing content and showcasing work. It combines a modern frontend stack with a headless CMS setup for flexible content management.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React](https://reactjs.org/) | UI library for building interactive interfaces |
| [Next.js](https://nextjs.org/) | App framework for routing, rendering, and deployment |
| [TypeScript](https://www.typescriptlang.org/) | Static typing and improved developer experience |
| [Sanity CMS](https://www.sanity.io/) | Headless CMS for structured content management |

---

## Monorepo Structure

This project is managed as a **Yarn workspaces** monorepo containing two packages:

| Package | Location | Description |
|---|---|---|
| `blog` (Next.js app) | `/` | Personal blog and portfolio frontend |
| `studio` (Sanity Studio) | `studio/` | Sanity content management studio |

A single `yarn install` from the root installs dependencies for both packages.

---

## Getting Started

### Prerequisites

- Node.js `>= 22.13`
- Yarn `>= 1.22.22`
- `.env` file at the root and `studio/.env` for Sanity Studio env vars

### Installation

```bash
git clone https://github.com/dangzo/dangz-dev.git
cd dangz-dev
yarn install
```

### Run Locally

Start the Next.js app:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

Start the Sanity Studio:

```bash
cd studio && yarn dev
```

Open [http://localhost:3333](http://localhost:3333) in the browser.

### Linting

Lint both packages from the root:

```bash
yarn lint && yarn lint-studio
```

To auto-fix lint issues where supported:

```bash
yarn lint --fix
```

### Type Checking

Type-check both packages from the root:

```bash
yarn typecheck && yarn typecheck-studio
```

Note: `yarn typecheck-studio` intentionally excludes `studio/sanity.config.ts` and `studio/sanity.cli.ts` for now due a dependency-type duplication conflict between workspace and hoisted Sanity packages. The rest of Studio `.ts/.tsx` files are still type-checked in CI.

### Testing Strategy

This project uses a two-layer testing approach:

- **Unit/component tests** with **Vitest + Testing Library**
- **End-to-end tests** with **Playwright**

The layers are intentionally separated so unit tests stay fast and deterministic, while e2e tests validate full user flows in a real browser.

#### Unit Tests (Vitest)

- **Command:** `yarn test:unit` (single run)
- **Runtime:** `jsdom`
- **Scope:** component tests, hooks, utility functions, API helpers
- **Location:** `src/**/*.test.ts(x)` and `src/**/*.spec.ts(x)`
- **Config:** [`vitest.config.ts`](vitest.config.ts)

Vitest explicitly excludes e2e specs under `src/tests/e2e/**`, so `yarn test:unit` does **not** execute Playwright tests.

#### End-to-End Tests (Playwright)

- **Command:** `yarn test:e2e`
- **Variants:** `yarn test:e2e:headed`, `yarn test:e2e:ui`
- **Scope:** route-level user journeys and integration behavior (home, blog, article, about, global UI)
- **Location:** `src/tests/e2e/`
- **Config:** [`playwright.config.ts`](playwright.config.ts)

Playwright starts the app server automatically via the configured `webServer` command and runs against `http://127.0.0.1:3000` by default.

---

## Yarn Workspaces

This monorepo is managed with Yarn workspaces. The root `package.json` defines the workspace configuration and shared dependencies. Each package (project root and `studio`) has its own `package.json` for package-specific dependencies and scripts.

### Available Scripts

#### Core Commands

| Command | Description |
|---|---|
| `yarn dev` | Starts the Next.js development server |
| `yarn build` | Builds the Next.js app for production |
| `yarn start` | Starts the Next.js production server |
| `yarn preview` | Builds and starts the Next.js app for previewing production build locally |
| `yarn build-studio` | Builds the Sanity Studio only |

#### Quality Commands

| Command | Description |
|---|---|
| `yarn lint` | Lints the Next.js app |
| `yarn lint:changed` | Lints only staged JS/TS files (useful for quick local checks) |
| `yarn lint-studio` | Lints the Sanity Studio only |
| `yarn test:unit` | Runs unit tests once (Vitest run mode) |
| `yarn test:e2e` | Runs end-to-end tests (Playwright) |
| `yarn test:e2e:headed` | Runs e2e tests in headed browser mode |
| `yarn test:e2e:ui` | Opens Playwright UI mode for interactive debugging |
| `yarn typecheck` | Type-checks the Next.js app |
| `yarn typecheck-studio` | Type-checks the Sanity Studio only |
| `yarn ci:lint` | Runs lint (both packages) — mirrors the CI lint job |
| `yarn ci:test` | Runs full test suite (`test:unit` + `test:e2e`) |
| `yarn ci:typecheck` | Runs type checks across both packages — mirrors the CI typecheck job |
| `yarn ci:build` | Builds both packages — mirrors the CI build job |
| `yarn ci` | Runs all CI checks in sequence (`ci:lint` → `ci:test` → `ci:typecheck` → `ci:lighthouse` → `ci:build`) |

#### Lighthouse Commands

| Command | Description |
|---|---|
| `yarn ci:lighthouse` | Runs the Lighthouse CI entrypoint used by the combined CI script |
| `yarn lhci:mobile` | Runs Lighthouse CI autorun using the mobile preset |
| `yarn lhci:desktop` | Runs Lighthouse CI autorun using the desktop preset |

#### Utility and Deployment Commands

| Command | Description |
|---|---|
| `yarn generate-build-version` | Generates the footer build semver (`YY.Push.MMDD`) from git history |
| `yarn generate-types` | Generates TypeScript types from Sanity schemas and adds them to the Next.js app |
| `yarn deploy-studio` | Deploys the Sanity Studio |
| `yarn deploy-graphql` | Deploys GraphQL schemas to Sanity |

---

## CI/CD Pipeline

Pull requests trigger the **PR Checks** workflow ([`.github/workflows/pr-quality-and-build.yml`](.github/workflows/pr-quality-and-build.yml)), which runs seven jobs:

```
             ┌──────────────┐
             │    setup     │   (install dependencies + cache)
             └──────┬───────┘
                    │
     ┌─────────────┬─────────────┬──────────────┬──────────────┬──────────────┐
     ▼             ▼             ▼              ▼              ▼
┌──────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  lint    │  │  test-unit  │  │   test-e2e   │  │  typecheck   │  │  lighthouse  │   (run in parallel)
└────┬─────┘  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
     └────┬──────────┴───────────────┴──────────────┴──────────────┬──────┘
          ▼
      ┌─────────┐
     │  build  │                   (runs only if all above pass)
      └─────────┘
```

| Job | Script | What it does |
|---|---|---|
| `setup` | n/a | Installs dependencies once and stores a lockfile-keyed cache for downstream jobs |
| `lint` | `yarn ci:lint` | Lints both packages (`eslint` + Sanity Studio), restoring cached dependencies |
| `test-unit` | `yarn test:unit` | Runs Vitest unit/component tests (Vitest run mode), restoring cached dependencies |
| `test-e2e` | `yarn test:e2e` | Runs Playwright e2e specs after installing Chromium |
| `typecheck` | `yarn ci:typecheck` | Type-checks both packages with `tsc`, restoring cached dependencies |
| `lighthouse` | `yarn lhci:mobile` + `yarn lhci:desktop` | Runs Lighthouse CI audits for both mobile and desktop, restoring cached dependencies |
| `build` | `yarn ci:build` | Builds both packages; blocked until lint, test-unit, test-e2e, typecheck, and lighthouse pass |

The workflow runs on pull requests that touch `src/**`, `studio/**`, config files, or the workflow file itself.

---

## Project Structure

```text
dangz-dev/                         # Yarn workspace root (blog package)
├── public/                        # Static assets
├── src/
│   ├── api/                       # API clients (Apollo, Sanity)
│   ├── app/                       # Next.js App Router, pages and layouts
│   ├── components/                # Shared components
│   │   ├── icons/
│   │   ├── layout/                # Layout shell components (footer, header, sidebar)
│   │   └── ui/                    # Primitive UI components (Button, Link, Text, …)
│   ├── contexts/                  # React context providers (ThemeProvider)
│   ├── data/                      # Static data (nav links, site metadata)
│   ├── features/
│   │   ├── about/
│   │   ├── blog/
│   │   └── home/
│   ├── hooks/                     # Global custom React hooks
│   ├── styles/                    # Global CSS and font config
│   ├── types/
│   └── utils/                     # Utility functions
├── studio/                        # Yarn workspace package — Sanity Studio
│   ├── schemaTypes/               # Sanity content schema definitions
│   ├── static/
│   ├── sanity.config.ts
│   └── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── ...
└── package.json                   # Root workspace manifest
```

---

## Deployment

The project is deployed on **Vercel**.

- ~~Pushes to **`dev`** trigger preview deployments.~~ 
- Merges to **`main`** trigger production deployments.

---

## Build Version (Footer Semver)

The footer shows an auto-generated build semver in this format:

`YY.Push.MMDD`

Example: `26.50.0512`

- `YY`: last 2 digits of current UTC year
- `Push`: git commit count since January 1st (UTC) of the current year
- `MMDD`: current UTC month and day

### How It Is Generated

- Source script: [`scripts/generate-build-version.mjs`](scripts/generate-build-version.mjs)
- Generated file: [`src/data/buildVersion.ts`](src/data/buildVersion.ts)
- Automatically runs on:
	- `yarn dev` (via `predev`)
	- `yarn build` (via `prebuild`)

This means no `.env` variable is required for versioning in local dev or Vercel builds.

---

## License

This project is personal and not licensed for reuse.