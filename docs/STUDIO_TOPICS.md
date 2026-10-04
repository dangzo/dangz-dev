# Studio topics and content migration

Issue #159 adds the Studio/content side of the #157/#158 topic contract. The approved names are Architecture, Performance, Accessibility, Full-Stack Engineering, Interviews, and AI-Assisted Development.

## Production migration checkpoint

On 2026-10-04, the additive GraphQL schema and approved production content migration were applied. Schema validation flagged only the added optional `primaryTopic` input field; existing legacy queries remain compatible. The content transaction created six topics and patched nine post variants, including the eight approved published excerpts. Full document verification passed, and a subsequent dry run planned zero changes with zero issues.

Published and authenticated-preview GraphQL checks confirmed the expected topic counts, keyword projections, excerpts, and publication split: eight published posts and the unpublished AI draft. Legacy tags remain intact. The frontend reading mode, hosted Studio, and webhook configuration were not changed by this migration; those rollout steps remain separate.

Private backup, reviewed report, and `applied.json` receipt are under `.tmp/topic-migration/issue-159-apply-review/` in the implementation worktree. The post-application report is under `.tmp/topic-migration/issue-159-post-apply/`. Keep these artifacts for the rollback window. Do not apply the original report again; generate a fresh dry run for any later content work.

## Authoring

Posts have one **Primary topic** and an **Excerpt** describing the reader benefit in one or two sentences, within 300 characters. Both are required for Studio publication. Missing or invalid values do not stop draft editing or autosave. Primary topics must reference a published topic with complete name, slug, description, and editorial guidance; weak or draft-ID references cannot pass publication validation. Sanity validation runs in Studio, so external API writers must enforce the same rules themselves.

Use **Topics** to manage the curated list. Create a topic only when concrete writing establishes a distinct reader need, rather than adding a category for each technology. Inline creation from the post picker and global topic creation are disabled. The selected topic's description and editorial guidance appear below the picker. Topic names and descriptions remain editable; published slugs are locked and validation rejects slug changes or collisions across draft/published variants. Topics cannot be unpublished through Studio; the seeded six cannot be deleted, keeping historical redirect destinations available.

The topic's **Posts** view lists each logical article once, with separate published/draft assignment details and counts. A draft moving to another topic remains visible in the published topic's view until publication. Edit links use the base post ID. The view watches post and topic changes, including removed assignments, and supports retry after subscription errors.

**Search keywords** are optional text terms for search only. They never become topic labels. Migration preserves old tag names, slugs, normalized slug phrases, and technology aliases through the exact shared `getSearchKeywords` function. Legacy tag documents and the hidden, read-only `tags` field remain in the schema and dataset for compatibility. The committed legacy URL manifest remains independent of those documents.

## Prepare and review a dry run

Use Node/Yarn from the root manifest and configure the existing root/Studio env files. `SANITY_API_READ_ONLY_TOKEN` must see both published and draft documents. Dry run uses only that token, even when a write token is configured.

```sh
yarn generate-types
yarn migrate:topics --dry-run
```

The migration defaults to dry run. An optional `--output-dir .tmp/topic-migration/<run>` selects a new output folder. Artifacts contain unpublished content: keep the folder private and out of Git. Directories/files are created with permissions 0700/0600. The runner refuses output outside the ignored `.tmp/` directory and never overwrites an existing artifact.

Each run creates:

- `backup.ndjson`: raw dataset documents, including drafts, original bodies/metadata, tag documents, and asset metadata. Asset binaries are unchanged and are not part of this export.
- `report.json`: backup checksum, target dataset, every before/after field change, revisions, inventory, conflicts, and planned topic creates.
- `report.md`: an inventory and change summary without article bodies or unpublished titles.
- `legacy-tag-map.json`: all approved historical destinations, including GraphQL and Lighthouse, even if their CMS documents are gone.

The initial inventory is eight published posts, the AI draft, 18 stored tag documents, and 20 historical tag URLs. Post assignments and eight proposed excerpts are approved shared data; the AI draft's existing excerpt stays intact. Published/draft variants are patched independently by base ID. IDs, bodies, slugs, asset references, tags, publication state, and unrelated metadata are preserved. The only created documents are the six topic seeds.

Review the exact changes in `report.json`. The planner fails on unmapped content, missing expected articles, unknown historical slugs, malformed/unresolved references, conflicting assignments, duplicate topic slugs, unexpected AI publication, and content-release variants. Resolve these deliberately and regenerate the report. Already-classified articles with different excerpts require review rather than automatic replacement. A second run after a successful migration plans zero changes.

## Separate live rollout

The following commands write remote content and are **not** part of the code/dry-run delivery. Review the report and schedule rollout before using them. Pause editorial changes during the short apply/verification window.

