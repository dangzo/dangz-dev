# Article code variants

Posts support existing single `code` blocks and additive `codeGroup` blocks.
Existing articles need no migration. Code variants are written by the author;
the site does not convert implementations between languages or frameworks.

## Authoring

Insert **Code variants** in the post body. Add one or more variants, each with
a meaningful **Tab label** and a **Code and syntax language** snippet. Labels
are free text: for example, React can use TSX highlighting and Vue can use Vue.
Drag variants to change their order; the first is selected initially. A single
variant displays one tab labeled with its normalized syntax language. Existing
single snippets use the same tabbed frame. Blank labels/code and missing languages prevent
publication, while incomplete drafts remain editable and do not crash previews.

Legacy and grouped snippets share language options. Bash is stored as `bash`
and uses the Studio editor's `sh` mode. The frontend normalizes existing `sh`
snippets to Bash. Unknown languages use escaped plaintext with line numbers.

## Rendering and interaction

The article query reads `body: bodyRaw`; no new GraphQL selection is needed.
Generated Sanity types include the named `codeGroup` and `codeVariant` objects.
The schema-only `legacyPostBody` object retains the previously deployed
`BlockOrCodeOrImageOrTable` GraphQL union. Sanity otherwise removes that generated
type when `codeGroup` is added. This object is not an authoring option and stores
no content; it reuses the legacy members of the post body schema.
Portable Text dispatches both legacy and grouped blocks to server renderers.
Shiki produces light/dark HTML for every snippet on the server; the client
selects the appropriate theme and active variant without importing Shiki.

All snippets use linked tabs and panels inside one shared border, with the tab
compact, right-aligned tab header attached directly to the code and an underline
marking the active tab. The former separate language badge is
omitted. Multiple variants display author labels; a single variant displays its
syntax language. Left/Right arrows wrap and select
the adjacent tab, Home/End select the first/last, and Enter/Space activate the
focused button. Only the selected snippet is displayed. Copy preserves its
exact code; switching tabs resets confirmation, including pending clipboard
operations from the preceding snippet. Tab strips and long code lines scroll
horizontally within the article on mobile.

## Validation

- Run `yarn generate-types`; review `studio/schema.json` and
  `src/types/sanity.types.ts` together.
- Run affected code-block, server-renderer, highlighter, and Studio schema unit
  tests with `yarn test:unit` and the individual test paths.
- Run `yarn test:e2e src/tests/e2e/code-variants.spec.ts` and
  `yarn test:e2e src/tests/e2e/blog-article.spec.ts`. The code-variants suite uses
  `/blog/fixture-post-6` and captures desktop/mobile screenshots in both themes
  under ignored `.tmp/issue-167/`.
- Run frontend/Studio lint and type checks, then `yarn ci:build`.
- In Studio, create and edit Vue/React variants, reorder them, verify required
  fields, and confirm Bash editor highlighting. Verify resulting draft previews
  before allowing grouped content to be published.

## Live rollout

1. Complete local validation and confirm the project/dataset and `default`
   GraphQL endpoint match the existing production configuration.
2. Deploy the additive schema with `yarn deploy-graphql`. Keep all legacy types
   and fields. Confirm the new types exist and an existing article still returns
   `bodyRaw`. Type generation alone does not deploy the API.
   First run `yarn deploy-graphql --dry-run` and confirm no breaking changes,
   including removal of the legacy body union; do not force deployment.
3. The site owner releases the frontend to production through the normal `main`
   release flow. A merge to `dev` is insufficient. Confirm the new renderer is
   live before deploying the Studio authoring option.
4. Deploy Studio with `yarn deploy-studio`. Use a disposable unpublished draft
   to verify create/edit/reorder, validation, Bash, and draft preview. Remove only
   that test draft afterward; existing articles remain untouched.
5. Verify grouped content through `bodyRaw` and the deployed frontend before
   normal publication. Record deployment and verification results separately
   from fixture-based evidence.

This task authorizes the additive GraphQL deployment and Studio deployment
after owner confirmation of the frontend release. Frontend production release
remains with the owner. Do not publish a test article solely for verification.

For rollback, restore the previous Studio deployment to stop new grouped
authoring. The additive GraphQL schema can remain deployed. If grouped articles
have already been published, retain the compatible frontend renderer or revert
those specific editorial changes before rolling it back.

## Rollout checkpoint: 2026-10-09

- The `production/default` GraphQL schema was deployed after a dry run reported
  no breaking changes. Read-back through the frontend's existing `v2023-08-01`
  URL confirmed `CodeGroup`, `CodeVariant`, the legacy body union, and an existing
  article's `bodyRaw`.
- Local Studio browser checks confirmed variant creation, editing, pointer
  reordering, Bash editor token colors, and blank-label publication blocking.
  Authenticated GraphQL draft preview returned the saved order and exact code.
  The disposable unpublished draft was removed after verification.
  Local Studio logged background EventSource fetch errors despite successful
  saves and read-back; verify realtime connectivity in the deployed Studio check.
- Validation passed: 47 focused unit tests, 28 existing article browser checks,
  four new viewport/theme checks, frontend/Studio type checks and lint, and both
  production builds. Frontend lint excluded existing ignored `.tmp/`,
  `playwright-report/`, and `test-results/` artifacts. Screenshots remain under
  `.tmp/issue-167/`.
- Frontend production release remains with the owner. Studio deployment and
  deployed-frontend verification await confirmation that the renderer is live.
- The follow-up tab layout uses one shared frame for every snippet, including
  single-language and legacy blocks. The separate language badge is removed.
  Validation passed for 18 component tests and four viewport/theme browser
  checks, including keyboard navigation, copying, and the attached header layout.
