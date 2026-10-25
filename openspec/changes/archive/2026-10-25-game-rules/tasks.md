# Tasks

## 1. Coverage gate and Node 22.8

- [x] 1.1 Raise the minimum Node version to 22.8: `engines.node` in `package.json` and `package-lock.json`, the Node line in `openspec/config.yaml`'s context, and the README's "Requirements" section. Verify: all four say 22.8, and `npm ci` and `npm test` still pass on the maintainer's Node 22.22.1.
- [x] 1.2 Add `src/game/board.ts` (design §1) with its tests, the guard test `test/game/modules.test.ts`, `../src/game` in `test/tsconfig.json`'s `include`, and the coverage flags in the `test` script (design §6). Verify:
  - `npm test` passes, reporting 100% lines, branches and functions for `src/game`;
  - it fails when one board test is removed;
  - it fails when a function no test calls is added;
  - it fails when an untested module is added that no test imports, both directly in `src/game/` and in a subfolder;
  - it fails when a `src/game` file contains a `node:coverage` comment.

  Revert each temporary edit afterwards.

  - Done 2026-10-25:
    - `npm test` passes with `board.ts` at 100% lines, branches and functions;
    - removing the only test that calls `neighbours` fails with 56% line coverage;
    - an uncalled function fails with 87.50% function coverage;
    - untested modules in `src/game/` and in a subfolder fail with 92.86% line coverage;
    - a `node:coverage` comment fails the guard test.
    - Finding: Node's branch coverage counts code blocks, not true/false outcomes. Removing every assertion where `inside` returns false still passed at 100%, because its `&&` chain runs completely whenever it is true. The gate catches skipped if/else and ternary arms and uncalled functions, but outcomes are only proven by behaviour tests.

## 2. New game and next balls

- [x] 2.1 Add the `Game` state, `newGame` and the choice of next balls to `src/game/game.ts` (design §2, §5). Add tests for:
  - 81 cells, 5 balls, score 0, colors 1–7, 3 next balls on distinct empty cells;
  - no starting line, including a seeded draw that would otherwise produce one;
  - only 2 next balls when only 2 cells are free.

  Verify: `npm test` passes at 100% coverage.
  - Done 2026-10-25: `test/game/game.test.ts`: 50 seeded games check the counts, colors, distinct next cells and that no line exists; all-zero draws force a line that gets redrawn; a nearly full board yields exactly 2 next balls. `npm test` passes 38 tests at 100% lines, branches and functions.

## 3. Paths and moves

- [x] 3.1 Add `findPath` in `src/game/path.ts` (design §5, step 2). Add tests for: a shortest route, a walled-off cell, a route over next balls, and the same path on every call. Verify: `npm test` passes at 100% coverage.
  - Done 2026-10-25: `test/game/path.test.ts` covers a shortest route, a route through the only gap in a wall, a walled-off cell and repeatability. `move.test.ts` routes across a next ball's cell. `npm test` passes 38 tests at 100% lines, branches and functions.
- [x] 3.2 Add `move`'s rejections and the jump of a covered next ball (design §5, steps 1 and 3). Add tests for:
  - each rejection: game over, empty origin, occupied destination, no route;
  - a rejected move leaves the input unchanged;
  - a covered next ball keeps its color and lands on a free cell.

  Verify: `npm test` passes at 100% coverage.
  - Done 2026-10-25: `move.test.ts`: all four rejections return null and leave the game unchanged; a covered next ball keeps its color, avoids balls and other next balls, then appears there. `npm test` passes 38 tests at 100% lines, branches and functions.

## 4. Lines, scoring, appearing balls, game over

- [x] 4.1 Add `findLines` in `src/game/lines.ts`, and removal plus scoring after a move (design §5, step 4). Add tests for:
  - lines of 5 horizontally, vertically and along both diagonals;
  - 4 in a row removes nothing;
  - crossing lines are removed together and score 160 for 9 balls;
  - 5 balls score 10 and 6 score 20;
  - next balls don't appear after a removal.

  Verify: `npm test` passes at 100% coverage.
  - Done 2026-10-25: `lines.test.ts` covers lines across, down and both diagonals, four in a row, a broken run, a longer line and crossing lines. `move.test.ts` checks scores of 10, 20 and 160 for 9 crossing balls, and that the next balls stay put after a removal. `npm test` passes 38 tests at 100% lines, branches and functions.
