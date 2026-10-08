# Issue #171: article table-of-contents review

## Recommendation and local implementation

The investigation for [#171](https://github.com/dangzo/dangz-dev/issues/171) found that the ToC is useful and ordinary anchor navigation works. Its desktop placement offset the article and bottom reactions from the shared footer, while squeezing tablet reading space. Keep the left ToC on wide screens and center the reading column.

The selected layout is implemented. Start it with `yarn dev -p 3000` and open [the architecture article](http://localhost:3000/blog/three-layered-architecture-for-front-end). This preview uses published CMS articles; nothing has been deployed. Review screenshots were removed at the user's request.

- Keep the title, metadata, and compact reactions in a **1152px header** and center its contents on the article/footer axis, as selected during live review. Metadata and reactions use separate rows.
- Below **1280px**, show a collapsed ToC above the centered reading column.
- At **1280px and above**, use a 1152px frame with `240px minmax(0, 1fr) 240px` columns and 32px gaps. The desktop reading column is 608px, reflecting the owner's final frame-width edit. The empty right rail balances the left ToC. The hero, prose, and bottom reactions share the footer's center axis.
- Use a quiet, cardless sticky desktop ToC and a bordered disclosure on smaller screens. Retain existing theme tokens, h2/h3 entries, h3 indentation, and active-entry feedback.
- Scroll only the entry list. Keep its heading, overflow cues, and back link visible outside the clipping region. Cap the list at `calc(100dvh - 220px)` on desktop and `min(480px, 60dvh)` in the disclosure.
- Reveal offscreen active entries within the list without moving the document. Keyboard navigation focuses the destination heading after closing the disclosure; Escape closes it and returns focus to the toggle.
- Omit empty ToCs and put “Back to all posts” below the metadata. Keep headingless articles centered at their existing 70ch limit.

Listing/topic layouts, parallel-slot routing, and the global shell retain their existing behavior. Hero image `sizes` reflect the new reading widths. Shared fixtures include long and headingless articles for regression checks.

## Alternatives and visual examples

| Pattern | Assessment |
| --- | --- |
| Previous left sidebar from 768px | Familiar and functional, but squeezes tablet prose and shifts article/reactions 136px right. |
| Centered article with left ToC | Selected: retains persistent navigation on wide screens and aligns the reading flow with the footer. Equal rails cost some desktop reading width. |
| Centered article with right ToC | Same geometry benefits, but changes familiar placement without a demonstrated benefit. |
| Disclosure at every width | Simplest centered column, but loses persistent orientation while scrolling desktop articles. |

The selected desktop arrangement is:

```text
┌────────────────────────── 1152px frame ──────────────────────────┐
│                      Centered title                             │
│                    Date · reading time · topic                   │
│                       Compact reactions                         │
├─────────────┬──────┬─────────────────────────┬──────┬─────────────┤
│ ToC: 240px  │ 32px │ Article: 608px           │ 32px │ Empty:240px │
│ sticky      │ gap  │ centered hero/body       │ gap  │             │
│ list scroll │      │ centered bottom reactions│      │             │
└─────────────┴──────┴─────────────────────────┴──────┴─────────────┘
                          Centered footer
```

Below 1280px, the centered header is followed by a collapsed bordered ToC disclosure and the hero/body. A short outline shows all entries without a cue. A long outline caps only its list and shows direction cues; its last entry remains keyboard-reachable. Nested h3 entries indent beneath h2; h4 stays in prose to limit outline clutter. Empty outlines omit the disclosure/rail and keep a centered 70ch article with a back link below metadata.

## Geometry findings

The previous 1152px frame reserved a 240px sidebar and a 32px gap from 768px upward, placing the article and bottom reactions **136px right of the page center**. The footer was correctly centered. Sidebar padding left only 190px for entries. Simply widening that two-column frame or moving the ToC to the right would retain an offset.

Widths below are CSS pixels, measured with loaded fonts. The existing 70ch limit measured 770px. Both themes gave the same geometry.

| Viewport | Previous article width | Previous center offset | Centered article width | New center offset |
| --- | ---: | ---: | ---: | ---: |
| 390 | 358 | 0 | 358 | 0 |
| 768 | 448 | +136 | 720 | 0 |
| 1024 | 704 | +136 | 770 | 0 |
| 1152 | 770 | +136 | 770 | 0 |
| 1280 | — | — | 608 | 0 |
| 1440 | 770 | +136 | 608 | 0 |

The 1279/1280px transition narrows prose from 770px to 608px while retaining its center. The full-width header avoids the earlier prototype's tighter title wrapping. Keeping desktop navigation persistent has a usability advantage over putting a disclosure above every article at every width; the left/right preference is a continuity judgment, not a user-study result.

## Functional findings and remaining work

Ordinary heading links, direct fragments, browser Back, and heading-copy controls worked in the investigation. Long outlines remained keyboard-reachable, but previously provided no explicit overflow cue and left the active entry offscreen when the document scrolled. Those layout and interaction gaps are addressed in the local implementation.

Two independent heading-ID defects remain separate follow-up work:

1. For `h2 Repeat → h4 Repeat → h3 Repeat`, rendering allocates `repeat`, `repeat-2`, and `repeat-3`, but the h3 ToC link targets `repeat-2`. Extraction skips h4 before allocating IDs.
2. A literal `h2 Repeat 2` can collide with a generated `repeat-2` ID, producing ambiguous fragments and duplicate React keys.

A future fix should share a deterministic allocation pass across all rendered h1–h4 blocks while exposing only h2/h3 in the ToC, reserve generated IDs, and preserve ordinary existing anchors. These defects reproduce in controlled bodies; this investigation does not assert that a published article contains the triggering titles.

## Validation and limits

The original investigation used isolated Playwright Chromium fixtures and temporary browser prototypes, covering short, long, nested, and empty outlines in both themes. Ordinary navigation/history/copy behavior and keyboard traversal passed; the two collision cases reproduced. Existing article browser checks passed 6 tests, and heading utility unit checks passed 12 tests across 2 files.

Final implementation validation covers both themes at 390, 768, 1024, 1152, 1279, 1280, and 1440px, centered headers/bodies/reactions, empty outlines, bounded long lists, active-entry reveal, keyboard destination focus, Escape dismissal, and client navigation. Validation results:

- `yarn test:e2e src/tests/e2e/blog-article.spec.ts src/tests/e2e/blog.spec.ts src/tests/e2e/topics.spec.ts --workers=1`: **41 passed**.
- `yarn test:unit src/features/blog/hooks/usePostInsights.test.ts src/features/blog/utils/posts.test.tsx src/test-support/e2e/sanity-fixtures.test.ts src/features/blog/components/reactions/Reactions.test.tsx src/features/blog/components/reactions/EmojiBtn.test.tsx`: **30 passed across 5 files**.
- Current-checkout frontend lint and TypeScript: **passed**, excluding unrelated nested worktrees and ignored review artifacts. Unscoped root checks otherwise include other checkouts.
- Live CMS article: mobile, tablet, desktop, both themes; centered header/article/reactions/footer, no horizontal overflow or page errors. The compact “Like” disclosure exposes hidden reactions and collapses correctly without submitting votes.
- `yarn test:e2e:visual:update --grep '/blog/stable-visual-regression-tests'`: **4 passed**, intentional desktop/mobile light/dark baselines refreshed and visually inspected.
- `git diff --check`: **passed**.

Production reactions and telemetry were not submitted during review. Chromium fixtures establish local behavior and geometry, not comparative reader preference, cross-browser compatibility, production analytics delivery, or a production rollout. The four existing article visual baselines are refreshed for the accepted layout; review-only screenshots remain removed at the user's request.
