# Blog topics

The blog uses one primary topic to help readers browse by the main benefit of an article. The site remains frontend-led, with room for full-stack work. Technology names and former tag labels remain searchable keywords; they are not extra public topic categories.

## Taxonomy and editorial guidance

The five topics with published articles are public. AI-Assisted Development is part of the taxonomy for an existing draft and appears only when that draft is visible in local preview; it currently has no published posts and is absent from public navigation and the sitemap.

| Topic | Use it for | Current published articles |
| --- | --- | --- |
| Architecture (3 published posts) | Application structure, boundaries, and design tradeoffs. Use Full-Stack Engineering when implementation across layers is the main reader benefit. | Three-Layered Architecture for Front-End; Monolith, Monorepo or Multi-repo? Choosing the right Codebase Architecture; How to structure a React app in 2026 |
| Performance (2 published posts) | Measuring or reducing rendering, responsiveness, and speed costs. | From 50 To 100: Hitting a Perfect Next.js Performance Score; Vue Vapor Mode - How Vue is Rewriting its Rendering Engine |
| Accessibility (1 published post) | Inclusive interface design and accessible interactions. | A Practical Guide to Web Accessibility in React and Vue (a11y) |
| Full-Stack Engineering (1 published post) | End-to-end features connecting interfaces, APIs, authentication, persistence, real-time communication, and runtime. | Building a Real-Time Chat App with WebSockets in 5 hours |
| Interviews (1 published post) | Practical engineering interview preparation, including senior frontend and full-stack discussions. | Senior Frontend Interview - Debug and Refactor a Real Product Component |
| AI-Assisted Development (0 published posts) | Coding agents, specifications, orchestration, and verification when AI is the main reader benefit. | Reserved for an unpublished software engineering draft |

Add a topic only when concrete writing establishes a distinct reader need. UI Engineering, Testing & Quality, and Developer Experience remain future candidates; they are not empty CMS categories or public navigation entries. Using AI while building an application does not by itself make AI-Assisted Development the primary topic.

## Assignment inventory

`POST_TOPIC_ASSIGNMENTS` in [`src/features/blog/data/topics.ts`](../src/features/blog/data/topics.ts) is the source of truth for the initial assignments and is deliberately independent of CMS tag documents. A post's persisted `primaryTopic` takes precedence when present. During compatibility mode, this manifest supplies the primary topic by the published base document ID; draft IDs use the same base ID after removing the `drafts.` prefix. The manifest assigns topics only and never publishes a document.

| Published document ID | Published article slug | Primary topic |
| --- | --- | --- |
| `27dd202f-fbfa-4549-b8a1-a9926769bfa6` | `three-layered-architecture-for-front-end` | Architecture |
| `34d700ec-6ac2-422a-bc57-9156ec212900` | `from-50-to-100-hitting-a-perfect-next-js-performance-score` | Performance |
| `51ab3708-b5ff-4ecf-a933-8afeef408b7e` | `a-practical-guide-to-web-accessibility-in-react-and-vue-a11y` | Accessibility |
| `56a36c36-3097-43b2-8244-d5179515a692` | `monolith-monorepo-or-multi-repo-choosing-the-right-codebase-architecture` | Architecture |
| `9822cd44-6b22-43d4-bdef-533cad2ab4d5` | `building-a-real-time-chat-app-with-websockets-in-5-hours` | Full-Stack Engineering |
| `a3db5c8d-71ec-4480-b59f-2771fa7aa0a7` | `how-to-structure-a-react-app-in-2026` | Architecture |
| `ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4` | `vue-vapor-mode-how-vue-is-rewriting-its-rendering-engine` | Performance |
| `d56cb50b-6c83-43ac-a14c-e761db74b2b8` | `senior-frontend-interview-debug-and-refactor-a-real-product-component` | Interviews |

The AI-Assisted Development draft is assigned by base ID `cecb1ab3-1182-4de2-9955-703b1d0a87cd`. It has no published document and is not counted above. Its draft status must remain unchanged by topic migration.

## Sanity field contract and runtime

The frontend expects an additive Sanity `topic` document with `displayName`, a unique stable `slug`, reader-facing `description`, and `editorialGuidance`. Posts gain one `primaryTopic` reference and a `keywords` string array. `primaryTopic` is required when publishing; drafts may be edited without it. Keywords support search and never become public topic chips. Before removing legacy tags, the #159 migration must persist the complete output of `getSearchKeywords(legacyPost)` into `keywords`, preserving old tag names, slugs, normalized slug phrases, and technology aliases such as React.js and GraphQL.

