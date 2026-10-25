# Tasks

## 1. Saving and resuming

- [x] 1.1 Add `parseSave` and `SAVE_VERSION` in `src/game/save.ts` (design §1, §2), with tests for: a round trip of saves taken from played games, a finished game, and a rejection naming the problem for each check (bad JSON, extra or missing keys, unknown version, board length and values, next-ball count, cells, colors, overlap with balls and with each other, scores, game-over flag, a line left on the board). Verify: `npm test` passes at 100% coverage, and each check, when removed, makes a test fail.
  - Done 2026-10-25: 76 tests at 100% coverage; 22 mutations of the checks, run in a scratch copy, all fail the tests after dropping a redundant array check and adding a renamed-key case; `firstMove`/`playFrom` moved into the shared test helpers.
- [x] 1.2 Add `src/ui/storage.ts` and saving in `src/main.ts` (design §3, §4), plus the best score in the bar and "New best!" in the game-over message (design §6). Verify headlessly: a reload mid-game and a reload right after a move show the same game; a reload after game over shows a new game and counts the score towards the best; damaged and unknown-version entries start a new game with a console warning; with storage blocked, 10 turns play with one warning.
  - Done 2026-10-25: all checks passed headlessly, including a reload during a turn's animation, two games to game over ("New best!" at 90, not at 80), damaged, version-2 and line-on-board saves, and blocked storage; reading and writing now share one warning, so blocked storage warns once.
- [x] 1.3 Add the New game dialog (design §5). Verify headlessly: during a game New game opens it and the board ignores taps; Keep playing and Escape keep the game; New game starts a fresh one and an abandoned higher score becomes the best; after game over both buttons start at once.
  - Done 2026-10-25: all checks passed headlessly: the dialog blocked a board tap; Keep playing and Escape kept the game; confirming abandoned a score of 10, which became the shown and stored best; after game over both buttons started at once.

## 2. Documentation

- [x] 2.1 Update the README: the game is saved on the device. Verify: it matches the specs.
  - Done 2026-10-25: the intro says the game and best score are kept in the browser on the device and resume after a reload; it matches the game-saving spec.

## 3. Review and archive

- [x] 3.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
  - Done 2026-10-25: a fresh subagent checked about 16,000 game-written saves and 13 hostile ones and found 6 issues, all applied with the maintainer's approval: empty boards are rejected; three tests now prove their checks (4 mutations caught); design and spec wording fixed; the dialog keeps a 16px margin.
- [x] 3.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
  - Done 2026-10-25: created the game-saving main spec (5 requirements) and replaced game-board's Game screen and New game requirements; `openspec validate --specs` passes for all 6 specs.
