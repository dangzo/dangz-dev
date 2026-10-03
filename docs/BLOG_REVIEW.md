# Issue #158: blog and layout review

Home is approved, including stacked cards on mobile. The tablet layout now shows four latest articles from 768px to 1023px; mobile and desktop keep three.

## Local checkpoint

Use the running server at <http://localhost:3000/>. The worktree is `git-worktrees/feat/158-browsing-layout`, based on PR #161. The restart command and proposed summaries are in [HOME_REVIEW.md](HOME_REVIEW.md).

Review these routes in both themes:

- [Blog](http://localhost:3000/blog): topic navigation above compact chronological previews.
- [Architecture](http://localhost:3000/blog/topics/architecture): editorial name, description, count, and active selection.
- [Legacy architecture URL](http://localhost:3000/blog/tags/frontend-architecture): redirects to the same canonical topic.
- [Article](http://localhost:3000/blog/three-layered-architecture-for-front-end): ToC, topic metadata, readable prose, heading anchors, code blocks, and reactions.
- [Home at tablet width](http://localhost:3000/): a complete two-by-two latest-writing grid.

The live corpus currently has too few published posts for a second archive page. Browser fixtures provide populated paginated archives for testing; production redirects and indexing retain PR #161’s policy.

## Behavior

- Desktop topics wrap above listings. Mobile controls start collapsed on all-posts and topic archives; the current selection/count and All posts reset remain visible.
- Topic links navigate directly to canonical destinations. Selecting a topic collapses the menu; Escape closes it and returns focus to the toggle.
- Previews show one readable topic, title, date, summary, and a consistent 16:9 image. Desktop images are 320 × 180px, tablet images are 256 × 144px, and mobile images use the full article width above the text. Images align with the topic/date row on larger screens and retain the same dimensions across articles regardless of excerpt length. Missing images and summaries do not create placeholder noise. Reactions remain available with quieter emphasis.
- The development-only editorial preview switch now applies the proposed summaries to both Home and blog listings. CMS writes and publication stay with #159.
- Article pages retain the ToC sidebar on desktop and its mobile disclosure. Prose is limited to 70ch with 16px paragraphs and comfortable line spacing; code and tables scroll within the content area.

## Shared review

Reviewed Home, About, blog/topic archives, an article, search, header/mobile menu, and footer at 390px, 768px, and 1440px in light and dark themes. No horizontal page overflow appeared in that matrix. Further narrow-screen and fixture checks cover long titles, missing content, loading/error states, pagination, and keyboard navigation.

The review produced two shared fixes: About tool categories now use h3 below the section h2, preserving their visual sizing; the search field has an accessible label and can shrink within its mobile container. The approved Home shell, header, footer, fonts, and theme palette are retained.

Screenshots for local review are under `/tmp/dangz-dev-158-review/`. Deterministic light/dark blog, topic, article, and pagination baselines live with the existing Playwright screenshots.

Validation passed: frontend lint and TypeScript checks, the full unit suite plus affected-component checks, all 63 browser tests (including 26 visual comparisons), eight additional topic tests with draft preview enabled, and the production build. The restarted local preview responds successfully at `/blog`.

The subsequent image revision also passed the affected unit checks and 13 blog/topic browser tests, including equal image dimensions and full-width mobile titles at 320px, 390px, 767px, 768px, 1023px, and 1440px. The desktop and mobile blog visual baselines were reviewed and updated in both themes.

No PR, merge, deployment, CMS migration, or publishing is part of this local checkpoint. Keep the worktree and dev server available for follow-up requests.