1. Deploy the frontend containing #157/#158 in compatibility mode, with `SANITY_TOPIC_MODEL` unset. Confirm canonical topic destinations and legacy redirects work on the actual production deployment; merging to the repository's default `dev` branch alone does not deploy `main` to production.
2. Generate a fresh dry run and review its backup and exact changes. For an additional full archive including binaries, use Sanity's dataset export before applying. Keep the archive with the private run artifacts.
3. Deploy the additive GraphQL schema with `yarn deploy-graphql`. Keep the legacy fields and types. Local `yarn generate-types` only regenerates the two committed artifacts and does not deploy GraphQL. Required fields remain optional in generated document types because incomplete drafts are valid editing states.
4. Apply the reviewed report using a server-side `SANITY_API_WRITE_TOKEN`:

   ```sh
   yarn migrate:topics --apply .tmp/topic-migration/<run>/report.json
   ```

   Application checks the backup checksum, recomputes the plan with the current code, verifies the target dataset and unchanged post/topic/tag inventory, and sends one atomic transaction. Revision-guarded patches reject concurrent changes. Topic creates reject existing IDs. There are no publish/unpublish/delete operations. `pending.json` records the transaction before submission; `applied.json` records the actual returned revisions before read-back verification. Reusing an applied report performs no writes. If interrupted after commit, re-running the apply command recovers a missing receipt only when every resulting document exactly matches the reviewed outcome. Preserve all artifacts on errors; if the transaction did not commit, inspect its ID and generate a new dry run rather than deleting recovery records blindly.
5. Configure the signed revalidation webhook for post, topic, and legacy tag create/update/delete events. Keep draft/version triggers disabled. Its compatible GROQ filter is `_type in ["post", "topic", "tag"]`; use this projection to include prior article slugs on changes and deletions:

   ```groq
   {
     "_type": coalesce(after()._type, before()._type),
     "operation": delta::operation(),
     "slug": coalesce(after().slug, before().slug),
     "previousSlug": before().slug.current
   }
   ```

   Retain the existing signing secret. The frontend handler already accepts this shape and expires shared content/search caches and affected routes.
6. Verify primary GraphQL queries and counts under both published and authenticated preview perspectives before setting `SANITY_TOPIC_MODEL=primary`. Expect published distribution 3 Architecture, 2 Performance, and 1 each Accessibility, Full-Stack Engineering, and Interviews. AI-Assisted Development remains draft-only and absent from public navigation, search, and sitemap. Check keyword searches, all legacy redirects (including pagination), article excerpts, Home, topic archives, and signed invalidation.
7. Enable primary-model reads and deploy Studio with the new authoring flow. Exercise create/edit/preview/publish using a disposable test article; ensure invalid topics/excerpts block publication and incomplete drafts save. Remove that test article afterward through the normal editorial workflow. Remove the temporary `LOCAL_EDITORIAL_PREVIEW` helper only after CMS excerpts are verified.

Keep legacy fields and documents throughout the rollback window. Their removal, search-preview helper removal, and any other taxonomy cleanup are follow-up changes after every consumer and redirect is verified.

## Rollback and recovery

First restore frontend compatibility mode by unsetting `SANITY_TOPIC_MODEL`; keep canonical topic routes available because permanent redirects can be cached. Redeploy the preceding Studio authoring configuration if needed. The additive GraphQL schema can remain deployed.

```sh
yarn migrate:topics --rollback .tmp/topic-migration/<run>/applied.json
```

Rollback restores only changed post fields (`primaryTopic`, `keywords`, and approved `excerpt` values), including unsetting fields absent in the backup. It uses the applied revision for each post and refuses to overwrite later edits. It does not replace full documents, publish/delete drafts, restore unrelated dataset changes, or remove topic documents. Seed topics and canonical destinations remain available. `rollback-pending.json` records the transaction before submission and `rolled-back.json` records its returned revisions. Full post-content verification confirms original bodies and metadata as well as restored fields; repeating a completed rollback performs no writes. A lost rollback receipt can be recovered by re-running the command only when the original post content is restored exactly.

If later edits prevent rollback, compare the private backup/report with current content and resolve the affected fields deliberately. If a request loses its response, preserve the transaction records and inspect current content before recovery. Never use a blind full-dataset import to overwrite subsequent editorial work.

## Validation

Run `yarn lint-studio`, `yarn typecheck-studio`, `yarn generate-types`, `yarn build-studio`, frontend lint/typecheck, and unit tests. Studio config and CLI files are included in Studio type checking. Tests cover publication validation, immutable/duplicate slugs, selected-topic guidance, live assignment changes, state/error handling, exact migration reports, checksum/revision guards, preservation, repeatability, receipt recovery, and rollback.

Run `yarn test:e2e src/tests/e2e/topics.spec.ts` and its `E2E_PREVIEW_DRAFTS=true` variant. These use primary-model fixtures without changing live content. Real GraphQL deployment, CMS publication, webhook configuration, and production cutover checks belong to the separate rollout above.
