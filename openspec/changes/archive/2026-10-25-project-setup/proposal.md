# Proposal

## Why

The repository holds only the license and the OpenSpec setup. Every planned change (game rules, playable board, saving, offline support) needs the same foundation: a TypeScript build that follows the agreed constraints, tests that run on any Node ≥ 22, and an automatic path from `main` to players. Building it first means each later change is tested in CI and goes live at its final address as soon as it is merged.

## What Changes

- **Package manifest** (`package.json`): a private ES-module package for Node ≥ 22 with `build` and `test` scripts. The only dev dependencies are `typescript` and `@types/node`, with the Node types matching Node 22. The lockfile is committed.
- **TypeScript configuration**: one config compiles the browser code (`src/` → `site/js/`). A second compiles the tests (`test/` → `build/`) without the DOM library, so modules the tests import can't use `document`, `window` or DOM element types.
- **Folder layout**:
  - `src/`: TypeScript source.
  - `test/`: tests.
  - `site/`: the static files that get published. Compiled JavaScript lands in `site/js/`, which git ignores.
- **Placeholder page** (`site/index.html`) with a one-line script. The first deploy then shows the whole path from TypeScript to the browser working at the real address.
- **Guard tests**: one enforces relative URLs in the site, the other the dev-dependency list.
- **GitHub Actions workflow**:
  - Tests on Node 22 and the current LTS on every push and pull request.
  - On `main`, after the tests pass, builds the site and publishes it to GitHub Pages.
- **Merge gate**: `main` is already protected by a ruleset. Its required checks get the two test jobs, so changes land only through squash-merged pull requests whose tests pass.
- **README**: what the project is, how to build, test and run it locally, how deploys work, and that OpenSpec is needed only to plan changes.
- **One-time hosting setup** by the maintainer, in the order GitHub documents, ending with the site served at https://lines.bortnik.org over HTTPS.

## Capabilities

### New Capabilities

- `build-and-test`: how the project is built and tested. It covers the supported Node versions, the allowed dev dependencies, and what makes a build or test run fail.
- `site-delivery`: how the game reaches players. It covers the public address and HTTPS, the merge gate into `main`, automatic deploys from `main` gated by tests, and relative URLs.

### Modified Capabilities

None. No specs exist yet.

## Out of Scope

- **Game rules and the board:** game rules, board UI, input and animations are changes 2 and 3.
- **Saving:** saving the current game and the best score is change 4.
- **Offline support:** the web app manifest, icons and service worker are change 5.
- **Preview deploys:** GitHub Pages serves one site per repository, so pull requests get no preview deployments.
- **Dependency update bots:** GitHub Actions are pinned to major versions instead.
- **Dev server:** no bundled local dev server; any static file server works.

## Impact

- **New files:**
  - package files: `package.json`, `package-lock.json`;
  - TypeScript configs: `tsconfig.json`, `test/tsconfig.json`;
  - code and tests: `src/main.ts`, `site/index.html`, `test/site.test.ts`, `test/dependencies.test.ts`;
  - repository files: `.gitignore`, `.github/workflows/ci.yml`, `README.md`.
- **Dependencies:** dev only, `typescript` ^7.0.2 and `@types/node` ^22. No runtime dependencies.
- **Outside the repository:**
  - GitHub Pages enabled for the repo, with GitHub Actions as its source.
  - `test (22)` and `test (lts/*)` added as required checks in the `main` ruleset.
  - A verified domain on the maintainer's GitHub account.
  - DNS records at the bortnik.org provider: a TXT record for verification, and a CNAME record for `lines`.
- **Later changes** all run through this CI and deploy when merged.
