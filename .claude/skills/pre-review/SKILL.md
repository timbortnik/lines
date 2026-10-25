---
name: pre-review
description: Review a branch of this repository once before it is merged - check its changes against the project context, the change's specs and the checklist below, prove its new tests and guards can fail, and report findings with proposed fixes. Use when an implementation's task list reaches its pre-review task, or when asked to "pre-review" a branch.
---

# pre-review

One review pass over a branch before it is merged. It catches what is cheap to catch before review; it does not replace review.

## Who runs it

Prefer a fresh session that did not write the code, so the review isn't anchored on the author's reasoning. If you wrote the code in this session, hand the pass to a subagent: give it this file, the branch name and the change's name, not your own conclusions.

The reviewer only reads and reports. It makes no edits, commits or pushes. Fixes are applied afterwards, once the maintainer agrees to them.

Run it once per branch, not in a loop: a repeated review starts inventing problems, and each fix adds new surface to review.

## 1. Scope

```sh
git fetch origin main
git log --oneline origin/main..HEAD                    # commits on the branch
git diff --stat origin/main...HEAD                     # what they change
git status --short --untracked-files=all               # uncommitted and untracked work
```

Review the commits and anything uncommitted. If the commit list and the status are both empty, the scope check went wrong (for example, a stale `origin/main`). Stop and say so; don't report a clean branch.

## 2. Check against the sources of truth

- `openspec/config.yaml`: the project context (constraints) and the planning rules.
- The change's own files in `openspec/changes/<change>/`: proposal, design, specs and tasks.
- The main specs in `openspec/specs/`.

Read every changed line of prose (README, comments, specs, tasks) against what the code actually does. Where the change touches something in the checklist below, check that item.

## 3. Prove new tests and guards

For each test or guard the branch adds, break the thing it protects, confirm it goes red, then restore it. Work on a copy or revert afterwards; never leave a break behind.

## 4. Report

List the findings with `file:line`, the concrete problem, and a proposed fix as exact old → new text. Prefer removing or narrowing text over adding more. Say plainly what you did not check, and mark anything you could not verify as unverified.

## Checklist: this project's recurring findings

Add to this list when a finding recurs; remove an entry when it no longer applies.

- **Guards fail closed.** A guard that silently skips what it doesn't understand (a new file type, a new dependency field) is a gap. It should fail until it's taught about the new case.
- **Matching nothing passes.** A glob, test filter or coverage pattern that matches no files reports success. Coverage reports use absolute, source-mapped `.ts` paths, so an include pattern like `src/**` matches nothing; use `**/src/**`.
- **`tsc` never deletes old output.** Stale files in `build/` or `site/js/` can keep running after their source is gone.
- **Official Node runs `.ts` files.** CI switches that off so code can't come to rely on it; Ubuntu's Node build can't run them at all.
- **`@types/node` declares browser-like globals.** `localStorage`, `navigator`, `EventTarget` and `performance` compile in the DOM-free test build, so that build doesn't prove a module avoids them.
- **Relative URLs only.** The site must work under a subpath; no root-relative (`/x`) or absolute URLs to its own files.
- **The maintainer's network intercepts plain DNS.** Check DNS with DNS-over-HTTPS (`https://dns.google/resolve?name=<name>&type=<type>`), not `dig`.
- **The anonymous GitHub API's `mergeable_state` ignores rulesets.** Whether a merge is blocked is visible on the pull request page.
- **Scheduled workflows switch themselves off.** GitHub disables a scheduled workflow after 60 days without activity, together with the rest of that workflow file.
