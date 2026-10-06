# GitHub issue and PR templates

## Investigation and decisions

Issue [#175](https://github.com/dangzo/dangz-dev/issues/175) calls for concise templates grounded in this repository's work. The investigation reviewed `AGENTS.md`, [WORKFLOW.md](WORKFLOW.md), the README's CI and PR guidance, existing labels, and representative recent issues and PRs.

| Examples reviewed | Useful pattern or gap |
| --- | --- |
| Issues [#167](https://github.com/dangzo/dangz-dev/issues/167) and [#159](https://github.com/dangzo/dangz-dev/issues/159) | Frontend and Studio changes need a clear outcome, bounded scope, observable acceptance criteria, and relevant schema/deployment context. |
| Issues [#168](https://github.com/dangzo/dangz-dev/issues/168) and [#174](https://github.com/dangzo/dangz-dev/issues/174) | Investigations need current evidence, open questions, and expected deliverables without requiring a predetermined solution. |
| Issue [#181](https://github.com/dangzo/dangz-dev/issues/181) | Maintenance can be concise: state the problem, scope, acceptance criteria, and links to existing context. |
| PRs [#161](https://github.com/dangzo/dangz-dev/pull/161) and [#164](https://github.com/dangzo/dangz-dev/pull/164) | A completed issue was referenced with `Refs` rather than a closing keyword. Make the closing-reference and default-branch check explicit. |
| PRs [#165](https://github.com/dangzo/dangz-dev/pull/165), [#166](https://github.com/dangzo/dangz-dev/pull/166), and [#148](https://github.com/dangzo/dangz-dev/pull/148) | Configuration and documentation PRs benefit from focused validation, explanations for skipped checks, and disclosure of live behavior not yet exercised. |
| PRs [#177](https://github.com/dangzo/dangz-dev/pull/177) and [#182](https://github.com/dangzo/dangz-dev/pull/182) | Schema rollout, partial mitigation, and untested authoring flows need explicit notes when applicable. |

The sample contains little human review discussion, so it does not establish recurring reviewer questions. The recommendations use the descriptions, recorded limitations, and confirmed issue-closing omission instead.

| Choice | Decision and rationale |
| --- | --- |
| Issue forms or Markdown | Use three Markdown templates. Forms can enforce required inputs, but Markdown suits freely edited handoffs and CLI authoring. No fields are technically required; problem/goal, scope or reproduction, and acceptance criteria/deliverables are the essential prompts. Context is optional, and existing evidence can replace unknown reproduction steps. |
| Issue categories | Bug report, feature/change, and investigation/maintenance. These describe work across frontend, Studio/content models, tests, CI/tooling, and documentation without separate templates for every subsystem. |
| One or several PR templates | Use one default template. The shared review questions apply across work types; specialized templates add selection overhead and require an explicit `template` URL parameter in GitHub's web flow. |
| Issue chooser | Keep blank issues available with `blank_issues_enabled: true` for unusual or tiny tasks. Numeric filenames order the three templates. |
| Labels and defaults | Do not add or automatically apply labels, title prefixes, or assignees. Existing labels are `dependencies`, `priority:high`, `priority:medium`, `priority:low`, `skip-ci`, `skip-lighthouse`, and `automerge`; none describes all issues in a template category. Select relevant existing labels manually. |
| Dedicated agent skill | Defer it. Templates and existing agent/workflow guidance provide one shared source for humans and agents. Reconsider a repository-local authoring skill if repeated drafting problems demonstrate a need. |

GitHub documents [Markdown template metadata and supported locations](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates), [issue forms and required inputs](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms), [chooser configuration and ordering](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository), and [multiple PR template selection](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository). Templates become available after merging into the default branch, currently `dev`.

## Usage

Choose a category from the repository's [new issue page](https://github.com/dangzo/dangz-dev/issues/new/choose). Fill the essential headings and remove irrelevant optional sections. Keep acceptance criteria observable; for investigations, describe the evidence or recommendation that will make the task complete. Small documentation tasks can use investigation/maintenance with a few sentences. Blank issues remain available.

For CLI authoring, `gh issue create --template 'Bug report'` selects an issue template by name. The other names are `Feature or change` and `Investigation or maintenance`. The default PR template is used in GitHub's web flow; `gh pr create --template pull_request_template.md --base dev` selects it explicitly in the CLI. For prepared descriptions, use `--body-file` with a filled Markdown body, omitting issue-template YAML front matter. Supplying a body does not enforce template prompts, so review the headings yourself.

PRs should lead with the problem and resulting behavior. Follow [WORKFLOW.md](WORKFLOW.md#validate-the-affected-behavior) to select validation; report what ran and its results, including failures and checks not run with reasons. Screenshots, deployment/schema sequencing, and rollback notes belong only in relevant changes. Remove the optional risks section when unnecessary.

Follow the issue-linking rule in [AGENTS.md](../AGENTS.md): before creating a PR, identify related issues and read their acceptance criteria. Use `Closes #<number>` for every completed issue and `Refs #<number>` for related or partial work, stating what remains. Write `None` when no related issues exist. Check the prepared description and current default-branch target before submission, then read back and verify the saved description and target after creation or updates and before merging. These checks apply to drafts and custom CLI bodies too. GitHub only interprets PR closing keywords when the PR targets the default branch; see [GitHub's linking documentation](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue). CI and merge labels remain governed by the [README](../README.md#pr-labels).

## Representative filled examples

These examples demonstrate the prompts; they are not new reports or claims about current defects. Optional sections are omitted when unnecessary.

### Bug report: CI label handling

**Problem and actual behavior:** Adding `automerge` can replace failed required checks with skipped results, allowing an unvalidated merge.

**Reproduction steps or evidence:** On a PR with failed quality checks, add `automerge` and inspect the replacement workflow run. It skips the gate and downstream jobs. This illustrates the historical defect described in PR #165.

**Expected behavior and acceptance criteria:** Every accepted PR event evaluates the current labels. Adding `automerge` cannot replace real validation with an all-skipped run; intentional skip labels retain their documented behavior.

**Context and scope (optional):** PR Checks workflow and its README guidance; preserve required check names.

### Feature or change: tabbed article code

**Problem or goal:** Readers should switch between author-written implementations in one code block.

**Scope:** Add ordered variants in Studio and accessible tabs in article rendering. Preserve existing blocks without a bulk content migration.

**Acceptance criteria:** Authors can reorder variants; readers can select tabs by keyboard; copying uses the active snippet; existing blocks still render in both themes.

**Context (optional):** Issue #167. Coordinate generated schema/types and remote GraphQL deployment. Validate Studio authoring and desktop/mobile rendering with the checks selected from WORKFLOW.md.

### Investigation or maintenance: reaction analytics audit

**Problem or goal:** Determine whether both reaction controls deliver useful Umami events.

**Scope and open questions:** Verify event delivery, tracker load timing, and whether clicks distinguish attempts from successful persistence. Recommend minimal event properties; implementation is follow-up work.

**Acceptance criteria or deliverables:** Evidence for both controls, an event inventory, prioritized recommendations, and follow-up issues for confirmed gaps.

**Context (optional):** Issue #168; Umami loads in production. Code declarations alone do not prove delivery.

### Investigation or maintenance: small documentation task

**Problem or goal:** Explain how contributors request a CodeRabbit review.

**Scope and open questions:** Add the manual review command to the existing README guidance.

**Acceptance criteria or deliverables:** The command matches repository configuration and its documentation link resolves.

### PR example: documentation-only change

**Problem and result:** Contributors could not find the manual review command. The README now explains how to request a review.

**Related issues:** In a real PR, add `Closes #<number>` for the completed documentation issue, or write `None` if there is none. Confirm closing references and the default-branch target before creation, after creation or updates, and before merging.

**Validation:** Checked the command against configuration, verified the documentation link, and ran `git diff --check`. Application tests were not run because only documentation changed. Live review triggering was not exercised.

## Validation and rollout

For template changes, parse Markdown front matter and chooser YAML, check unique names and supported locations, verify links and CLI flags, and run `git diff --check`. Review Markdown rendering where available and check these examples against the template headings. Application tests are unnecessary for template/documentation-only changes.

Local parsing and Markdown rendering cannot confirm GitHub's template selection behavior. Once merged into the default branch, open the new issue chooser to verify category order and the blank-issue option, open each template to check its body, and inspect PR creation to confirm default autofill. Do not submit dummy issues or PRs. Record any unavailable live checks in the implementation PR's validation notes.
