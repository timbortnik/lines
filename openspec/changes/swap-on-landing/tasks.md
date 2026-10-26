# Tasks

## 1. Swap on landing

- [x] 1.1 In `src/game/game.ts`, send a next ball the moving ball lands on to the cell the ball left, keeping its color and its `jumped` event, with no random draw. Update `test/game/move.test.ts`: the landing test uses a random source whose first draw would pick a different free cell, and asserts the whole turn record. Verify: `npm test` passes at 100% coverage, and putting back the random jump makes the landing test fail.
  - Done 2026-10-26: `jumpCovered` became `swapCovered`; 79 tests pass at 100% coverage; with the old `game.ts` restored, only the landing test fails.

## 2. Review and archive

- [x] 2.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
  - Done 2026-10-26: no code defects, 6 mutations of which 5 red; all 3 findings applied with approval: "Next balls" spec wording, proposal wording, and a test that landing draws no random number.
- [ ] 2.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
