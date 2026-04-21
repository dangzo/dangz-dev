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

## Getting Started

### Prerequisites

- Node.js `>= 18`
- Yarn
- .env file

### Installation

```bash
git clone https://github.com/dangzo/dangz-dev.git
cd dangz-dev
yarn install
```

### Run Locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

### Sanity Studio

If the project includes a local Sanity Studio workflow, run:

```bash
yarn sanity
```

### Linting

```bash
yarn lint
```

To auto-fix lint issues where supported:

```bash
yarn lint --fix
```

---

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Starts the local development server |
| `yarn build` | Builds the application for production |
| `yarn start` | Starts the production server |
| `yarn sanity` | Runs Sanity-related local tooling |
| `yarn lint` | Checks the codebase for linting issues |

---

## Project Structure

```text
dangz-dev/
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
├── studio/                        # Sanity Studio
│   ...
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deployment

The project is deployed on **Vercel**.

- Pushes to **`dev`** trigger preview deployments.
- Merges to **`main`** trigger production deployments.

---

## License

This project is personal and not licensed for reuse.