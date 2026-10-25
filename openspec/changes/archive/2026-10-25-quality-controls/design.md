# Design

## Context

See proposal.md for the motivation. Facts checked while planning and in the pre-review:

- **Compiler checks:**
  - With TypeScript 7.0.2, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` and `noFallthroughCasesInSwitch` pass on the code currently on `main`, for both `tsc -p .` and `tsc -p test`.
  - On probe files they reject an unused local or parameter (TS6133), a function that returns a value on only some paths (TS7030, which `strict` alone doesn't report), and a switch fall-through (TS7029).
  - A parameter named `_event` is accepted, but an unused local named `_u` is still reported.
- **The fail-fast problem:** in PR #3, the matrix default `fail-fast: true` cancelled `test (lts/*)` as soon as `test (22)` failed.
  - Pull-request runs use the pull request's merge commit. So a throwaway branch only exercises a new matrix setting if it starts from the branch that adds it.
- **GitHub docs:**
  - Scheduled workflows in a public repository are disabled after 60 days without activity.
  - CodeQL default setup includes a weekly scan.
  - Dependabot security updates need no `dependabot.yml`.
  - Push protection is part of Secret Protection, under Settings → Advanced Security.
  - Private vulnerability reporting adds "Report a vulnerability" to the repository's "Security and quality" tab, and `GET /repos/{owner}/{repo}/private-vulnerability-reporting` reports whether it is on.
- **Settings already on:** the maintainer switched on the four security settings during planning.
  - The API reports private vulnerability reporting as enabled.
  - A "CodeQL Setup" run completed on `main`.

## Goals / Non-Goals

**Goals:**
- Unused code and partial returns fail at compile time, with no new dependencies.
- Every Node version's result is visible, including when another version fails.
- Security reporting and scanning run on GitHub's own features, with `SECURITY.md` as the only file to maintain.
- Every implementation branch gets the same pre-review before it is first pushed.

**Non-Goals:**
- Checks on the site at runtime, such as a Content Security Policy. Those belong with the game's own changes.
- Making CodeQL a required check (see Open Questions).

## Decisions

### 1. Compiler checks in the shared `tsconfig.json`

The four options go into the root `tsconfig.json`. `test/tsconfig.json` extends it, so tests get the same checks.
- **`noUnusedLocals` and `noUnusedParameters`** catch dead code; a leading underscore marks a parameter as deliberately unused.
- **`noImplicitReturns`** catches functions that return a value on only some paths.
- **`noFallthroughCasesInSwitch`** catches a non-empty switch case that silently runs into the next.

Alternatives considered:
- **ESLint:** about 95 packages with TypeScript support, for checks the compiler already does.
- **`exactOptionalPropertyTypes`:** mostly noise for this codebase.
- **`noUncheckedIndexedAccess`:** left to `game-rules`, which can weigh it against board indexing.
- **`noImplicitOverride`:** there are no classes to guard yet.

### 2. CI: independent matrix results

The only CI change is `fail-fast: false` on the test matrix. The triggers and the deploy job stay as they are.

Alternative considered: a weekly scheduled run, to catch breakage from outside the repository.
- **Rejected because of the 60-day rule.** GitHub disables a scheduled workflow after 60 days without activity. With the schedule in `ci.yml`, that would also stop the push and pull-request runs, so the required checks would never report and every merge would be blocked until someone re-enabled the workflow.
- **A separate scheduled workflow** would avoid that, but it's one more file to maintain for little value: CodeQL already scans weekly, and outside breakage shows up on the next pull request.

### 3. `SECURITY.md`

The file says:
- the supported version is whatever is live at https://lines.bortnik.org;
- the game has no backend and keeps its data in the player's browser;
- vulnerabilities go through "Report a vulnerability" on the repository's "Security and quality" tab, not public issues.

GitHub shows the file as the repository's security policy.

### 4. Security settings instead of security files

The maintainer switches on four repository settings, under Settings → Advanced Security. None of them adds a file to maintain:
- **CodeQL analysis in default setup.** JavaScript/TypeScript needs no configuration. An advanced setup would add a workflow file to keep up to date.
- **Secret Protection with push protection.**
- **Dependabot alerts and Dependabot security updates.** There is deliberately no `dependabot.yml`. Version updates are what that file configures, so without it Dependabot only acts on known vulnerabilities, which matches the "no update bot" decision.
- **Private vulnerability reporting.**

### 5. The `pre-review` skill

`.claude/skills/pre-review/SKILL.md` describes one review pass over a local branch before it is first pushed. It is written for this repository, with no text taken from other projects:
- It's best run by a fresh session that didn't write the code, which reports rather than edits.
- The branch is compared with `origin/main`, including untracked files.
- The changes are checked against the project context, the change's specs and the checklist.
- Each new test or guard is proven by making it fail.
- Fixes are proposed, and applied only after the maintainer agrees.
- It runs once per branch, not in a loop.

The checklist holds only this project's own findings, so it grows with the project:
- guards must fail closed;
- globs, tests and coverage patterns that match nothing pass;
- `tsc` never deletes old output;
- official Node runs `.ts` files;
- `@types/node` declares browser-like globals (`localStorage`, `navigator`, `EventTarget`, `performance`);
- relative URLs only;
- plain DNS on the maintainer's network is intercepted, so DNS is checked over DNS-over-HTTPS;
- the anonymous GitHub API's `mergeable_state` ignores rulesets;
- a scheduled workflow disables itself after 60 quiet days.

There is no `.ai/` folder: the skill is the checklist's only reader.

### 6. The pre-review becomes a planning rule

A new entry under `rules: tasks:` in `openspec/config.yaml`: *"Run the pre-review skill on the implementation branch before its first push; only tasks that need the pull request come after it."* OpenSpec feeds it into every generated task list, so the routine needs no separate reminder.
- **Before the first push:** the review covers exactly what goes up, and nothing can be merged before it reports.
- **How this was decided:** the first version said "before merging". This change's own pull request (#6) was then merged before its pre-review finished, so the maintainer moved the review to before the push. Checks that only exist on GitHub, such as the pull request's checks and CodeQL, are verified after the push.

Alternative considered: a `CLAUDE.md` instruction. It would be a second place to keep in sync with the planning rules.

## Risks / Trade-offs

- [The stricter checks make half-finished code fail while it's being written] → Finish the code or prefix the parameter with `_`. That's accepted as the price of catching dead code.
- [CodeQL may report false positives] → They are triaged in the "Security and quality" tab and don't block merges, since CodeQL isn't a required check.
- [A pre-review that is repeated drifts into inventing problems] → The skill says to run it once per branch.

## Migration Plan

Nothing to migrate. To roll back, revert through a pull request and switch the repository settings off.

## Open Questions

- Should CodeQL's check become required in the `main` ruleset? It can be added at any time once its false-positive rate on this code is known. It changes nothing in this plan.
