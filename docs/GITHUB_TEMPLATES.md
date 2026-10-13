# GitHub issue and PR templates

Choose **Bug report**, **Feature or change**, or **Investigation or maintenance** from the [new issue page](https://github.com/dangzo/dangz-dev/issues/new/choose). Fill the problem/goal, scope or evidence, and observable acceptance criteria/deliverables; remove irrelevant optional sections. Blank issues remain available for tiny or unusual tasks. The source templates live in [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/).

For CLI authoring, `gh issue create --template 'Bug report'` selects a template by name; use the other names above for other categories. Prepared bodies use `--body-file` and omit issue-template YAML front matter.

PRs use [`.github/pull_request_template.md`](../.github/pull_request_template.md). The web flow fills it automatically; `gh pr create --template pull_request_template.md --base <target>` selects it explicitly in the CLI. Check the current default branch before choosing a target. A prepared `--body-file` must contain the filled template headings.

Agents use the [pr-create skill](../.agents/skills/pr-create/SKILL.md) when creating PRs or drafting/editing descriptions. Follow [AGENTS.md](../AGENTS.md) for related-issue criteria, closing references, saved-description checks, and documentation-only labels; select validation from [WORKFLOW.md](WORKFLOW.md#validate-the-affected-behavior). Keep descriptions focused on the problem, resulting behavior, material changes, and actual validation.

When changing templates, check front matter/chooser YAML, unique names, links, supported locations, and `git diff --check`. After merging to the default branch, inspect the issue chooser, category bodies, blank-issue option, and PR autofill without submitting dummy issues or PRs.
