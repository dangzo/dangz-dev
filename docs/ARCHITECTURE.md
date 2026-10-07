# Architecture

dangz.dev is Daniele Gazzelloni's personal portfolio and frontend engineering blog.
Keep content readable, navigation accessible, and layouts usable on mobile and in both themes.
The root package serves the Next.js App Router site; the `studio/` Yarn workspace manages Sanity content.
Resolve `@/` imports from `src/`. Check package manifests for current dependency versions.

## Locate changes

| Concern | Source |
| --- | --- |
| Pages, layouts, metadata, API routes | `src/app/` |
| Blog queries, types, rendering, hooks, pagination | `src/features/blog/` |
| Home sections | `src/features/home/components/` |
| About sections, experience, tool entries | `src/features/about/`; edit entries in `data/aboutMeData.ts` |
| Shared UI primitives | `src/components/ui/` |
| Header, search modal, footer | `src/components/layout/` |
| Theme provider, shared hooks and utilities | `src/contexts/`, `src/hooks/`, `src/utils/` |
| Site metadata, contact links, navigation | `src/data/siteMetadata.ts`, `src/data/headerNavLinks.ts` |
| Tailwind theme tokens, global styles, fonts | `src/styles/tailwind.css`, `src/styles/fonts.ts` |
| Static assets and About tool SVGs | `public/`, `public/icons/` |
| CMS schemas and Studio configuration | `studio/schemaTypes/`, `studio/sanity.config.ts` |

## Follow rendering and data flow

- Keep route files focused on composition; place feature behavior under `src/features/` and shared behavior in the shared directories above.
- Preserve blog route parity: `src/app/blog/layout.tsx` renders `children`, `@heading`, and `@sidebar`. Check matching slots when changing article, topic, legacy tag, or pagination routes.
- Use `src/features/blog/api/queries/` for CMS reads through the server Apollo client in `src/api/apollo-client.ts`. Development with a read token previews drafts; production reads published content with hourly fetch revalidation. Some query helpers also use React `cache` to share reads within a render.
- Topic definitions, approved post-ID assignments, the durable legacy tag redirect manifest, search keyword derivation, and reviewed summaries live in dependency-free `src/data/blogTopics.ts`. Existing feature exports remain available to frontend consumers; Studio and the Node migration reuse the same data. Topic queries and archives live beside other blog queries and routes. See [BLOG_TOPICS.md](BLOG_TOPICS.md) for the taxonomy and [STUDIO_TOPICS.md](STUDIO_TOPICS.md) for authoring, migration, and rollout.
- Topic archives filter the fetched post corpus in JavaScript through shared topic resolution during the legacy/primary model transition. Sanity's generated GraphQL filter cannot filter the legacy `tags` reference array. The legacy tag route remains for permanent redirects; search keywords can include old tag labels without exposing them as topic chips. Reuse `src/features/blog/utils/pagination.ts` for page parsing and sizing.
- Review `src/app/api/search/route.ts` and `src/app/api/revalidate/route.ts` together when changing content freshness: search caches its published corpus, and the signed Sanity webhook invalidates shared content and search data and revalidates blog routes.
- Keep reaction mutations behind `src/app/api/reactions/route.ts`; its query helpers use a server write token. `useReactions(postId, placement)` shares optimistic counts, reconciles overlapping submissions, and reports each initiating request's lifecycle. See [REACTION_ANALYTICS.md](REACTION_ANALYTICS.md) for count and delivery contracts.
- Article discovery uses typed server-safe anchor marks and the root `PostDiscoveryAnalytics` capture listener, preserving Next navigation. See [POST_DISCOVERY_ANALYTICS.md](POST_DISCOVERY_ANALYTICS.md) for sources, placements, and dashboard verification.
- Search, discovery, and reaction events use typed feature helpers with a shared bounded in-memory transport in `src/utils/analyticsTransport.ts`, flushed by the Umami script readiness integration. See [SEARCH_ANALYTICS.md](SEARCH_ANALYTICS.md) for event contracts, privacy, and production verification.
- The production Umami script announces readiness through `UmamiScript`; `useBottomReactionsExposure` retains bottom-section exposure only for the mounted post visit. See [UMAMI_EXPOSURE.md](UMAMI_EXPOSURE.md) for the event rename and separate browser/dashboard validation.
- Pageviews use the root `UmamiPageviews` route observer and `pageviewAnalytics` buffer; automatic Umami pageviews are disabled while click tracking stays initialized. Each committed pathname/query change counts once, fragments are ignored, and visits before readiness retain captured URLs/referrers. See [UMAMI_PAGEVIEWS.md](UMAMI_PAGEVIEWS.md) for queue limits, counting policy, and separate collector/dashboard verification.
- Contact/profile/résumé links use the server-safe `contactAnalytics` attribute helper. Keep event properties on the anchor, including footer icons. See [CONTACT_ANALYTICS.md](CONTACT_ANALYTICS.md) for placements, historical labels, and validation.
- Extend article rendering in `src/features/blog/components/portable-text/`. Keep heading IDs aligned with table-of-contents extraction in `src/features/blog/utils/posts.ts`; keep Shiki highlighting on the server.
- Use generated Sanity types through feature adapters such as `PostWithTopic`, which adapt document references to populated query results and the primary-topic model.
- Home previews use `WritingPreview` independently of blog listing cards. `BlogFrame` positions the `@sidebar` slot as topic navigation above listings and as a ToC beside articles. The shared server-only editorial preview helper overrides known excerpts only in development with `LOCAL_EDITORIAL_PREVIEW=true`; CMS data and public production excerpts remain authoritative.

For schema generation, fixtures, and validation commands, read [WORKFLOW.md](WORKFLOW.md).
