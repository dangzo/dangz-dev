# Architecture

dangz.dev is a portfolio and frontend engineering blog. The root package serves the Next.js App Router site; `studio/` manages Sanity content. Resolve `@/` from `src/`; read manifests for versions. Support mobile layouts, both themes, and accessible navigation.

## Locate changes

| Concern | Source |
| --- | --- |
| Pages, layouts, metadata, API routes | `src/app/` |
| Blog queries, types, rendering, hooks | `src/features/blog/` |
| Home sections | `src/features/home/components/` |
| About sections and entries | `src/features/about/`, including `data/aboutMeData.ts` |
| Shared primitives and layout | `src/components/ui/`, `src/components/layout/` |
| Theme, shared hooks/utilities | `src/contexts/`, `src/hooks/`, `src/utils/` |
| Metadata, contacts, navigation | `src/data/siteMetadata.ts`, `src/data/headerNavLinks.ts` |
| Theme tokens and local fonts | `src/styles/tailwind.css`, `src/styles/fonts.ts` |
| Static assets and About SVGs | `public/`, `public/icons/` |
| CMS schemas/config | `studio/schemaTypes/`, `studio/sanity.config.ts` |

## Rendering and data boundaries

- Route files compose feature components; shared behavior belongs in the shared directories above. Preserve blog parallel-slot parity: `src/app/blog/layout.tsx` renders `children`, `@heading`, and `@sidebar` for article, topic, legacy-tag, and pagination routes.
- CMS reads use `src/features/blog/api/queries/` and the server Apollo client in `src/api/apollo-client.ts`. Development with a read token previews drafts; production reads published content with hourly fetch revalidation. Some helpers share reads within a render through React `cache`. Adapt generated Sanity references through feature types such as `PostWithTopic`.
- Canonical topic seeds, migration assignments, redirects, keywords, and reviewed summaries live in dependency-free `src/data/blogTopics.ts`, shared with Studio/migration code. Archives filter the fetched corpus in JavaScript during the legacy/primary transition: generated GraphQL filters cannot filter legacy `tags` reference arrays. Use shared pagination helpers. See [BLOG_TOPICS](BLOG_TOPICS.md) and [STUDIO_TOPICS](STUDIO_TOPICS.md).
- Review search and signed revalidation API routes together when changing freshness. The webhook invalidates shared content/search caches and revalidates affected blog routes. Keep reaction writes behind `src/app/api/reactions/route.ts` with server-only write credentials. Shared optimistic reconciliation and initiating-request outcome semantics are in [REACTION_ANALYTICS](REACTION_ANALYTICS.md).
- Portable Text and Shiki highlighting stay on the server. Client code handles interactive tabs, copying, and image viewing. Preserve the legacy GraphQL body union when extending code schemas; see [CODE_VARIANTS](CODE_VARIANTS.md).
- Cover/inline image triggers share one article-scoped `ArticleImageViewer`. Its portal isolates focus/background interaction and restores scroll/trigger focus. Viewer images use the original Sanity asset without thumbnail sizing, crop, or hotspot parameters; reuse authored captions/alt text.
- Search is a lazy-loaded palette with server post results and local navigation/theme/contact commands. Post matches precede commands; native anchors/buttons handle activation. Preserve background isolation and focus restoration; [SEARCH_ANALYTICS](SEARCH_ANALYTICS.md#command-palette) includes keyboard/pending-result behavior.
- Next-read recommendations use a published-only metadata corpus, exclude the current article, and rank by topic, shared keywords, then recency. Deduplicate IDs/slugs and select up to four linked cards below reactions, outside the body/ToC. The full-width section spans the 1152px article frame below both rails; the sidebar’s sticky boundary ends above it. Cards use one/two/three columns, with the fourth suggestion visible only in the two-column layout. See [selection](../src/features/blog/utils/relatedPosts.ts), [query](../src/features/blog/api/queries/relatedPosts.ts), and [discovery contract](POST_DISCOVERY_ANALYTICS.md).
- Analytics loads through the production Umami integration. Buffered events, pageviews, exposure observations, and delegated anchor events have different delivery/privacy rules; consult [ANALYTICS](ANALYTICS.md) and its feature references when touching them.

## Layout and assets

Home and article recommendations share the blog feature’s `WritingPreview` cards; blog/topic listings use `PostCard`. `BlogFrame` places topic navigation above listings. Article headers use a centered 1152px limit; hero, prose, and bottom reactions align with the footer. Below 1280px the ToC is a disclosure above the reading column; wider layouts use a balanced `240px minmax(0, 1fr) 240px` frame with 32px gaps. The empty right rail balances the left sticky ToC. Keep the article image viewer provider wrapper-free so the reading region and recommendations remain separate frame grid items. Only its entry list scrolls, with overflow cues; active entries reveal inside the list without scrolling the document. Keyboard activation focuses the destination heading; Escape returns focus to the disclosure toggle. Headingless articles omit the ToC and retain a centered 70ch column.

Bundled Latin Geist/Geist Mono/Roboto/Roboto Slab fonts use `next/font/local` to avoid build-time downloads and Google loader failures. Keep colocated source/license notes and theme fallback stacks.

## Known heading-ID limitations

ToC extraction in [usePostInsights.ts](../src/features/blog/hooks/usePostInsights.ts) allocates IDs for h2/h3 only, while the [renderer](../src/features/blog/components/portable-text/PortableText.tsx) shares a factory across h1–h4. `h2 Repeat → h4 Repeat → h3 Repeat` therefore links the h3 ToC entry to `repeat-2` instead of rendered `repeat-3`. The [factory](../src/features/blog/utils/posts.ts) also allows literal `Repeat 2` to collide with a generated `repeat-2` ID.

A future fix should allocate IDs deterministically across all rendered headings while exposing only h2/h3 in the ToC, reserve generated IDs, and preserve ordinary existing anchors. These controlled cases were identified in the #171 review; they are not claims about current published article titles. Historical review evidence is available in Git history.

See [WORKFLOW](WORKFLOW.md) for generation, fixtures, and validation.
