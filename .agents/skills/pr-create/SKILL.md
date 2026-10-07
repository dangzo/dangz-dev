---
name: pr-create
description: Write concise dangz.dev PR titles and descriptions whenever creating a pull request, including drafts and PR creation within a larger task. Also use when drafting or rewriting a PR description; review-only requests use pr-review.
---

# Concise PR creation

Follow [AGENTS.md](../../../AGENTS.md) and use the [PR template](../../../.github/pull_request_template.md). This skill guides writing; it does not itself authorize creating, pushing, posting, or merging.

## Write for the reviewer

- Use a short, concrete title describing the final change.
- Aim for a body of 100–150 words. Small changes can be shorter; this is not a minimum or a hard cap. Expand only for essential risks, compatibility or rollout requirements, validation gaps, required issue references, or explicit user requests for detail.
- Keep **Problem and result**, **Related issues**, and **Validation**. Add **Risks and rollout** only when relevant; remove template comments and unused optional sections from the prepared body.
- Lead with the concrete problem and resulting behavior in one or two sentences. Describe the final implementation rather than the conversation or abandoned approaches.
- Omit work chronology, file inventories, procedural checklists, repeated explanations, and claims that add no review value. Link supporting detail instead of copying it. Use bullets only when they make parallel information easier to scan.
- In **Related issues**, use `Closes #<number>` for each completed issue, `Refs #<number>` for partial work with a brief note on what remains, or `None` when there are no related issues.
- In **Validation**, state checks actually run and their results. Disclose failures and relevant checks not run with reasons; do not claim success from planned checks. Include relevant screenshots and material limits of manual or live verification.

## Check before publishing

Read the finished title and body once for duplication and unnecessary detail. Preserve material evidence even when it exceeds the word target.

Perform the root guidance's issue-criteria, closing-reference, default-branch, and label checks without narrating the checklist in the PR. For an authorized GitHub write, pass the prepared body using `--body-file`, then read back the saved description, base branch, and labels and correct discrepancies. Reapply the writing guidance and required checks when updating the PR.
