# Proposal

## Why

`project-setup` made the build, tests, CI and deploys work. The maintainer's other project (`widget`) also has quality controls: strict static analysis, code scanning, security alerts, a security policy and a review routine. This project should get the equivalents that add no dependencies, before the game code starts arriving in `game-rules`.

## What Changes

- **Stricter TypeScript checks** in `tsconfig.json`: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` and `noFallthroughCasesInSwitch`. Unused locals and parameters, functions that return a value on only some paths, and switch fall-through fail the build and the tests.
- **CI:** `fail-fast: false` on the Node matrix, so each Node version reports its own result. In PR #3, the failing `test (22)` cancelled `test (lts/*)`.
- **`SECURITY.md`**, telling people to report vulnerabilities privately through GitHub.
- **Repository settings**, switched on by the maintainer:
  - CodeQL default setup;
  - Secret Protection with push protection;
  - Dependabot alerts and security updates;
  - private vulnerability reporting.
- **A `pre-review` skill** (`.claude/skills/pre-review/SKILL.md`): a single self-review pass over a branch before it is merged. Its checklist holds this project's recurring findings.
- **A task rule** in `openspec/config.yaml`, so every implementation's task list ends by running the pre-review before merging.

## Capabilities

### New Capabilities

- `repository-security`: how security problems are reported, detected and kept out of the repository. It covers private vulnerability reporting, code scanning, secret push protection and dependency alerts.

### Modified Capabilities

- `build-and-test`: unused code fails the build and tests, and each Node version reports its own CI result.

## Out of Scope

- **Linting and formatting tools.** ESLint with TypeScript support adds about 95 packages; the compiler checks above cover unused code without any.
- **A scheduled CI run.** GitHub disables a scheduled workflow after 60 days without activity. With the schedule in `ci.yml`, that would also stop the required checks and block merges. CodeQL default setup already scans weekly.
- **Codacy**, or any other external code-quality service: it overlaps with CodeQL and the compiler checks.
- **The dependency-review action.** The dependency guard test already rejects every new package.
- **Dependabot version updates.** Only security updates are wanted, as project-setup's design decided.
- **`noImplicitOverride`.** There are no classes yet; the change that introduces some can add it.
- **A coverage gate.** It belongs to `game-rules`, where the first tested code appears.
- **A `.ai/` folder.** The checklist lives in the skill until a second tool needs to read it.

## Impact

- **Changed files:** `tsconfig.json`, `.github/workflows/ci.yml`, `openspec/config.yaml`.
- **New files:** `SECURITY.md`, `.claude/skills/pre-review/SKILL.md`.
- **Dependencies:** none added.
- **Outside the repository:** the four security settings, already switched on by the maintainer.
- **Later changes:** every implementation runs the pre-review before merging, and compiles under the stricter checks.
