# Design

## Context

The repository contains only `LICENSE` and the OpenSpec setup. See proposal.md for the motivation and the project context for the constraints. Facts checked while planning:

- **Toolchain:**
  - The maintainer's Node.js 22.22.1 is an Ubuntu build without TypeScript support, so tests must be compiled before they run.
  - Official Node 22 and 24 builds, by contrast, run `.ts` files directly. `NODE_OPTIONS=--no-experimental-strip-types` turns that off.
  - TypeScript 7.0.2 no longer loads `@types/*` packages automatically; they must be listed in `types`.
  - With Node 22, `node --test` needs file patterns: a folder argument fails, and a pattern that matches no files exits 0.
- **GitHub Actions:** the pinned versions exist and accept the inputs used below: `actions/checkout@v7`, `actions/setup-node@v7` (`node-version`, `cache`, the `lts/*` alias), `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5` (`path`), and `actions/deploy-pages@v5` (output `page_url`).
- **GitHub Pages:**
  - It is free for public repositories, and Actions minutes on standard runners are free for them too.
  - With Actions-based publishing, a `CNAME` file in the repository is ignored and not required.
  - "Enforce HTTPS" redirects all HTTP requests to HTTPS.
- **Prototype:** the layout below was built in a scratch copy and run on both the Ubuntu Node 22.22.1 and the official Node 24.22.1. Build and tests passed. Three deliberate faults failed as intended:
  - an absolute URL in the page failed the test command;
  - a type error failed the build;
  - a tested module using `document` failed the test build with TS2584.

## Goals / Non-Goals

**Goals:**
- Later changes slot into the layout without restructuring it.
- Build and test are one command each, and run identically on a laptop and in CI.
- The pipeline needs no routine maintenance beyond an occasional major-version bump of an action.

**Non-Goals:**
- Linting or formatting tools: they would add dependencies.
- Versioned releases or tags. Every push to `main` is a release.
- The caching and update strategy for offline use (change 5).

## Decisions

### 1. Folder layout: publish `site/` as-is

```
src/            TypeScript for the browser (entry: src/main.ts)
test/           tests (*.test.ts) and their tsconfig
site/           static files, published exactly as they are
site/js/        compiled browser code (git-ignored)
build/          compiled tests and the modules they import (git-ignored)
```

The published folder is exactly `site/`, so there is no copy step and no build script beyond `tsc`.

Alternatives considered:
- `public/` plus a `dist/` output: needs a copy script, for no benefit.
- Compiling next to the sources: mixes generated files into hand-written folders.

### 2. Two TypeScript configs; the test build has no DOM types

- **`tsconfig.json` (browser):**
  - Includes `src/` and compiles it to `site/js/`.
  - `lib: ["es2023", "dom"]`, `types: []`.
  - `sourceMap` and `inlineSources`, so browser devtools show the TypeScript without the `.ts` files being published.
- **`test/tsconfig.json`** extends it:
  - Includes only `test/` and compiles it to `build/`, with `rootDir: ".."`.
  - `lib: ["es2023"]`, `types: ["node"]`.
  - The compiler follows imports, so it also builds exactly the `src/` modules the tests use. Without the DOM library it rejects `document`, `window` and DOM element types in any of them. `@types/node` 22 still declares some browser-like globals, such as `localStorage`, `navigator`, `EventTarget` and `performance`, so those are not caught.
- **Shared options:**
  - **`target: "es2023"`:** modern syntax is emitted untouched. The compiler doesn't know Baseline status, though, and some newer ES2023 features may not be widely available yet. So the "Baseline widely available" constraint is still checked in review when a new API is used.
  - **`module: "nodenext"`:** relative imports must spell out the file extension, which browsers require.
  - **`strict`.**
  - **`erasableSyntaxOnly`.**
  - **`verbatimModuleSyntax`:** type-only imports are explicit, so the emitted JavaScript is the source minus its types.
  - **`rewriteRelativeImportExtensions`:** sources import `./x.ts`, and the output imports `./x.js`.

Alternatives considered:
- A single config with both DOM and Node types: loses the DOM-free check, and the tests would compile into the published folder.
- `noUncheckedIndexedAccess`: left off for now, because board-array indexing would need non-null assertions everywhere. The game-rules change can revisit it.

### 3. npm scripts

- `build`: `tsc -p .`
- `test`: `tsc -p test && node --enable-source-maps --test "build/**/*.test.js"`

The explicit glob works on Node 22, and keeps newer Node versions from picking up the `.ts` files on their own. It deliberately doesn't depend on where `rootDir` places the output: a pattern matching nothing would report a green run with no tests. Source maps make failures point to `.ts` lines; this was verified on Node 22.

There is no `serve` script. The README suggests any static file server, for example `python3 -m http.server -d site`.

### 4. Dependencies and their guard

- **Versions:** `typescript` ^7.0.2 and `@types/node` ^22. The Node types match the oldest supported Node, so using a newer Node API in tests is a type error.
- **Lockfile:** `package-lock.json` is committed, and CI installs with `npm ci`.
- **Guard test:** `test/dependencies.test.ts` reads `package.json`. It asserts that `devDependencies` is the only `*Dependencies` field, so no runtime, optional or peer dependencies, and that it lists exactly `@types/node` and `typescript`. Adding a package therefore means editing this test, which makes the decision visible in review.

### 5. Placeholder page and the relative-URL guard

