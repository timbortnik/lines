# Tasks

## 1. Six colors

- [x] 1.1 In `src/game/board.ts`, set `COLORS` to 6, and say "1–6" in the board comment in `src/game/game.ts`. Move `test/game/` off color 7:
  - `patternBoard` in `helpers.ts` cycles through `COLORS`, still with no two neighbours sharing a color;
  - the `boardOf` comment says '1'–'6';
  - the boards in `move.test.ts` and `path.test.ts` that hold a 7 use colors 1–6 and keep what they test;
  - the new-game test title says 6 colors;
  - the save tests for an out-of-range color use 7, the first color out of range.

  Add a game test that a random draw just below 1 gives color 6. Verify: `npm test` passes at 100% coverage, and setting `COLORS` back to 7 fails the new color test and both save color tests.
  - Done 2026-10-28: 85 tests pass at 100% coverage; with `COLORS` at 7, exactly the new color test and both save color tests fail.
- [x] 1.2 Remove the brown ball style (`.c7`) from `site/style.css`. Verify: `npm test` passes; no `c7` is left in `site/` or `src/`; a new game in the browser shows only red, green, blue, yellow, purple and cyan balls.
  - Done 2026-10-28: 85 tests pass; no `c7` left; headless Chrome drew 330 balls over 30 new games, all `c1`–`c6`, each styled.

## 2. Review and archive

- [x] 2.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
  - Done 2026-10-28: no code defects; reverting `COLORS` and each color bound turns a test red; all 5 findings, all wording, applied with approval.
- [ ] 2.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