The current frontend implementation has two query modes. Without `SANITY_TOPIC_MODEL=primary`, it reads existing tag references, uses the ID manifest to resolve primary topics, and derives search keywords from existing tag names/slugs and technology aliases. When primary mode is enabled, queries read `primaryTopic` and `keywords` from posts and `allTopic` from Sanity; they do not query `tags`. The environment switch is supported by the frontend but must remain unset until the additive GraphQL schema is deployed and the content migration has been verified. No remote schema or CMS content migration is implied by this frontend change.

Both modes use the current read perspective: local development with `SANITY_API_READ_ONLY_TOKEN` can preview drafts, while production and explicit published reads use the published perspective. Visible topic counts come from the posts in that perspective. Public navigation, archives, sitemap entries, and public topic indexing require at least one published post; a draft-only topic can appear in local preview when it has a visible draft post. Keyword matches can include a post's title, excerpt, primary topic name, and search keywords. Search responses use `primaryTopic` as the authoritative classification, do not expose keywords, and include an empty legacy `tags` array for compatibility with already-open clients; they do not expose technology tags as topic labels.

Topic archives use `/blog/topics/[slug]` and `/blog/topics/[slug]/page/[page]`. Page 1 canonicalizes to the root. Unknown topics, topics with no visible posts, malformed pages, and pages beyond the last page return 404. Topic roots are self-canonical; paginated archives are self-canonical with `noindex, follow`. The sitemap lists published topic roots only. Legacy `/blog/tags/[slug]` URLs permanently redirect in one hop, using published counts to decide valid page destinations.

### Legacy tag URL map

This map is also in `LEGACY_TAG_REDIRECTS` in the topic data module and remains available independently of CMS tag documents. The 18 established tag slugs are retained here, along with the two historical slugs `graphql` and `lighthouse`.

| Legacy tag slugs | Destination |
| --- | --- |
| `frontend-architecture`, `design-patterns`, `scalability` | `/blog/topics/architecture` |
| `web-performance`, `performance-optimizations`, `core-web-vitals`, `lighthouse` | `/blog/topics/performance` |
| `full-stack-development`, `cloud-deployment`, `devops` | `/blog/topics/full-stack-engineering` |
| `web-accessibility` | `/blog/topics/accessibility` |
| `frontend-interviews` | `/blog/topics/interviews` |
| `clean-code`, `react`, `vue-js`, `typescript`, `next-js`, `engineering-best-practices`, `frameworks`, `graphql` | `/blog` |

If a mapped topic has no published posts, its redirect falls back to `/blog`. A legacy page number is retained only when it is valid for the published destination; otherwise the redirect goes to its root. Unknown legacy slugs return 404. Permanent redirects may be cached, so canonical destinations must remain available during rollback.

## Rollout ownership and sequence

The frontend topic routes and compatibility behavior are the #157 scope. The #159 Studio work owns additive schema changes, generated artifacts, publication validation, and the backed-up, dry-run, repeatable data migration. The #158 work owns navigation compaction, card redesign, and broader visual review. These are separate dependencies; the frontend change does not establish that schema deployment or content migration has happened.

The content rollout proceeds in this order:

1. Export and back up content; inventory both published and draft variants. Run the migration in dry-run mode, then verify it is repeatable and preserves document IDs, slugs, and bodies without publishing drafts.
2. Deploy the additive GraphQL schema and generate/review local Sanity types.
3. Migrate and verify topic documents, article references, and keywords for both published and draft variants. Persist `getSearchKeywords(legacyPost)` output before removing legacy tags so prior label, slug, and technology-alias searches remain available in primary mode. Confirm the AI draft stays unpublished and has no effect on public counts, search, or sitemap.
4. Exercise development and preview with `SANITY_TOPIC_MODEL` unset (compatibility behavior), then test primary-model queries after the schema and data are ready.
5. Set `SANITY_TOPIC_MODEL=primary` only after verification. Keep old fields available through the rollback window; remove them later as a separate cleanup.

The signed Sanity webhook invalidates the shared CMS and search corpus caches and revalidates blog routes when posts, topics, or tags change. Rollback may restore the compatibility query mode, but permanent redirects can already be cached: keep each canonical topic destination available while rollback is possible.