- **Placeholder:**
  - `site/index.html` loads `js/main.js` as a module.
  - `src/main.ts` replaces "Loading…" with "Coming soon".
  - The first deploy thereby proves the whole path: TypeScript, compile, publish, module loading at the real address.
  - Change 3 replaces both files.
- **Relative-URL guard:** `test/site.test.ts` checks every file in `site/` except the compiled `site/js/`.
  - In HTML files it reads the `src` and `href` attributes, in either quote style. It fails on root-relative paths (`/x`) and on any URL with a scheme. That is stricter than the spec: links to other sites are rejected too, until a change needs one and extends the guard.
  - It fails on any other file type. The change that adds CSS or the web manifest therefore has to teach the guard about it.

### 6. One workflow, two jobs

`.github/workflows/ci.yml`:

- **Triggers:** every `push` and every `pull_request`. Workflow-level permissions are `contents: read`.
- **`test` job:**
  - Runs on a matrix of Node `22` and `lts/*`.
  - Steps: checkout, then setup-node (with the npm cache), then `npm ci`, `npm test` and `npm run build`.
  - Sets `NODE_OPTIONS=--no-experimental-strip-types`, so the official Node builds behave like builds without TypeScript support. Otherwise CI couldn't catch code that relies on Node running `.ts` files. It's set only in CI, where the Node versions are known, not in the npm scripts that run on contributors' Node versions.
- **`deploy` job:**
  - Needs `test`, and runs only for a push to `refs/heads/main`.
  - Permissions: `contents: read`, `pages: write`, `id-token: write`. Job-level permissions replace the workflow-level ones, so `contents: read` is repeated here.
  - Environment: `github-pages`, with its URL taken from the deploy step's `page_url`.
  - Concurrency group `pages`, with `cancel-in-progress: false`, so a running deploy finishes and the next one queues behind it.
  - Steps: checkout, setup-node `lts/*`, `npm ci`, `npm run build`, `configure-pages`, `upload-pages-artifact` with `path: site`, then `deploy-pages`.

Actions are pinned to major tags. They receive fixes automatically, and there is no update bot opening pull requests.

Alternatives considered:
- Handing the test job's build output to the deploy job as an artifact: more moving parts to save a build of a few seconds.
- Pinning actions to commit SHAs and adding Dependabot: more supply-chain protection, but a steady stream of update PRs. That is rejected under the least-maintenance goal (see Risks).

### 7. Custom domain configured in GitHub, not in the repository

These steps follow the order in GitHub's documentation:
1. Verify `bortnik.org` on the maintainer's account (a TXT record).
2. Set the Pages source to GitHub Actions.
3. Let the first deploy run.
4. Enter `lines.bortnik.org` as the custom domain.
5. Create the CNAME record `lines` → `timbortnik.github.io`.
6. Enforce HTTPS.

No `CNAME` file is committed, since it would be ignored anyway.

### 8. `main` is protected by a ruleset

The maintainer set this up in the repository; nobody can bypass it. The rules:
- **Pull requests required**, with 0 approvals since there's a single maintainer.
- **Squash is the only merge method.** Every change lands as two pull requests (see the project context), so it becomes two commits on `main`: its plan and its implementation.
- **Linear history; force-push and deletion blocked.**
- **Required status checks** are switched on, with an empty list for now.

GitHub only offers checks it has already seen run, so `test (22)` and `test (lts/*)` are added as required checks after CI's first run on the `project-setup` pull request. The names stay stable: they come from the job id and the literal matrix values `22` and `lts/*`, and the `lts/*` alias keeps its name when a new LTS arrives. If a later change raises the minimum Node version, that change must update the ruleset too.

Because nothing can be pushed to `main` directly, work after the merge (the remaining task check-offs, findings, and archiving the change) lands in a small follow-up pull request.

Alternatives considered:
- Requiring branches to be up to date before merging: extra rebasing for a solo project. The push to `main` runs the tests again before deploying (§6), which covers the gap.

## Risks / Trade-offs

- [Major tags can move to new code without review] → Use only official `actions/*` actions. Revisit SHA pinning if the threat model changes.
- [GitHub retires the runtime an action uses, forcing a major bump] → CI shows deprecation warnings well in advance. The bump is a one-line edit per action.
- [TypeScript 7 is young; behaviour can shift between versions] → The lockfile pins the exact version. Upgrades are deliberate.
- [Domain takeover in the gap between setting the custom domain and creating DNS records] → Verify `bortnik.org` first (step 1).
- [The first deploy lands on `timbortnik.github.io/lines/` before the custom domain is set] → Harmless: it's a placeholder with no saved data, and the domain is finished within this change, long before change 4 adds saving.
- [DNS propagation and HTTPS certificate issuance can each take up to 24 hours] → Those tasks end with an explicit check. No code depends on the timing.
- [Whether the `github.io` address redirects to the custom domain is unverified] → Check it after setup. Nothing depends on it.
- [Branches with an open pull request run CI twice (push and pull_request)] → Accepted: minutes are free for public repositories.
- [Two pull requests pass separately but break `main` together, since branches needn't be up to date] → The push to `main` runs the tests again before the deploy job, so a broken `main` never publishes. Fix forward with another pull request.
- [`inlineSources` makes the published source maps larger] → Accepted: readable production debugging matters more than size.

## Migration Plan

Not applicable: nothing is deployed yet. To roll back, revert the squashed commit through a pull request. GitHub Pages keeps serving the last successful deploy until then.
