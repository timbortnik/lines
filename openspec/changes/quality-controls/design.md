# Design

## Context

`project-setup` is merged. Its specs live only inside that change until it is archived, so this change's `build-and-test` delta can be planned now but must be archived after `project-setup`. `openspec validate` reports this as an informational note. See proposal.md for the motivation. Facts checked while planning:

- **Compiler checks:**
  - With TypeScript 7.0.2, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noImplicitOverride` pass on the code currently on `main`, for both `tsc -p .` and `tsc -p test`.
  - On a probe file they reject an unused parameter (TS6133), a missing return path (TS2366) and a switch fall-through (TS7029). They accept a parameter named `_event`.
- **The fail-fast problem:** in PR #3, the matrix default `fail-fast: true` cancelled `test (lts/*)` as soon as `test (22)` failed.
- **GitHub docs:**
  - Scheduled workflows in a public repository are disabled after 60 days without repository activity, and their notifications go to whoever last changed the cron line.
  - CodeQL default setup includes a weekly scan, paused after 6 months without pushes or pull requests.
  - Push protection blocks pushes that contain detected secrets.
  - Private vulnerability reporting adds a "Report a vulnerability" button to the Security tab.
  - A `dependabot.yml` file only customises Dependabot.

## Goals / Non-Goals

**Goals:**
- Unused code and missing return paths fail at compile time, with no new dependencies.
- Every Node version's result is visible, including when another version fails.
- Breakage from outside the repository surfaces within a week while the project is active.
- Security reporting and scanning run on GitHub's own features, with `SECURITY.md` as the only file to maintain.
- Every implementation pull request gets the same pre-review routine.

**Non-Goals:**
- Checks on the site at runtime, such as a Content Security Policy. Those belong with the game's own changes.
- Making CodeQL a required check (see Open Questions).

## Decisions

### 1. Compiler checks in the shared `tsconfig.json`

The five options go into the root `tsconfig.json`. `test/tsconfig.json` extends it, so tests get the same checks.
- **`noUnusedLocals` and `noUnusedParameters`** catch dead code; a leading underscore marks a parameter as deliberately unused.
- **`noImplicitReturns`** catches functions where some paths return a value and others don't.
- **`noFallthroughCasesInSwitch`** catches a non-empty switch case that silently runs into the next.
- **`noImplicitOverride`** makes a method that overrides a parent's say so with `override`.

Alternatives considered:
- **ESLint:** about 100 packages for checks the compiler already does.
- **`exactOptionalPropertyTypes`:** mostly noise for this codebase.
- **`noUncheckedIndexedAccess`:** left to `game-rules`, which can weigh it against board indexing.

### 2. CI: independent matrix results and a weekly run

- **`fail-fast: false`** on the test matrix.
- **`schedule: - cron: '0 6 * * 1'`**: every Monday at 06:00 UTC, on `main`.
- **The deploy job is untouched.** Its condition already requires a push to `main`, so a scheduled run tests and builds but never publishes.
- **Limitation (accepted):** GitHub disables the schedule after 60 days without repository activity, and the next push re-enables it. Failure emails go to the maintainer, who will be the last person to edit the cron line.

Alternatives considered:
- **An update bot to detect drift:** rejected in project-setup's design.
- **A daily schedule:** more noise, with no benefit for a project that changes weekly at most.

### 3. `SECURITY.md`

The file says:
- the supported version is whatever is live at https://lines.bortnik.org;
- the game has no backend and keeps its data in the player's browser;
- vulnerabilities go through the Security tab's "Report a vulnerability", not public issues.

GitHub shows the file as the repository's security policy.

### 4. Security settings instead of security files

The maintainer switches on four repository settings. None of them adds a file to maintain:
- **CodeQL default setup.** JavaScript/TypeScript needs no configuration. An advanced setup would add a workflow file to keep up to date.
- **Secret-scanning push protection.**
- **Dependabot alerts and Dependabot security updates.** There is deliberately no `dependabot.yml`. Version updates are what that file configures, so without it Dependabot only acts on known vulnerabilities, which matches the "no update bot" decision.
- **Private vulnerability reporting.**

### 5. The `pre-review` skill

`.claude/skills/pre-review/SKILL.md` describes one self-review pass before a pull request is opened. It follows the same method as the maintainer's webapp4 skill but is written fresh for this repository: no text is copied from that work project.

The method:
- check the scope against `origin/main`, including untracked files;
- hunt in a fixed order:
  - claims that no longer match the code;
  - two parallel places that now disagree;
  - code paths nothing exercises;
  - tests that can't fail;
  - guards that fail open;
  - dead code;
- audit the edits themselves;
- prove each new guard by breaking it;
- report, fixing by removing claims before adding any.

It runs once, not in a loop. It's best run by a fresh session that didn't write the code, which reports rather than edits. Fixes are applied after the maintainer agrees.

The skill's checklist holds this project's recurring findings, so it grows with the project:
- guards must fail closed;
- globs, tests and coverage patterns that match nothing pass;
- official Node runs `.ts` files;
- `@types/node` declares browser-like globals (`localStorage`, `navigator`, `EventTarget`, `performance`);
- relative URLs only;
- the anonymous GitHub API's `mergeable_state` ignores rulesets.

There is no `.ai/` folder: the skill is the checklist's only reader.

### 6. The pre-review becomes a planning rule

A new entry under `rules: tasks:` in `openspec/config.yaml`: *"End with running the pre-review skill on the branch before opening the implementation pull request."* OpenSpec feeds it into every generated task list, so the routine needs no separate reminder.

Alternative considered: a `CLAUDE.md` instruction. It would be a second place to keep in sync with the planning rules.

## Risks / Trade-offs

- [The stricter checks make half-finished code fail while it's being written] → Finish the code or prefix the parameter with `_`. That's accepted as the price of catching dead code.
- [The weekly schedule switches itself off after 60 days of inactivity] → Accepted. Any push turns it back on, and an inactive project has nothing new to break.
- [CodeQL may report false positives] → They are triaged in the Security tab and don't block merges, since CodeQL isn't a required check.
- [A pre-review that is repeated drifts into inventing problems] → The skill says to run it once per pull request.
- [This change can't be archived before `project-setup`] → `project-setup`'s wrap-up pull request goes first. It is already prepared.

## Migration Plan

Nothing to migrate. To roll back, revert through a pull request and switch the repository settings off.

## Open Questions

- Should CodeQL's check become required in the `main` ruleset? It can be added at any time once its false-positive rate on this code is known. It changes nothing in this plan.
