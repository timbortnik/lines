# Proposal

## Why

`project-setup` made the build, tests, CI and deploys work. The maintainer's other project (`widget`) also has quality controls: strict static analysis, code scanning, security alerts, a security policy, scheduled CI runs and a review routine. This project should get the equivalents that add no dependencies, before the game code starts arriving in `game-rules`.

## What Changes

- **Stricter TypeScript checks** in `tsconfig.json`: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noImplicitOverride`. Unused code and missing return paths fail the build and the tests.
- **CI changes**:
  - a weekly scheduled run, which catches breakage from outside the repository (a new Node LTS, a retired action runtime) even when nobody commits;
  - `fail-fast: false` on the Node matrix, so each Node version reports its own result. In PR #3, the failing `test (22)` cancelled `test (lts/*)`.
- **`SECURITY.md`**, telling people to report vulnerabilities privately through GitHub.
- **Repository settings**, configured by the maintainer:
  - CodeQL code scanning in default setup;
  - secret-scanning push protection;
  - Dependabot alerts and security updates;
  - private vulnerability reporting.
- **A `pre-review` skill** (`.claude/skills/pre-review/SKILL.md`): a single self-review pass before opening a pull request, adapted from the maintainer's webapp4 skill. Its checklist holds this project's recurring findings.
- **A task rule** in `openspec/config.yaml`, so every implementation's task list ends by running the pre-review before its pull request is opened.

## Capabilities

### New Capabilities

- `repository-security`: how security problems are reported, detected and kept out of the repository. It covers private vulnerability reporting, code scanning, secret push protection and dependency alerts.

### Modified Capabilities

- `build-and-test`: unused code fails the build and tests, and continuous testing gains a weekly run and independent per-version results. The capability is introduced by `project-setup`, which isn't archived yet, so this change must be archived after it.

## Out of Scope

- **Linting and formatting tools.** ESLint would add about 100 packages; the compiler checks above cover unused code without any.
- **Codacy**, or any other external code-quality service: it overlaps with CodeQL and the compiler checks, and is one more account to maintain.
- **The dependency-review action.** The dependency guard test already rejects every new package.
- **Dependabot version updates.** Only security updates are wanted, as project-setup's design decided (no update bot).
- **A coverage gate.** It belongs to `game-rules`, where the first tested code appears.
- **A `.ai/` folder.** The checklist lives in the skill until a second tool needs to read it.

## Impact

- **Changed files:** `tsconfig.json`, `.github/workflows/ci.yml`, `openspec/config.yaml`.
- **New files:** `SECURITY.md`, `.claude/skills/pre-review/SKILL.md`.
- **Dependencies:** none added.
- **Outside the repository:** four security settings in the GitHub repository, switched on by the maintainer.
- **Later changes:** every implementation now runs the pre-review before its pull request, and compiles under the stricter checks.
- **Archive order:** this change can be archived only after `project-setup`.
