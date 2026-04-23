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

This project is managed as a **Yarn workspace + Turborepo** monorepo containing two packages:

| Package | Location | Description |
|---|---|---|
| `blog` (Next.js app) | `/` (root) | Personal blog and portfolio frontend |
| `studio` (Sanity Studio) | `studio/` | Sanity content management studio |

A single `yarn install` from the root installs dependencies for both packages. Turborepo orchestrates tasks across them with caching.

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

Lint both packages via Turborepo:

```bash
yarn turbo run lint
```

Or lint only the Next.js app:

```bash
yarn lint
```

To auto-fix lint issues where supported:

```bash
yarn lint --fix
```

---

## Turborepo

This is a monorepo project managed with [Turborepo](https://turbo.build/), which orchestrates tasks across both the Next.js app and Sanity Studio with intelligent caching.

### Running tasks

| Command | Description |
|---|---|
| `yarn ci` | Lints and builds **all packages** via Turbo |
| `yarn turbo run lint` | Lints all packages |
| `yarn turbo run build` | Builds all packages |
| `yarn turbo run lint --filter=studio` | Lints the Sanity Studio only |
| `yarn turbo run build --filter=studio` | Builds the Sanity Studio only |
| `yarn turbo run lint --filter=blog` | Lints the Next.js app only |
| `yarn turbo run build --filter=blog` | Builds the Next.js app only |

Task configuration lives in [`turbo.json`](turbo.json).

---

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Starts the Next.js development server |
| `yarn build` | Builds the Next.js app for production |
| `yarn start` | Starts the Next.js production server |
| `yarn lint` | Lints the Next.js app |
| `yarn ci` | Lints and builds all packages (used in CI) |
| `yarn turbo` | Runs arbitrary Turbo tasks |
| `yarn generate-types` | Generates TypeScript types from Sanity schemas and adds them to the Next.js app |
| `yarn deploy-studio` | Deploys the Sanity Studio |
| `yarn deploy-graphql` | Deploys GraphQL schemas to Sanity |

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
├── turbo.json                     # Turborepo task configuration
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

## License

This project is personal and not licensed for reuse.