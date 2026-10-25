# Tasks

## 1. The game screen

- [x] 1.1 Add the page skeleton in `site/index.html`, `site/style.css`, `src/ui/view.ts`, and a `src/main.ts` that draws a new game (design §1, §3, §7). Teach `test/site.test.ts` CSS URLs (design §8). Verify: `npm test` and `npm run build` pass; the guard fails on a root-relative `url()` and on an absolute `@import` in a CSS file; headless screenshots at 390×844 and 1280×800 show the bar and the whole board with 5 balls and 3 small next balls, and no console errors.
  - Done 2026-10-25: tests and build pass; the guard fails on `url(/bg.png)`, `url( "/x.png" )` and an https `@import`; screenshots at 390×844, 1280×800, 844×390 and 320×568 fit without scrolling; the only console message is the browser's own `/favicon.ico` 404, left for installable-offline.
- [ ] 1.2 Add selection, moves and the turn animation: `src/ui/animate.ts`, and taps in `src/main.ts` (design §2, §4, §5, §6). Verify headlessly: tapping a ball selects it, a second tap drops it, an unreachable cell keeps it selected; after each of 20 moves the drawn board, score and preview match the game state; the same holds with reduced motion emulated; no console errors.
- [ ] 1.3 Add the game-over message and both New game buttons (spec: Game over, New game). Verify headlessly, with reduced motion emulated: random moves until the game ends show the message with the final score, board taps then do nothing, and New game shows a fresh game with score 0.

## 2. Documentation

- [ ] 2.1 Update the README: the live site is playable, and "Build and run locally" gains `npx tsc -p . --watch` for editing. Verify: the commands run as written.

## 3. Review and archive

- [ ] 3.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
- [ ] 3.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
