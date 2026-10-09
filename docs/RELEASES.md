# Releases

Release `dev` to production through a pull request targeting `main`.

## From GitHub

1. Open [Actions → Create release PR](https://github.com/dangzo/dangz-dev/actions/workflows/create-release-pr.yml).
2. Click **Run workflow**, leave the branch on **dev**, and run it.
3. Open the PR linked in the run summary. Review its description and diff.
4. If the PR shows **Approve workflows to run**, click it to start checks.
5. Once required checks pass, choose **Create a merge commit** and merge to
   `main`. Keep `dev`; do not delete it or squash/rebase a release.
6. Confirm the Vercel production deployment and follow any included rollout
   notes before deploying dependent services such as Studio.

The workflow creates a PR or updates the description of its existing generated
PR. It preserves manually written release PR descriptions and links to those
PRs instead, while still checking their skip labels against the current diff.
It does not merge, enable auto-merge, deploy services, or publish a
GitHub Release/tag. With nothing unreleased, it exits successfully without a PR.

## One-time authentication setup

The workflow supports two authentication options. Neither requires an AI service.

### Built-in token

In **Settings → Actions → General → Workflow permissions**, enable **Allow
GitHub Actions to create and approve pull requests**. Keep the default workflow
permissions on read: this workflow explicitly requests contents read and
pull-requests write. It never approves reviews.

GitHub requires a writer to click **Approve workflows to run** for checks on PRs
created with `GITHUB_TOKEN`. Other token-generated events, including label
changes, do not start workflows. Approval may therefore run checks even for a
documentation-only release that has skip labels.

If a documentation-only release later gains code, the workflow removes both
skip labels. With the built-in token, **close and reopen the release PR before
merging** to start fresh checks: token-generated label removal does not start
CI, and earlier skipped results are insufficient. The run summary highlights
this requirement. An App starts fresh checks automatically on label removal.

### GitHub App (automatic checks)

To remove that extra approval click:

1. Create a GitHub App with repository **Contents: Read** and **Pull requests:
   Read and write** permissions. No webhook subscription is needed.
2. Install it on **dangz-dev** only and generate a private key.
3. Add repository Actions variable **RELEASE_APP_ID** with its App ID.
4. Add repository Actions secret **RELEASE_APP_PRIVATE_KEY** with the complete
   private-key PEM contents. Never commit the key.

When both are configured, the workflow creates a short-lived installation token
scoped to this repository and those two permissions. The action revokes it after
the job. Configure both values together; partial configuration fails with a
setup message. With an App, the built-in-token create/approve setting is not
needed for this workflow.

See GitHub's [manual workflow guidance](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow),
[token-triggered checks](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow),
and [Actions repository settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository).

## How descriptions are generated

- Compare the current `main` and `dev` commit IDs, including all comparison pages.
  Previous release merge commits on `main` do not count as new changes.
- Include merged PRs targeting `dev` whose merge/squash commit is unreleased.
  Each contributes its title, link, and up to two concise **Changes** bullets.
  Other unreleased commits appear with their subject and commit link.
- Carry over explicit closing/partial issue references and **Risks and rollout**
  sections from source PRs. These references rely on the author/reviewer having
  checked issue completion; the workflow does not infer acceptance criteria.
- State that the new release checks still need to pass. Never claim source
  validation or production deployment has been verified by this automation.
- Read the saved PR back to check its target, head, title, description, and skip
  labels. Refuse publication if either branch moved during preparation; rerun.

Keep feature PR titles and Changes bullets concise and meaningful. Link detailed
validation and rollout guidance in feature PRs. Include issue references even
when the issue was closed by the original merge into `dev`. Since `dev` is the
default branch, a closing reference in a release to `main` does not automatically
close an open issue.

The full release diff receives `skip-ci` and `skip-review` only when every file
is known non-production Markdown under `docs/`, agent/config instruction folders,
or the root README/agent instructions. Markdown in application content is not
eligible. Both labels are removed when other changes are included; other labels
are preserved. A truncated file listing never qualifies for skipped checks.

## Validate changes to the automation

Run `yarn test:unit scripts/release-pr.test.ts`, `yarn typecheck`, and
`git diff --check`. The script uses Node 24's TypeScript support and needs no
dependency installation in Actions. Validate the workflow YAML when editing it.

For a read-only preview, provide `GH_TOKEN` through your local credential manager
and run:

```bash
GITHUB_REPOSITORY=dangzo/dangz-dev node scripts/create-release-pr.mts --dry-run
```

The preview makes only GitHub reads. If `main` already contains `dev`, it prints
that there is nothing to release. Running without `--dry-run` creates or updates
the release PR. The workflow must be merged into default branch `dev` before
GitHub shows its **Run workflow** button.
