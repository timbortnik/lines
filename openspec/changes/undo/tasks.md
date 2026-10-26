# Tasks

## 1. The undo rule

- [x] 1.1 Add `src/game/undo.ts` (design §1) with tests in `test/game/undo.test.ts`: a new game has nothing to undo; after a move, undo gives back the game before it; after an undo there is nothing to undo; a move right after an undo can't be undone, and the move after it can; a resumed game's first move can't be undone, and its second can. Verify: `npm test` passes at 100% coverage, and dropping the `undone` check from `afterMove`, or starting a resumed game with `undone` false, makes a test fail.
  - Done 2026-10-26: 84 tests pass at 100% coverage; 6 mutations of `undo.ts` (both named here, plus undo keeping `previous` or not setting `undone`, `afterMove` keeping `undone`, a new game starting `undone`) each fail a test; the offline file list gained `js/game/undo.js`.

## 2. The Undo button

- [x] 2.1 Change the bar (design §5): add a disabled Undo button in `site/index.html`, rename the bar's New game button to "New", shrink the bar's gap to 8px, and style disabled buttons in `site/style.css`. Verify with headless screenshots at 320×568, 360×740, 390×844, 844×390 and 1280×800, with a 5-digit score and best score: the bar and the whole board are visible without scrolling, and the bar's items don't overflow it.
  - Done 2026-10-26: the first check overflowed at 320, 360 and 390px with 5-digit scores, so the bar's buttons got 0.5em side padding (0.6em still overflowed at 320); now all 5 sizes fit (286 of 288px at 320) with no console errors.
- [x] 2.2 Wire Undo (design §2–§4): `undo` in `View`, `canUndo` in `render`, and the history in `src/main.ts`. Verify headlessly, checking after every step that the drawn board, next balls, preview and score match the saved game: Undo after a move restores the board, next balls, preview and score, and drops the selection; Undo is disabled at the start of a new game, after an undo, after a move right after an undo, and after the first move of a resumed game, and enabled otherwise; Undo after game over closes the message and play goes on; Undo during a turn's animation and after New game does nothing; a reload after an undo shows the game before the undone move; no console errors.
  - Done 2026-10-26: 11 headless checks pass with no console errors or warnings, including undoing a game over after 26 turns; 5 broken versions of `main.ts` (no busy check, no save on undo, selection kept, resumed game treated as new, New game keeping the history) each fail a check.

## 3. Review and archive

- [ ] 3.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
- [ ] 3.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
