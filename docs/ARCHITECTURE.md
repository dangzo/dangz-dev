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
- Preserve blog route parity: `src/app/blog/layout.tsx` renders `children`, `@heading`, and `@sidebar`. Check matching slots when changing article, tag, or pagination routes.
- Use `src/features/blog/api/queries/` for CMS reads through the server Apollo client in `src/api/apollo-client.ts`. Development with a read token previews drafts; production reads published content with hourly fetch revalidation. Some query helpers also use React `cache` to share reads within a render.
- Keep tag filtering in mind: Sanity's generated GraphQL filter lacks the tags reference array. Tagged lists fetch all posts, then filter and paginate in application code. Reuse `src/features/blog/utils/pagination.ts` for page parsing and sizing.
- Review `src/app/api/search/route.ts` and `src/app/api/revalidate/route.ts` together when changing content freshness: search caches its corpus, and the signed Sanity webhook revalidates affected paths.
- Keep reaction mutations behind `src/app/api/reactions/route.ts`; its query helpers use a server write token. `useReactions` shares optimistic counts across mounted components and rolls back failures.
- Extend article rendering in `src/features/blog/components/portable-text/`. Keep heading IDs aligned with table-of-contents extraction in `src/features/blog/utils/posts.ts`; keep Shiki highlighting on the server.
- Use generated Sanity types through feature types such as `PostWithTags`, which adapt document references to populated query results.

For schema generation, fixtures, and validation commands, read [WORKFLOW.md](WORKFLOW.md).
