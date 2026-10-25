# Tasks

## 1. Branch, toolchain, build and placeholder page

- [x] 1.1 Once the plan pull request is squash-merged, run `git switch main && git pull --ff-only`, then `git switch -c project-setup`. Verify: `openspec/changes/project-setup/` exists on the new branch, and `git log --oneline -1` shows the plan's squash commit.
- [x] 1.2 Create `package.json`: private, `"type": "module"`, `engines.node` `>=22`, license MIT. Install `typescript@^7.0.2` and `@types/node@^22` as dev dependencies and commit `package-lock.json`. Verify: `npm ci` succeeds, and `npm ls --depth=0` lists exactly those two packages.
- [x] 1.3 Add `.gitignore` for `node_modules/`, `site/js/` and `build/`. Verify: after 1.4, `git status` shows nothing from those folders.
- [x] 1.4 Add `tsconfig.json` (browser settings from design §2), the `build` script, `site/index.html` (loads `js/main.js` as a module and shows "Loading…") and `src/main.ts` (replaces that text with "Coming soon"). Verify:
  - `npm run build` exits 0 and writes `site/js/main.js` and `site/js/main.js.map`;
  - serving `site/` with a static file server shows "Coming soon";
  - a deliberate type error in `src/` makes `npm run build` exit non-zero (revert it afterwards).
- [x] 1.5 Write `README.md` covering what the project is, the requirements (Node ≥ 22), and how to build and run it locally. Note that OpenSpec is needed only by people planning changes. Verify: every command in the README runs as written.

## 2. Tests and guards

- [x] 2.1 Add `test/tsconfig.json` (test settings from design §2), the `test` script, and `test/site.test.ts`, the relative-URL guard from design §5. Verify:
  - `npm test` passes;
  - it fails when `site/index.html` refers to `/js/main.js`, `https://lines.bortnik.org/js/main.js` or `https://github.com/timbortnik/lines`, in double or single quotes;
  - it fails when a file type it doesn't check, such as an empty `site/x.css`, is added.

  Revert each temporary edit afterwards.
- [x] 2.2 Add `test/dependencies.test.ts`, the dependency guard from design §4. Verify: `npm test` passes, and fails after `npm install -D` or `npm install -O` of any package (revert it afterwards).
- [x] 2.3 Check the test command's failure modes, reverting each temporary edit afterwards. Verify:
  - a failing assertion makes `npm test` exit non-zero, and its report points to the `test/*.test.ts` line;
  - a type error in a test exits non-zero before any test runs;
  - a test importing a `src/` module that reads `document` fails with a type error.
- [x] 2.4 Run `npm test` and `npm run build` on a Node 22 build without TypeScript support (the maintainer's Ubuntu Node 22.22.1). Verify: both succeed.
- [x] 2.5 Add a "Testing" section to `README.md`. Verify: the documented command runs as written.

## 3. Continuous integration and deployment workflow

- [ ] 3.1 Add `.github/workflows/ci.yml` as in design §6:
  - a `test` job on Node `22` and `lts/*`, with `NODE_OPTIONS=--no-experimental-strip-types`;
  - a `deploy` job that runs only on pushes to `main`, using `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5` and `actions/deploy-pages@v5`.

  Verify:
  - the `deploy` job declares `needs: test`;
  - pushing `project-setup` and opening its pull request runs checks named `test (22)` and `test (lts/*)`, both pass, and the deploy job is skipped.
- [ ] 3.2 Maintainer: in the `main` ruleset, add `test (22)` and `test (lts/*)` as required status checks (design §8). Verify: `curl -s https://api.github.com/repos/timbortnik/lines/rules/branches/main` lists both under `required_status_checks`, along with `pull_request` (squash only), `non_fast_forward`, `deletion` and `required_linear_history`.
- [ ] 3.3 Push a throwaway branch from `project-setup` with a deliberately failing test, and open a pull request from it. Verify:
  - the pull request's check is reported as failed;
  - GitHub shows merging as blocked.

  Then close the pull request and delete the branch.
- [ ] 3.4 Add a "Deploys" section to `README.md` covering how changes land (pull request, required checks, squash merge), what triggers a deploy, and what is published where. Verify: it matches the workflow file and the ruleset.

## 4. Hosting at lines.bortnik.org (maintainer steps, in GitHub's documented order)

- [x] 4.1 Maintainer: verify `bortnik.org` for GitHub Pages (profile → Settings → Pages → Add a domain, then the TXT record at the DNS provider). Verify: GitHub lists the domain as verified.
  - Done 2026-10-25. The TXT record `_github-pages-challenge-timbortnik.bortnik.org` resolves over DNS-over-HTTPS (Google and Cloudflare), and the maintainer confirmed that GitHub shows the domain as verified.
- [x] 4.2 Maintainer: in the repository, set Settings → Pages → Build and deployment → Source to **GitHub Actions**. Verify: the setting shows "GitHub Actions".
  - Done 2026-10-25, as confirmed by the maintainer. The public API now reports `has_pages: true` (it was `false`). The source type itself is only visible with authentication; the first deploy in 4.4 exercises it.
- [ ] 4.3 Add a "Hosting setup (maintainers)" section to `README.md` listing steps 4.1, 4.2, 4.5 and 4.6. Verify: the order matches design §7.
- [ ] 4.4 Squash-merge the `project-setup` pull request, then run `git switch main && git pull --ff-only`. Verify:
  - `main` gained exactly one commit;
  - the `deploy` job succeeds;
  - https://timbortnik.github.io/lines/ shows "Coming soon", which also proves the site works under a subpath;
  - local `main` matches `origin/main`.
- [ ] 4.5 Maintainer: in the repository, set Settings → Pages → Custom domain to `lines.bortnik.org` and save. Then, at the DNS provider, create the CNAME record `lines` → `timbortnik.github.io`. Verify: `dig +short lines.bortnik.org CNAME` prints `timbortnik.github.io.`, and GitHub's DNS check passes.
- [ ] 4.6 Maintainer: tick **Enforce HTTPS** once it is offered (this can take up to 24 hours). Verify:
  - https://lines.bortnik.org shows "Coming soon";
  - http://lines.bortnik.org redirects to HTTPS.
- [ ] 4.7 Check what is published. Verify:
  - https://lines.bortnik.org/src/main.ts and https://lines.bortnik.org/package.json return 404;
  - note whether https://timbortnik.github.io/lines/ now redirects to the custom domain (design: unverified).

## Workflow follow-up

- After the merge, land the remaining task check-offs, the `github.io` redirect finding (as a README note) and the archive (`/opsx:archive`) together in one small follow-up pull request. Do this once every task is checked and the site is live at https://lines.bortnik.org.
