# Tasks

## 1. Compiler checks

- [ ] 1.1 Add `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` and `noFallthroughCasesInSwitch` to `tsconfig.json` (design §1). Verify:
  - `npm run build` and `npm test` pass;
  - each of these, added temporarily, makes `npm test` or `npm run build` fail: an unused variable, an unused parameter, a function that returns a value on only some paths, and a switch fall-through;
  - a parameter named `_event` compiles.

  Revert each temporary edit afterwards.

## 2. CI: independent results

- [ ] 2.1 Add `fail-fast: false` to the test matrix in `.github/workflows/ci.yml` (design §2), leaving the triggers and the deploy job unchanged. Verify:
  - the workflow parses;
  - the implementation pull request's checks `test (22)` and `test (lts/*)` pass.
- [ ] 2.2 Push a throwaway branch cut from the implementation branch, with a deliberately failing test, and open a pull request from it. Verify: `test (22)` and `test (lts/*)` both end as **failure**; neither is cancelled. Then delete the branch, which closes the pull request.

## 3. Security policy and settings

- [ ] 3.1 Add `SECURITY.md` (design §3). Verify: it links to the repository's "Security and quality" tab, and its claims (no backend, data kept in the browser) match the code.
- [ ] 3.2 Maintainer: Settings → Advanced Security → **CodeQL analysis** → Set up → **Default**. Verify: a CodeQL check runs on the implementation pull request.
- [ ] 3.3 Maintainer: Settings → Advanced Security → enable **Secret Protection**, then **Push protection**. Verify: the maintainer confirms both are on.
- [ ] 3.4 Maintainer: Settings → Advanced Security → enable **Dependabot alerts** and **Dependabot security updates**. Verify:
  - the maintainer confirms both are on;
  - the repository has no `.github/dependabot.yml`.
- [ ] 3.5 Maintainer: Settings → Advanced Security → enable **Private vulnerability reporting**. Verify: `curl -s https://api.github.com/repos/timbortnik/lines/private-vulnerability-reporting` prints `"enabled": true`.

## 4. Pre-review skill and planning rule

- [ ] 4.1 Write `.claude/skills/pre-review/SKILL.md` (design §5) for this repository, with no text taken from other projects. Verify:
  - Claude Code lists the skill;
  - every command in it runs as written in this repository.
- [ ] 4.2 Add the rule from design §6 under `rules: tasks:` in `openspec/config.yaml`. Verify: `openspec instructions tasks --change quality-controls --json` lists it among the rules.
- [ ] 4.3 Run the pre-review skill on this change's implementation branch, in a fresh read-only session. Apply the fixes the maintainer agrees to. Verify: the report and the applied fixes are recorded in the pull request description.

## Workflow follow-up

- Archive this change at the end of its implementation pull request.
- After the merge, the "Security and quality" tab shows `SECURITY.md` as the security policy.
