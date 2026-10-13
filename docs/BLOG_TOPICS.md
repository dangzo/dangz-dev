# Blog topics

The blog uses one primary topic to help readers browse by the main benefit of an article. The site remains frontend-led, with room for full-stack work. Technology names and former tag labels remain searchable keywords; they are not extra public topic categories.

## Taxonomy and editorial guidance

The curated taxonomy and editorial guidance live in `TOPICS` in [`src/data/blogTopics.ts`](../src/data/blogTopics.ts): Architecture, Performance, Accessibility, Full-Stack Engineering, Interviews, and AI-Assisted Development. Public visibility depends on published content; local preview can also show topics with visible drafts. Read CMS content for current article counts rather than treating the original migration inventory as current.

Add a topic only when concrete writing establishes a distinct reader need. UI Engineering, Testing & Quality, and Developer Experience remain future candidates; they are not empty CMS categories or public navigation entries. Using AI while building an application does not by itself make AI-Assisted Development the primary topic.

## Assignment inventory

`POST_TOPIC_ASSIGNMENTS` in [`src/data/blogTopics.ts`](../src/data/blogTopics.ts) is the source of truth for initial assignments, independent of CMS tag documents. A persisted `primaryTopic` takes precedence. Compatibility mode resolves assignments by published base document ID, stripping `drafts.` from draft IDs. The manifest never publishes a document. The original migration covered eight published articles and one AI-Assisted Development draft; preserving that publication split was a migration requirement, not a restriction on later editorial publication.

## Sanity field contract and runtime

The additive Studio schema defines a Sanity `topic` document with `displayName`, a unique stable `slug`, reader-facing `description`, and `editorialGuidance`. Posts have one `primaryTopic` reference and a `keywords` string array. `primaryTopic` and a nonblank excerpt within 300 characters are required for Studio publication; incomplete drafts remain editable. Keywords support search and never become public topic chips. Before removing legacy tags, the #159 migration persists the complete output of the shared `getSearchKeywords(legacyPost)` into `keywords`, preserving old tag names, slugs, normalized slug phrases, and technology aliases such as React.js and GraphQL. See [STUDIO_TOPICS.md](STUDIO_TOPICS.md) for the read-only dry run, backed-up application, and rollback commands.

The frontend has two query modes. Without `SANITY_TOPIC_MODEL=primary`, it reads existing tag references, uses the ID manifest to resolve primary topics, and derives search keywords from existing tag names/slugs and technology aliases. Primary mode reads `primaryTopic`, `keywords`, and `allTopic`, without querying `tags`. Enable it only after additive GraphQL deployment and content migration verification; source changes alone establish neither.

Both modes use the current read perspective: local development with `SANITY_API_READ_ONLY_TOKEN` can preview drafts, while production and explicit published reads use the published perspective. Visible topic counts come from the posts in that perspective. Public navigation, archives, sitemap entries, and public topic indexing require at least one published post; a draft-only topic can appear in local preview when it has a visible draft post. Keyword matches can include a post's title, excerpt, primary topic name, and search keywords. Search responses use `primaryTopic` as the authoritative classification, do not expose keywords, and include an empty legacy `tags` array for compatibility with already-open clients; they do not expose technology tags as topic labels.

Topic archives use `/blog/topics/[slug]` and `/blog/topics/[slug]/page/[page]`. Page 1 canonicalizes to the root. Unknown topics, topics with no visible posts, malformed pages, and pages beyond the last page return 404. Topic roots are self-canonical; paginated archives are self-canonical with `noindex, follow`. The sitemap lists published topic roots only. Legacy `/blog/tags/[slug]` URLs permanently redirect in one hop, using published counts to decide valid page destinations.

### Legacy tag URL map

`LEGACY_TAG_REDIRECTS` in [`src/data/blogTopics.ts`](../src/data/blogTopics.ts) preserves historical tag destinations independently of CMS tag documents, including `graphql` and `lighthouse`. Topic values resolve to `/blog/topics/[slug]`; null values resolve to `/blog`.

If a mapped topic has no published posts, its redirect falls back to `/blog`. A legacy page number is retained only when it is valid for the published destination; otherwise the redirect goes to its root. Unknown legacy slugs return 404. Permanent redirects may be cached, so canonical destinations must remain available during rollback.

## Rollout ownership and sequence

Follow [STUDIO_TOPICS.md](STUDIO_TOPICS.md#separate-live-rollout) for backup, dry run, additive schema deployment, atomic migration, query verification, and primary-mode cutover. Preserve article IDs, slugs, bodies, search keywords, and publication state. Keep legacy fields through the rollback window; removal is a separate cleanup.

The signed Sanity webhook invalidates the shared CMS and search corpus caches and revalidates blog routes when posts, topics, or tags change. Rollback may restore the compatibility query mode, but permanent redirects can already be cached: keep each canonical topic destination available while rollback is possible.
