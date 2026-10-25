# Tasks

## 1. Coverage gate and Node 22.8

- [ ] 1.1 Raise the minimum Node version to 22.8: `engines.node` in `package.json` and `package-lock.json`, the Node line in `openspec/config.yaml`'s context, and the README's "Requirements" section. Verify: all three say 22.8, and `npm ci` and `npm test` still pass on the maintainer's Node 22.22.1.
- [ ] 1.2 Add `src/game/board.ts` (design §1) with its tests, the guard test `test/game/modules.test.ts`, `../src/game` in `test/tsconfig.json`'s `include`, and the coverage flags in the `test` script (design §6). Verify:
  - `npm test` passes, reporting 100% lines, branches and functions for `src/game`;
  - it fails when one board test is removed;
  - it fails when a function no test calls is added;
  - it fails when an untested module is added that no test imports, both directly in `src/game/` and in a subfolder;
  - it fails when a `src/game` file contains a `node:coverage` comment.

  Revert each temporary edit afterwards.

## 2. New game and next balls

- [ ] 2.1 Add the `Game` state, `newGame` and the choice of next balls to `src/game/game.ts` (design §2, §5). Add tests for:
  - 81 cells, 5 balls, score 0, colors 1–7, 3 next balls on distinct empty cells;
  - no starting line, including a seeded draw that would otherwise produce one;
  - only 2 next balls when only 2 cells are free.

  Verify: `npm test` passes at 100% coverage.

## 3. Paths and moves

- [ ] 3.1 Add `findPath` in `src/game/path.ts` (design §5, step 2). Add tests for: a shortest route, a walled-off cell, a route over next balls, and the same path on every call. Verify: `npm test` passes at 100% coverage.
- [ ] 3.2 Add `move`'s rejections and the jump of a covered next ball (design §5, steps 1 and 3). Add tests for:
  - each rejection: game over, empty origin, occupied destination, no route;
  - a rejected move leaves the input unchanged;
  - a covered next ball keeps its color and lands on a free cell.

  Verify: `npm test` passes at 100% coverage.

## 4. Lines, scoring, appearing balls, game over

- [ ] 4.1 Add `findLines` in `src/game/lines.ts`, and removal plus scoring after a move (design §5, step 4). Add tests for:
  - lines of 5 horizontally, vertically and along both diagonals;
  - 4 in a row removes nothing;
  - crossing lines are removed together and score 160 for 9 balls;
  - 5 balls score 10 and 6 score 20;
  - next balls don't appear after a removal.

  Verify: `npm test` passes at 100% coverage.
- [ ] 4.2 Add appearing balls, the lines they complete, new next balls and game over (design §5, step 5). Add tests for:
  - balls appear when nothing is removed;
  - an appearing ball completes and scores a line;
  - fewer next balls when the board is nearly full;
  - the game ends when the board fills;
  - the game continues when the filling balls complete a line;
  - moves are rejected after game over;
  - a move that clears the board places 5 new balls without a line, keeps the score and leaves the next balls in place;
  - appearing balls that clear the board lead to 5 new balls, then new next balls.

  Verify: `npm test` passes at 100% coverage.

## 5. Turn record, determinism, plain data

- [ ] 5.1 Return the turn record (design §4). Add tests for:
  - the event order of an ordinary move, a removing move, a move with a jump, a move that clears the board, and a move that ends the game;
  - `move` never changes its input game;
  - the same state, move and seed give identical results;
  - a game state survives a JSON round trip, and play continues identically from it.

  Verify: `npm test` passes at 100% coverage.

## 6. Documentation, review and pull request

- [ ] 6.1 Update the README's "Testing" section:
  - say that the rules in `src/game/` must stay at 100% line, branch and function coverage;
  - correct the two sentences that will no longer hold: the test build now compiles all of `src/game/`, not only the modules tests import, and there are now more than two guard tests.

  Verify: the section matches the `test` script and `test/tsconfig.json`.
- [ ] 6.2 Run the pre-review skill on the local branch before its first push, in a fresh read-only session. Apply the fixes the maintainer agrees to. Verify: the report and the applied fixes are recorded, to go into the pull request description.
- [ ] 6.3 Push the branch and open the implementation pull request. Verify: `test (22)`, `test (lts/*)` and CodeQL pass, and the coverage report in the CI log shows 100% for `src/game`.

## Workflow follow-up

- Archive this change in the implementation pull request once every task is checked, before merging.