- [x] 4.2 Add appearing balls, the lines they complete, new next balls and game over (design §5, step 5). Add tests for:
  - balls appear when nothing is removed;
  - an appearing ball completes and scores a line;
  - fewer next balls when the board is nearly full;
  - the game ends when the board fills;
  - the game continues when the filling balls complete a line;
  - moves are rejected after game over;
  - a move that clears the board places 5 new balls without a line, keeps the score and leaves the next balls in place;
  - appearing balls that clear the board lead to 5 new balls, then new next balls.

  Verify: `npm test` passes at 100% coverage.
  - Done 2026-10-25: `move.test.ts` covers balls appearing, an appearing ball completing a line, the board filling up (game over, moves then rejected), filling balls completing a line (the game continues), and the board being cleared by a move or by appearing balls. `npm test` passes 38 tests at 100% lines, branches and functions.

## 5. Turn record, determinism, plain data

- [x] 5.1 Return the turn record (design §4). Add tests for:
  - the event order of an ordinary move, a removing move, a move with a jump, a move that clears the board, and a move that ends the game;
  - `move` never changes its input game;
  - the same state, move and seed give identical results;
  - a game state survives a JSON round trip, and play continues identically from it.

  Verify: `npm test` passes at 100% coverage.
  - Done 2026-10-25: Event orders are asserted in every scenario: ordinary, removal, jump, cleared board, game over. `turn.test.ts` covers determinism, an unchanged input, and a JSON round trip that keeps playing identically. `npm test` passes 38 tests at 100% lines, branches and functions.

## 6. Documentation, review and pull request

- [x] 6.1 Update the README's "Testing" section:
  - say that the rules in `src/game/` must stay at 100% line, branch and function coverage;
  - correct the two sentences that will no longer hold: the test build now compiles all of `src/game/`, not only the modules tests import, and there are now more than two guard tests.

  Verify: the section matches the `test` script and `test/tsconfig.json`.
  - Done 2026-10-25:
    - the section now says that all of `src/game/` is compiled, and that the gate covers lines, branches and functions with no ignore comments;
    - it names the three guard tests (modules, relative URLs, dependencies);
    - checked against `package.json` and `test/tsconfig.json`.
- [x] 6.2 Run the pre-review skill on the local branch before its first push, in a fresh read-only session. Apply the fixes the maintainer agrees to. Verify: the report and the applied fixes are recorded, to go into the pull request description.
  - Done 2026-10-25: a fresh read-only session ran the skill on the unpushed branch, breaking the code about 40 times in copies. All 5 findings were applied with the maintainer's approval:
    - the module guard fails on file types other than `.ts`;
    - the jump test asserts the exact turn record, and the refill test checks the refilled balls;
    - the spec's next-ball sentence now matches the free move;
    - `move` rejects an origin off the board (its new test fails without the fix);
    - a wording nit in task 1.1.

    Still 38 tests at 100% coverage. The report goes into the pull request description.
- [x] 6.3 Push the branch and open the implementation pull request. Verify: `test (22)`, `test (lts/*)` and CodeQL pass, and the coverage report in the CI log shows 100% for `src/game`.
  - Done 2026-10-25:
    - PR #10, run 40214014367: `test (22)`, `test (lts/*)`, "Analyze (javascript-typescript)", "Analyze (actions)" and CodeQL all passed;
    - the maintainer reported the run green;
    - the job logs need admin rights, so the coverage table wasn't read here. The `test` script's 100% thresholds make a passing test job impossible below 100%.
    - #10 was merged before the archive commit, so this record and the archive land in a follow-up pull request.

## Workflow follow-up

- Archive this change in the implementation pull request once every task is checked, before merging.
