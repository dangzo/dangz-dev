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
| `blog` (Next.js app) | `/` (root) | Personal blog and portfolio frontend |
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
| `yarn typecheck` | Type-checks the Next.js app |
| `yarn typecheck-studio` | Type-checks the Sanity Studio only |
| `yarn ci:lint` | Runs lint (both packages) — mirrors the CI lint job |
| `yarn ci:test` | Runs the test suite — mirrors the CI test job |
| `yarn ci:typecheck` | Runs type checks across both packages — mirrors the CI typecheck job |
| `yarn ci:build` | Builds both packages — mirrors the CI build job |
| `yarn ci` | Runs all CI checks in sequence (`ci:lint` → `ci:test` → `ci:typecheck` → `ci:build` → `ci:lighthouse`) |

#### Lighthouse Commands

| Command | Description |
|---|---|
| `yarn ci:lighthouse` | Runs Lighthouse CI against the production build, clearing old local artifacts first |
| `yarn lighthouse` | Runs Lighthouse CI locally against production build URLs, replacing previous local artifacts |
| `yarn lighthouse:clean` | Deletes and recreates the local Lighthouse artifacts directory (`.tmp/lighthouse`) |
| `yarn lighthouse:summary` | Prints a grouped summary table (latest run per URL) from local Lighthouse reports |
| `yarn lighthouse:open` | Generates `.tmp/lighthouse/index.html` and opens it in your default browser |

#### Utility and Deployment Commands

| Command | Description |
|---|---|
| `yarn generate-build-version` | Generates the footer build semver (`YY.Push.MMDD`) from git history |
| `yarn generate-types` | Generates TypeScript types from Sanity schemas and adds them to the Next.js app |
| `yarn deploy-studio` | Deploys the Sanity Studio |
| `yarn deploy-graphql` | Deploys GraphQL schemas to Sanity |

---

## CI/CD Pipeline

Pull requests trigger the **PR Checks** workflow ([`.github/workflows/pr-quality-and-build.yml`](.github/workflows/pr-quality-and-build.yml)), which runs six jobs:

```
             ┌──────────────┐
             │    setup     │   (install dependencies + cache)
             └──────┬───────┘
                    │
      ┌─────────────┼──────────────┐
      ▼             ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│  lint    │  │  test    │  │  typecheck   │   (run in parallel)
└────┬─────┘  └────┬─────┘  └──────┬───────┘
     └────┬────────┴───────────────┘
          ▼
      ┌─────────┐
      │  build  │                   (runs only if all above pass)
      └─────────┘
           │
           ▼
      ┌────────────┐
      │ lighthouse │               (runs against the production build and fails on metric regressions)
      └────────────┘
```

| Job | Script | What it does |
|---|---|---|
| `setup` | n/a | Installs dependencies once and stores a lockfile-keyed cache for downstream jobs |
| `lint` | `yarn ci:lint` | Lints both packages (`eslint` + Sanity Studio), restoring cached dependencies |
| `test` | `yarn ci:test` | Runs the test suite (vitest), restoring cached dependencies |
| `typecheck` | `yarn ci:typecheck` | Type-checks both packages with `tsc`, restoring cached dependencies |
| `build` | `yarn ci:build` | Builds both packages; blocked until all three checks pass |
| `lighthouse` | `yarn ci:lighthouse` | Downloads the built Next.js app and runs Lighthouse CI on the homepage, blog, and about routes |

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
└── package.json                   # Root workspace manifest
```

---

## Deployment

The project is deployed on **Vercel**.

- Pushes to **`dev`** trigger preview deployments.
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