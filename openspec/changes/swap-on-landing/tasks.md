# Tasks

## 1. Swap on landing

- [ ] 1.1 In `src/game/game.ts`, send a next ball the moving ball lands on to the cell the ball left, keeping its color and its `jumped` event, with no random draw. Update `test/game/move.test.ts`: the landing test uses a random source whose first draw would pick a different free cell, and asserts the whole turn record. Verify: `npm test` passes at 100% coverage, and putting back the random jump makes the landing test fail.

## 2. Review and archive

- [ ] 2.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
- [ ] 2.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
