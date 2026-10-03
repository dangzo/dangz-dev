# Home review: issue #158, first checkpoint

This branch builds on taxonomy PR #161 (`c2d6fba`). Home was approved after restoring stacked cards on mobile; blog layouts are now available for the next local review. Keep this worktree for follow-up requests.

## Start the preview

From this worktree, with the repository’s local `.env` configured:

```sh
NEXT_TURBOPACK_ROOT=/home/dangz0/Projects/dangz-dev LOCAL_EDITORIAL_PREVIEW=true yarn dev -p 3000
```

Open <http://localhost:3000/>. If that port is occupied, use another available port. The optional Turbopack root supports shared dependencies in local worktrees. Playwright uses its own fixture server on port 3100.

The preview reads real CMS content. A configured development read token permits CMS drafts, following PR #161’s existing perspective rules. Production shows only published content. Leave `SANITY_TOPIC_MODEL` unset until #159’s schema/content migration has been verified.

`LOCAL_EDITORIAL_PREVIEW=true` replaces known Home article summaries only in development. The same preview copy appears in blog listings. It does not change CMS data or search. Stop the server and omit the switch to compare the existing CMS copy. After approval, #159 can publish the reviewed summaries into the existing `excerpt` field; then remove the temporary copy preview.

## Review checklist

- Below 768px: a single column of cards with full-width 16:9 images above the topic, date, title, and summary.
- From 768px to 1023px: four articles in a two-by-two grid. Below 768px and from 1024px: three articles.
- One primary-topic link per preview, separate from title/read links, with canonical destinations.
- Full titles and summaries without artificial ellipses; images omitted when unavailable.
- Topic discovery uses readable labels and counts, with empty/error/loading states.
- Review at 390px, 768px, and 1440px in both themes, plus 320px for overflow. Check keyboard navigation and focus visibility.

## Proposed summaries

Drafted from the eight published articles. Every summary fits the existing 300-character limit. The latest three appear on mobile/desktop Home, or four in the two-column tablet grid; all eight are listed here for review.

| Article | Proposed summary |
| --- | --- |
| [Three-Layered Architecture for Front-End](http://localhost:3000/blog/three-layered-architecture-for-front-end) | Separate UI, business logic, and data access in React and Vue. Learn where each responsibility belongs and how clear boundaries make frontend code easier to test and change. |
| [From 50 To 100: Hitting a Perfect Next.js Performance Score](http://localhost:3000/blog/from-50-to-100-hitting-a-perfect-next-js-performance-score) | Follow the Next.js optimizations that raised this site’s Lighthouse performance score from around 50 to nearly 100. See how smaller bundles, server rendering, and smarter image and data loading made the difference. |
| [A Practical Guide to Web Accessibility in React and Vue (a11y)](http://localhost:3000/blog/a-practical-guide-to-web-accessibility-in-react-and-vue-a11y) | Build more accessible React and Vue interfaces with semantic HTML, clear form labels, and intentional focus management. Includes practical patterns for keyboard navigation, ARIA, and accessibility checks. |
| [Monolith, Monorepo or Multi-repo? Choosing the right Codebase Architecture](http://localhost:3000/blog/monolith-monorepo-or-multi-repo-choosing-the-right-codebase-architecture) | Compare monolithic applications, monorepos, and multiple repositories through realistic examples. Understand how deployment, shared dependencies, and team autonomy shape the right choice for your codebase. |
| [Building a Real-Time Chat App with WebSockets in 5 hours](http://localhost:3000/blog/building-a-real-time-chat-app-with-websockets-in-5-hours) | Trace a real-time chat app from Vue and Socket.io to Docker and AWS deployment. Explore frontend architecture, WebSocket connections, and an automated delivery pipeline built over an afternoon. |
| [How to structure a React app in 2026](http://localhost:3000/blog/how-to-structure-a-react-app-in-2026) | Compare folders by type, Atomic Design, feature-based organization, and hexagonal architecture for React apps. Learn which tradeoffs matter as your project grows and how to keep related code easy to find. |
| [Vue Vapor Mode - How Vue is Rewriting its Rendering Engine](http://localhost:3000/blog/vue-vapor-mode-how-vue-is-rewriting-its-rendering-engine) | Explore how Vue’s Vapor Mode replaces Virtual DOM work with compiler-generated DOM updates. Compare rendering approaches and understand the tradeoffs and limitations before experimenting with it. |
| [Senior Frontend Interview  - Debug and Refactor a Real Product Component](http://localhost:3000/blog/senior-frontend-interview-debug-and-refactor-a-real-product-component) | Work through a React interview exercise with repeated renders, duplicate requests, and sluggish search. Learn how to diagnose the issues, refactor the component, and discuss production tradeoffs as a senior engineer. |
