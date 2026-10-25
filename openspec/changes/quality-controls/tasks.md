# Tasks

## 1. Compiler checks

- [ ] 1.1 Add `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noImplicitOverride` to `tsconfig.json` (design §1). Verify:
  - `npm run build` and `npm test` pass;
  - a temporary unused variable, unused parameter and switch fall-through each make `npm test` or `npm run build` fail, while a parameter named `_event` compiles (revert afterwards).
- [ ] 1.2 Add one sentence to the README's "Testing" section: the compiler rejects unused code, missing return paths and switch fall-through. Verify: it names exactly the checks in `tsconfig.json`.

## 2. CI: independent results and a weekly run

- [ ] 2.1 In `.github/workflows/ci.yml`, add `fail-fast: false` to the test matrix and `schedule: - cron: '0 6 * * 1'` to the triggers (design §2). Leave the deploy job's push-only condition as it is. Verify:
  - the workflow parses;
  - the deploy job's `if` still requires a `push` to `main`;
  - the implementation pull request's checks `test (22)` and `test (lts/*)` pass.
- [ ] 2.2 Push a throwaway branch with a deliberately failing test and open a pull request from it. Verify: `test (22)` and `test (lts/*)` both end as **failure**; neither is cancelled. Then delete the branch, which closes the pull request.
- [ ] 2.3 Add a sentence to the README's "Deploys" section about the weekly run, which tests but never deploys. Verify: it matches the workflow file.

## 3. Security policy and settings

- [ ] 3.1 Add `SECURITY.md` (design §3). Verify: it links to the repository's Security tab, and its claims (no backend, data kept in the browser) match the code.
- [ ] 3.2 Maintainer: Settings → Code security → enable **CodeQL analysis** with **Default** setup. Verify: a CodeQL check runs on the implementation pull request.
- [ ] 3.3 Maintainer: Settings → Code security → enable secret-scanning **Push protection**. Verify: the maintainer confirms the setting is on.
- [ ] 3.4 Maintainer: Settings → Code security → enable **Dependabot alerts** and **Dependabot security updates**. Verify:
  - the maintainer confirms both are on;
  - the repository has no `.github/dependabot.yml`.
- [ ] 3.5 Maintainer: Settings → Code security → enable **Private vulnerability reporting**. Verify: the repository's Security tab offers "Report a vulnerability".

## 4. Pre-review skill and planning rule

- [ ] 4.1 Write `.claude/skills/pre-review/SKILL.md` (design §5), fresh for this repository, with no text copied from the work project. Verify:
  - Claude Code lists the skill;
  - every command in it runs as written in this repository.
- [ ] 4.2 Add the rule from design §6 under `rules: tasks:` in `openspec/config.yaml`. Verify: `openspec instructions tasks --change quality-controls --json` lists it among the rules.
- [ ] 4.3 Run the pre-review skill on this change's branch, in a fresh read-only session. Apply the fixes the maintainer agrees to. Verify: the report and the applied fixes are recorded in the pull request description.

## Workflow follow-up

- Archive this change at the end of its implementation pull request, which requires `project-setup` to be archived first.
- After the merge:
  - the first scheduled run appears in the Actions tab on the following Monday, with `deploy` skipped;
  - the Security tab shows `SECURITY.md` as the security policy.
