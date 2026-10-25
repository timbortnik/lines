# Tasks

## 1. Compiler checks

- [x] 1.1 Add `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` and `noFallthroughCasesInSwitch` to `tsconfig.json` (design §1). Verify:
  - `npm run build` and `npm test` pass;
  - each of these, added temporarily, makes `npm test` or `npm run build` fail: an unused variable, an unused parameter, a function that returns a value on only some paths, and a switch fall-through;
  - a parameter named `_event` compiles.

  Revert each temporary edit afterwards.

## 2. CI: independent results

- [x] 2.1 Add `fail-fast: false` to the test matrix in `.github/workflows/ci.yml` (design §2), leaving the triggers and the deploy job unchanged. Verify:
  - the workflow parses;
  - the implementation pull request's checks `test (22)` and `test (lts/*)` pass.
  - Done 2026-10-25: on PR #6, both the push and the pull-request runs passed `test (22)` and `test (lts/*)`, with `deploy` skipped.
- [x] 2.2 Push a throwaway branch cut from the implementation branch, with a deliberately failing test, and open a pull request from it. Verify: `test (22)` and `test (lts/*)` both end as **failure**; neither is cancelled. Then delete the branch, which closes the pull request.
  - Done 2026-10-25: on PR #7 (branch cut from `quality-controls`), the push and pull-request runs both ended with `test (22)` and `test (lts/*)` as failure, neither cancelled. The branch was deleted, which closed #7 unmerged.

## 3. Security policy and settings

- [x] 3.1 Add `SECURITY.md` (design §3). Verify: it links to the repository's "Security and quality" tab, and its claims (no backend, data kept in the browser) match the code.
  - Done 2026-10-25: both links answer 200, and `src/` makes no network calls and stores nothing, which matches the scope claims.
- [x] 3.2 Maintainer: Settings → Advanced Security → **CodeQL analysis** → Set up → **Default**. Verify: a CodeQL check runs on the implementation pull request.
  - Done 2026-10-25: PR #6 shows CodeQL "Analyze (javascript-typescript)" ✓ and "Analyze (actions)" ✓, and its "CodeQL" result check passed.
- [x] 3.3 Maintainer: Settings → Advanced Security → enable **Secret Protection**, then **Push protection**. Verify: the maintainer confirms both are on.
  - Done 2026-10-25: the maintainer confirmed the security settings are enabled, push protection included (it requires Secret Protection). Not visible without authentication.
- [x] 3.4 Maintainer: Settings → Advanced Security → enable **Dependabot alerts** and **Dependabot security updates**. Verify:
  - the maintainer confirms both are on;
  - the repository has no `.github/dependabot.yml`.
  - Done 2026-10-25: the maintainer confirmed alerts and security updates are on, and there is no `.github/dependabot.yml`.
- [x] 3.5 Maintainer: Settings → Advanced Security → enable **Private vulnerability reporting**. Verify: `curl -s https://api.github.com/repos/timbortnik/lines/private-vulnerability-reporting` prints `"enabled": true`.
  - Done 2026-10-25: the API returns `{"enabled":true}`.

## 4. Pre-review skill and planning rule

- [x] 4.1 Write `.claude/skills/pre-review/SKILL.md` (design §5) for this repository, with no text taken from other projects. Verify:
  - Claude Code lists the skill;
  - every command in it runs as written in this repository.
  - Done 2026-10-25:
    - Claude Code listed `pre-review`, with the file's description, in the session that created it;
    - its scope commands and DNS-over-HTTPS example ran as written;
    - it contains no positional parameters.
- [x] 4.2 Add the rule from design §6 under `rules: tasks:` in `openspec/config.yaml`. Verify: `openspec instructions tasks --change quality-controls --json` lists it among the rules.
  - Done 2026-10-25: `openspec instructions tasks` now lists the rule as the third task rule.
- [ ] 4.3 Run the pre-review skill on this change's implementation branch, in a fresh read-only session. Apply the fixes the maintainer agrees to. Verify: the report and the applied fixes are recorded in the pull request description.

## Workflow follow-up

- Archive this change at the end of its implementation pull request.
- After the merge, the "Security and quality" tab shows `SECURITY.md` as the security policy.
